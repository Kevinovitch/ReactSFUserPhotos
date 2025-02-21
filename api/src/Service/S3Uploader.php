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

        // Configuration améliorée du client S3
        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region'  => $region,
            'credentials' => [
                'key'    => $accessKeyId,
                'secret' => $secretAccessKey,
            ],
            'http' => [
                'verify' => false,  // Désactive temporairement la vérification SSL
                'connect_timeout' => 5,
                'timeout' => 10
            ],
            'debug' => true, // Active les logs de debug
            'use_path_style_endpoint' => true, // Utilise le style de chemin au lieu du style virtuel
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
                'ServerSideEncryption' => 'AES256', // Ajoute le chiffrement côté serveur
            ]);

            // Retourne l'URL du fichier uploadé
            return $result['ObjectURL'];

        } catch (\Exception $e) {
            // Log l'erreur pour le débogage
            error_log('S3 Upload Error: ' . $e->getMessage());
            throw $e;
        }
    }
}