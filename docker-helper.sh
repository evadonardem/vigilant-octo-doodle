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
      docker-compose down && docker-compose up -d
      docker-compose exec workspace bash -c "php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\""
      docker-compose exec workspace bash -c "php -r \"if (hash_file('sha384', 'composer-setup.php') === '906a84df04cea2aa72f40b5f787e49f22d4c2f19492ac310e8cba5b96ac8b64115ac402c8cd292b8a03482574915d1a8') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;\""
      docker-compose exec workspace bash -c "php composer-setup.php"
      docker-compose exec workspace bash -c "php -r \"unlink('composer-setup.php');\""
      docker-compose exec workspace bash -c "php composer.phar install"
      docker-compose exec workspace bash -c "vendor/bin/phing configure-environment"
      break;;
    2 )
      docker-compose down -v && docker-compose up -d
      docker-compose exec workspace bash -c "php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\""
      docker-compose exec workspace bash -c "php -r \"if (hash_file('sha384', 'composer-setup.php') === '756890a4488ce9024fc62c56153228907f1545c228516cbf63f885e036d37e9a59d27d63f46af1d4d07ee0f76181c7d3') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;\""
      docker-compose exec workspace bash -c "php composer-setup.php"
      docker-compose exec workspace bash -c "php -r \"unlink('composer-setup.php');\""
      docker-compose exec workspace bash -c "php composer.phar install"
      docker-compose exec workspace bash -c "vendor/bin/phing configure-environment"
      break;;
    3 )
      docker-compose exec workspace bash -c "php artisan db:seed --class='GeneralDatabaseSeeder'"
      docker-compose exec workspace bash -c "php artisan db:seed --class='FakeDatabaseSeeder'"
      break;;
    4 )
      docker-compose exec workspace bash
      break;;
    [Xx] )
      exit;;
  esac
done
