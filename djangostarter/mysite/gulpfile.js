"use strict";

const gulp = require("gulp");
const del = require("del");
const browserSync = require("browser-sync").create();

// load plugins
const $ = require("gulp-load-plugins")();

// for running django server
const spawn = require("child_process").spawn;

$.sass.compiler = require("node-sass");

const app = "mysite/";

const dir = {
  src: "./static/" + app,
};
// images
const images = {
  src: dir.src + "images/**/*",
  build: dir.src + "images",
};

// styles
const styles = {
  src: dir.src + "scss/styles.scss",
  build: dir.src + "css",
};
// templates
const templates = {
  src: "./templates/" + app,
};
// vendor js processing
const jsVendors = {
  src: dir.src + "scripts/vendors/**/*",
  build: dir.src + "js/vendors/",
  filename: "vendors.js",
};
// custom js settings
const js = {
  src: dir.src + "scripts/master/**/*",
  build: dir.src + "js/master/",
  filename: "main.js",
};

function reload(done) {
  browserSync.reload();
  done();
}

// Images
gulp.task("images", () => {
  return gulp
    .src(images.src)
    .pipe($.newer(images.build))
    .pipe($.imagemin())
    .pipe(gulp.dest(images.build));
});

// Styles
gulp.task("styles", function () {
  return gulp
    .src(styles.src)
    .pipe($.sourcemaps.init())
    .pipe($.sassGlob())
    .pipe(
      $.sass({ errLogToConsole: true, outputStyle: "compressed" }).on(
        "error",
        $.sass.logError
      )
    )
    .pipe($.autoprefixer())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(styles.build))
    .pipe($.size());
});

// CONCAT JS
gulp.task("jsVendors", function () {
  return gulp
    .src(jsVendors.src)
    .pipe($.concat(jsVendors.filename))
    .pipe($.uglify())
    .pipe(gulp.dest(jsVendors.build));
});

gulp.task("js", function () {
  return gulp
    .src(js.src)
    .pipe($.concat(js.filename))
    .pipe($.uglify())
    .pipe(gulp.dest(js.build));
});

// Cleaning
gulp.task("clean", async function () {
  return del.sync([styles.build + "/*.css", dir.src + "js/**/*"]);
});

// Run the Django development server
gulp.task("django", function () {
  spawn("python3", ["../manage.py", "runserver", "localhost:8000"], {
    stdio: "inherit",
  });
});

// all functions once
gulp.task("build", gulp.series(["styles", "js", "jsVendors"]));

// watch for changes
gulp.task(
  "watch",
  gulp.parallel(
    "build",
    "django",
    function browserSyncInit(cb) {
      browserSync.init({
        notify: false,
        port: 8000,
        proxy: "localhost:8000",
        localOnly: true,
        reloadDelay: 300,
        reloadDebounce: 500,
      });
      cb();
    },
    function watch_() {
      gulp.watch(dir.src + "**/*.scss", gulp.series("styles", reload));
      gulp.watch(templates.src + "**/*.html", reload);
      gulp.watch("**/*.py", reload);
      gulp.watch(js.src, gulp.series("js", reload));
    }
  )
);
