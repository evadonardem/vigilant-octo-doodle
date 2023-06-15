FROM php:8.1.20-apache

RUN apt-get update && apt-get install -y zip && apt-get install -y mariadb-client && apt-get install -y npm

RUN docker-php-ext-install bcmath

RUN docker-php-ext-install ctype

RUN docker-php-ext-install pdo

RUN docker-php-ext-install pdo_mysql

RUN docker-php-ext-install sockets

RUN a2enmod rewrite

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

WORKDIR /var/www/html
