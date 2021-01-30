echo 'TAD Development Platform' ;

while true; do
  echo 'List of actions';
  echo '[1] Start application';
  echo '[2] Start application (clear volumes)';
  echo '[3] Seed fake data';
  echo '[4] Get into workspace';
  echo 'E[x]it';
  read -p 'Option: ' option
  case $option in
    1 )
      winpty docker-compose down && docker-compose up -d
      winpty docker-compose exec workspace bash -c "php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\""
      winpty docker-compose exec workspace bash -c "php -r \"if (hash_file('sha384', 'composer-setup.php') === '756890a4488ce9024fc62c56153228907f1545c228516cbf63f885e036d37e9a59d27d63f46af1d4d07ee0f76181c7d3') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;\""
      winpty docker-compose exec workspace bash -c "php composer-setup.php"
      winpty docker-compose exec workspace bash -c "php -r \"unlink('composer-setup.php');\""
      winpty docker-compose exec workspace bash -c "php composer.phar install"
      winpty docker-compose exec workspace bash -c "vendor/bin/phing configure-environment"
      break;;
    2 )
      winpty docker-compose down -v && docker-compose up -d
      winpty docker-compose exec workspace bash -c "php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\""
      winpty docker-compose exec workspace bash -c "php -r \"if (hash_file('sha384', 'composer-setup.php') === '756890a4488ce9024fc62c56153228907f1545c228516cbf63f885e036d37e9a59d27d63f46af1d4d07ee0f76181c7d3') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;\""
      winpty docker-compose exec workspace bash -c "php composer-setup.php"
      winpty docker-compose exec workspace bash -c "php -r \"unlink('composer-setup.php');\""
      winpty docker-compose exec workspace bash -c "php composer.phar install"
      winpty docker-compose exec workspace bash -c "vendor/bin/phing configure-environment"
      break;;
    3 )
      winpty docker-compose exec workspace bash -c "php artisan db:seed --class='GeneralDatabaseSeeder'"
      winpty docker-compose exec workspace bash -c "php artisan db:seed --class='FakeDatabaseSeeder'"
      break;;
    4 )
      docker-compose exec workspace bash
      break;;
    [Xx] )
      exit;;
  esac
done
