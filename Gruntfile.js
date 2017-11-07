module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        compress: {
            admin: {
                options: {
                    archive: 'dist/socketio.zip'
                },
                files: [
                    {
                        src: [
                            'bin/**',
                            '!node_modules/**',
                            'package.json',
                            'README.md',
                            'config.js',
                            'imprimir.bat',
                            'init.bat',
                            'init.js',
                        ]
                    }
                ]
            },
        },
        shell: {
            target: {
                command: 'rsync -avz dist/socketio.zip oneweb@downloads.oneweb.com.br:downloads/public_html/'
            }
        }
    });

    grunt.registerTask('default', ['compress:admin', 'shell']);
};
