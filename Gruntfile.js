module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {files: ['Gruntfile.js', 'js/main.js', 'js/common.js']},
        browserify: {
            dist: {files: {'js/main.min.js': ['js/common.js', 'js/main.js']}},
            options: {
                alias: {
                    'common': './js/common.js',
                    'main': './js/main.js'
                }
            }
        }
    });

    // Load dependencies.
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');

    // Default task(s).
    grunt.registerTask('test', ['eslint']);
    grunt.registerTask('default', ['eslint', 'browserify']);
};
