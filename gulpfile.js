'use strict';

var gulp        = require('gulp');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
// Load plugins
var $ = require('gulp-load-plugins')();
var coffeeify = require('gulp-coffeeify');
var notify = require("gulp-notify");
var sftp = require('gulp-sftp');

var handleErrors = function() {

  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};


// browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./dist"
        }
    });
});

gulp.task('images', function () {
    return gulp.src('./src/img/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('./dist/img'))
        .pipe($.size())
        .pipe(reload({stream:true}));
});

// Sass task, will run when any SCSS files change & BrowserSync
// will auto-update browsers
gulp.task('sass', function () {
    return gulp.src('./src/sass/*.sass')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
        }))
        .on("error", handleErrors)
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('./dist/css'))
        .pipe($.size())
        .pipe(reload({stream:true}));
});

gulp.task('css', function () {
    return gulp.src('./src/css/*.css')
        .pipe(gulp.dest('./dist/css'))
        .pipe($.size())
        .pipe(reload({stream:true}));
});

gulp.task('scripts', function () {
    return gulp.src('./src/js/**/*.js')
        .pipe(gulp.dest('./dist/js'))
        .pipe($.size())
        .pipe(reload({stream:true}));
});

gulp.task('coffee', function () {
    return gulp.src('./src/coffee/*.coffee')
        .pipe(coffeeify())
        .pipe($.size())
        .pipe(gulp.dest('./dist/js'));
});

// HTML
gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('dist'))
        .pipe($.size())
        .pipe(reload({stream:true}));
});

gulp.task('fonts', function () {
    return gulp.src('./src/fonts/*')
        .pipe(gulp.dest('./dist/fonts'))
        .pipe(reload({stream:true}));
});

gulp.task('clear', function (done) {
  return $.cache.clearAll(done);
});


gulp.task('upload', function () {
    return gulp.src('dist/**')
        .pipe(sftp({
            host: 'friss.me',
            user: 'root',
            pass: 'Dr3amsUnlimit3d',
            port: '55555',
            remotePath: '/var/www/friss.me/web/dev/blog'
    }));
});

// Default task to be run with `gulp`
gulp.task('default', ['images', 'sass', 'coffee', 'css', 'scripts', 'fonts', 'html', 'browser-sync'], function () {
    gulp.watch("src/sass/*.sass", ['sass']);
    gulp.watch("src/css/*.css", ['css']);
    gulp.watch("src/*.html", ['html']);
    gulp.watch("src/img/*", ['images']);
    gulp.watch("src/js/**/*.js", ['scripts']);
    gulp.watch("src/coffee/*.coffee", ['coffee']);
    gulp.watch("dist/**", ['upload']);
});
