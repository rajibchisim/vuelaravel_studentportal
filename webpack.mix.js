const mix = require('laravel-mix');
const path = require('path')

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

if (mix.inProduction()) {
    mix.options({
        terser: {
            terserOptions: {
                compress: {
                   drop_console: true
                }
            }
        }
    });

    mix.version();
}

mix.options({
    processCssUrls: false,
});

mix.browserSync('localhost:8001');

mix.alias({
    '@': path.join(__dirname, 'resources/js')
})

mix.js('resources/js/app.js', 'public/js')
    .vue({ version: 2 })
    .postCss("resources/css/app.css", "public/css", [
        require("tailwindcss")('tailwind.config.js'),
    ])
    .extract(['vue', '@popperjs/core', 'axios', 'vee-validate', 'vue-toast-notification', 'lodash'])
