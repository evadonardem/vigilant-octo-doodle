echo 'GOGFMC Development Platform' ;

while true; do
  echo 'List of actions';
  echo '[1] Start application';
  echo '[2] Start application (clear volumes)';
  echo '[3] Execute migration';
  echo '[3] Stop application';
  echo '[4] Seed fake data';
  echo '[5] Get into workspace';
  echo 'E[x]it';
  read -p 'Option: ' option
  case $option in
    1 )
      docker-compose down && docker-compose up -d
      docker-compose exec workspace bash -c "composer update -o"
      docker-compose exec workspace bash -c "vendor/bin/phing configure-environment"
      docker-compose exec workspace bash -c "npm update"
      docker-compose exec workspace bash -c "npm audit fix"
      docker-compose exec workspace bash -c "npm run development"
      break;;
    2 )
      docker-compose down -v && docker-compose up -d
      docker-compose exec workspace bash -c "composer update -o"
      docker-compose exec workspace bash -c "vendor/bin/phing configure-environment"
      docker-compose exec workspace bash -c "npm update"
      docker-compose exec workspace bash -c "npm audit fix"
      docker-compose exec workspace bash -c "npm run development"
      break;;
    3 )
      docker-compose exec workspace bash -c "php artisan migrate"
      break;;
    3 )
      docker-compose down
      break;;
    4 )
      docker-compose exec workspace bash -c "php artisan db:seed --class='GeneralDatabaseSeeder'"
      docker-compose exec workspace bash -c "php artisan db:seed --class='FakeDatabaseSeeder'"
      break;;
    5 )
      docker-compose exec workspace bash
      break;;
    [Xx] )
      exit;;
  esac
done
