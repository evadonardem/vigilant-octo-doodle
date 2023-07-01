FROM php:8.1.20-apache

RUN apt-get update && \
    apt-get install -y zip && \
    apt-get install -y mariadb-client && \
    apt-get install -y npm && \
    apt-get autoclean

RUN docker-php-ext-install bcmath

RUN docker-php-ext-install ctype

RUN docker-php-ext-install pdo

RUN docker-php-ext-install pdo_mysql

RUN docker-php-ext-install sockets

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

RUN a2enmod rewrite

ENV NVM_VERSION=master

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash

RUN nvm install --lts | bash

RUN nvm use --lts | bash

WORKDIR /var/www/html
