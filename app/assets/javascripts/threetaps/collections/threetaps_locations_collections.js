Craiggers.Collections.DynamicLocations = Backbone.Collection.extend({

  //old function - use only for posting form on step 2.
  initialize: function() {
    var codes = this.codes = {};
    $('#locations .code').each(function() {
      var c = $(this), el = $();
      if ( c.parents('.city').length)
        el =  c.parents('.city');
      else if ( c.parents('.state').length)
        el = c.parents('.state');
      else if ( c.parents('.country').length)
        el = c.parents('.country');
      codes[c.text()] = el;
    });
  },

  deepCode: function(locations) {
    if(!locations) return false

    var deepCode = ''
    var levels = ['country', 'state', 'metro', 'region', 'county', 'city', 'locality']
    if( arguments[1] )
      levels_tmp = levels.slice(0, levels.length + arguments[1])
    else
      levels_tmp = levels

    _.each(levels_tmp, function(level) {
      if(locations[level])
        deepCode = locations[level]
    })

    return deepCode
  },

  deepCodeLevel: function(locations) {
    if(!locations) return false

    var deep = {}
    var levels = ['country', 'state', 'metro', 'region', 'county', 'city', 'locality']
    if( arguments[1] ) levels = arguments[1]

    _.each(levels, function(level) {
      if(locations[level])
        deep = {level: level, code: locations[level]}
    })
    return deep
  },

  extractLocationsContext: function(location) {
    var items = [];
    var levels = ['states', 'metros', 'regions', 'counties', 'cities', 'localities'];

    _.each(levels, function(level) {
      if(location.context[level])
        items.push(location.context[level][0]);
    })
    return items
  },

  //old function - use only for posting form on step 2.
  codeByName: function(name, options, withinstate) {
    var selector = '';
    if ( options && options.state ) {
      selector = '#locations .state > .clickable';
    }
    if ( options && (options.city || options.location_1 || options.loc_1) ) {
      selector = selector + '#location .city > .clickable';
    }
    name = name.toLowerCase();
    return $(_.detect(
      $(selector || '#locations .clickable'),
      function(clickable) {
        var text = $(clickable).text().toLowerCase();
        if ( withinstate ) {
          var state = $(clickable).parents('.state');
          return text === name && (state.children('.code').text() === withinstate || state.children('.clickable').text() === withinstate);
        } else {
          return text === name;
        }
      }
    )).siblings('.code').text();
  },

  //new function
  locationsCodes: function(code, callback) { 
    if(_.isObject(code)) code = code.code
    Craiggers.Connection.get_location_children_by_code_from_local_server(code).done(callback)
  },

  //new function
  neighborsCodes: function(code, callback) {
    if(_.isObject(code)) code = code.code
    Craiggers.Connection.get_location_by_code_from_local_server(code).done(callback)  
  },

  //new function
  nameByCode: function(code, callback, important) {
    if(_.isObject(code)) code = code.code

    if ( code != 'all' ) {
      var params = {
        url: LOCATION_API + code,
        dataType: 'json',
        success: callback
      };

      ( important ) ? $.ajax(params) : $.manageAjax.add('location', params);
    } else {
      return 'all locations';
    }
  },

  nameByCodeWithCallback: function(code, callback, important) {
    if( code == 'all' )
      callback('all locations');
    else
      this.nameByCode(code, callback, important);
  },

  parentCodeByCode: function(code, callback) {
    if(_.isObject(code)) code = code.code
    $.ajax({
      url: LOCATION_API + code,
      dataType: 'json',
      success: callback
    });
  },

  namesByCodes: function(codes, callback) {
    $.ajax({
       url: LOCATION_API + 'get/' + codes.join(','),
       dataType: 'json',
       success: callback
    });
  },

  extractCode: function(obj) {
    // TODO: try _(levels).map(getCode).compact().last()
    var levels = ['country', 'state', 'metro', 'region', 'county', 'city', 'locality'];
    var code, level;
    while ( !code ) {
      level = levels.pop()
      if ( !level ) {
        return ''
      };
      code = obj.location[level + 'Code'];
    };
    return code
  },

  extractLocationsList: function(loc) {
    var levels = ['countries', 'states', 'metros', 'regions', 'counties', 'cities', 'localities'];
    var subLocations = _(levels).chain().map(subLocation).compact();
    subLocations.push({
      code: loc.code,
      level: loc.level,
      name: loc.name,
    })
    return subLocations.value();

    function subLocation(level) {
      var subLoc = loc.context[level] && loc.context[level][0];
      if ( subLoc ) {
        return {
          code: subLoc.code,
          level: level,
          name: subLoc.name,
        }
      };
    };
  },

  extractLocationsListS: function(loc) {
    var levels = [
      ['countries','country'],
      ['states', 'state'],
      ['metros', 'metro'],
      ['regions', 'region'],
      ['counties', 'county'],
      ['cities', 'city'],
      ['localities', 'locality']
    ];
    var is_region = false;
    var subLocations = _(levels).chain().map(subLocation).compact();

    if(loc.level != 'city' || !is_region)
      subLocations.push({
        code: loc.code,
        level: loc.level,
        name: nameLocation(loc)
      })

    return subLocations.value();

    function subLocation(level) {
      if(level[1] == 'city' && is_region) return ;
      if(!loc.context) return ;
      var subLoc = loc.context[level[0]] && loc.context[level[0]][0];

      if ( subLoc ) {
        if(level[1] == 'region') is_region = true;
        return {
          code: subLoc.code,
          level: level[1],
          name: nameLocation(subLoc)
        }
      };
    };

    function nameLocation(loc) {
      if(loc.code == 'USA-SFO') return 'SF Bay Area';
      return loc.name
    };
  }
});
