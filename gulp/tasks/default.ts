/// <reference path="../reference.d.ts" />
import gulp = require('gulp');
import path = require('path');
import gutil = require('gulp-util');
import debug = require('gulp-debug');
import replace = require('gulp-replace');
import ts = require('gulp-typescript');
import sequence = require('gulp-sequence');
import livereload = require('gulp-livereload');
import sourcemaps = require('gulp-sourcemaps');

export = (config) => {
  var scriptName = 'ng-repeat-infinity';

  var tsConfig = path.join(config.src, 'tsconfig.json');

  var typescriptGlob = [
    path.join(config.src, 'ng-repeat-infinity.ts'),
    path.join(config.src, 'utils.ts'),
  ];

  gulp.task('default', sequence('typescript-compile'));
  gulp.task('watch', sequence('typescript-compile', 'typescript-compile-watch'));

  gulp.task('typescript-compile', () => {
    gutil.log('------------------------------------------------------------');
    gutil.log('Starting TS Project compile');
    var tsProject = ts.createProject(tsConfig);
    
    var tsResult = gulp
      .src(typescriptGlob, config)
      .pipe(sourcemaps.init())
      .pipe(debug())
      .pipe(ts(tsProject));

    return tsResult.js
      .pipe(replace(/\/\/\/ <reference path.*?\/>\s*/g, ''))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(config.output))
      .pipe(livereload());
  });

  gulp.task('typescript-compile-watch', () => {
    gutil.log('Starting TS Project watch')
    livereload.listen();
    return gulp.watch(typescriptGlob, ["typescript-compile"]);
  });
};
