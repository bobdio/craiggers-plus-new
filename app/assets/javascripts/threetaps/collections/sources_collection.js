Craiggers.Collections.Sources = Backbone.Collection.extend({

  initialize: function() {
    var codes = this.codes = {};
    $('#srces .code').each(function() {
      var c = $(this);
      if ( c.parents('.source').length)
        el =  c.parents('.source');
      codes[c.text().toLowerCase()] = el;
    });
    var sources = this;
    sources['isSource'] = function(code) {
      try {
        return 'source' === sources.sourceType(code);
      } catch(e) {
        return false;
      }
    };
  },

  sourceType: function(code) {
    if ( code === 'all') return 'all';
    var el = this.elByCode(code);
    if ( el.hasClass('source')) return 'source';
    throw 'Unknown source type.';
  },

  elByCode: function(code) {
    if ( !code) return $();
    return this.codes[code.toLowerCase()] || $();
  },

  nameByCode: function(code) {
    return this.clickableByCode(code).text();
  },

  codeByName: function(name, scope) {
    name = name.toLowerCase();
    return $(_.detect(
      $('#srces .clickable'),
      function(clickable) {
        var text = $(clickable).text().toLowerCase()
        if ( scope ) {
          return text === name && ($(clickable).parents('.source').children('.clickable').text() === scope || $(clickable).parents('.source').children('.code').text() === scope);
        } else {
          return text === name;
        }
      }
    )).siblings('.code').text();
  },

  clickableByCode: function(code) {
    var el = this.elByCode(code);
    return el.children('.clickable');
  },

  match: function(q) {
    return _.uniq(
             _.select(
               _.map(
                 $('#srces .clickable'), function(source) {
                   return $(source).text();
                 }
               ),
               function(val) {
                 return val.match(new RegExp("^(" + q +")", "i"));
               }
             )
           );
  },

  sourceByCode: function(code) {
    var el = this.elByCode(code);
    if ( el.hasClass('source') )
      return code;
    return el.parents('.source').children('.code').text() || 'all';
  },

  siblingCodes: function(code) {
    var sources = this;
    if ( this.isSource(code) || code === 'all' ) {
      return _($('#srces .source'))
        .chain()
        .map(function(el) { return $(el).children('.code').text(); })
        .reject(function(code) { return code === 'all' })
        .value();
    }
  },

  childrenCodes: function(code) {
    return [];
  }
});
