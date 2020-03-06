var gulp    = require('gulp');
var less     = require('gulp-less');
var cleanCSS = require('gulp-clean-css');

gulp.task('less',function(){
    return gulp.src('./assets/css/*.less')
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./assets/css/'))
});

gulp.task('less:watch', function(){
    gulp.watch('assets/css/**/*.less', gulp.series(['less']));
});

gulp.task('default', gulp.series(['less']));