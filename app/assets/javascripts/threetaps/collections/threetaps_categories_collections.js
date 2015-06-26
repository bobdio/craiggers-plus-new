Craiggers.Collections.ThreeTapsCategories = Backbone.Collection.extend({

  initialize: function() {
    var codes = this.codes = {};
    $('#categories .code').each(function(index, code_el) {
      var el
      var code_el = $(code_el)
      if ( code_el.parents('.subcat').length ){
        el = code_el.parents('.subcat')
      } else if ( code_el.parents('.cat').length ) {
        el =  code_el.parents('.cat')
      }
      codes[code_el.text().toLowerCase()] = el
    });
  },

  elByCode: function(code) {
    if ( !code || typeof(code)!= 'string' ) return $();
    return this.codes[code.toLowerCase()] || $();
  },

  _categoryType: function(code) {
    if ( code === 'all') return 'all';

    var el = this.elByCode(code);
    if ( el.is('.cat')) return 'cat';
    if ( el.is('.subcat')) return 'subcat';
    console.error('Unknown category type: ' + code);
  },

  nameByCode: function(code) {
    var el = this.elByCode(code);
    return el.children('.clickable').text();
  },

  shortNameByCode: function(code) {
    return this.nameByCode(code)
  },

  categoryByCode: function(code) {
    var el = this.elByCode(code);
    if ( el.is('.cat') )
      return code;

    return el.parents('.cat').children('.code').text() || 'all';
  },

  childrenCodes: function(code) {
    // HACK
    if ( code == 'all' )
      return this.siblingCodes('SSSS')

    return _(this.elByCode(code).find('.subcat')).map(function(s) {
      return $(s).children('.code').text();
    })
  },

  parentCode: function(code) {
    var el = this.elByCode(code);
    if (el.is('.cat')){
      return 'all'
    }

    if (el.is('.subcat')){
      return el.parents('.cat').children('.code').text()
    }
  },

  isTopLevel:  function(code) {
    var el = this.elByCode(code);
    return el.is('.cat')
  },

  siblingCodes: function(code) {
    var categories = this;
    if ( this.isCat(code) || code === 'all' )
      return _($('#categories .cat'))
        .chain()
        .map(function(el) { return $(el).children('.code').text(); })
        .reject(function(code) { return code === 'all' })
        .value();

    if ( this.isSubcat(code) )
      return _(this.elByCode(code).parents('.cat').find('.subcat'))
        .map(function(el) { return $(el).children('.code').text(); })
  },

  hasChildrenCodes: function(code) {
    return code == 'all' || this.isCat(code)
  },

  codeByName: function(name, scope) {
    name = name.toLowerCase();
    return $(_.detect(
      $('#categories .clickable'),
      function(clickable) {
        var text = $(clickable).text().toLowerCase();
        if ( scope )
          return text === name
                 && ( $(clickable).parents('.cat').children('.clickable').text() === scope
                      || $(clickable).parents('.cat').children('.code').text() === scope )

        return text === name;
      }
    )).siblings('.code').text();
  },

  getSubCategoryList: function() {
    var cats_codes = [], cats = [];
    _.each($('#categories .subcat'), getSubcat);

    function getSubcat (cat) {
      var parent = $(cat).parents('.cat').children('.clickable').text(),
          name = $(cat).children('.clickable').text(),
          code = $(cat).children('.code').text();

      if($.inArray(code, cats_codes) == -1) {
        cats_codes.push(code);
        cats.push({
          path: parent + ' > ' + name,
          name: name,
          code: code
        })
      }
    };

    return cats;
  },

  getCategoryList: function() {
    var cats = _.map($('#categories .clickable'),
      function(cat) {
        var $cat = $(cat),
            cats = [],
            code = $cat.siblings('.code').text(),
            s = ' > ',
            is_subcat =  !!$cat.parent('.subcat').length,
            parent = $cat.parents('.cat').children('.clickable').text();
        if ( is_subcat ) {
          cats.push({
            path: parent + s + $cat.text(),
            name: $cat.text(),
            code: code
          });
        } else {
          // it's a category. it has no parents.
          parent = null;
        }
        cats.push({
          path: $cat.text(),
          name: $cat.text(),
          code: code,
          parents: parent
        });
        return cats;
      }
    );
    return _.flatten(cats);
  },

  isPriceable: function(code) {
    if ( _.isArray(code) )
      return false;

    if(!this.isTopLevel(code))
      code = this.parentCode(code)

    return code === 'VVVV' || code === 'SSSS' || code === 'RRRR';
  },

  // duplicated in craigslist_categories_collections
  has: function(name) {
    return !!this.codeByName(name).length;
  },

  // duplicated in craigslist_categories_collections
  isCat: function(code) {
    return this._categoryType(code) === 'cat';
  },

  // duplicated in craigslist_categories_collections
  isSubcat: function(code) {
    return this._categoryType(code) === 'subcat';
  },

  // duplicated in threetaps_categories_collections
  isSubcat_2: function(code) {
    return this._categoryType(code) === 'subcat_2';
  },

});

