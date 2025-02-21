<?php

namespace App\Service;


use App\Entity\Photo;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserService
{

    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    )
    {
    }

    /**
     * Function to get all the active users created during the last
     * amount of time corresponding to $datetime
     * @param $date
     * @return array
     */
    public function getActiveUsersCreatedSince($date): array
    {
        return $this->entityManager->getRepository(User::class)->findActiveUsersCreatedSince($date);
    }

    /**
     * Function to create a user from the payload of a POST request
     * to validate its datas
     * @param array $postDatas
     * @return User
     */
    public function createUserFromPostRequestForValidation(array $postDatas): User
    {
        $user = new User();
        foreach($postDatas as $postData) {
            foreach ($postData as $key => $value) {
                $setter = 'set' . ucfirst($key);
                $user->$setter($value);
            }

        }

        return $user;
    }

    /**
     * @param User $user
     * @param $objectPhotos
     * @param $avatar
     * @param bool $aws
     * @return void
     *
     * Function to save a user, its photos and its avatar in the database
     */
    public function saveUserAndPhotosCreated(User $user, $objectPhotos, $avatar, bool $aws) :void
    {
        // If there is an avatar which was uploaded, we hydrate the User object $user
        // else we set a default avatar using DiceBear API in order to hydrate the object $user
        $this->setAvatar($user, $avatar, $aws);

        // We create the Photo and User objects and then store them in the database
        $this->setUserandPhotos($user, $objectPhotos);
    }

    /**
     * @param User $user
     * @return void
     *
     * Method to authenticate a User by giving it the role
     * 'IS_AUTHENTICATED_FULLY'
     */
    public function fullyAuthenticateUser(User $user): void
    {
        $user->setRoles(['IS_AUTHENTICATED_FULLY']);
        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    /***
     * @param User $user
     * @param $avatar
     * @param bool $aws
     * @return void
     *
     * Method to set the avatar of a User
     */
    public function setAvatar(User $user, $avatar, bool $aws): void
    {
        if($avatar)
        {
           $user->setAvatar($aws === false ? $avatar['url'] : $avatar);
        }
        else
        {
            $user->setAvatar('https://api.dicebear.com/7.x/avataaars/svg?seed=' . $user->getEmail());
        }
    }

    /**
     * @param User $user
     * @param $objectPhotos
     * @return void
     *
     * Method to create Photo objects , hydrate a new User entity and persist Photo and User objects
     */
    public function setUserandPhotos(User $user, $objectPhotos): void
    {
        // We create the Photo objects hydrate the user with them and store the
        // photos in the database
        foreach($objectPhotos as $objectPhoto)
        {
            /** @var Photo $objectPhoto  */
            $objectPhoto->setUser($user);
            $user->addPhoto($objectPhoto);
            $this->entityManager->persist($objectPhoto);
        }

        // We hash the password of the user
        $hashedPassword = $this->passwordHasher->hashPassword($user, $user->getPassword());
        $user->setPassword($hashedPassword);
        $user->eraseCredentials();

        // We persist and save the $user object
        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }


}