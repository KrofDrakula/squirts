module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            dist: {
                src  : ['lib/common.js', 'lib/math/*.js', 'lib/game/*.js'],
                dest : 'build/game.js'
            }
        },
        watch: {
            files : '<config:concat.dist.src>',
            tasks : 'concat'
        }
    });

    grunt.registerTask('default', 'concat');
};