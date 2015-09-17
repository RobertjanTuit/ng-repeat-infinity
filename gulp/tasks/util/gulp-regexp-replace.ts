/// <reference path="../../reference.d.ts" />
'use strict';
import stream = require('stream');
import through = require('through2');
import gutil = require('gulp-util');

class RegexpReplacePlugin extends stream.Transform {
  constructor(private replacePattern: RegExp, private replaceValue?: string) {
    super();
    
    //return through.obj((file, enc, callback) => {
    //  
    //});
    //this.push(chunk.toString().replace(this.replacePattern, this.replaceValue || ''))
  }
}

export = (pattern: RegExp, replaceValue?: string) => {
  return new RegexpReplacePlugin(pattern, replaceValue);
};
