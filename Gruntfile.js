module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            dist: {
                src  : ['lib/common.js', 'lib/math/*.js', 'lib/game/*.js', 'squirts.js'],
                dest : 'build/game.js'
            }
        },
        watch: {
            files : '<config:concat.dist.src>',
            tasks : 'default'
        },
        uglify: {
            dist: {
                src: ['build/game.js'],
                dest: 'build/game.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);
};