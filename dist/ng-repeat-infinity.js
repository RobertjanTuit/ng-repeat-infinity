var ngRepeatInfinity;
(function (ngRepeatInfinity) {
    var ngRepeatEndComment;
    var expressionMatch = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
    var NgRepeatInfinity = (function () {
        // @NgAnnotate
        function NgRepeatInfinity($parse) {
            this.$parse = $parse;
            this.restrict = 'A';
            this.transclude = 'element';
            this.priority = 1000;
            this.link = {
                pre: this.preLink.bind(this),
                post: this.postLink.bind(this)
            };
            this.compile = this.unboundCompile.bind(this);
            infinity.config.PAGE_TO_SCREEN_RATIO;
        }
        NgRepeatInfinity.prototype.unboundCompile = function ($el, $attr, transclude) {
            var expression = $attr.ngRepeatInfinity;
            ngRepeatEndComment = document.createComment(' end ngRepeatInfinity: ' + expression + ' ');
            var match = expression.match(expressionMatch);
            if (!match) {
                throw "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '" + expression;
            }
            return new NgRepeatInfinity(this.$parse).link;
        };
        NgRepeatInfinity.prototype.preLink = function ($scope, $el, $attr) {
            this.infinity = new infinity.ListView($el.parent(), { lazy: function ($el) {
                    // Do something to items thata were outside of the viewport and are now displayed...
                } });
            this.infinity.$el.after($(ngRepeatEndComment.cloneNode(false)));
        };
        NgRepeatInfinity.prototype.postLink = function ($scope, $el, $attr) {
        };
        return NgRepeatInfinity;
    })();
    angular
        .module('ng-repeat-infinity', [])
        .directive('ngRepeatInfinity', function ($parse) {
        return new NgRepeatInfinity($parse);
    });
})(ngRepeatInfinity || (ngRepeatInfinity = {}));
