<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\UserType;
use App\Service\PhotoService;
use App\Service\S3Uploader;
use App\Service\UploadFileService;
use App\Service\UserService;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/users')]
class UserController extends AbstractController
{

    public function __construct(
        private ValidatorInterface $validator,
        private UserService $userService,
        private UploadFileService $uploadFileService,
        private string $uploadedPhotosFolder,
        private string $uploadedAvatarsFolder,
        private string $uploadedPhotosFolderAWS,
        private string $uploadedAvatarsFolderAWS,
        private PhotoService $photoService,
        private S3Uploader $s3Uploader

    ) {
    }

    /**
     * Function to register a new user
     */
    #[Route('/register', name: 'app_users_register', methods: ['GET', 'POST'])]
    public function register(Request $request): JsonResponse
    {
        return $this->processRegistration($request, false);
    }

    /**
     * Function to register a new user created to test the upload of files in the cloud with AWS
     * @throws Exception
     */
    #[Route('/register/aws', name: 'app_users_register_AWS', methods: ['GET', 'POST'])]
    public function registerAWS(Request $request): JsonResponse
    {
        return $this->processRegistration($request, true);
    }

    /**
     * Common method to process user registration with local or AWS storage
     *
     * @param Request $request
     * @param bool $useAws Whether to use AWS S3 storage or local storage
     * @return JsonResponse
     */
    private function processRegistration(Request $request, bool $useAws): JsonResponse
    {
        // We use the UserType to validate these datas
        $form = $this->createForm(UserType::class, new User());

        // We get the data sent by the client and with them we create a User to validate these datas
        // thanks to the createUserFromPostRequestForValidation() methods and then we submit the form
        $userFromPostDatas = $this->userService->createUserFromPostRequestForValidation((array)$request->getPayload());
        $form->submit($userFromPostDatas);
        // We handle the request to keep the datas submitted for the upload of files
        $form->handleRequest($request);

        // We use the validator to validate the data sent by the client
        $errors = $this->validator->validate($userFromPostDatas);

        // We set the $photoFiles variable to handle the case
        // in which there are less than 4 photos sent even
        $photoFiles = $request->files->get('photos') ?? [];

        if(count($errors) > 0)
        {
            $errorsString = (string)$errors;
            return new JsonResponse(['status' => 'error', 'errors' => $errorsString], Response::HTTP_BAD_REQUEST);
        }
        // If less than 4 photos were selected
        else if(!is_array($photoFiles) || count($photoFiles) < 4)
        {
            return new JsonResponse(['status' => 'error', 'message' => 'You must upload at least 4 photos'], Response::HTTP_BAD_REQUEST);
        }
        else
        {
            /** @var UploadedFile $photos  */
            $photoFiles = $request->files->get('photos');
            /** @var UploadedFile $avatarFile  */
            $avatarFile = $request->files->get('avatar');

            $objectPhotos = [];

            // Process photos either with AWS S3 or local storage
            foreach ($photoFiles as $photoFile)
            {
                if ($useAws) {
                    // We get the URL in AWS S3 of the uploaded photo
                    $photoFileUrl = $this->s3Uploader->upload($photoFile, $this->uploadedPhotosFolderAWS);

                    // Create photo object with original filename and AWS URL
                    $objectPhoto = $this->photoService->createPhotoWhileCreatingUser(
                        $photoFile->getClientOriginalName(),
                        $photoFileUrl
                    );
                } else {
                    // We upload each photo using the local upload service
                    $photoFileUploadArray = $this->uploadFileService->uploadFile($photoFile, $this->uploadedPhotosFolder);

                    // Create photo object with generated name and local URL
                    $objectPhoto = $this->photoService->createPhotoWhileCreatingUser(
                        $photoFileUploadArray['name'],
                        $photoFileUploadArray['url']
                    );
                }

                $objectPhotos[] = $objectPhoto;
            }

            // Process avatar - either with AWS or local storage
            $avatar = null;
            if ($avatarFile) {
                if ($useAws) {
                    $avatar = $this->s3Uploader->upload($avatarFile, $this->uploadedAvatarsFolderAWS);
                } else {
                    $avatar = $this->uploadFileService->uploadFile($avatarFile, $this->uploadedAvatarsFolder);
                }
            }

            // Save user with photos and avatar
            $this->userService->saveUserAndPhotosCreated($userFromPostDatas, $objectPhotos, $avatar, $useAws);

            // Return success response
            return new JsonResponse(['status' => 'User registered successfully'], Response::HTTP_CREATED);
        }
    }

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // This method will be handled by JWT authentication
        // The actual authentication is done by the security system
        // This method will never be called
        return new JsonResponse(['message' => 'Invalid credentials'], Response::HTTP_UNAUTHORIZED);
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function getCurrentUser(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $this->getUser();

            if (!$user) {
                return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }

            return new JsonResponse([$user->jsonSerialize()], Response::HTTP_OK);
        } catch (Exception $e) {
            return new JsonResponse([
                'error' => 'An error occurred while fetching user details: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}