
# Étape 1 : Build du frontend React
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Étape 2 : Préparation de Symfony
FROM php:8.3-fpm AS symfony-base

# Installations système
RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libpq-dev libonig-dev libzip-dev zip curl libxml2-dev libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-install intl pdo pdo_mysql zip opcache gd

# Installation de Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configuration du projet Symfony
WORKDIR /var/www/html
COPY api/ ./
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Étape 3 : Finalisation avec NGINX
FROM nginx:alpine
COPY --from=frontend-build /app/frontend/build /var/www/html/frontend
COPY --from=symfony-base /var/www/html /var/www/html/api
COPY api/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
