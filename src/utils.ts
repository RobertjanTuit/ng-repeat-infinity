/// <reference path="reference.d.ts" />
module ngRepeatInfinity.utils {

export class AngularDirectiveBaseClass {

    constructor() {
      this.link = {
        pre: this.preLink.bind(this),
        post: this.postLink.bind(this)
      };
      this.compile = this.unboundCompile.bind(this);

    }
    public link: ng.IDirectivePrePost;
    public compile: ng.IDirectiveCompileFn;

    public unboundCompile($el: ng.IAugmentedJQuery, $attr: ng.IAttributes, transclude: ng.ITranscludeFunction): ng.IDirectivePrePost {
      return this.link;
    };
    public preLink($scope: ng.IScope, $el?: ng.IAugmentedJQuery, $attr?: ng.IAttributes, controller?: {}, $transclude?: ng.ITranscludeFunction): void { }
    public postLink($scope: ng.IScope, $el?: ng.IAugmentedJQuery, $attr?: ng.IAttributes, controller?: {}, $transclude?: ng.ITranscludeFunction): void { }
  }



  var uid = 0;
  export var nextUid = function(): any {
    return ++uid;
  };

  export function createMap() {
    return Object.create(null);
  }

  export function getBlockNodes(nodes: any): any {
    // TODO(perf): update `nodes` instead of creating a new object?
    var node = nodes[0];
    var endNode = nodes[nodes.length - 1];
    var blockNodes: any;

    for (var i = 1; node !== endNode && (node = node.nextSibling); i++) {
      if (blockNodes || nodes[i] !== node) {
        if (!blockNodes) {
          blockNodes = angular.element([].slice.call(nodes, 0, i));
        }
        blockNodes.push(node);
      }
    }

    return blockNodes || nodes;
  }

  export var updateScope = (scope: ng.IScope|any, index: number, valueIdentifier: string, value: Object, keyIdentifier: string, key: string, arrayLength: number) => {
    // TODO(perf): generate setters to shave off ~40ms or 1-1.5%
    scope[valueIdentifier] = value;
    if (keyIdentifier) scope[keyIdentifier] = key;
    scope.$index = index;
    scope.$first = (index === 0);
    scope.$last = (index === (arrayLength - 1));
    scope.$middle = !(scope.$first || scope.$last);
    // jshint bitwise: false
    scope.$odd = !(scope.$even = (index & 1) === 0);
    // jshint bitwise: true
  };

  export var getBlockStart = (block: any) => {
    return block.clone[0];
  };

  export var getBlockEnd = (block: any) => {
    return block.clone[block.clone.length - 1];
  };

  export var hashKey = (obj: any) => {
    var objType = typeof obj;
    var key: (() => string) |string;

    if (objType == 'object' && obj !== null) {
      if (typeof (key = obj.$$hashKey) == 'function') {
        // must invoke on object to keep the right this
        key = obj.$$hashKey();
      } else if (key === undefined) {
        key = obj.$$hashKey = nextUid();
      }
    } else {
      key = obj;
    }

    return objType + ':' + key;
  };
  
  export function isWindow(obj: any) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
  };

  export function isArrayLike(obj: any) {
    if (obj == null || isWindow(obj)) {
      return false;
    }

    var length = obj.length;

    if (obj.nodeType === 1 && length) {
      return true;
    }

    return angular.isArray(obj) || !angular.isFunction(obj) && (
      length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj
      );
  };    
}