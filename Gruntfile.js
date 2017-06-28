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
    });
};
