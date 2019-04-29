module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {files: ['Gruntfile.js', 'js/*']}
    });

    // Load dependencies.
    grunt.loadNpmTasks('grunt-eslint');

    // Default task(s).
    grunt.registerTask('test', ['eslint']);
    grunt.registerTask('default', ['eslint']);
};
