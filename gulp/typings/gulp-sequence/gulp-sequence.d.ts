/// <reference path="../node/node.d.ts"/>
declare module "gulp-sequence" {
    function sequence(...tasks: (string[]|string)[]): Function;
    export = sequence;
}