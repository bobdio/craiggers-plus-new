Craiggers.Models.Search = Backbone.Model.extend({

    defaults: {
        query: '',
        location: { 'code': 'all'},
        radius: {},
        category: 'all',
        source: 'all',
        params: { subnav: 'workspace-link', nav: 'search-link' },
        safe: 'yes',
        url: '',
        categories: 'SSSS VVVV RRRR JJJJ SVCS CCCC DISC ZZZZ AAAA MMMM DDDD PPPP all',
    },


    initialize: function() {
        var search = this;

        search.bind('change:query', function (argument) {
          Craiggers.Search.set({ days_back: 1 })
        })

        search.set({'location_flag_response': 0});
        search.bind('change:url', function() {
            search.parseUrl();
            search.checkSafe();
        });
        search.bind('change:category', function() {
            var priceable = Craiggers.Categories.isPriceable(this.get('category'));
            if ( !priceable ) {
                this.update({
                    params: {
                        price: null
                    }
                });
                if ( this.get('params').sort === 'price' || this.get('params').sort === '-price' ) {
                    this.update({
                        params: {
                            sort: null,
                            order: null
                        }
                    });
                }
            }
            search.checkSafe();
        });
        //search.parseUrl();
        search.checkSafe();
    },

    parseUrl: function() {
        var url = this.get('url') || '';
        // !/search/location/category/source/query/params
        var parts = url.split('/');
        var category = parts[3];// support for multicategory search: (parts[3] || 'all').split(',');
        var source = parts[4]; // support for multisource search: (parts[4] || 'all').split(',');
        this.set({
            location: this.parseLocation(parts[2]),
            category: category, //categories.length > 1 ? categories : categories[0],
            source:   source,//s.length > 1 ? sources : sources[0],
            query:    decodeURIComponent(parts[5]),// || ''),
            params:   this.parseParams(parts[6])// || '')
        }, {silent: true});
    },

    generateUrl: function() {
        var query = encodeURIComponent(this.get('query'));
        var location = this.get('location');
        if ( _.isArray(location)){
            location = location.join(',');
        } else {
            if(location.code == 'all')
                location = 'all'
            else
                location = location.level + '=' + location.code
        }
        var category = this.get('category');
        //if ( _.isArray(category)) category = category.join(',');
        var source = this.get('source');
        //if ( _.isArray(source)) source = source.join(',');
        var url = ['!/search/',
            location + '/',
            category + '/',
            source + '/',
            query].join('');
        var params = this.get('params') || {};
        if ( _.keys(params).length ) {
            url = url + '/';
            url = url + _.map(params, function(val, key) {
                return key + '=' + val;
            }).join('&');
        }
        return url;
    },

    params: function(options) {
        var params = this.get('params');
        var data = {
            retvals:      [
                'heading', 'timestamp', 'category', 'location', 'images',
                'source', 'price', 'currency', 'status', 'id', 'external_url'
            ].join(','),

            // 'accountName', 'postKey', 'commentCount', 'annotations',
            // 'flagged', 'latitude', 'longitude', 'country', 'state', 'metro', 'region',
            // 'county', 'city', 'locality', 'sourceId', 'postingTimestamp'

//            days_back:    this.get('days_back'),
            rpp:          options && options.rpp || 50,
            page:         options && options.page || 0,
            annotations:  {}
            // safe:         this.get('safe')
        };

        var locations = this.get('location');//_.isArray(this.get('location')) ? this.get('location') : this.get('location').split(',');
        // locations = locations.join(' OR ').replace(/\sOR\s$/, '');
        if ( locations.code != 'all' ) {
          data[locations.level] = locations.code
        }

//        var categories =  _.isArray(this.get('category')) ? this.get('category') : this.get('category').split(',');
        var category = this.get('category')
//        category = categories.join(' OR ').replace(/\sOR\s$/, '');
        if ( category != 'all' ) {
            if( this.defaults.categories.match(category) )
                data.category_group = category;
            else
                data.category = category;
        }

//        var sources = _.isArray(this.get('source')) ? this.get('source') : this.get('source').split(',');
        var source = this.get('source')
//        source = sources.join(' OR ').replace(/\sOR\s$/, '');
        if ( source != 'all' ) {
            data.source = source;
        }

        if ( params.status)
            data.status = params.status;

        if ( Craiggers.Categories.isPriceable(category) ) {
            if ( params.price ) {
                data.price = params.price;
            }
            if ( params.sort === 'price' ) {
                data.sort = 'price';
            }
            if ( params.sort === '-price' ) {
                data.sort = '-price';
                data.reverse = true;
            }
            data.currency = 'USD'
        }

        _.extend(data, this.commonParams());

        if(data.radius) {
          delete data[locations.level]
        }

        if (params.age)
          data.annotations.age = params.age;
//        if ( params.maxage && params.minage ) {
//            data.annotations.age = params.minage + '-' + params.maxage;
//        } else if ( params.minage ) {
//            data.annotations.age = '>' + params.minage;
//        } else if ( params.maxage ) {
//            data.annotations.age = '<' + params.maxage;
//        };
//        if ( params.compensation === 'pay' ) {
//            data.annotations.compensation = 'not no pay';
//        } else if ( params.compensation === 'no-pay' ) {
//            data.annotations.compensation = 'no pay';
//        }

        _.each('telecommute contract internship partTime nonprofit'.split(' '),
            function(type) { setBoolAnnotations(type, 'on') })

        _.each(['cats', 'dogs'],
            function(type) { setBoolAnnotations(type, 'YES') })

        _.each('sqft bedrooms year age model make vin'.split(' '), setValAnnotations)

        if($.isEmptyObject(data.annotations)) delete(data.annotations);
        else data.annotations = buildAnnotations(data.annotations);

        return data;

        function setBoolAnnotations(type, yes) {
            if(params[type]) {
                if(params[type] == 'YES') data.annotations[type] = yes
                else data.annotations[type] = null
            }
        }
        function setValAnnotations(type) {
            if(params[type])
                data.annotations[type] = params[type]
        }

        function buildAnnotations(data) {
            var annotations = []
            $.each(data, function(key, value) {
                annotations.push(key + ':' + value)
            })
            return '{' + annotations.join(' AND ') + '}';
        }
    },

    summary: function(summaryParams, callback) {
        //  summaryParams = summaryParams || this.params();
        // return $.ajax({
        //   url: BASE_URL + '/summarizer/?' + AUTH_TOKEN,
        //   dataType: 'json',
        //   data: summaryParams,
        //   success: callback
        // });
    },

    fireSearch: function(options) {
        Craiggers.Search.started_search_at = (new Date).getTime();

//        initDatamap();
//        updateDatamap();
        var params = this.params(options);
        var search = this;
        var running = $.ajax({
            url: BASE_URL + '/search/?' + AUTH_TOKEN,
            data: params,
            dataType: 'json',
            type: 'get',
            success: function(data, textStatus, jqXHR) {
                search.on.success(data, textStatus, jqXHR, params);
            },
            error: search.on.error,
            complete: search.on.complete
        });

        // TODO move to search view
        $('#cancel-running-search').click(function() {
            running.abort();
            $.fancybox.close();
        });
        // end move

        _gaq.push(['_trackPageview', '/search']);
    },

    checkSafe: function() {
    this.set({
      safe: ( this.get('category') === 'all' ) ? 'yes' : 'no',
      silent: true
    });
  },

  categoryParams: function() {
    // cached value
    if ( this._categoryParams )
      return this._categoryParams

    var defaults = [
        'sort', 'title-only', 'has-image', 'original_locality', 'status',
        'has-price', 'radius', 'start', 'end', 'nav', 'subnav', 'postKey',

        'dogs', 'cats', 'bedrooms', 'sqft', 'make', 'model', 'vin', 'year',
        'age', 'personal_flavor', 'compensation', 'partTime', 'telecommute',
        'contract', 'internship', 'nonprofit'
    ];
    var params = {};
    _.each(this.get('categories').split(' '), function(cat) {
      params[cat] = [];
    });

//    var categorySpecParams = this.get('categorySpecParams') || {};
//    _.each(_.clone(categorySpecParams), function(properties, cat) {
//      _.each(Craiggers.Categories.childrenCodes(cat), function(v) {
//        categorySpecParams[v] = properties;
//      })
//    });
//    _.extend(params, categorySpecParams);

    _.each(_.keys(params), function(category) {
      if ( Craiggers.Categories.isPriceable(category) ) {
        params[category] = params[category].concat(['price', 'order']);
      }
      params[category] = params[category].concat(defaults);
    });

    this._categoryParams = params;
    return params;
  },

  update: function(attributes) {
    var params = this.get('params');
    if ( _.isString(attributes.params) ) {
      console.error('params is a string');
      _.extend(params, this.parseParams(attributes.params));
      attributes.location = this.parseLocation(attributes.location);
    } else {
      _.extend(params, attributes.params);
    }

    var loc = attributes.location;
    // clear out zip and within params when location is specified
    // if ( loc && loc.code != this.defaults.location.code ) {
    //   params.radius = null;
    // };
    // otherwise clear out location
    // if ( params.lat && params.long && params.radius) {
    //   loc = this.defaults.location;
    // };

    if ( !loc ) loc = this.get('location');
    var originalLoc = params.original_locality;
    if ( originalLoc ) {
      if ( Craiggers.Neighborhoods.includes(loc, originalLoc) ) {
        // REVIEW: is this needed?
        // params.original_locality = encodeURIComponent(params.original_locality)
      } else {
        params.original_locality = '' // reset neighborhoods
      };
    };

    this.set({
      location: loc,
      category: attributes.category || this.get('category')
    });
    this.set({ source: attributes.source || this.get('source') });
    this.checkSafe();
    if ( !_.isUndefined(attributes.query) ) {
      this.set({ query: decodeURIComponent(attributes.query) });
    }

    var search = this;

    var category = this.get('category');
    if ( !_.isArray(category) ) category = [category];
    var catparams = _.flatten(_.map(category, function(c) {
      // TODO: refactoring
      return search.categoryParams()[c]
             || search.categoryParams()[Craiggers.Categories.parentCode(c)]
             || search.categoryParams()[Craiggers.Categories.categoryByCode(c)];
    }));
    _.each(params, function(val, key) {
      if ( !val || !_.include(catparams, key) ) {
        delete params[key];
      }
    });

    this.set({ url: this.generateUrl() });

    return this;
  },

  locationAsArray: function() {
    var location = this.get('location');
    if ( !_.isArray(location)) location = [location];
    return location;
  },

  parseParams: function(str) {
    var params = {};
    _.each(str.split('&'), function(p) {
      var keyval = p.split('=');
      if ( keyval[0] && keyval[1] )
        params[keyval[0]] = decodeURIComponent(keyval[1]);
    });
    return params;
  },

  // splits str by '=' sign,
  // returns both parts in format {'level' : part0, 'code' : part1}
  // if str is not split returns {'code': 'all'}
  parseLocation: function(str) {
    var data = str.split('=')
    if(data[0] && data[1])
      return { 'level': data[0], 'code': data[1] }
    else
      return { 'code': 'all' }
  },

  commonParams: function() {
    var params = this.get('params');
    var data = {};

    if ( params.sort === 'relevant' ) {
      data.sort = 'relevancy';
    }

    // edit query in order to support grouping search
    var query = this.get('query');
    if ( ~query.indexOf('|') ) {
      query = _.map(query.split(' | '), function(s) {
        s = _.trim(s);
        return ( ~s.indexOf(' ') ) ? '(' + s + ')' : s
      }).join(' | ');
    };
    // title-only vs entire-post
    if ( params['title-only'] ) {
      data.heading = query;
    } else {
      if(query) data.text = query;
    }

    // dates
    if ( params.start && params.end) {
      var start = new Date(params.start);
      var end = new Date(params.end);

      var start_str = start.getTime()/1000;
      start_str += start.getTimezoneOffset()*60;
      var end_str = end.getTime()/1000;
      end_str += end.getTimezoneOffset()*60 + 86399;

      data.timestamp = start_str + '..' + end_str;
    }
    else if (this.get('days_back') != undefined) {
      data.timestamp = this.get('days_back') + 'd..';
    }

    // has images
    if ( params['has-image'] ) data.has_image = 1;

    if ( params['has-price'] ) data.price = '*';

    // radius filter
    if((lat = Craiggers.Search.get('radius').lat)
        && (long = Craiggers.Search.get('radius').long)
        && params.radius){

      var additional = 0,
          distance = Number(params.radius.replace(/[a-z]/g, '')),
          dimension = params.radius.replace(/[0-9]/g, '');

      switch(Craiggers.Search.get('location').level) {
        case 'state': additional = 50; break;
        case 'metro': additional = 20; break;
        case 'region': additional = 15; break;
        case 'locality': additional = 2; break;
        case 'city':
        case 'zip': additional = 10; break;
      }

      if( additional )
        switch(dimension) {
          case 'km':
            additional = additional * 1.6; break;
          case 'm':
            additional = additional * 1609; break;
          case 'ft':
            additional = additional * 5280; break;
        }


      _.extend(data, {
        lat: lat,
        long: long,
        radius: (distance + additional) + dimension
      })
    }

    return data
  },

  submit: function(options) {
    this.trigger('search:submit');
    $('.newmatches').hide();
    if (interval)
      clearInterval(interval);
    if ( !$('#search.page').is(':visible') )
      new Craiggers.Pages.Search();

    Craiggers.Controller.saveLocation(this.generateUrl());
    $.fancybox({
      autoDimensions: false,
      centerOnScroll: true,
      content: JST['searching-popup'](),
      enableEscapeButton: false,
      height: 60,
      hideOnOverlayClick: false,
      onComplete: function() {
        Craiggers.Search.fireSearch(options);
      },
      showCloseButton: false,
      transitionIn: 'none',
      transitionOut: 'none',
      width: 200
    });

    // TODO this was under annotation model check
    // Notify treemaps
//    var annotations = {},
//        query = { annotations: annotations },
//        locationCode = this.get('location').code,
//        categoryCode = this.get('category');
//
//    if ( !_.isArray(locationCode) ) {
//      CraiggersDatamap(locationCode);
//    }
//
//    CraiggersTreemap.update({
//      query: this.get('query'), // TODO pass whole query
//      location: locationCode,
//      category: categoryCode
//    });
  },

  data: function() {
  },

  on: {
    success: function(data, textStatus, jqXHR, params) {
      if ( !data.success ) {
        $.fancybox.close();
        alert("Uh oh, it seems like there's something funky with your search request. Please try again.");
        return;
      }
      if ( params.page === 0 ) {
        Craiggers.Postings = new Craiggers.Collections.Postings;
      }
      Craiggers.Postings.add(data.postings);

      _.extend(Craiggers.Postings, {
        page:           params.page,
        rpp:            params.rpp,
        totalresults:   data.num_matches || 0,
        exectime:       (new Date).getTime() - Craiggers.Search.started_search_at,
        exectimeAPI:    data.time_taken
      });

      new Craiggers.Views.Postings({
        collection:     Craiggers.Postings,
        page:           Craiggers.Postings.page,
        rpp:            Craiggers.Postings.rpp,
        totalresults:   Craiggers.Postings.totalresults,
        exectime:       Craiggers.Postings.exectime,
        exectimeAPI:    Craiggers.Postings.exectimeAPI,
        select:         Craiggers.Search.get('params').postKey
      });
      if ( params.page === 0 ) {
        $(document).scrollTop(0);
      }
      new Craiggers.Views.CurrentSearch();
      
      Craiggers.Search.anchor = data.anchor;
        interval = setInterval(function(){
            var timestamp = parseInt(Craiggers.Postings.at(0).get('timestamp')) + 1;
            var curTime = Math.round(new Date().getTime() / 1000);
            params.timestamp = timestamp + ".." + curTime;
            params.rpp = 1;
            $.ajax({
                url: BASE_URL + '/search/?' + AUTH_TOKEN,
                data: params,
                dataType: 'json',
                type: 'get',
                success: function(data){
                    var num = data.num_matches;
                    if (num > 0 && Craiggers.postingsMode != 'favorites' ) {
                        if (num == 1)
                            $('.newmatches').text(num + ' newer result').show();
                        else
                            $('.newmatches').text(num + ' newer results').show();
                }
              }
            });
        }, 10000)

    },
    error: function(jqXHR, textStatus, errorThrown) {
    },
    complete: function(jqXHR, textStatus) {
      $.fancybox.close();
      Craiggers.Search.trigger('search:complete');
      $(window).resize();
    }
  }
});

