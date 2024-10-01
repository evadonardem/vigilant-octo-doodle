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
         fs: false,
      },
   },
})
   .js('resources/js/app.js', 'public/js')
   .react()
   .sass('resources/sass/app.scss', 'public/css')
   .styles([
      //'node_modules/datatables.net-dt/css/dataTables.dataTables.min.css',
      'node_modules/datatables.net-bs5/css/dataTables.bootstrap5.min.css',
      'node_modules/datatables.net-autofill-bs5/css/autoFill.bootstrap5.min.css',
      'node_modules/datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css',
      'node_modules/datatables.net-colreorder-bs5/css/colReorder.bootstrap5.min.css',
      'node_modules/datatables.net-fixedcolumns-bs5/css/fixedColumns.bootstrap5.min.css',
      'node_modules/datatables.net-fixedheader-bs5/css/fixedHeader.bootstrap5.min.css',
      'node_modules/datatables.net-keytable-bs5/css/keyTable.bootstrap5.min.css',
      'node_modules/datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css',
      'node_modules/datatables.net-rowgroup-bs5/css/rowGroup.bootstrap5.min.css',
      'node_modules/datatables.net-rowreorder-bs5/css/rowReorder.bootstrap5.min.css',
      'node_modules/datatables.net-scroller-bs5/css/scroller.bootstrap5.min.css',
      'node_modules/datatables.net-searchbuilder-bs5/css/searchBuilder.bootstrap5.min.css',
      'node_modules/datatables.net-searchpanes-bs5/css/searchPanes.bootstrap5.min.css',
      'node_modules/datatables.net-select-bs5/css/select.bootstrap5.min.css',
      'node_modules/datatables.net-staterestore-bs5/css/stateRestore.bootstrap5.min.css',
   ], 'public/css/all.css')
   .version();
