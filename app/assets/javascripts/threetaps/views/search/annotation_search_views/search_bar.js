_.extend(Craiggers.Views, {

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
      Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
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

  })
})