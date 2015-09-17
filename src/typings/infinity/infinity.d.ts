/// <reference path="../jquery/jquery.d.ts" />
declare namespace infinity {
  export class ListView {
    // ### Constructor
    //
    // Creates a new instance of a ListView.
    //
    // Takes:
    //
    // - `$el`: a jQuery element.
    // - `options`: an optional hash of options
    constructor($el: JQuery, options: {});
    
    // ### append
    //
    // Appends a jQuery element or a ListItem to the ListView.
    //
    // Takes:
    //
    // - `obj`: a jQuery element, a string of valid HTML, or a ListItem.
    //
    // TODO: optimized batch appends
    append<T extends JQuery>(obj: T): ListItem<T>;
    append<T extends string>(obj: T): ListItem<T>;
    append<T>(obj: ListItem<T>): ListItem<T>;

    // ### prepend
    //
    // Prepend a jQuery element or a ListItem to the ListView.
    //
    // Takes:
    //
    // - `obj`: a jQuery element, a string of valid HTML, or a ListItem.
    //
    // TODO: optimized batch prepend
    prepend<T extends JQuery>(obj: T): ListItem<T>;
    prepend<T extends string>(obj: T): ListItem<T>;
    prepend<T>(obj: ListItem<T>): ListItem<T>;
    
    // ### remove
    //
    // Removes the ListView from the DOM and cleans up after it.
    remove() : void;
    
    // ListView querying
    // -----------------

    // ### find
    //
    // Given a selector string or jQuery element, return the items that hold the
    // given or matching elements.
    //
    // Note: this is slower than an ordinary jQuery find. However, using jQuery
    // to find elements will be bug-prone, since most of the elements won't be in
    // the DOM tree. Caching elements is usually important, but it's even more
    // important to do here.
    //
    // Arguments:
    //
    // - `findObj`: A selector string, or a jQuery element.
    //
    // Returns a ListItem.
    find<T extends JQuery>(obj: T): ListItem<T>[];
    find<T extends string>(obj: T): ListItem<T>[];
    find<T>(obj: ListItem<T>): ListItem<T>[];
    
    // ListView cleanup
    // ----------------
    cleanup() : void;
  }

  export class ListItem<T> {
    // ### clone
    //
    // Clones the ListItem.
    clone() : void;
    
    // ### remove
    //
    // Removes the ListItem and its elements from the page, and cleans up after
    // them.
    remove() : void;
    
    // ### cleanup
    //
    // Cleans up after the ListItem without removing it from the page.
    cleanup() : void;

  }
}