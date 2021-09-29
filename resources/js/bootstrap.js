window._ = require('lodash');

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

try {
    window.Popper = require('popper.js').default;
    window.$ = window.jQuery = require('jquery');

    require('bootstrap');
    require('datatables.net-bs4');
    require('datatables.net-responsive-bs4');
    require('datatables.net-buttons-bs4');
    require('datatables.net-buttons/js/buttons.html5.js');
    require('datatables.net-fixedcolumns-bs4');
    require('datatables.net-rowreorder-bs4');
    window.pdfMake = require('pdfmake/build/pdfmake');
    window.pdfFonts = require('pdfmake/build/vfs_fonts');
    window.pdfMake.vfs = window.pdfFonts.pdfMake.vfs;

    window.pdfExportCommonSettings = function (doc) {
        doc.content[1].table.widths =
            Array(doc.content[1].table.body[0].length + 1)
                .join('*')
                .split('');
        doc.styles.tableHeader.alignment = 'left';
    };
    window.exportButtonsBase = [
        {
            extend: 'csvHtml5',
            footer: true,
        },
        {
            extend: 'pdfHtml5',
            orientation: 'landscape',
            pageSize: 'legal',
            customize : window.pdfExportCommonSettings,
            footer: true,
        }
    ];

    $.extend( true, $.fn.dataTable.defaults, {
        dom: '<"data-table-wrapper"Blftipr>',
        language: {
            loadingRecords: '&nbsp;',
            processing: '<span class="fa fa-spin fa-spinner"></span> Loading...',
        },
        lengthChange: false,
        processing: true,
    });

} catch (e) {}

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = require('axios');

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

let token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo'

// window.Pusher = require('pusher-js');

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     encrypted: true
// });
