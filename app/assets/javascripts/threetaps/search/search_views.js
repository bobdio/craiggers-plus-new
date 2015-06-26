Craiggers.Views.Filter = Backbone.View.extend({

  DEFAULT_VISIBLE_FILTERS: 5,

  showResults: function() {
    this.$('.header').find('.text').addClass('selected');
    this.$('.body').show();

    // jeboom only
    this.el.parents('#morefilters').children('.header')
          .find('.text').addClass('selected')
          .end().siblings('.body').show();
  },

  selectAll: function() {
    this.$('.results').find('.selector').find('input').attr('checked', 'checked');
    this.update();
  },

  deselectAll: function() {
    this.$('.results').find('.selector').find('input').removeAttr('checked');
    this.update();
  },

  toggleMore: function(event) {
    var $target = $(event.target);
    var $results = $target.prev().find('.result'); // TODO: this is fragile

    var collapsed = $results.filter(function() {
      return $(this).css('display') == 'none'
    }).length;
    collapsed = !collapsed;

    if ( collapsed ) {
      $results.slice(this.DEFAULT_VISIBLE_FILTERS).hide();
      $target.text('see more...');
    } else {
      $results.slice(this.DEFAULT_VISIBLE_FILTERS).show();
      $target.text('see less...');
    }
  },

  renderFiltersList: function(items, selector) {
    if ( !selector ) {
      selector = '.results'
    };

    // sorting items by selected/unselected
    var groups = _(items).groupBy(function(item) {
      return item.selected
    });
    items = (groups[true] || []).concat(groups[false] || []);

    var $results = this.$(selector);
    var $seemore = $results.next('.seemore'); // HACK: this is fragile

    $results.html(JST['filters-list']({ items: items }));

    if ( this.options.hideCounts ) // only for cat filters
      $results.find('.count').hide();

    $results.find('.result').slice(0, this.DEFAULT_VISIBLE_FILTERS).show();

    var $tailItems = $results.find('.result').slice(this.DEFAULT_VISIBLE_FILTERS);
    if ( !$tailItems.length )
      return

    $seemore.show();

    // old condition (without selected/unselected sorting)
    // if ( !this.selectall && $tailItems.find(':checked').length )
    if ( this.showall ||
         !this.selectall && $tailItems.first().find('input').is(':checked') ) {
      $tailItems.show();
      $seemore.text('see less...');
    }

    var expand = !this.selectall && _.any(items, function(item) {
      return item.selected
    })
    if ( expand ) this.showResults()
  },

  search: function(event) {
    this.update(event);
    Craiggers.Search.submit();
  }

});

Craiggers.Views.SummaryFilter = Craiggers.Views.Filter.extend({
  // parent class for CategoryFilter, LocationFilter and NeighborFilter

  events: {
    'click .results .name': 'search',
    'click .allnone .none': 'deselectAll',
    'click .allnone .all': 'selectAll',
    'change .selector input': 'update',
    'click .seemore': 'toggleMore'
  },

  countNameCode: function(code, singleCode) {
    if ( singleCode && this.collection.hasChildrenCodes(code) )
      return code

    return this.collection.parentCode(code)
  },

  summaryCodes: function() {
    var code = this.code;
    var singleCode = !_.isArray(code);
    code = singleCode ? code : code[0];

    if ( singleCode && this.collection.hasChildrenCodes(code) ) {
      this.selectall = true;
      return this.collection.childrenCodes(code);
    }

    return this.collection.siblingCodes(code);
  },

  render: function(data) {
    var collection = this.collection;
    this.$('.seemore').text('see more...').hide();

    // var codes = this.code;
    // var singleCode = !_.isArray(codes);
    // var code = singleCode ? codes : codes[0];

    // var countNameCode = this.countNameCode(code, singleCode);
    // var countName = collection.shortNameByCode(countNameCode);
    // var allcountname = ('all ' + countName).replace('all all', 'all');
    // this.$('.allcountname').text(allcountname);
    var total = 0;
    var selectall = this.selectall;
    var items = _.map(data['summary'], function(data) {
      total += data[2];
      return {
        name: collection.shortNameByCode(data[1]),
        count: _.commatizeNumber(data[2] || 0),
        count_int: data[2] || 0,
        code: data[1],
        selected: selectall ||
            _.include(_([data[1]]).flatten(), data[1])
      }
    });

    items.sort(function(a,b){ return b.count_int - a.count_int })

    this.$('.allcountnumber').html(_.commatizeNumber(total));
    this.renderFiltersList(items);
  },

});

_.extend(Craiggers.Views, {

  SearchFilters: Craiggers.Views.Filter.extend({

    el: $('#searchfilters'),

    events: {
      'change :checkbox[param], :radio[param]': 'updateParam',
      'change .dates input': 'updateDate',
      'change #annotations_block select': 'updateSelector',
      'keyup #annotations_block input': 'updateText',
      'change #annotations_block :checkbox': 'updateCheckbox',
      'click .datepicker-label': 'clickDatepicker'
    },

    initialize: function() {
      this.$('.datepicker').each(function() {
        $(this).datepicker({
          minDate: -5,
          maxDate: 0,
          dateFormat: 'yy-mm-dd',
          altField: '#' + this.id + '_label',
          altFormat: 'M d'
        });
      });

      Craiggers.Search.bind('change:params', this.updateFromModel, this);
      Craiggers.Search.bind('change:category', this.updateAnnotations);

      if ( this.updateFromModel() )
        this.showResults()
    },

    updateAnnotations: function() {
      var params = Craiggers.Search.get('params');
      var category = Craiggers.Search.get('category');

      if(category !== 'all') {

        function show (type) {
          var selector = ['year', 'age', 'bedrooms'];
          var checkboxes = 'cats dogs telecommute contract internship partTime nonprofit'.split(' ');
          var text = 'make model vin sqft'.split(' '); // personal_flavor compensation

          var el = $('#annotations_block .' + type);

          // SELECT
          if($.inArray(type, selector) != -1) {
            if(params[type])
              el.find('select option[value=' +params[type]+ ']')
                .attr('selected', true)
            else
              el.find('select').prop('selectedIndex', 0);

          // CHECKBOX
          } else if($.inArray(type, checkboxes) != -1) {
            if(params[type])
              el.find('input').attr('checked', true)
            else
              el.find('input').attr('checked', false);

          // TEXT
          } else if($.inArray(type, text) != -1) {
            if(params[type])
              el.find('input').val(params[type]);
            else
              el.find('input').val('');
          } else return false;

          el.show();
        }

        function hide(type) {
          $('#annotations_block .' + type).hide();
          if(params[type]) {
            var update = {};
            update[type] = null
            Craiggers.Search.update({ params: update });
          }
        }

        function toggle(items) {
          _.each(items, show)
          _.each(_.difference(type, items), hide)
        }


        var parent = category;
        var type = ['bedrooms', 'cats', 'dogs'
                    , 'sqft'
                    , 'make', 'model', 'vin', 'year'
                    , 'age', 'personal_flavor'
                    , 'compensation', 'partTime', 'telecommute', 'contract', 'internship', 'nonprofit'];

        if(!Craiggers.Categories.isTopLevel(parent))
          parent = Craiggers.Categories.parentCode(category);

        switch(parent) {
          case 'RRRR':
            if($.inArray(category, ['RCRE', 'RLOT', 'RPNS']) == -1)
              toggle(type.slice(0, 4))
            else if (category !== 'RLOT')
              toggle(type.slice(3, 4));
            break;

          case 'VVVV': toggle(type.slice(4, 8)); break;
          case 'PPPP': toggle(type.slice(8, 10)); break;
          case 'JJJJ': toggle(type.slice(10, 16)); break;
          default: _.each(type, hide); break;
        }
      }
    },

    updateFromModel: function() {
      var params = Craiggers.Search.get('params');

      if ( params['title-only'] ) {
        this.$('.title-only').attr('checked', true);
      } else {
        this.$('.entire-post').attr('checked', true);
      }

      this.$('.has-image').attr('checked', !!params['has-image']);
      this.$('.has-price').attr('checked', !!params['has-price']);

      if ( params['start'] ) {
          console.log(params['start']);
          var d = new Date(params['start']);
          console.log(d);
          this.$('#start_date').datepicker('setDate', d);
      }
      if ( params['end'] )
        this.$('#end_date').datepicker('setDate', new Date(params['end']));

      var expand = _.any('title-only has-image start has-price'.split(' '), function(k) {
        return params[k]
      });

      this.updateAnnotations();
      return true //expand
    },

    updateParam: function(event) {
      var el = $(event.currentTarget);
      var param = el.attr('param');
      var val = el.is(':checked');
      var update = {};

      if ( param === 'entire-post' ) {
        update['title-only'] = false;
      } else {
        update[param] = val;
      }

      Craiggers.Search.update({ params: update });
    },

    updateSelector: function (event) {
      var el = $(event.currentTarget),
          update = {};

      update[el.attr('name')] = el.val()
      Craiggers.Search.update({ params: update });
    },

    updateText: function (event) {
      var el = $(event.currentTarget),
          update = {};

      update[el.attr('name')] = el.val()
      Craiggers.Search.update({ params: update });
      if(event.keyCode == Craiggers.Util.KEY.ENTER)
        Craiggers.Search.submit()
    },

    updateCheckbox: function(event) {
      var el = $(event.currentTarget);
      var name = el.attr('name');
      var update = {};

      if(el.is(':checked')) update[name] = el.val();
      else update[name] = null;

      Craiggers.Search.update({ params: update });
    },

    updateDate: function(event) {
      var params = {};
      var key = event.currentTarget.id.replace(/_date/, '');
      var date = $(event.currentTarget).datepicker('getDate');
      params[key] = $.datepicker.formatDate('yy-mm-dd', date);

      Craiggers.Search.update({ params: params });
    },

    clickDatepicker: function(e) {
      var id = e.currentTarget.id.slice(0, -6);
      $('#' + id).datepicker('show');
    },

  }),

  LocationFilter: Craiggers.Views.SummaryFilter.extend({

  }),

  CategoryFilter: Craiggers.Views.SummaryFilter.extend({

    el: $('#categoryfilter'),

    initialize: function() {
      var collection = this.collection = Craiggers.Categories;
      _.bindAll(this, 'render');
      this.selectall = false;

      this.code = this.options.category || Craiggers.Search.get('category');
      var codes = this.summaryCodes();

      // if ( this.collection.isCat(codes[0]) )
      //   this.showall = true; // always expand items list

      var params = Craiggers.Search.params(false, { category: null });

      if ( this.options.hideCounts ) {
        var data = {
          total: 0,
          totals: {}
        };
        _.each(codes, function(code) {
          data.totals[code] = 0;
        });
        this.render(data);

        this.$('.allcount').hide();
      } else {
        params.dimension = this.dimension(codes);
        /* params.codes = codes.join(','); */
        Craiggers.Search.summary(params, this.render);

        this.$('.allcount').show();
      }
    },

    update: function(event) {
      // TODO: hard refactoring
      var params = {};
      // "click" event seems to be incorrect, probably "change" event is needed
      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        params.category = $(event.currentTarget).parent().find('.code').text();

        // deselect all checkboxes so we make sure to populate filters correctly
        this.$('.selector input').filter('.' + params.category).attr('checked', 'checked');
        this.$('.selector input').not($('.' + params.category)).removeAttr('checked');
      } else {
        // populate from select boxes
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        if ( checkedCheckBoxes.length < checkBoxes.length ) {
          params.category = _.map(checkedCheckBoxes, function(c) {
            return $(c).val();
          });
        } else {
          var currentCategory = Craiggers.Search.get('category');
          if ( !_.isArray(currentCategory) ) currentCategory = [currentCategory];
          params.category = Craiggers.Categories.parentCode(currentCategory[0]);

          // old solution
          // TODO: make sure the new one works well
          // params.category = $(Craiggers.Categories.elByCode(currentCategory[0]).parent().parent().find('.code')[0]).text();
        }
      }
      Craiggers.Search.update(params);
    },

  }),

  CurrentSearch: Backbone.View.extend({

    el: $('#currentsearch'),

    events: {
      'click .header': 'toggleResults',
      'keydown #location_input': 'keydownCurrentSearchLocation',
      "keydown input[type='submit']": 'keydownCurrentSearchButtonSearch',
      "keydown input[type='button']": 'keydownCurrentSearchSave',
      "keydown #min-price-range": 'keydownCurrentSearchMinPrice',
      "keydown #search-name": 'keydownCurrentSearchSearchName',
      "keydown #notify-email": 'keydownCurrentSearchNotifyEmail',
      "keydown #notify-email-address": 'keydownCurrentSearchNotifyEmailAddress',
      "keydown #save-notification": 'keydownSaveNotification'
    },

    initialize: function(options) {
      this.data = Craiggers.Search.params();
      this.render();
    },

    toggleResults: function(event) {
      $(event.currentTarget)
          .find('.text').toggleClass('selected')
          .end().siblings('.body').toggle();
    },

    keydownCurrentSearchLocation: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#location_input"))) {
        $("input[type='submit']").focus();
        e.preventDefault();
      }
    },

    keydownCurrentSearchButtonSearch: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("input[type='submit']"))) {
         $("input[type='button']").focus();
         e.preventDefault();
      }
    },

    keydownCurrentSearchSave: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("input[type='button']")) && ($("#price-range").is(':visible'))) {
        $("#min-price-range").focus();
        e.preventDefault();
      }
    },

    keydownCurrentSearchMinPrice: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#min-price-range"))) {
        $("#max-price-range").focus();
        e.preventDefault();
      }
    },

    keydownCurrentSearchSearchName: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#search-name"))) {
        $("#notify-email").focus();
        e.preventDefault();
      }
    },

    keydownCurrentSearchNotifyEmail: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#notify-email"))) {
        $("#notify-email-address").focus();
        e.preventDefault();
      }
    },

      keydownCurrentSearchNotifyEmailAddress: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#notify-email-address"))) {
        $("#save-notification").focus();
        e.preventDefault();
      }
    },

      keydownSaveNotification: function(e){
          if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#save-notification"))) {
              $("#search-name").focus();
              e.preventDefault();
          }
      }
  }),

  SearchBar: Backbone.View.extend({

    el: $('#searchbar, #searchcolumn'),

    acoptions: {
      width: 200,
      max: 100,
      formatItem: function(el, i, max) {
        if ( el.parents ) {
          return el.path + ' <i>(' + el.parents + ')</i>';
        }
        return el.path;
      },
      formatMatch: function(el, i, max) {
        return el.path;
      },
      formatResult: function(el) {
        return el.name;
      }
    },

    init: function() {
      // 2011-12-01 12:11 Author: Igor Novak
      // use this method for common actions both for craiggers and jeboom
      // be careful with actions sequence!

      this.initAutocompletion();
      if ( !navigator.geolocation ) {
        this.$('.geolocate').hide();
      }
      $('#currentsearch').find('.filter-dropdown').find('.header').find('text')
        .removeClass('selected')
      $('#currentsearch').find('.filter-dropdown').find('.body').hide()

      if ( Craiggers.Search.get('category') !== Craiggers.Search.defaults.category ) {
        $('#searchcolumn').find('.category).find(.input').val(
          Craiggers.Categories.nameByCode(Craiggers.Search.get('category'))
        );
      }

      $('#start_date').datepicker('setDate', Craiggers.Search.get('start') || '');
      $('#end_date').datepicker('setDate', Craiggers.Search.get('end') || '');

      // TODO: check if we need this
      // Craiggers.Search.bind('change', this.updateHolder, this);
    },

    showNotifySave: function() {
        if (Craiggers.User.attributes.signedin)
            new Craiggers.Views.NotifySave();
        else
            new Craiggers.Views.Dialog('must_sign_up');
    },

    keydownCategory: function(event) {
      if ( event.keyCode === Craiggers.Util.KEY.TAB && !this.validCategory() ) {
        event.preventDefault();
        this.showAllCategories();
      }
    },

    selectLocationFromList: function(event) {
      var name = $(event.currentTarget).text();
      this.$('.location .input').val(name);

      var location = $(event.currentTarget)
              .parents('.location').first()
              .find('.primary').text();
      // TODO scope/options will have to change for codeByName
      // once countries are introduced
      var code = Craiggers.Locations.codeByName(name, null, location) || Craiggers.Search.defaults.location;

      this.clearAllLocations();

      Craiggers.Search.update({ location: code });

      this.$('.location .holder').hide();
      // this.$('.location .input').focus();
    },

    clearAllLocations: function() {
      if ( this.$('.location .jumbolist').is(':visible') ) {
        this.$('.location .jumbolist').hide();
        this.$('.location .viewlist').addClass('closed');
      }
    },

    showAllLocations: function() {
      this.clearAllCategories();
      var viewlist = this.$('.location .viewlist');
      var jumbolist = this.$('.location .jumbolist');
      if ( viewlist.hasClass('closed') || !jumbolist.is(':visible') ) {
        viewlist.removeClass('closed');
        this.showJumboList(jumbolist);
      }
      this.$('.location .input').focus();
    },

    showJumboList: function(jumbolist) {
      // needed for jumbolist height calculating
      $(window).resize();
      jumbolist.show();
    },

    updateSearchCategory: function(event) {
      var val = $(event.currentTarget).val();

      if ( val === 'see filters' || _.isArray(Craiggers.Search.get('category'))) return;
      var current = Craiggers.Categories.nameByCode(
        Craiggers.Search.get('category')
      );
      if ( !val.length ) {
        Craiggers.Search.update({
          category: Craiggers.Search.defaults.category
        });
      } else if ( val !== current ) {
        Craiggers.Search.update({
          category: Craiggers.Categories.codeByName(val)
        });
      }
      return true;
    },

    clearAllCategories: function() {
      if ( this.$('.category .jumbolist').is(':visible') ) {
        this.$('.category .jumbolist').hide();
        this.$('.category .viewlist').addClass('closed');
      }
    },

    clearHolder: function(event) {
      $(event.currentTarget).parents('.wrapper').find('.holder').hide();
    },

    updateHolder: function(event) {
      var input = event ? $(event.target) : this.$('.input');
      input.each(function() {
        if ( $(this).val() ) {
          $(this).siblings('.holder').hide();
        } else {
          $(this).siblings('.holder').show();
        };
      });
    },

    clearInputHoldersIfVals: function() {
      this.$('.input').each(function() {
        var holder = $(this).parents('.wrapper').find('.holder');
        if ( $(this).val().length ) {
          holder.hide();
        } else {
          holder.show();
        }
      });
    }

  }),

  RadiusFilter: Craiggers.Views.Filter.extend({

  }),

  SortBy: Backbone.View.extend({

    el: $('#sortby'),

    events: {
      'change .sortby': 'sortby'
    },

    initialize: function() {
      this.$('option').attr('selected', false);

      var sort = Craiggers.Search.get('params').sort;
      var priceable = Craiggers.Categories.isPriceable(
        Craiggers.Search.get('category')
      );
      if ( priceable && sort ) {
        if( sort === 'price' ) {
          this.$('.lotohi').attr('selected', true);
        }
        if( sort === '-price' ) {
          this.$('.hitolo').attr('selected', true);
        }
      } else if ( sort === 'relevant' ) {
        this.$('.relevant').attr('selected', true);
      } else {
        this.$('.recent').attr('selected', true);
      }

      if ( !priceable ) {
        this.$('.hitolo, .lotohi').attr('disabled', true);
      } else {
        this.$('.hitolo, .lotohi').attr('disabled', false);
      }
    },

    sortby: function() {
      var selected = this.$('option:selected');
      var params = {
        sort: null,
        order: null
      };

      if ( selected.hasClass('hitolo') ) {
        params.sort = '-price';
      } else if ( selected.hasClass('lotohi') ) {
        params.sort = 'price';
      } else if ( selected.hasClass('relevant') ) {
        params.sort = 'relevant';
      }

      Craiggers.Search.update({
        params: params
      });
    }

  }),

  StatusFilter: Craiggers.Views.Filter.extend({

    el: $('#statusfilter'),

    events: {
      'click .results .name': 'search',
      'click .allnone .none': 'deselectAll',
      'click .allnone .all': 'selectAll',
      'change .selector input': 'update'
    },

    initialize: function() {
      _.bindAll(this, 'render');

      this.status = Craiggers.Search.get('params').status || '';
      var params = Craiggers.Search.params(false, { status: false });
      params.codes = 'stolen,lost,found,wanted,offered';
      params.dimension = 'status';
      //Craiggers.Search.summary(params, this.render);

      this.isMobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

      if(this.isMobile)
      {
        window.scrollTo(0,0);
      }

    },

    render: function(data) {
      var view = this;
      var selectall = !this.status;

      this.$('.allcountnumber').html(_.commatizeNumber(data.total));

      var items = _.map(data.sommary, function(total, code) {
        return {
          name: code,
          count: _.commatizeNumber(total),
          code: code,
          selected: selectall || _.include(view.status.split(' OR '), code)
        }
      });

      this.$('.results').html(JST['filters-list']({ items: items }));

      var expand = !selectall && _.any(items, function(item) {
        return item.selected
      })
      if ( expand ) this.showResults()
    },

    update: function(event) {
      var query = Craiggers.Search.get('query');
      var params = {};

      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        var type = $(event.currentTarget);
        params.status = type.parent().find('.code').text();

        // deselect all checkboxes so we make sure to populate filters correctly
        this.$('.selector input').filter('.' + params.status).attr('checked', 'checked');
        this.$('.selector input').not($('.' + params.status)).removeAttr('checked');
      } else {
        // populate from select boxes
        params.status = '';
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        if ( checkedCheckBoxes.size() < checkBoxes.size() ) {
          checkedCheckBoxes.each(function(index, selector) {
            params.status += $(selector).val() + ' OR ';
          });
        }
        params.status = params.status.substring(0, params.status.lastIndexOf(' OR '));
      }
      Craiggers.Search.update({
        query: query,
        params: params
      });
    },

  }),

  PriceRange: Backbone.View.extend({

    el: $('#price-range'),

    events: {
      'keyup .min, .max': 'minmaxKeyup',
      'blur .min, .max': 'minmaxBlur',
      'focus .min, .max': 'minmaxFocus',
      'click .reset': 'minmaxReset',
    },

    max: 9999999,
    min: 0,
    mintext: 'min',
    maxtext: 'max',

    initialize: function() {
      this.toggle()

      this.render();
      Craiggers.Search.bind('change:category', this.toggle)

    },

    toggle: function () {
      var priceable = Craiggers.Categories.isPriceable(
        Craiggers.Search.get('category')
      );
      if ( priceable ) {
        $('#price-range').show();
      } else {
        $('#price-range').hide();
      }
    },

    render: function() {
      // TODO: this is ugly
      var price = Craiggers.Search.get('params').price;
      if ( price ) {
        var range = price.split('..');
        if ( range.length === 2 ) {
          this.$('.min').val(range[0]).removeClass('default');
          this.$('.max').val(range[1]).removeClass('default');
          return;
        }
      } else {
        this.$('.min').val(this.mintext).addClass('default');
        this.$('.max').val(this.maxtext).addClass('default');
      }
    },

    minmaxKeyup: function(e) {
      var minmax = $(e.currentTarget);
      minmax.val(minmax.val().replace(/\D/g, ''));
      Craiggers.Search.update({ params: { price: this.range() } });

      if ( e.keyCode === 13 ) Craiggers.Search.submit();
    },

    minmaxBlur: function(e) {
      if ( $(e.currentTarget).is('.min') && !this.$('.min').val() ) {
        this.$('.min').val(this.mintext).addClass('default');
      }
      if ( $(e.currentTarget).is('.max') && !this.$('.max').val() ) {
        this.$('.max').val(this.maxtext).addClass('default');
      }
    },

    minmaxFocus: function(e) {
      if ( $(e.currentTarget).is('.default') ) {
        $(e.currentTarget).val('').removeClass('default');
      }
    },

    minmaxReset: function() {
      this.$('.min').val(this.mintext).addClass('default');
      this.$('.max').val(this.maxtext).addClass('default');
      Craiggers.Search.update({ params: { price: null } });
    },

    range: function() {
      var min = this.$('.min').is('.default') ? this.min : this.$('.min').val();
      var max = this.$('.max').is('.default') ? this.max : this.$('.max').val();
      if ( min.length && max.length) return min + '..' + max;
      if ( min.length) return min + '..';
      if ( max.length) return '..' + max;
      return null;
    },
  }),

  NavBar: Backbone.View.extend({

    el: $('#navbar'),

    events: {
      'click #favorites-link': 'showFavorites',
      'click #search-link': 'showSearch',
      'click .subnavlink': 'showSubnav'
    },

    initialize: function() {
      // TODO: consider to create NavBar model
      _.bindAll(this, 'showSearch');
      Craiggers.Search.bind('search:submit', this.showSearch);
      this.render();
      this.showSearch();
    },

    render: function() {
      this.el.show().removeClass('root posting').addClass('search');
    },

    showSubnav: function(event) {
      var target, id, contentId, subnav;
      subnav = Craiggers.Search.get('params').subnav;
      if ( event ) {
        target = event.target;
        Craiggers.PageState.set({sub_nav: target.id.replace(/-link/, '')});
      } else if ( subnav ) {
        target = $('#' + subnav)[0];
      } else {
        target = $('#workspace-link')[0];
      }
      id = target.id;
      contentId = id.replace(/-link/, '');
      $(target).addClass('active').siblings('.active').removeClass('active');
      $('.main-content').hide();
      $('#' + contentId).show();

      if ( contentId != 'treemap') {
        $('.tooltip').hide();
      }

      Craiggers.Search.update({ params: { subnav: id } });
      Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));
    },

    showNav: function(id, params) {
      this.$('.navlink').removeClass('active');
      this.$('#' + id + '-link').addClass('active');
      if ( params ) new Craiggers.Views.Postings(params);
      Craiggers.Search.update({ params: { nav: id + '-link' } });
      //Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));
    },

    showFavorites: function() {
      Craiggers.postingsMode = 'favorites';
      if (Craiggers.currentFavoriteDetail) {
        new Craiggers.Views.PostingDetail().close();
        var model = Craiggers.Favorites.getByPostingId(Craiggers.currentFavoriteDetail)
        new Craiggers.Views.PostingDetail({ model: model.get('posting') }).render();
      }
      if (Craiggers.currentPostingDetail) {
        Craiggers.openPosting = true;
        new Craiggers.Views.PostingDetail().resize();
      }

      var params = {
        collection:   Craiggers.Favorites.postings(),
        page:         0,
        rpp:          Craiggers.Favorites.length,
        totalresults: Craiggers.Favorites.length,
        favorites: true
      };
      this.showNav('favorites', params);

      $('#workspace-link').click();

      // TODO: consider visibility: hidden instead of hiding
      this.$('.subnavlink').hide();

      $('#leftcol').hide();
      // $('#leftcol').hide('slide', {direction: 'left'}, 300);
      $('.main-content').addClass('shifted-left');

      Craiggers.Favorites.lazyLoadAndRenderPostings();
    },

    showSearch: function() {
      if (Craiggers.currentFavoriteDetail) {
        new Craiggers.Views.PostingDetail().close();
      }
      Craiggers.postingsMode = 'search';
      var params = {
        collection:   Craiggers.Postings,
        page:         Craiggers.Postings.page,
        rpp:          Craiggers.Postings.rpp,
        totalresults: Craiggers.Postings.totalresults,
        exectime:     Craiggers.Postings.exectime,
        exectimeAPI:  Craiggers.Postings.exectimeAPI,
        select:       Craiggers.Search.get('params').postKey
      };
      this.showNav('search', params);
      this.$('.subnavlink').show();
      this.showSubnav();
      // 2011-11-10 12:58 Author: Igor Novak
      // TODO: add animation, improve behavior
      $('#leftcol').show();
      $('.main-content').removeClass('shifted-left');
      // if ( $('#leftcol').is(':hidden') )
      //   $('#leftcol').show('slide', {direction: 'right'}, 300);
      Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));

      if (Craiggers.openPosting) {
          var model = Craiggers.Postings.getByPostingId(Craiggers.currentPostingDetail)
          if (model)
              new Craiggers.Views.PostingDetail({ model: model }).render();
          else {
              Craiggers.currentPostingDetail = null;
              Craiggers.openPosting = false;
          }
      }
    },

  }),

  Drawer: Backbone.View.extend({

    el: $('#drawer-button'),

    events: {
      'click': 'toggleDrawer'
    },

    initialize: function() {
      this.render();
      this.open = false;
    },

    render: function() {
      $('#drawer-button').show();
      this.closeDrawer();
    },

    closeDrawer: function() {
      $('#drawer').removeClass('open');
      $('.main-content').removeClass('shifted-right');
    },

    toggleDrawer: function() {
      $('#drawer').toggleClass('open');
      $('.main-content').toggleClass('shifted-right');
      Craiggers.drawerOpen = !Craiggers.drawerOpen;
      new Craiggers.Views.PostingDetail().resize();
//      if (Craiggers.drawerOpen) {
//          if (Craiggers.postingsMode == 'favorites') {
//              $('#detail').css({'max-width': $('#container').width() - 992})
//              $('#detail').css({'min-width': $('#container').width() - 992})
//          }
//          else {
//              $('#detail').css({'max-width': $('#container').width() - 802})
//              $('#detail').css({'min-width': $('#container').width() - 802})
//          }
//      }
//      else {
//          if (Craiggers.postingsMode == 'favorites') {
//              $('#detail').css({'max-width': $('#container').width() - 842})
//              $('#detail').css({'min-width': $('#container').width() - 842})
//          }
//          else {
//              $('#detail').css({'max-width': $('#container').width() - 652})
//              $('#detail').css({'min-width': $('#container').width() - 652})
//          }
//      }

    }

  }),

  SavedSearches: Backbone.View.extend({

    el: $('#savedsearches'),

    initialize: function() {
      var saved = this;
      Craiggers.SavedSearches.bind('add', function(search) {
        new Craiggers.Views.SavedSearch({model: search});
        saved.updateCount();
      });
      Craiggers.SavedSearches.bind('remove', function(search) {
        saved.updateCount();
      });
      Craiggers.Search.bind('search:submit', function() {
        $('.savedsearch', '#savedsearches').removeClass('selected');
      });
    },

    updateCount: function() {
      if ( Craiggers.SavedSearches.length > 0 ) {
        $('#savedsearches .none').hide();
      } else {
        $('#savedsearches .none').show();
      }
    },

    render: function() {
      Craiggers.SavedSearches.each(function(search) {
        new Craiggers.Views.SavedSearch({model: search});
      });
    }

  }),

  SavedSearch: Backbone.View.extend({

    className: 'savedsearch',

    events: {
      'click .delete': 'deleteSearch',
      'click .extras .email': 'popupEmail',
      'click .extras .notification': 'popupNotification',
      'click': 'loadSearch'
    },

    initialize: function() {
      // 2011-09-29 12:14 Author: Igor Novak
      // this methos is overloaded for jeboom in standart_search_views.js

      this.location = Craiggers.Locations.nameByCode(this.model.get('location'));
      this.render();
    },

    render: function() {
      var view = this;

      Craiggers.Locations.nameByCodeWithCallback(view.model.get('location').code, build, true)

      function build(data){
        var location;
        var parent_cat;
        var parent_locations;
        var category = view.model.get('category');

        if(category !== 'all' && !Craiggers.Categories.isTopLevel(category))
          parent_cat = Craiggers.Categories.nameByCode(
            Craiggers.Categories.parentCode(category)
          )

        if(typeof(data) === "object") {
          location = data.name;
          parent_locations = Craiggers.Locations.extractLocationsContext(data);
        }
        else
          location = data;

        $(view.el).html(
          JST['savedsearch']({
            name: view.model.get('name'),
            query: view.model.get('query'),
            location: location,
            parent_locations: parent_locations,
            cat: Craiggers.Categories.nameByCode(category),
            parent_cat: parent_cat,
          })
        );
        $('.searches', '#savedsearches').append(view.el);
      }
    },

    popupEmail: function(event) {
      new Craiggers.Views.SavedSearchEmailPopup({model: this.model});
    },

    popupNotification: function(event) {
      new Craiggers.Views.SavedSearchNotificationPopup({model: this.model});
    },

    loadSearch: function(event) {
      if ( !$(event.currentTarget).is('.savedsearch')
           || $(event.target).is(':input') ) return;

      Craiggers.Search.update(this.model.attributes).submit();

      $(this.el).addClass('selected');
    },

    deleteSearch: function() {
      var view = $(this.el),
          model = this.model,
          search = {
            name: model.get('name'),
            params: model.params(),
            extra: { url: model.get('url') },
            flag: true
          };

      new Craiggers.Views.UpdateSavedSearch({
        email: this.model.get('email'),
        name: this.model.get('name'),
        notifications: this.model.get('notifications'),
        destroy_callback: destroy_callback,
        update_callback: update_callback
      });


      return false

      function update_callback(options) {
        view.find('.name .text').html(options.name)

        $.ajax({
          url: '/search/update/' + model.get('id'),
          type: 'put',
          data: options,
          complete: function() {
          }
        });

        model.set(options)
        if(!options.email) model.set({email: null})
        if(!options.notifications) model.set({notifications: null})
      };

      function destroy_callback() {
        if ( model.get('saved_without_params') ) {
          delete search.params;
        }

        view.hide();

        $.ajax({
          url: '/search/delete/' + model.get('id'),
          type: 'delete',
          complete: function() {
            Craiggers.SavedSearches.remove(model);
            view.remove();
          }
        });
      };
    }

  }),


  // TODO: are we still using this? -- df
  // date < 2011-10-26 00:35
  SavedSearchNotificationPopup: Backbone.View.extend({

    className: 'emailpopup',

    events: {
      'click .setup': 'setup'
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      $(this.el).html(
        JST['savedsearch-notificationpopup']()
      );
      $.fancybox({
        content: this.el,
        scrolling: 'no'
      });
    },

    setup: function() {
      this.$('input').removeClass('error');
      if ( !this.$('.email').val().length ) {
        this.$('.email').addClass('error');
        return;
      }
      this.$('.setup').attr('disabled', true);
      var popup = this;
      var params = this.model.params();
      delete params.retvals;
      delete params.page;
      delete params.rpp;
      params.app = Craiggers.appName;
      if (Craiggers.Search.defaultSearchParams) $.extend(params, Craiggers.Search.defaultSearchParams);
      params.email = this.$('.email').val();
      params.search_url = this.model.get('url');
      params.name = this.model.get('name');
      $.ajax({
        url: 'http://3taps.net/notifications/create',
        type: 'get',
        dataType: 'jsonp',
        //jsonpCallback: 'ThreeTapsNotificationsCreate',
        data: params,
        success: function(data) {
          if ( data.success ) {
            popup.$('.form').hide();
            popup.$('.sent').show();
            _.delay(function() {
              $.fancybox.close();
            }, 8000);
          } else {
            popup.$('.form').hide();
            if ( data.error && data.error.message ) {
              popup.$('.notsent').text(
                data.error.message
              );
            }
            popup.$('.notsent').show();
          }
        },
        error: function() {
          popup.$('.form').hide();
          popup.$('.notsent').show();
        }
      });

    }

  }),

  // TODO: are we still using this? --df
  // date < 2011-10-26 00:35
  SavedSearchEmailPopup: Backbone.View.extend({

    className: 'emailpopup',

    events: {
      'click .send': 'submit'
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      $(this.el).html(
        JST['savedsearch-emailpopup']({
          orjust: 'http://craiggers.com/#' + this.model.generateUrl()
        })
      );
      $.fancybox({
        content: this.el
      });
    },

    submit: function() {
      this.$('input').removeClass('error');
      if ( !this.$('.your').val().length ) {
        this.$('.your').addClass('error');
        return;
      }
      if ( !this.$('.dest').val().length ) {
        this.$('.dest').addClass('error');
        return;
      }

      this.$('.send').attr('disabled', true);
      var popup = this;
      $.ajax({
        url: '/search/mail',
        type: 'post',
        data: {
          to: this.$('.dest').val(),
          from: this.$('.your').val(),
          data: { search: this.model.get('url') }
        },
        success: function() {
          popup.$('.form').hide();
          popup.$('.sent').show();
          $.fancybox.close();
        },
        error: function() {
          popup.$('.form').hide();
          popup.$('.notsent').show();
        }
      });
    }

  }),

  NotifySave: Backbone.View.extend({
    // 2011-12-19 15:50 Author: Igor Novak
    // currently notification is disabled
    // TODO: clean up

    el: $('#notifysave'),

    events: {
      'click #notifysaveclose': 'close',
      'click #save-notification': 'saveSearch',
      'click #notify-email': 'notifyEmail',
      'click #notify-sms': 'notifySms',
      'keydown': 'setEnterHandler'
    },

    initialize: function() {
      Craiggers.Search.bind('search:submit', function() {
        if ( $('#notifysave').is(':visible') ) new Craiggers.Views.NotifySave;
      });
      this.render();
    },

    render: function() {
      this.$('#search-name').val(Craiggers.Search.get('query') || 'everything');
      $('#notify-sms').removeAttr('disabled');
      this.setNotifySave();
      this.el.show();
    },

    setEnterHandler: function(event) {
      if ( event.keyCode === Craiggers.Util.KEY.ENTER ) {
        this.saveSearch()
        event.preventDefault()
      }
    },

    close: function() {
      this.el.hide();
    },

    notifyEmail: function() {
      $('#notify-email-address').attr('disabled',!$('#notify-email').is(':checked'));
      if ($('#notify-email').is(':checked'))
        $('#notify-email-address').focus();
    },

    notifySms: function() {
      if ( Craiggers.Postings.totalresults > 1400 ) {
        $('#notify-sms').attr('disabled', true).removeAttr('checked');
        $('#sms-error').text("Sorry, there are too many results that match this search for us to set up SMS notifications. Try narrowing your search parameters. You can still save this search and subscribe for email notifications.").show();
      } else {
        $('#notify-sms-address').attr('disabled', !$('#notify-sms').is(':checked'));
      }
    },

    setNotifySave: function() {
      var email = $('#notify-email-address').val('').attr('disabled',true);
      var phone = $('#notify-sms-address').val('').attr('disabled',true);
      $('#notify-email').attr('checked',false);
      $('#notify-sms').attr('checked',false);

      if ( Craiggers.User.get('signedin') ) {
        var settings = Craiggers.User.get('settings');
        if ( settings ) {
          email.val(settings.email)
          phone.val(settings.phone)
        }
      }

      $('#sms-error').val('').hide();
    },

    validateNotifySave: function() {
      var errors = [];
      if ( $('#notify-email').is(':checked') && !emailCheck($('#notify-email-address').val())) errors.push("Invalid email address") ;
      if ( $('#notify-sms').is(':checked') && !phoneCheck($('#notify-sms-address').val())) errors.push('Your number must be a valid US phone number.');
      if ( errors.length == 0 ) {
        return true;
      } else {
        $('#sms-error').html(errors.join('<br />')).show();
        return false;
      }

      function phoneCheck(phone) {
        var phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        return phoneNumberPattern.test(phone);
      }

    },

    saveSearch: function() {
      if ( !this.validateNotifySave() ) return false;
      var name = $('#search-name').val();
      var search = Craiggers.Search.clone();

      // HACK
      // Without this all new SavedSearch'es would have the same "params"
      // attribute, thus would have same original_locality
      // search.set({
      //   params: {
      //     original_locality: Craiggers.Search.get('params').original_locality
      //   }
      // });

      var data = {
        name: name,
        params: search.params(),
        extra: { url: search.generateUrl() },
        flag: true,
        timestamp: Craiggers.Postings.at(0).get('timestamp')
      };
      var notifications = false;

      if ( $('#notify-email').is(':checked') ) {
        data.email = $('#notify-email-address').val();
        notifications = true;
      }

      send_data = { json: JSON.stringify(data)  }
      if (notifications) { send_data.notifications = true}

      $.ajax({
        url: '/search/save',
        type: 'post',
        data: send_data,
        success: function(data_, textStatus, XMLHttpRequest) {
          $.fancybox.close();
          search.set({
            url: data.extra.url,
            name: data.name,
            id: data_.key,
            email: data.email,
            notifications: data_.notifications
          });
          Craiggers.SavedSearches.add(search);
        },
      });
      $('#notifysave').hide();

      // if the user wants notifications, create them and pop up a notice
      // TODO: this doesn't feel like a great place for this
      var self = this;
      _.each(['email', 'sms'], function(method) {
        if ( $('#notify-' + method).is(':checked') ) {
          var params = search.params();
          params.app = Craiggers.appName;
          if (Craiggers.Search.defaultSearchParams) $.extend(params, Craiggers.Search.defaultSearchParams);
          params.search_url = search.get('url');
          params.name = search.get('name');
          params[method] = $('#notify-' + method + '-address').val();
          if ( params.sms) params['number'] = params.sms;

          $.ajax({
            url: 'http://3taps.net/notifications/create',
            type: 'get',
            dataType: 'jsonp',
            data: params,
            success: function(data) { },
            error: function() { }
          });
        }
      });

      // don't run the search
      return false;
    },

  }),


});
