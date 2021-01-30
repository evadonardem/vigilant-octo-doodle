FROM php:7.2-apache

RUN apt-get update && apt-get install -y zip && apt-get install -y mariadb-client && apt-get install -y npm

RUN docker-php-ext-install bcmath 

RUN docker-php-ext-install ctype 

RUN docker-php-ext-install json 

RUN docker-php-ext-install pdo 

RUN docker-php-ext-install pdo_mysql

RUN docker-php-ext-install tokenizer 

RUN docker-php-ext-install sockets

RUN a2enmod rewrite

WORKDIR /var/www/html
