var SINGLE_SEARCH_DEFAULT_CONFIG = {
  total_amount_of_shown_postings: 0,
  amount_found_postings_to_show: 0,
  num_matches: 0,
  total_results: 0,
  total_results_of_new_postings: 0,
  total_results_of_older_postings: 0,
  main_search_running: undefined,
  promoted_search_running: undefined,
  detailed_search_running: undefined,
  timestamp_left_border: undefined,
  timestamp_right_border: undefined,
  promoted_posting_already_included: undefined,
  main2_already_included: undefined,
  jeboom_posting_already_included: undefined,
  started_search_at: undefined,
  type_of_search: 'new_search',
  search_from_homepage: undefined,
  oldest_posting_timestamp: undefined,
  newest_posting_timestamp: undefined,
  anchor: undefined,
  postings: undefined,
  page: 0,
  tier: 0,
  rpp: 25,
  next_page: 0,
  next_tier: 0,

  exectime: 0,
  exectimeTotal: 0,
  exectimeFetch: 0,
  exectimeSearch: 0,

  summary_by_source_data: undefined
}

Craiggers.Models.Search = Backbone.Model.extend({

  defaults: _.extend({
    query: '',
    location: { 'code': 'all'},
    radius: {},
    category: 'all',
    source: 'all',
    params: { subnav: 'workspace-link', nav: 'search-link' },
    safe: 'yes',
    url: '',
    categories: 'SSSS VVVV RRRR JJJJ SVCS CCCC DISC ZZZZ AAAA MMMM DDDD PPPP all',
  }, SINGLE_SEARCH_DEFAULT_CONFIG),

  initialize: function() {
    var search = this;

    search.bind('change:query', function (argument) {
      Craiggers.Search.set({ timestamp_left_border: undefined })
      Craiggers.Search.set({ timestamp_right_border: undefined })
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
    search.checkSafe();
  },

  fireSearch: function(options) {
    var search = this;
    var params = this.params(options);
    if (this.get('search_from_homepage')){
      $('#postings .postings').html('')
      this.set({ search_from_homepage: undefined })
    }

    params = Craiggers.Util.modify_params_for_url_for_safe_search(params)

    this.set({ started_search_at: (new Date).getTime() })

    var main_search_running = Craiggers.Util.get_search_request(params)
    this.set({ main_search_running: main_search_running})

    var main_search2_running = Craiggers.Util.get_search2_request(params)
    this.set({ main_search2_running: main_search2_running})

    var promoted_search_running = Craiggers.Util.get_promoted_search(params, this)
    this.set({ promoted_search_running: promoted_search_running })

    var detailed_search_running = Craiggers.Util.get_detailed_search(params, this)
    this.set({ detailed_search_running: detailed_search_running })

    var local_search_running = Craiggers.Util.get_local_search_request(params)
    this.set({ local_search_running: local_search_running})

    var jeboom_search_running = Craiggers.Util.get_jeboom_search(params, this)
    this.set({ jeboom_search_running: jeboom_search_running})

    var stastart = new Date().getTime()
    $.when(main_search_running, main_search2_running, promoted_search_running, detailed_search_running, local_search_running, jeboom_search_running).done(function(main_data, main2_data, promoted_data, detailed_data, local_data, jeboom_data){
      var endend = new Date().getTime()
      var diff = endend - stastart
      console.log(diff / 1000)

      search.set({ amount_found_postings_to_show: (main_data[0].postings.length + main2_data[0].postings.length + local_data[0].length) })

      if (promoted_data != undefined && promoted_data[0].postings[0]!= undefined){
        promoted_data[0].postings[0]['promoted'] = true
        main_data[0].postings.splice(2, 0, promoted_data[0].postings[0])
        search.set({ promoted_posting_already_included: true })
      }

      main_data[0].postings = $.merge(main_data[0].postings, main2_data[0].postings)
      main_data[0].postings = $.merge(main_data[0].postings, local_data[0])

      if (jeboom_data != undefined && jeboom_data[0].postings[0]!= undefined){
        jeboom_data[0].postings[0]['jeboom'] = true
        main_data[0].postings.splice(0, 0, jeboom_data[0].postings[0])
        search.set({ jeboom_posting_already_included: true })
      }
      if (detailed_data != undefined && detailed_data[0].postings[0] != undefined){
        var temp_detailed_posting = new Craiggers.Collections.Postings()
        temp_detailed_posting.add(detailed_data[0].postings[0])
        new Craiggers.Views.PostingDetail({ model: temp_detailed_posting.models[0] }).render()
      }

      // Ugly hack to sort postings merged from different sources
      if (!params['sort']) {
        function sort_by(a, b){
          var aName = a['timestamp'].toString();
          var bName = b['timestamp'].toString();
          return (aName == bName) ? 0 : (aName < bName) ? 1 : -1;
        }
      } else {
        function sort_by(a, b){
          var aID = parseInt(a['price'] || 0);
          var bID = parseInt(b['price'] || 0);
          if (params['sort'] == '-price') {
            return (aID == bID) ? 0 : (aID < bID) ? 1 : -1;
          } else {
            return (aID == bID) ? 0 : (aID > bID) ? 1 : -1;
          }
        }

      }

      main_data[0].postings.sort(sort_by);

      search.on.success(main_data[0], null, null, params);
    }).always(function(){
      search.on.complete()
    })

    _gaq.push(['_trackPageview', '/search']);
  },

  on: {
    success: function(data, textStatus, jqXHR, params) {
      var search = Craiggers.Search


      if(!data.success) {
        $.fancybox.close();
        alert("Uh oh, it seems like there's something funky with your search request. Please try again.");
        return;
      }


      search.set({ num_matches: data.num_matches || 0})
      search.set({ postings: Craiggers.Util.add_postings_to_hash(search.get('postings'), data.postings) })

      console.log('num_matches ' + search.get('num_matches'))
      if (search.get('type_of_search') === 'show_older_postings'){
        search.set({ total_results_of_older_postings: search.get('num_matches') })
      }
      if (search.get('type_of_search') === 'new_search'){
        search.set({ total_results_of_new_postings: search.get('num_matches') })
        search.set({ anchor: data.anchor })
        search.set({ newest_posting_timestamp: (_.first(data.postings) && _.first(data.postings)['timestamp']) || undefined})
        Craiggers.Postings._reset()
      }
      search.set({ total_results: search.get('total_results_of_new_postings') +  search.get('total_results_of_older_postings')})

      console.log(search.get('type_of_search'))
      console.log('total_results_of_new_postings ' + search.get('total_results_of_new_postings'))
      console.log('total_results_of_older_postings ' + search.get('total_results_of_older_postings'))
      console.log('amount_found_postings_to_show ' + search.get('amount_found_postings_to_show'))
      console.log('total_results ' + search.get('total_results'))

      search.set({ oldest_posting_timestamp: (_.last(data.postings) && _.last(data.postings)['timestamp']) || undefined})
      search.set({ exectime: (new Date).getTime() - Craiggers.Search.get('started_search_at') })
      search.set({ exectimeTotal: parseInt(data.time_taken) })
      search.set({ exectimeFetch: parseInt(data.time_taken_fetch) })
      search.set({ exectimeSearch: parseInt(data.time_taken_search) })
      if (typeof search.get('total_amount_of_shown_postings') === 'undefined'){
        search.set({ total_amount_of_shown_postings: search.get('amount_found_postings_to_show')})
        Craiggers.Postings = new Craiggers.Collections.Postings
        $(document).scrollTop(0)
      } else {
        search.set({ total_amount_of_shown_postings: search.get('total_amount_of_shown_postings') + search.get('amount_found_postings_to_show')})
      }

      Craiggers.Postings.add(data.postings);
      _.extend(Craiggers.Postings, {
        page:           params.page,
        rpp:            params.rpp,
      })
      new Craiggers.Views.CurrentSearch()

      interval = Craiggers.Util.setIntervalSearchUpdate(params)

      search.set({ next_page: data.next_page || 0})
      search.set({ next_tier: data.next_tier || 0})
    },

    complete: function(jqXHR, textStatus) {
      $.fancybox.close();
      Craiggers.Search.trigger('search:complete');

      // INCLUDE RENDERING POSTINGS
      Craiggers.Views.NavBar.prototype.toggle()

      $(window).resize();
    }
  },

  params: function(options) {
    var params = this.get('params');
    var data = {
      retvals:      [
          'heading', 'timestamp', 'category', 'location', 'images',
          'source', 'price', 'currency', 'status', 'id', 'external_url', 'body', 'annotations'
      ].join(','),

      // 'accountName', 'postKey', 'commentCount', 'annotations',
      // 'flagged', 'latitude', 'longitude', 'country', 'state', 'metro', 'region',
      // 'county', 'city', 'locality', 'sourceId', 'postingTimestamp'

//            timestamp_left_border:    this.get('timestamp_left_border'),
      rpp:          this.get('rpp'),
      page:         this.get('page'),
      tier:         this.get('next_tier'),
      annotations:  {},
      safe:         this.get('safe'),
      anchor:       this.get('anchor')
    };
    var locations = this.get('location');//_.isArray(this.get('location')) ? this.get('location') : this.get('location').split(',');
    // locations = locations.join(' OR ').replace(/\sOR\s$/, '');
    if ( locations.code != 'all' ) { data[locations.level] = locations.code }

//        var categories =  _.isArray(this.get('category')) ? this.get('category') : this.get('category').split(',');
    var category = this.get('category')
//        category = categories.join(' OR ').replace(/\sOR\s$/, '');
    if ( category != 'all' ) {
      if( this.defaults.categories.match(category) ){
        data.category_group = category
      } else {
        data.category = category
      }
    }

//        var sources = _.isArray(this.get('source')) ? this.get('source') : this.get('source').split(',');
    var source = this.get('source')
//        source = sources.join(' OR ').replace(/\sOR\s$/, '');
    if ( source != 'all' ) { data.source = source }
    if ( params.status){ data.status = params.status }

    if ( Craiggers.Categories.isPriceable(category) ) {
      if ( params.price ) { data.price = params.price }
      if ( params.sort === 'price' ) { data.sort = 'price' }
      if ( params.sort === '-price' ) {
        data.sort = '-price'
        data.reverse = true
      }
      data.currency = 'USD'
    }

    _.extend(data, this.commonParams());

    if(data.radius) { delete data[locations.level] }
    if (params.age){ data.annotations.age = params.age }
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

    _.each('telecommute contract internship partTime nonprofit'.split(' '), function(type) { setBoolAnnotations(type, 'on') })
    _.each(['cats', 'dogs'], function(type) { setBoolAnnotations(type, 'YES') })
    _.each('sqft bedrooms start_year end_year age model make vin'.split(' '), setValAnnotations)

    if ($.isEmptyObject(data.annotations)){
      delete(data.annotations)
    } else {
      data.annotations = buildAnnotations(data.annotations)
    }

    return data;

    function setBoolAnnotations(type, yes) {
      if(params[type]) {
        if(params[type] == 'YES') {
          data.annotations[type] = yes
        } else {
          data.annotations[type] = null
        }
      }
    }

    function setValAnnotations(type) {
      if(params[type]){ data.annotations[type] = params[type] }
    }

    function buildAnnotations(data) {
      var annotations = []
      var start_year, end_year
      $.each(data, function(key, value) {
        if (key=='start_year'){start_year = parseInt(value)} else
        if (key=='end_year'){end_year = parseInt(value)} else {
          annotations.push(key + ':' + value)
        }
      })

      if ((start_year && !end_year) ||
          (start_year && end_year && start_year >= end_year)){
        annotations.push('year:' + start_year)
      }
      if (!start_year && end_year){
        annotations.push('year:' + end_year)
      }
      if (start_year && end_year && start_year < end_year){
        var years_array = []
        for (var iter_year = start_year; iter_year <= end_year; iter_year++) {
          years_array.push(iter_year)
        }
        years_array = _.map(years_array, function(year){
          return 'year:'+year
        })
        var years_string = '(' + years_array.join(' OR ') + ')'
        annotations.push(years_string)
      }
      return '{' + annotations.join(' AND ') + '}';
    }
  },

    parseUrl: function() {
        var url = this.get('url') || '';
        // !/search/location/category/source/query/params
        var parts = url.split('/');
        var category = parts[3];// support for multicategory search: (parts[3] || 'all').split(',');
        var source = parts[4]; // support for multisource search: (parts[4] || 'all').split(',');
        var data = {
            location: this.parseLocation(parts[2]),
            category: category, //categories.length > 1 ? categories : categories[0],
            source:   source,//s.length > 1 ? sources : sources[0],
            query:    decodeURIComponent(parts[5]),// || ''),
            params:   this.parseParams(parts[6])// || '')
        };
        this.set(data, {silent: true});
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
        var source = this.get('source')
        if ( _.isArray(source)) source = source.join('|');
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

    summary_for_source: function(summaryParams, callback) {
      var params = this.params()
      var search = this
      $.when(
        Craiggers.Util.get_source_count_search(params, 'BKPGE'),
        Craiggers.Util.get_source_count_search(params, 'CRAIG'),
        Craiggers.Util.get_source_count_search(params, 'EBAYC'),
        Craiggers.Util.get_source_count_search(params, 'KIJIJ'),
        Craiggers.Util.get_source_count_search(params, 'INDEE'),
        Craiggers.Util.get_source_count_search(params, 'HMNGS'),
        Craiggers.Util.get_source_count_search(params, 'EBAYM'),
        Craiggers.Util.get_source_count_search(params, 'NBCTY'),
        Craiggers.Util.get_source_count_search(params, 'JBOOM'),

        Craiggers.Util.get_source_count_search2(params, 'BKPGE'),
        Craiggers.Util.get_source_count_search2(params, 'CRAIG'),
        Craiggers.Util.get_source_count_search2(params, 'EBAYC'),
        Craiggers.Util.get_source_count_search2(params, 'KIJIJ'),
        Craiggers.Util.get_source_count_search2(params, 'INDEE'),
        Craiggers.Util.get_source_count_search2(params, 'HMNGS'),
        Craiggers.Util.get_source_count_search2(params, 'EBAYM'),
        Craiggers.Util.get_source_count_search2(params, 'NBCTY'),
        Craiggers.Util.get_source_count_search2(params, 'JBOOM'),

        Craiggers.Util.get_source_count_local_search(params, 'JBOOM')
      ).done(function(
            bkpge_data, craig_data, ebayc_data, kijij_data, indee_data, hmngs_data, ebaym_data, nbcty_data, jboom_data,
            bkpge_data2, craig_data2, ebayc_data2, kijij_data2, indee_data2, hmngs_data2, ebaym_data2, nbcty_data2, jboom_data2,
            local_jboom_data
          ){
        var tier_summary_data = {}
        tier_summary_data[search.get('tier')] = {
          'bkpge_num_matches': bkpge_data[0].num_matches + bkpge_data2[0].num_matches,
          'craig_num_matches': craig_data[0].num_matches + craig_data2[0].num_matches,
          'ebayc_num_matches': ebayc_data[0].num_matches + ebayc_data2[0].num_matches,
          'kijij_num_matches': kijij_data[0].num_matches + kijij_data2[0].num_matches,
          'indee_num_matches': indee_data[0].num_matches + indee_data2[0].num_matches,
          'hmngs_num_matches': hmngs_data[0].num_matches + hmngs_data2[0].num_matches,
          'ebaym_num_matches': ebaym_data[0].num_matches + ebaym_data2[0].num_matches,
          'nbcty_num_matches': nbcty_data[0].num_matches + nbcty_data2[0].num_matches,
          'jboom_num_matches': jboom_data[0].num_matches + jboom_data2[0].num_matches + local_jboom_data[0].count
        }
        if (search.get('summary_by_source_data')){
          search.set({ summary_by_source_data: _.extend(search.get('summary_by_source_data'), tier_summary_data) })
        } else {
          search.set({ summary_by_source_data: tier_summary_data })
        }

        var result = Craiggers.Util.calculate_summary_for_sources(search.get('summary_by_source_data'))
        callback(result)
      })
    },


    summary: function(summaryParams, callback) {
        //  summaryParams = summaryParams || this.params();
        // return $.ajax({
        //   url: BASE_URL + '/summarizer/?' + AUTH_TOKEN,
        //   dataType: 'json',
        //   data: summaryParams,
        //   success: callback
        // });
      return 0
    },



  checkSafe: function() {
    // console.log('category ' + (this.get('category')))
    // this.set({
    //   safe: ( this.get('category') === 'all' ) ? 'yes' : 'no',
    //   silent: true
    // });
  },

  categoryParams: function() {
    // cached value
    if ( this._categoryParams )
      return this._categoryParams

    var defaults = [
        'sort', 'title-only', 'has-image', 'original_locality', 'status',
        'has-price', 'radius', 'start', 'end', 'nav', 'subnav', 'postKey', 'localPostKey',

        'dogs', 'cats', 'bedrooms', 'sqft', 'make', 'model', 'vin', 'start_year', 'end_year',
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
    console.log('---')
    var params = this.get('params');
    if ( _.isString(attributes.params) ) {
      params = this.parseParams(attributes.params);
      attributes.location = this.parseLocation(attributes.location);
    } else {
      _.extend(params, attributes.params);
    }

    var loc = attributes.location;

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
      category: attributes.category || this.get('category'),
      params: params
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
    else if (this.get('timestamp_left_border') != undefined) {
      data.timestamp = this.get('timestamp_left_border') + '..' + this.get('timestamp_right_border')
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
    $('.metrics_container').hide()
    Craiggers.Search.set({ include_backpage_posting: false })
    var localPostKey = Craiggers.Search.attributes.params.localPostKey
    if (localPostKey){
      new Craiggers.Views.PostingDetail().showLocalPosting(localPostKey)
    }
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
  },

  getRightBorderTimestamp: function(){
    var now = new Date;
    var utc_date = new Date(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() ,
          now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    utc_date.setHours(utc_date.getHours() - 7);
    utc_date.setHours(0, 0, 0, 0)
    utc_date.setDate(utc_date.getDate() -2)
    return utc_date.getTime()
  },

  data: function() {
  },

  error: function(jqXHR, textStatus, errorThrown) {
  }
});

