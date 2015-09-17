/// <reference path="../gulp/gulp.d.ts" />
/// <reference path="../node/node.d.ts" />
declare module "gulp-npm-script-sync" {
  class syncConfig {
    path: string  
  }
  
  function sync(gulp: any, config: syncConfig): void;
  
  export = sync;
}