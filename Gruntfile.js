module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.initConfig({
        compress: {
            admin: {
                options: {
                    archive: 'dist/socketio.zip'
                },
                files: [
                    {src: [
                            'bin/**', 
                            'lib/**', 
                            'node_modules/**',
                            '!node_modules/grunt/**',
                            '!node_modules/grunt-contrib-compress/**',
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
    });
};
