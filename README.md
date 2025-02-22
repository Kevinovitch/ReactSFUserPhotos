# SSL Certificate Configuration for AWS S3


To allow the application to securely connect to AWS S3 services, you need to install the appropriate CA root certificate. Here are the steps to follow:

# Certificate Download


1) Download the curl CA certificate


curl -o cacert.pem https://curl.se/ca/cacert.pem


2) Create the destination folder


mkdir -p api/config/cert


3) Copy the file in your project folder

   
cp cacert.pem api/config/cert/cacert.pem


# PHP Configuration


Modify your php.ini file to point to this certificate:

[curl]
curl.cainfo = "[CHEMIN_ABSOLU]/api/config/cert/cacert.pem"

[openssl]
openssl.cafile = "[CHEMIN_ABSOLU]/api/config/cert/cacert.pem"


Replace [ABSOLUTE_PATH] with the complete path to your project.


# Validation


To verify that your configuration works correctly, you can execute:

php -r "echo file_get_contents('https://s3.eu-west-3.amazonaws.com');"


If no SSL error is displayed, the configuration is correct.


# Important Note


The cacert.pem file is excluded from the Git repository via the .gitignore because:


It is specific to each environment

It is regularly updated for security reasons

It is publicly available and can be downloaded at any time

Each developer must install this certificate locally by following these instructions.
