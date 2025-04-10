# ReactSFUserPhotos

A modern web application for managing user accounts and photo collections, powered by a Symfony 7.2 backend API and a React frontend.

## Project Overview

This project demonstrates a full-stack web application with user authentication, file uploads (both local and cloud storage), and profile management. It was developed as a portfolio project to showcase Symfony and React integration skills.

## Features

- User registration with JWT authentication
- Photo upload functionality (minimum 4 photos required)
- AWS S3 cloud storage integration
- User profile display with photo gallery
- Avatar management

## Technology Stack

### Backend (API)
- Symfony 7.2
- PHP 8.x
- MySQL
- JWT Authentication
- NelmioCorsBundle for CORS
- AWS SDK for PHP

### Frontend
- React
- React Router Dom
- React Bootstrap
- Formik & Yup for form validation
- Axios for API requests

## Installation

### Prerequisites
- PHP 8.x
- Composer
- Node.js and npm
- MySQL
- Symfony CLI

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ReactSFUserPhotos.git
cd ReactSFUserPhotos/api
```

2. Install dependencies:
```bash
composer install
```

3. Configure your database in `.env.local`:
```
DATABASE_URL="mysql://db_user:db_password@127.0.0.1:3306/db_name?serverVersion=8.0"
```

4. Configure JWT:
```bash
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
```

5. Set up your AWS credentials in `.env.local` (if using AWS):
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET=your_bucket_name
```

6. Create the database and run migrations:
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

7. Start the Symfony server:
```bash
symfony server:start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```
VITE_API_URL=http://localhost:8000/api
VITE_BASE_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account (you'll need to upload at least 4 photos)
3. Log in with your credentials
4. View and manage your profile

## API Endpoints

- `POST /api/users/register` - Register a new user (local storage)
- `POST /api/users/register/aws` - Register a new user (AWS storage)
- `POST /api/users/login` - Authenticate user and get JWT token
- `GET /api/users/me` - Get current user's profile (requires auth)

## Project Structure

```
ReactSFUserPhotos/
├── api/                  # Symfony backend
│   ├── config/           # Configuration files
│   ├── public/           # Web root
│   ├── src/              # Source code
│   │   ├── Controller/   # API controllers
│   │   ├── Entity/       # Database entities
│   │   └── Service/      # Business logic
│   └── .env              # Environment configuration
├── frontend/             # React frontend
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── contexts/     # Context providers
│   │   └── services/     # API services
│   └── .env              # Environment configuration
└── README.md             # Project documentation
```

## CORS Configuration

For development, ensure your NelmioCorsBundle is configured properly in `config/packages/nelmio_cors.yaml`:

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization']
        expose_headers: ['Link']
        max_age: 3600
    paths:
        '^/api/':
            allow_origin: ['http://localhost:5173']
            allow_headers: ['Content-Type', 'Authorization']
            allow_methods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS']
            max_age: 3600
        '^/uploads/':
            allow_origin: ['http://localhost:5173']
            allow_methods: ['GET']
            max_age: 3600
```

## License

[MIT License](LICENSE)

