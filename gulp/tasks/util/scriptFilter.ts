/// <reference path="../../reference.d.ts" />
'use strict';
var path = require('path');

// Filters out non .js files. Prevents
// accidental inclusion of possible hidden files
export function filterTs(name: string) {
  return /(\.(ts)$)/i.test(path.extname(name));
};