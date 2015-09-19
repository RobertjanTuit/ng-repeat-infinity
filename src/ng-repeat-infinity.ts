/// <reference path="reference.d.ts" />
/// <reference path="utils.ts"/>
namespace ngRepeatInfinity {
  
  interface Attributes extends ng.IAttributes {
    ngRepeatInfinity: string;
  }

  var NG_REMOVED = '$$NG_REMOVED';

  var expressionMatch = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;

  function ngRepeatMinErr(type: string, msg: string) {
    return type + ' - ' + msg;
  }
  
  /// Extending ngRepeat to support virtualization and inffinite scrolling. 
  /// ngRepeat: https://github.com/angular/angular.js/blob/master/src/ng/directive/ngRepeat.js
  class NgRepeatInfinity extends utils.AngularDirectiveBaseClass {
    private trackByExpGetter: ng.ICompiledExpression;
    private trackByIdExpFn: (key: string, value: string, index: number) => ng.ICompiledExpression;
    private valueIdentifier: string;
    private keyIdentifier: string;
    private hashFnLocals: { $id: (obj: any) => string }|any;
    private trackByIdArrayFn: (key: string, value: Object) => string;
    private trackByIdObjFn: (key: string) => string;
    private trackByIdFn: (key: string, value: Object, index: number) => string;
    private rhs: string;
    private lhs: string;
    private aliasAs: string;
    private trackByExp: string;
    private expression: string;

    public restrict = 'A';
    public transclude = 'element';
    public link: ng.IDirectivePrePost;
    public compile: ng.IDirectiveCompileFn;

    private ngRepeatEndComment: Comment;
    
    // @NgAnnotate
    constructor(
      private $parse: ng.IParseService,
      private $animate: ng.IAnimateService,
      private $injector: ng.auto.IInjectorService) {
      super()
    }

    public unboundCompile($el: ng.IAugmentedJQuery, $attr: Attributes): ng.IDirectivePrePost {
      this.expression = $attr.ngRepeatInfinity;
      this.ngRepeatEndComment = document.createComment(' end ngRepeatInfinity: ' + this.expression + ' ');
      var match = this.expression.match(expressionMatch);
      if (!match) {
        throw `Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '${this.expression}`;
      }

      this.lhs = match[1];
      this.rhs = match[2];
      this.aliasAs = match[3];
      this.trackByExp = match[4];

      match = this.lhs.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/);

      if (!match) {
        throw ngRepeatMinErr('iidexp', `'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '${this.lhs}'`)
      }
      this.valueIdentifier = match[3] || match[1];
      this.keyIdentifier = match[2];

      if (this.aliasAs && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(this.aliasAs) ||
        /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(this.aliasAs))) {
        throw ngRepeatMinErr('badident', `alias '${this.aliasAs}' is invalid --- must be a valid JS identifier which is not a reserved name.`);
      }

      this.hashFnLocals = { $id: utils.hashKey };

      if (this.trackByExp) {
        this.trackByExpGetter = this.$parse(this.trackByExp);
      } else {
        this.trackByIdArrayFn = (key: string, value: string) => {
          return utils.hashKey(value);
        };
        this.trackByIdObjFn = (key: string) => {
          return key;
        };
      }

      return this.link;
    }

    public preLink($scope: ng.IScope, $element: ng.IAugmentedJQuery, $attributes: ng.IAttributes, $controller: {}, $transclude: ng.ITranscludeFunction) {

      if (this.trackByExpGetter) {
        this.trackByIdExpFn = (key: string, value: string, index: number) => {
          // assign key, value, and $index to the locals so that they can be used in hash functions
          if (this.keyIdentifier) this.hashFnLocals[this.keyIdentifier] = key;
          this.hashFnLocals[this.valueIdentifier] = value;
          this.hashFnLocals.$index = index;
          return this.trackByExpGetter($scope, this.hashFnLocals);
        };
      }

      var nextBlockMap = utils.createMap();
      var lastBlockMap = utils.createMap();

      //watch props
      $scope.$watchCollection(this.rhs, (collection: Array<Object>) => {

        var previousNode: Node = $element[0];
        if (this.aliasAs) {
          $scope[this.aliasAs] = collection;
        }

        var collectionKeys: Array<Object>;
        if (utils.isArrayLike(collection)) {
          collectionKeys = collection;
          this.trackByIdFn = this.trackByIdFn || this.trackByIdArrayFn;
        } else {
          this.trackByIdFn = this.trackByIdFn || this.trackByIdObjFn;
          // if object, extract keys, sort them and use to determine order of iteration over obj props
          collectionKeys = [];
          for (var key in collection) {
            if (collection.hasOwnProperty(key) && key.charAt(0) != '$') {
              collectionKeys.push(key);
            }
          }
          collectionKeys.sort();
        }

        var collectionLength = collectionKeys.length;
        var nextBlockOrder = new Array(collectionLength);

        // locate existing items
        for (var index = 0; index < collectionLength; index++) {
          key = (collection === collectionKeys) ? index : collectionKeys[index];
          var value = collection[key];
          var trackById = this.trackByIdFn(key, value, index);
          if (lastBlockMap[trackById]) {
            // found previously seen block
            var block = lastBlockMap[trackById];
            delete lastBlockMap[trackById];
            nextBlockMap[trackById] = block;
            nextBlockOrder[index] = block;
          } else if (nextBlockMap[trackById]) {
            // if collision detected. restore lastBlockMap and throw an error
            angular.forEach(nextBlockOrder, (block) => {
              if (block && block.scope) lastBlockMap[block.id] = block;
            });
            throw ngRepeatMinErr('dupes', `Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: ${this.expression}, Duplicate key: ${trackById}, Duplicate value: ${value}`);
          } else {
            // new never before seen block
            nextBlockOrder[index] = { id: trackById, scope: undefined, clone: undefined };
            nextBlockMap[trackById] = true;
          }
        }

        // remove leftover items
        for (var blockKey in lastBlockMap) {
          block = lastBlockMap[blockKey];
          var elementsToRemove = utils.getBlockNodes(block.clone);
          this.$animate.leave(elementsToRemove);
          if (elementsToRemove[0].parentNode) {
            // if the element was not removed yet because of pending animation, mark it as deleted
            // so that we can ignore it later
            for (index = 0, length = elementsToRemove.length; index < length; index++) {
              elementsToRemove[index][NG_REMOVED] = true;
            }
          }
          block.scope.$destroy();
        }

        var nextNode: Node|any;

        // we are not using forEach for perf reasons (trying to avoid #call)
        for (index = 0; index < collectionLength; index++) {
          key = (collection === collectionKeys) ? index : collectionKeys[index];
          value = collection[key];
          block = nextBlockOrder[index];

          if (block.scope) {
            // if we have already seen this object, then we need to reuse the
            // associated scope/element

            nextNode = previousNode;

            // skip nodes that are already pending removal via leave animation
            do {
              nextNode = nextNode.nextSibling;
            } while (nextNode && nextNode[NG_REMOVED]);

            if (utils.getBlockStart(block) != nextNode) {
              // existing item which got moved
              this.$animate.move(utils.getBlockNodes(block.clone), null, $(previousNode));
            }
            previousNode = utils.getBlockEnd(block);
            utils.updateScope(block.scope, index, this.valueIdentifier, value, this.keyIdentifier, key, collectionLength);
          } else {
            // new item which we don't know about
            $transclude((clone: any, scope: ng.IScope) => {
              block.scope = scope;
              // http://jsperf.com/clone-vs-createcomment
              var endNode = this.ngRepeatEndComment.cloneNode(false);
              clone[clone.length++] = endNode;

              // TODO(perf): support naked previousNode in `enter` to avoid creation of jqLite wrapper?
              this.$animate.enter(clone, null, $(previousNode));
              previousNode = endNode;
              // Note: We only need the first/last node of the cloned nodes.
              // However, we need to keep the reference to the jqlite wrapper as it might be changed later
              // by a directive with templateUrl when its template arrives.
              block.clone = clone;
              nextBlockMap[block.id] = block;
              utils.updateScope(block.scope, index, this.valueIdentifier, value, this.keyIdentifier, key, collectionLength);
            });
          }
        }
        lastBlockMap = nextBlockMap;
      });
    }

    public postLink($scope: ng.IScope, $el: ng.IAugmentedJQuery, $attr: ng.IAttributes) {
      // Stuff after link...
    }
  }

  angular
    .module('ng-repeat-infinity', [])
    .factory('ngRepeatInfinityObject')
    .directive('ngRepeatInfinity', ($injector: ng.auto.IInjectorService) => {
      return $injector.instantiate<NgRepeatInfinity>(NgRepeatInfinity);
    });
}