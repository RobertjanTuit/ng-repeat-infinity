/// <reference path="../reference.d.ts" />
import gulp = require('gulp');
import sync = require('gulp-npm-script-sync');
export = (config) => {
  sync(gulp, { path: 'package.json' });
}