const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.webpackConfig({
   resolve: {
      fallback: {
         stream: require.resolve("stream-browserify"),
         zlib: require.resolve("browserify-zlib"),
      },
   },
})
   .js('resources/js/app.js', 'public/js')
   .react()
   .sass('resources/sass/app.scss', 'public/css')
   .styles([
      'node_modules/datatables.net-bs4/css/dataTables.bootstrap4.min.css'
   ], 'public/css/all.css');
   