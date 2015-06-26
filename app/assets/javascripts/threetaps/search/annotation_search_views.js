_.extend(Craiggers.Views, {

  LocationFilter: Craiggers.Views.LocationFilter.extend({

    el: $('#locationfilter'),

    initialize: function() {
      var collection = this.collection = Craiggers.Locations;
      _.bindAll(this, 'render');
      this.selectall = false;

      this.code = Craiggers.Search.get('location');
      var codes = this.summaryCodes();

      var params = Craiggers.Search.params(false, { location: null });
      params.dimension = collection.dimension(codes[0]);
      params.codes = codes.join(',');
      //Craiggers.Search.summary(params, this.render);
    },

    update: function(event) {
      // this duplicates CategoryFilter#update functionality
      // TODO: hard refactoring
      var params = {};
      // "click" event seems to be incorrect, probably "change" event is needed
      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        params.location = $(event.currentTarget).parent().find('.code').text();

        // deselect all checkboxes so we make sure to populate filters correctly
        this.$('.selector input').filter('.' + params.location).attr('checked', 'checked');
        this.$('.selector input').not($('.' + params.location)).removeAttr('checked');
      } else {
        // populate from select boxes
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        if ( checkedCheckBoxes.length < checkBoxes.length ) {
          params.location = _.map(checkedCheckBoxes, function(c) {
            return $(c).val();
          });
        } else {
          var currentLocation = Craiggers.Search.get('location');
          if ( !_.isArray(currentLocation) ) currentLocation = [currentLocation];
          params.location = Craiggers.Locations.parentCode(currentLocation[0]);
        }
      }
      Craiggers.Search.update(params);
    },

  }),

  CategoryFilter: Craiggers.Views.CategoryFilter.extend({

    countNameCode: function(code, singleCode) {
      // subsubcategories for "apts/housing" should be displayed for
      // "new york city" location only
      // do not display them for other locations
      if ( !Craiggers.Locations.isNYC(Craiggers.Search.get('location'))
           && code == 'apa' ) {
        return this.collection.parentCode(code);
      }

      if ( singleCode && this.collection.hasChildrenCodes(code) )
        return code

      return this.collection.parentCode(code)
    },

    summaryCodes: function() {
      var code = this.code;
      var singleCode = !_.isArray(code);
      code = singleCode ? code : code[0];

      // subsubcategories for "apts/housing" should be displayed for
      // "new york city" location only
      // do not display them for other locations
      if ( !Craiggers.Locations.isNYC(Craiggers.Search.get('location'))
           && code == 'apa' ) {
        return this.collection.siblingCodes(code);
      }

      if ( singleCode && this.collection.hasChildrenCodes(code) ) {
        this.selectall = true;
        return this.collection.childrenCodes(code);
      }

      return this.collection.siblingCodes(code);
    },

    dimension: function(codes) {
      return Craiggers.Categories.isCat(codes[0]) ? 'original_cat' :
             Craiggers.Categories.isSubcat(codes[0]) ? 'original_subcat' :
                                                       'original_subcat_2';
    },

  }),

  NeighborFilter: Craiggers.Views.SummaryFilter.extend({

    el: $('#neighborfilter'),

    initialize: function() {
      var collection = this.collection = Craiggers.Neighborhoods;
      _.bindAll(this, 'render');

      var loc = Craiggers.Search.get('location');
      var codes = Craiggers.Neighborhoods.getItemsByLocation(loc);
      if ( !codes.length )
        return this.el.hide();

      var curParams = Craiggers.Search.get('params').original_locality;
      if ( curParams ) {
        curParams = curParams.replace(/AND/g, '/');
        this.code = decodeURIComponent(curParams).split(' OR ');
      } else {
        this.code = codes;
      };
      this.selectall = !this.code;

      var params = Craiggers.Search.params(false, { original_locality: null });
      params.dimension = 'original_locality';
      params.codes = codes.join(',');
      //Craiggers.Search.summary(params, this.render);
      this.el.show();
    },

    countNameCode: function() {
      var collection = this.collection;
      var codes = _(this.code).chain().map(function(i) {
        return collection.parentCode(i)
      }).uniq().value();
      if ( codes.length < 2 )
        return codes[0]

      return collection.parentCode(codes[0])
    },

    update: function() {
      var codes = this.$(':checked').map(function() {
        return this.value.replace(/\//g, 'AND')
      });
      var params = [].join.call(codes, ' OR ');
      Craiggers.Search.update({
        params: { original_locality: params }
      });
    },

    search: function(event) {
      this.deselectAll();
      var $input = $(event.currentTarget).siblings('.selector').find('input');
      $input.attr('checked', !$input.attr('checked'));
      this.update();
      Craiggers.Search.submit();
    }

  }),

  CurrentSearch: Craiggers.Views.CurrentSearch.extend({

    render: function() {
      new Craiggers.Views.PriceRange();
      new Craiggers.Views.SortBy();
      new Craiggers.Views.CategorySpecFilters();

      new Craiggers.Views.SearchFilters();
      new Craiggers.Views.CategoryFilter();
      new Craiggers.Views.LocationFilter();
      new Craiggers.Views.RadiusFilter();
      new Craiggers.Views.StatusFilter();

      new Craiggers.Views.NeighborFilter();

      this.clearCategories();

      this.$('.normal').show();

      $(window).resize();
    },

    // TODO: check if we do not need this and remove (till 01.15.2012)
    // collapse the category filter
    clearCategories: function() {
      this.$('.categories .header .text').removeClass('selected');
      this.$('.categories .allnone').hide();
      // ANIMATION
      //this.$('.categories .results').slideUp(function() { $(this).empty(); });
      this.$('.categories .results').hide(function() {
        $(this).empty();
      });
    },

  }),

  SearchBar: Craiggers.Views.SearchBar.extend({

    events: {
      'submit .form': 'search',
      'click .search': 'search',
      'focus .wrapper .input': 'clearHolder',
      'blur .wrapper .input': 'updateHolder',
      'click .category .viewlist': 'toggleAllCategories',
      'click .category .jumbolist .selectable': 'selectCategoryFromList',
      'click .location .viewlist': 'toggleAllLocations',
      'click .location .jumbolist .selectable': 'selectLocationFromList',
      'click .geolocate': 'geolocate',
      'blur .query .input': 'updateSearchQuery',
      'blur .location .input': 'updateSearchLocation',
      'keydown .location .input': 'keydownLocation',
      'blur .category .input': 'updateSearchCategory',
      'focus .category .input': 'clearAllLocations',
      'click .signinout .safe': 'changeSafe',
      'focus .location .input': 'clearAllCategories',
      'click .savesearch': 'showNotifySave',
      'click .form .input': 'startTyping'
    },

    initialize: function() {
      this.$('.category .input').result(function(event, data, formatted) {
        Craiggers.Search.set({ category: data.code });
      });
      this.$('.location .input').result(function(event, data, formatted) {
        Craiggers.Search.set({ location: data.code });
      });

      this.isMobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

      // 2011-12-01 12:11 Author: Igor Novak
      // be careful with actions sequence!
      this.init();

      if ( Craiggers.Search.get('location') !== Craiggers.Search.defaults.location ) {
        $('#searchcolumn .location .input').val(
          Craiggers.Locations.nameByCode(Craiggers.Search.get('location'))
        );
      }

      var searchbar = this;
      Craiggers.Search.bind('search:submit', function() {
        searchbar.$('.query .input').val(Craiggers.Search.get('query'));
        searchbar.$('.location .input').val(searchbar.getLocationName());

        var catisarray = _.isArray(Craiggers.Search.get('category'));
        searchbar.$('.category .input').val(catisarray ?
            'see filters' :
            Craiggers.Categories.nameByCode(Craiggers.Search.get('category'))
        );
        searchbar.clearInputHoldersIfVals();
        searchbar.$('.input').blur();
      });

      $('body').click(function(e) {
        if ( $(e.target).parents('.searchcontainer .wrapper').length )
          return

        if ( searchbar.validCategory() ) {
          searchbar.clearAllCategories();
        } else {
          searchbar.showAllCategories();
        }
        if ( searchbar.validLocation() ) {
          searchbar.clearAllLocations();
        } else {
          searchbar.showAllLocations();
        }
      });

      if ( this.isMobile ) {
        this.geolocate();
        //make header's position not fixed in iPhone
        $('#navbar').css("position", "absolute");
        $('#sublinks').css("position", "absolute");
      };
    },

    getLocationName: function() {
      if ( Craiggers.Search.get('params').zip && Craiggers.Search.get('params').within )
        return 'see filters'

      var origLoc = Craiggers.Search.get('params').original_locality;
      if ( origLoc ) {
        if ( / OR /.test(origLoc) ) {
          return 'see filters'
        } else {
          return origLoc
        };
      };

      var loc = Craiggers.Search.get('location');
      if ( _.isArray(loc) ) {
        $('.location-path').html(''); // wtf?
        return 'see filters'
      } else {
        return Craiggers.Locations.nameByCode(loc);
      }
    },

    initAutocompletion: function() {
      // 2011-10-07 14:11 Author: Igor Novak
      $('#searchcolumn').find('.category').find('.input').autocomplete(
        Craiggers.Categories.getCategoryList(),
        this.acoptions
      );
      $('#searchcolumn').find('.location').find('.input').autocomplete(
        Craiggers.Locations.getLocationList(),
        this.acoptions
      );

      // autocomplete list for searchbar needs additional class in computer browsers while resizing
      var autocompleteOptions = (this.isMobile) ? this.acoptions : _.extend({}, this.acoptions, { resultsClass: 'ac_results search-bar-ac-results' });
      $('#searchbar').find('.category').find('.input').autocomplete(
        Craiggers.Categories.getCategoryList(),
        autocompleteOptions
      );
      $('#searchbar').find('.location').find('.input').autocomplete(
        Craiggers.Locations.getLocationList(),
        autocompleteOptions
      );
    },

    changeSafe: function(event) {
      Craiggers.Search.update({
        safe: $(event.currentTarget).is(':checked') ? 'yes' : 'no'
      });
      //Craiggers.Search.submit();
    },

    startTyping: function(event) {
      //change the behavior of the search form in iPhone
      if (this.isMobile) {
        var additional_offset = 45;
        window.scrollTo(window.pageXOffset,window.pageYOffset + additional_offset);
      }
    },

    updateSearchQuery: function(event) {
      Craiggers.Search.update({ query: $(event.currentTarget).val() });
    },

    validLocation: function() {
      // TODO: check correctness
      var val = this.$('.location .input').val();

      return !val.length ||
             val === this.$('.location .jumbolist .all').text() ||
             val === 'see filters' ||
             Craiggers.Locations.has(val) ||
             Craiggers.Neighborhoods.has(val)
    },

    keydownLocation: function(event) {
      if ( event.keyCode === Craiggers.Util.KEY.TAB && !this.validLocation() ) {
        event.preventDefault();
        this.showAllLocations();
      }
    },

    updateSearchLocation: function(event) {
      var val = $(event.currentTarget).val();

      if ( val === 'see filters' || _.isArray(Craiggers.Search.get('location'))) return;
      var current = Craiggers.Locations.nameByCode(
        Craiggers.Search.get('location')
        );
      if ( !val.length ) {
        Craiggers.Search.update({
          location: Craiggers.Search.defaults.location
        });
      }
      // if location name doesn't match val, then find and set
      else if ( val !== current ) {
        Craiggers.Search.update({
          location: Craiggers.Locations.codeByName(val)
        });
      }
    },

    validCategory: function() {
      var val = this.$('.category .input').val();
      if ( !val
           || val === this.$('.category .jumbolist .all').text()
           || val == 'see filters' ) return true;
      return Craiggers.Categories.has(val);
    },

    search: function(event) {
      event.preventDefault();

      if ( !this.validLocation() ) {
        this.showAllLocations();
        return false;
      }
      if ( !this.validCategory() ) {
        this.showAllCategories();
        return false;
      }
      if($('#searchbar').is(':visible')) $('#workspace-link').click();

      Craiggers.Search.update({ // HACK
        query: $('.searchcontainer:visible').find('.query').find('.input').val()
      });

      Craiggers.Search.submit();
    },

    selectCategoryFromList: function(event) {
      var $target = $(event.currentTarget);
      var categoryName = $target.text();
      this.$('.category .input').val(categoryName);

      var $parent = $target.parents('.category').first().find('.primary');
      var parentCode = Craiggers.Categories.codeByName($parent.text());
      var code = Craiggers.Categories.codeByName(categoryName, parentCode)
                 || Craiggers.Search.defaults.category;

      this.clearAllCategories();

      Craiggers.Search.update({ category: code });

      //new Craiggers.Views.CategoryFilter({ hideCounts: true });

      this.$('.category .holder').hide();
      // this.$('.category .input').focus();
    },

    showAllCategories: function() {
      this.clearAllLocations();
      var viewlist = this.$('.category .viewlist');
      var jumbolist = this.$('.category .jumbolist');
      if ( viewlist.is('.closed') || !jumbolist.is(':visible') ) {
        viewlist.removeClass('closed');
        this.showJumboList(jumbolist);
      }
      this.$('.category .input').focus();
    },

    clearHolder: function(event) {
      $(event.currentTarget).parents('.wrapper').find('.holder').hide();

      // HACK for mobile app
      if ( $(event.currentTarget).is('#searchbar_category_input')
           && this.isMobile ) {
        this.clearAllLocations();
        var viewlist = this.$('.category .viewlist');
        var jumbolist = this.$('.category .jumbolist');
        if ( viewlist.is('.closed') || !jumbolist.is(':visible') ) {
          viewlist.removeClass('closed');
          this.showJumboList(jumbolist);
        }
      };
    },

    toggleAllCategories: function() {
      this.clearAllLocations();

      var viewlist = this.$('.category .viewlist');
      if ( viewlist.hasClass('closed') ) {
        this.showAllCategories();
      } else {
        this.clearAllCategories();
      }
    },

    toggleAllLocations: function() {
      this.clearAllCategories();

      var viewlist = this.$('.location .viewlist');
      if ( viewlist.hasClass('closed') ) {
        this.showAllLocations();
      } else {
        this.clearAllLocations();
      }
    },

    geolocate: function() {
      if ( !navigator.geolocation )
        return

      var searchbar = this;
      navigator.geolocation.getCurrentPosition(callback, noLocation);

      function callback(position) {
        $.ajax({
          url: '/user/locations',
          data: {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          },
          type: 'post',
          beforeSend : function(data) {
            $('.location .input').addClass('ml-loading-img');
          },
          complete : function(data) {
            $('.location .input').removeClass('ml-loading-img');
          },
          success: function(data, textStatus, jqXHR) {
            if ( data && data.code ) {
              searchbar.$('.location .input').val(
                Craiggers.Locations.nameByCode(data.code)
              );
              Craiggers.Search.update({
                location: data.code
              });
              searchbar.$('.location .holder').hide();
              $.fancybox.close();
            } else {
              noLocation();
            }
          },
          error: noLocation
        });
      };

      function noLocation() {
        $.fancybox({
          content: '<div id="geolocate-loading-popup">hm, your location wasn\'t found... yo, where you at? try your location in the field below</div>',
          autoScale: false,
          autoDimensions: false,
          height: 70,
          width: 300
        });
        _.delay(function() {
          $.fancybox.close()
        }, 5000);
      };
    },

  }),

  RadiusFilter: Craiggers.Views.RadiusFilter.extend({

    el: $('#radiusfilter'),

    events: {
      'change .filter': 'updateWithin',
      'change .within': 'updateWithin',
      'keyup .zip': 'updateZip',
    },

    initialize: function() {
      Craiggers.Search.bind('change:params', this.updateFromModel, this);

      if ( this.updateFromModel() )
        this.showResults()
    },

    updateFromModel: function() {
      var zip = Craiggers.Search.get('params').zip;
      var within = Craiggers.Search.get('params').within;

      this.$('.filter').attr('checked', !!within);
      if ( within ) {
        this.$('.within option[value="' + within + '"]').attr('selected', true);
      } else {
        this.$('.within option:first').attr('selected', true);
      }

      this.$('.zip').val(zip || '');

      return zip || within
    },

    updateWithin: function() {
      var within = ( this.$('.filter').is(':checked') ) ?
                   this.$('.within').val() : null;
      Craiggers.Search.update({
        params: { within: within }
      });
    },

    updateZip: function(e) {
      var zip = this.$('.zip').val();
      if ( !/^\d{5}$/.test(zip) ) zip = null;
      Craiggers.Search.update({ params: { zip: zip } });

      if ( e.keyCode === 13 ) Craiggers.Search.submit();
    },

  }),

  CategorySpecFilters: Backbone.View.extend({

    el: $('#categoryspecfilters'),

    events: {
      'change :checkbox[param]': 'updateParam',
      'change .bedrooms select.min': 'updateMinBedrooms',
      'change .bedrooms select.max': 'updateMaxBedrooms',
      'click .bedrooms .reset': 'resetBedrooms',
      'click .jobs .all': 'selectJobs',
      'click .jobs .none': 'deselectJobs',
      'focus .range input': 'hideHolder',
      'blur .range input': 'updateRangeParam',
      'keyup .range input': 'keyupRangeInput',
      'click .range .reset': 'resetRangeParam',
      'clear': 'clear'
    },

    initialize: function() {
      this.clear();

      var cat = Craiggers.Search.get('category');
      this.originalCategory = cat; // could be cat, subcat or subcat_2
      if ( _.isArray(cat) ) cat = cat[0];

      this.category = Craiggers.Categories.categoryByCode(cat);
      this.filter = this.$('.filter').filter('.' + this.category);
      this.render();
    },

    render: function() {
      // TODO: needs refactoring
      this.filter.show();

      var params = Craiggers.Search.get('params');
      var filters = this;

      // sales (cars+trucks)
      if ( _.include(['cta', 'ctd', 'cto'], this.originalCategory) )
        this.initCarsYearRange(params);

      // gigs
      if ( this.category == 'ggg' ) {
        if ( params.compensation ) {
          this.filter.find('.' + params.compensation).attr('checked', true);
        } else {
           this.filter.find('input').attr('checked', true);
        }
        var summaryParams = Craiggers.Search.params();
        summaryParams.dimension = 'original_compensation';
        summaryParams.codes = 'no pay,not no pay';
        Craiggers.Search.summary(summaryParams, function(data) {
          filters.filter.find('.no-pay').parents('.result').find('.count')
                 .text(_.commatizeNumber(data.totals['no pay']));
          filters.filter.find('.pay').parents('.result').find('.count')
                 .text(_.commatizeNumber(data.totals['not no pay']));
        });
      }

      // housing
      if ( _.include('roo apa sub hsw swp vac'.split(' '), this.originalCategory) ) {
        this.filter.find('.catsdogs').show();
        if ( params.cats ) this.filter.find('.cats').attr('checked', true);
        if ( params.dogs ) this.filter.find('.dogs').attr('checked', true);
      };
      if ( _.include('rea apa sub hsw swp vac'.split(' '), this.originalCategory) ) {
        this.filter.find('.bedrooms').show();
        if ( params.bedrooms ) {
          if ( params.bedrooms.length === 1 ) {
            this.filter.find('.bedrooms .min option[value="' + parseInt(params.bedrooms) + '"]').attr('selected', true);
            this.filter.find('.bedrooms .max option[value="' + parseInt(params.bedrooms) + '"]').attr('selected', true);
          } else if ( (range = params.bedrooms.split('-')).length === 2 ) {
            this.filter.find('.bedrooms .min option[value="' + parseInt(range[0]) + '"]').attr('selected', true);
            this.filter.find('.bedrooms .max option[value="' + parseInt(range[1]) + '"]').attr('selected', true);
          } else if ( (range = params.bedrooms.split('>')).length === 2 ) {
            this.filter.find('.bedrooms .min option[value="' + parseInt(range[1]) + '"]').attr('selected', true);
            this.filter.find('.bedrooms .max option').last().attr('selected', true);
          } else if ( (range = params.bedrooms.split('<')).length === 2 ) {
            this.filter.find('.bedrooms .min option').first().attr('selected', true);
            this.filter.find('.bedrooms .max option[value="' + parseInt(range[1]) + '"]').attr('selected', true);
          }
        } else {
          this.filter.find('.bedrooms .min option').first().attr('selected', true);
          this.filter.find('.bedrooms .max option').last().attr('selected', true);
        }
        this.updateMinBedrooms();
      };

      // jobs
      if ( this.category == 'jjj' ) {
        _.each(['telecommute', 'contract', 'internship', 'part-time', 'non-profit'], function(i) {
          var $input = filters.filter.find('.' + i);
          if ( params[i] ) $input.attr('checked', true);

          if ( i == 'telecommute' ) i = 'telecommuting';
          if ( i == 'part-time' ) i = 'partTime';
          if ( i == 'non-profit' ) i = 'nonprofit';

          var summaryParams = Craiggers.Search.params();
          summaryParams.dimension = i;
          summaryParams.codes = 'on';
          Craiggers.Search.summary(summaryParams, function(data) {
            $input.parents('.result').find('.count').text(data.total)
          });
        });
      };

      // personals
      if ( this.category == 'ppp' && this.originalCategory != 'rnr' ) {
        this.filter.find('.range').show();
        _.each(['minage', 'maxage'], function(item) {
          if ( params[item] ) filters.setRangeParam(item, params[item]);
        });
      };
    },

    initCarsYearRange: function(params) {
      this.filter.find('.range').show();

      var year = params.year;
      var min, max;
      if ( year ) {
        if ( ~year.indexOf('-') ) {
          year = year.split('-');
          min = year[0];
          max = year[1];
        } else if ( ~year.indexOf('<') ) {
          year = year.split('<');
          min = year[0];
          max = year[1];
        } else if ( ~year.indexOf('>') ) {
          year = year.split('>');
          min = year[1];
          max = year[0];
        };
      };
      this.setRangeParam('min_year', min || '');
      this.setRangeParam('max_year', max || '');
    },

    clear: function() {
      this.$(':checkbox, :radio').attr('checked', false);
      this.$(':text').val('');
      this.$('select').each(function(select) {
        $(select).find('option').first().attr('selected', true);
      });
      this.$('.bedrooms .max option').last().attr('selected', true);
      this.$('.filter').hide();

      this.$('.range').hide();
      this.$('.bedrooms').hide();
      this.$('.catsdogs').hide();
    },

    updateParam: function(event) {
      var el = $(event.currentTarget);
      var param = el.attr('param');
      var val = el.is(':checked');
      var update = {};
      if ( _.include(['pay', 'no-pay'], param) ) {
        var $checked = this.$('.gigs').find('input:checked');
        if ( $checked.length == 1 ) {
          update.compensation = $checked.attr('param');
        } else {
          update.compensation = null
        };
      } else {
        update[param] = val;
      }

      Craiggers.Search.update({ params: update });
    },

    hideHolder: function(event) {
      $(event.currentTarget).siblings('.holder').hide();
    },

    updateHolder: function(event, selector) {
      var $target = event && $(event.currentTarget) || $(selector);
      if ( $target.val() ) {
        $target.siblings('.holder').hide();
      } else {
        $target.siblings('.holder').show();
      };
    },

    setRangeParam: function(id, val) {
      $('#' + id).val(val);
      this.updateHolder(null, '#' + id);
    },

    updateRangeParam: function(event, selector) {
      var $target = event && $(event.currentTarget) || $(selector);
      var val = $target.val().replace(/\D/g, '')
      $target.val(val);
      this.updateHolder(event, selector);

      var params = {};
      var id = $target.attr('id');
      if ( id == 'min_year' || id == 'max_year' ) { // for cars+trucks
        var min = $('#min_year').val();
        var max = $('#max_year').val();
        params.year = ( min && max ) ? min + '-' + max :
                             ( min ) ? '>' + min :
                             ( max ) ? '<' + max :
                             null;
      } else {
        params[id] = val;
      };
      Craiggers.Search.update({ params: params });
    },

    resetRangeParam: function(event) {
      var filters = this;
      $(event.currentTarget).parents('.range').find('input').each(function() {
        $(this).val('');
        filters.updateRangeParam(null, '#' + this.id);
      });
    },

    keyupRangeInput: function(event) {
      if ( event.keyCode === 13 ) {
        this.updateRangeParam(event);
        Craiggers.Search.submit();
      }
    },

    updateMinBedrooms: function() {
      var min = this.$('.bedrooms .min');
      var max = this.$('.bedrooms .max');

      var minval = parseInt(min.find('option:selected').val());
      var maxval = parseInt(max.find('option:selected').val());

      // enable all max options
      max.find('option').attr('disabled', false);

      // de-select max if min is greater than max
      if ( minval > maxval ) {
        max.find('option').first().attr('selected', true);
      }

      // disable max vals less than min val
      if ( minval > 0 ) {
        for(var i = 1; i < minval; i++) {
          max.find('option[value="' + i + '"]').attr('disabled', true);
        }
      }

      this.updateBedrooms();
    },

    updateMaxBedrooms: function() {
      this.updateBedrooms();
    },

    updateBedrooms: function() {
      var min = this.$('.bedrooms .min');
      var max = this.$('.bedrooms .max');

      var minval = parseInt(min.find('option:selected').val());
      var maxval = parseInt(max.find('option:selected').val());
      var maxmaxval = parseInt(max.find('option').last().val());

      var update = {
        bedrooms: null
      };

      if ( minval && maxval === maxmaxval ) {
        update.bedrooms = '>' + minval;
      } else if ( minval && maxval ) {
        update.bedrooms = minval === maxval ? minval : minval + '-' + maxval;
      } else if ( maxval && maxval !== maxmaxval ) {
        update.bedrooms = '<' + maxval;
      }

      Craiggers.Search.update({ params: update });
    },

    resetBedrooms: function() {
      this.$('.bedrooms .min option').first().attr('selected', true);
      this.$('.bedrooms .max option').last().attr('selected', true);

      Craiggers.Search.update({
        params: { bedrooms: null }
      });
    },

    selectJobs: function() {
      var params = {};
      this.$('.jobtypes').find('input').each(function() {
        $(this).attr('checked', 'checked');
        params[$(this).attr('param')] = true;
      });

      Craiggers.Search.update({ params: params });
    },

    deselectJobs: function() {
      var params = {};
      this.$('.jobtypes').find('input').each(function() {
        $(this).removeAttr('checked');
        params[$(this).attr('param')] = false;
      });

      Craiggers.Search.update({ params: params });
    },

  }),

});
