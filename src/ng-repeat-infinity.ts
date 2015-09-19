/// <reference path="reference.d.ts" />
namespace ngRepeatInfinity {
  
  interface Attributes extends ng.IAttributes {
    ngRepeatInfinity: string;
  } 
  
  var ngRepeatEndComment: Comment;
     
  var expressionMatch = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
  class NgRepeatInfinity {
    private infinity: infinity.ListView<JQuery>;

    public restrict = 'A';
    public transclude = 'element'; 
    public priority = 1000;
    public link: ng.IDirectivePrePost;
    public compile: ng.IDirectiveCompileFn;
    
    // @NgAnnotate
    constructor(private $parse: ng.IParseProvider) {
      this.link = { 
        pre: this.preLink.bind(this), 
        post: this.postLink.bind(this) 
      };
      this.compile = this.unboundCompile.bind(this);
      
      infinity.config.PAGE_TO_SCREEN_RATIO
    }
    
    public unboundCompile($el: ng.IAugmentedJQuery, $attr: Attributes, transclude: ng.ITranscludeFunction): ng.IDirectivePrePost {
      var expression = $attr.ngRepeatInfinity;
      ngRepeatEndComment = document.createComment(' end ngRepeatInfinity: ' + expression + ' ');
      var match = expression.match(expressionMatch);
      if (!match) {
        throw `Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '${expression}`;
      }
      return new NgRepeatInfinity(this.$parse).link;
    }
    
    public preLink($scope: ng.IScope, $el: ng.IAugmentedJQuery, $attr: ng.IAttributes) {
      this.infinity = new infinity.ListView<JQuery>($el.parent(), { lazy: ($el: infinity.ListItem<JQuery>) => {
        // Do something to items thata were outside of the viewport and are now displayed...
      }});
      this.infinity.$el.after($(ngRepeatEndComment.cloneNode(false)));
    }
    
    public postLink($scope: ng.IScope, $el: ng.IAugmentedJQuery, $attr: ng.IAttributes) {
    }
  }
  
  angular
    .module('ng-repeat-infinity', [])
    .directive('ngRepeatInfinity', ($parse) => { 
      return new NgRepeatInfinity($parse);
    });
}