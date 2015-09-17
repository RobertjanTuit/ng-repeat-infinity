/// <reference path="../reference.d.ts" />
import gulp = require('gulp');
import path = require('path');
import gutil = require('gulp-util');
import debug = require('gulp-debug');
import replace = require('gulp-replace');
import ts = require('gulp-typescript');
import sequence = require('gulp-sequence');

export = (config) => {
  var scriptName = 'ng-repeat-infinity';

  var tsConfig = path.join(config.src, 'tsconfig.json');

  var typescriptGlob = [
    path.join(config.src, scriptName + '.ts')
  ];

  gulp.task('default', sequence('typescript-compile'));
  gulp.task('watch', sequence('typescript-compile', 'typescript-compile-watch'));

  gulp.task('typescript-compile', () => {
    gutil.log('------------------------------------------------------------');
    gutil.log('Starting TS Project compile');
    var tsProject = ts.createProject(tsConfig);

    return gulp
      .src(typescriptGlob, config)
      .pipe(debug())
      .pipe(ts(tsProject)).js
      .pipe(replace(/\/\/\/ <reference path.*?\/>\s*/g, ''))
      .pipe(gulp.dest(config.output));
  });

  gulp.task('typescript-compile-watch', () => {
    gutil.log('Starting TS Project watch')
    return gulp.watch(typescriptGlob, ["typescript-compile"]);
  });
};
