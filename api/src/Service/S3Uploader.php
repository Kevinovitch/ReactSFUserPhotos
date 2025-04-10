<?php

namespace App\Service;

use Aws\S3\S3Client;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class S3Uploader
{
    private S3Client $s3Client;
    private string $bucket;

    public function __construct(string $accessKeyId, string $secretAccessKey, string $region, string $bucket)
    {
        $this->bucket = $bucket;

        // Improved S3 client configuration
        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region'  => $region,
            'credentials' => [
                'key'    => $accessKeyId,
                'secret' => $secretAccessKey,
            ],
            'http' => [
                'verify' => false,  // Temporarily disables SSL verification
                'connect_timeout' => 5,
                'timeout' => 10
            ],
            'debug' => true, // Activate debug logs
            'use_path_style_endpoint' => true, // Uses the path style instead of the virtual style
        ]);
    }

    public function upload(UploadedFile $file, string $directory = ''): string
    {
        try {
            $extension = $file->guessExtension();
            $filename = sprintf(
                '%s/%s-%s.%s',
                trim($directory, '/'),
                bin2hex(random_bytes(5)),
                time(),
                $extension
            );

            $result = $this->s3Client->putObject([
                'Bucket' => $this->bucket,
                'Key'    => $filename,
                'Body'   => fopen($file->getPathname(), 'rb'),
                'ACL'    => 'public-read',
                'ContentType' => $file->getMimeType(),
                'ServerSideEncryption' => 'AES256', // Adds server-side encryption
            ]);

            // Returns the URL of the uploaded file
            return $result['ObjectURL'];

        } catch (\Exception $e) {
            // Log error for debugging
            error_log('S3 Upload Error: ' . $e->getMessage());
            throw $e;
        }
    }
}