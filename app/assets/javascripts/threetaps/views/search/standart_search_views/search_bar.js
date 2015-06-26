_.extend(Craiggers.Views, {

  SearchBar: Craiggers.Views.SearchBar.extend({

    events: {
      'submit .form': 'search',
      'click .search': 'search',
      'focus .wrapper .input': 'clearHolder',
      'blur .wrapper .input': 'updateHolder',
      'click .category .viewlist': 'toggleAllCategories',
      'click .location .jumbolist .selectable': 'selectLocationFromList',
      'click .category .jumbolist .selectable': 'selectCategoryFromList',
      'click .category .jumbolist .more_menu_results': 'showAdditionalCategoriesForMenu',
      'click .category .jumbolist .less_menu_results': 'hideAdditionalCategoriesForMenu',
      'click .location .viewlist': 'geolocate',
      'click .location .geolocate': 'geolocate',
      'click .location-path .locality': 'searchByLocation',
      'click .location-path .city': 'searchByLocation',
      'click .location-path .county': 'searchByLocation',
      'click .location-path .region': 'searchByLocation',
      'click .location-path .metro': 'searchByLocation',
      'click .location-path .state': 'searchByLocation',
      'click .location-path .country': 'searchByLocation',
      'change .query .input': 'updateSearchQuery',
      'blur .category .input': 'updateSearchCategory',
      'keyup .location .input': 'locationAuto',
      'keydown .location .input': 'eventsForLocationFieldReset',
      'blur .location .input': 'locationFieldCheck',
      'click .location .autocomplete .selectable': 'clickLocationAuto',
      'click .signinout .safe': 'changeSafe',
      'focus .location .input': 'clearAllCategories',
      'click .savesearch': 'showNotifySave'
    },

    initialize: function() {
      $('#cancel-running-search').live('click', function() {
        var backpage_running = Craiggers.Search.get('backpage_running')
        var detailed_posting_running = Craiggers.Search.get('detailed_posting_running')
        var main_search_running = Craiggers.Search.get('main_search_running')
        backpage_running && backpage_running.abort()
        detailed_posting_running && detailed_posting_running.abort()
        main_search_running && main_search_running.abort()
        $.fancybox.close()
      });
      
      var view = this
      this.$('.category .input').result(function(event, data, formatted) {
        Craiggers.Search.set({ category: data.code });
        $('.category .input').val(data.name);

        new Craiggers.Views.CategoryFilter({
          hideCounts: true,
          category: data.code
        });
      });
      
      $('.signinout .safe, .safe_checkbox_container .safe').on('click', function(e){
        view.changeSafe(e)
      })

      // 2011-12-01 12:11 Author: Igor Novak
      // be careful with actions sequence!
      this.init();

      this.initialize_location_aim_menu($('#searchcolumn .jumbolist'));
      this.initialize_location_aim_menu($('#searchbar .jumbolist'));

      if ( Craiggers.Search.get('location') !== Craiggers.Search.defaults.location ) {
        Craiggers.Locations.nameByCode(Craiggers.Search.get('location'), function(data) {
          this.$('.location .input').val(data.location.name);
        });
      }

      var searchbar = this;
      Craiggers.Search.bind('search:submit', function() {
        searchbar.$('.query .input').val(Craiggers.Search.get('query'));

        var catisarray = _.isArray(Craiggers.Search.get('category'));
        searchbar.$('.category .input').val(catisarray ?
            'see filters' :
            Craiggers.Categories.nameByCode(Craiggers.Search.get('category'))
        );

        var isarray = _.isArray(Craiggers.Search.get('location'));
        if ( isarray ) {
          $('.location-path').html('');
          searchbar.$('.location .input').val('see filters');
          searchbar.clearInputHoldersIfVals();
          searchbar.$('.input').blur();
        } else {
          Craiggers.Locations.nameByCodeWithCallback(Craiggers.Search.get('location').code, function(data) {
            if ( !data.error ) {
              searchbar.$('.location .input').val(data.name);
              getContext(Craiggers.Search.get('location').code);
            }
            searchbar.clearInputHoldersIfVals();
            searchbar.$('.input').blur();
          });
        }

        searchbar.clearInputHoldersIfVals();
        searchbar.$('.input').blur();
      });

      $('body').click(function(event) {
        var el = $(event.target);
        if ( !el.parents('.searchcontainer .wrapper').length ) {
          if ( searchbar.validCategory() ) {
            searchbar.clearAllCategories();
          } else {
            searchbar.showAllCategories();
          }
        }

        // with locationAutoESC should hide autocomplete location block
        $(".location .autocomplete").hide();
      });
    },

    showAdditionalCategoriesForMenu: function(caller){
      $(caller.toElement).parents('.dropdown-menu')
      .find('#additional_categories_for_menu').slideDown('fast');
      $(caller.toElement).hide()
      $('.category .jumbolist .less_menu_results').show()
    },

    hideAdditionalCategoriesForMenu: function(caller){
      $(caller.toElement).parents('.dropdown-menu')
      .find('#additional_categories_for_menu').slideUp('fast');
      $(caller.toElement).hide()
      $('.category .jumbolist .more_menu_results').show()
    },

    initialize_location_aim_menu: function(caller){
      
      var $menu = $(caller).find(".dropdown-menu");

      // jQuery-menu-aim: <meaningful part of the example>
      // Hook up events to be fired on menu row activation.
      $menu.menuAim({
          activate: activateSubmenu,
          deactivate: deactivateSubmenu,
          rowSelector: "> li, #additional_categories_for_menu > li"
      });
      // jQuery-menu-aim: </meaningful part of the example>

      // jQuery-menu-aim: the following JS is used to show and hide the submenu
      // contents. Again, this can be done in any number of ways. jQuery-menu-aim
      // doesn't care how you do this, it just fires the activate and deactivate
      // events at the right times so you know when to show and hide your submenus.
      function activateSubmenu(row) {
          var $row = $(row),
              submenuId = $row.data("submenuId"),
              $submenu = $(caller).find("#" + submenuId),
              width = $menu.outerWidth();

          if($.inArray(submenuId, ['all_categories_submenu', 'discussions_submenu', 
          'uncategorized_submenu']) !== -1){    
            $submenu.css({
                display: "none"
            }); 
          } else {
            // Show the submenu
            $submenu.css({
                display: "block",
                top: -2,
                left: width - 4  // main should overlay submenu
            });

            $menu.css({
              '-webkit-border-top-right-radius': 0,
              'border-top-right-radius': 0,
            }); 
          } 

          // Keep the currently activated row's highlighted look
          $row.find("a").addClass("maintainHover");
      }

      function deactivateSubmenu(row) {
          var $row = $(row),
              submenuId = $row.data("submenuId"),
              $submenu = $(caller).find("#" + submenuId);

          // Hide the submenu and remove the row's highlighted look
          $submenu.css("display", "none");

          $menu.css({
            '-webkit-border-top-right-radius': 10,
            'border-top-right-radius': 10,
          }); 
          $row.find("a").removeClass("maintainHover");
      }

      // Bootstrap's dropdown menus immediately close on document click.
      // Don't let this event close the menu if a submenu is being clicked.
      // This event propagation control doesn't belong in the menu-aim plugin
      // itself because the plugin is agnostic to bootstrap.
      // $("#searchcolumn .category>.jumbolist .dropdown-menu li").click(function(e) {
      //     e.stopPropagation();
      // });

      $(document).click(function() {
          // Simply hide the submenu on any click. Again, this is just a hacked
          // together menu/submenu structure to show the use of jQuery-menu-aim.
          $(".popover").css("display", "none");
          $menu.css({
            '-webkit-border-top-right-radius': 10,
            'border-top-right-radius': 10,
          }); 
          $("a.maintainHover").removeClass("maintainHover");
      });
    },

    initAutocompletion: function() {
      // 2011-10-07 14:11 Author: Igor Novak
      // autocomplete list for searchbar needs additional class, so
      // firstly initialize autocompetion for searchcolumn,
      // then for searchbar, not vice versa!
      $('#searchcolumn').find('.category').find('.input').autocomplete(
        Craiggers.Categories.getCategoryList(),
        this.acoptions
      );
      // this.acoptions.resultsClass = 'ac_results search-bar-ac-results';
      $('#searchbar').find('.category').find('.input').autocomplete(
        Craiggers.Categories.getCategoryList(),
        this.acoptions
      );
    },

    clickLocationAuto: function(event) {
      var auto = $(event.currentTarget).closest('.location.autocomplete'),
      selectable = $(event.currentTarget);
      var code = (selectable.next().text()).trim();
      var level = (selectable.next().next().text()).trim();
      this.$('.location .input').val(selectable.text().replace(level + ":",'').trim());
      auto.hide();
      Craiggers.Search.set({'location': { 'level': level, 'code': code}});
      getContext(code);
    },

    eventsForLocationFieldReset: function(event){
      if(event.keyCode == Craiggers.Util.KEY.ESC)
        this.locationFieldReset()
      else if ( event.keyCode === Craiggers.Util.KEY.ENTER ) {
        value = $(event.currentTarget).val()
        if( value == 'all' || value == 'all locations')
          this.locationFieldReset();
      }
    },

    locationFieldReset: function(){
      var input = $(".location .input")
      input.val('')
      input.parent().find('.holder').show()
      input.next().hide()
      input.next().next().html('')
      Craiggers.Search.update({ location: {code:'all'} })
      getContext('all')
    },

    locationFieldCheck: function(event){
      value = $(event.currentTarget).val()
      if( value == 'all' || value == 'all locations')
        this.locationFieldReset();
    },

    locationAuto: function(event) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function(){
        if ( $(event.currentTarget).val() == '' ) {
          $("#searchbar .location .input").val('');
          $('#searchbar .location .location-path').html('');
          Craiggers.Search.set({location: { 'code': 'all'}});
          return;
        }
        var auto = $(event.currentTarget).next();
        var location = event.currentTarget.value;
        var code = event.keyCode;
        var current = String.fromCharCode(code);
        if ( code === Craiggers.Util.KEY.ENTER || code === Craiggers.Util.KEY.TAB ) {
          if ( event.type === 'keydown' && code === Craiggers.Util.KEY.ENTER && !auto.is(':visible') ) {
            this.$('.search.button').click();
            return false;
          }
          if ( Craiggers.Util.KEY.TAB && !auto.is(':visible')) return;
          var selected = auto.find('.selected');
          var code = selected.next().text().trim();
          var level = selected.next().next().text().trim();
          this.$('#searchbar .location .input').val(
            selected.text().replace(level + ":",'').trim()
          );
          Craiggers.Search.set({'location' :
            {
              code: code,
              level: level
            }
          });
          getContext(code);
          auto.hide();
          if ( code === Craiggers.Util.KEY.ENTER) return false;
          return;
        }
        this.$('.location .location-path').html('');
        var arrowkeys = (code === Craiggers.Util.KEY.UP || code === Craiggers.Util.KEY.DOWN);
        //if ( event.type === 'keyup' && arrowkeys) return false;
        if ( event.type === 'keyup' && arrowkeys ) {
          var tobe;
          var selected = auto.find('.selected').removeClass('selected');
          if ( code === Craiggers.Util.KEY.DOWN ) {
            tobe = selected.nextAll('.selectable:first');
            if ( !tobe.length ) tobe = auto.find('.selectable').last();
            tobe.addClass('selected');
          } else {
            tobe = selected.prevAll('.selectable:first');
            if ( !tobe.length) tobe = auto.find('.selectable').first();
            tobe.addClass('selected');
          }
          var elTop = tobe.offset().top;
          var someNumber = 180;
          if ( elTop - someNumber > 150 || elTop - someNumber < 0 )
            auto.find('ul').scrollTop(elTop - someNumber);

          return false;
        }
        if ( event.type === 'keydown' && current.match(/\w/i) ) location += current;
        if ( !location.length ) {
          auto.hide();
          return;
        }
        if ( location.length >= 3 && !/^\d*$/.test(location) ) {
          Craiggers.Search.set({
            'location_flag_response': Craiggers.Search.get('location_flag_response') + 1
          });
          var location_flag_response = Craiggers.Search.get('location_flag_response');
          $.manageAjax.add('geolocate', {
            url: '/location/search',
            dataType: 'json',
            data: {
              levels: 'country,state,metro,region,county,city,locality',
              text: location,
              type: 'istartswith'
            },
            success: function(data) {
              if ( Craiggers.Search.get('location_flag_response') != location_flag_response )
                return

              if ( data.numMatches < 50 ) {
                var locations = _.map(data.locations.slice(0, 19), function(loc, i) {

                  var item = {
                    name: loc.locationName,
                    code: loc.code,
                    level: loc.level,
                    oddeven: i % 2 ? 'ac_odd' : 'ac_even'
                  }

                  if( loc.code != 'all')
                    item.metro = loc.level + ': ';

                  return item
                });

                // sort by level
                levels = 'country,state,metro,region,county,city,locality'.split(',')
                locations.sort(function (a, b) {
                  if( levels.indexOf(a.level) > levels.indexOf(b.level) ) return 1
                  else if ( levels.indexOf(a.level) < levels.indexOf(b.level) ) return -1
                  else return 0
                })

                auto.html(JST['root-location-autocomplete']({
                  locations: locations,
                  present: !_.isEmpty(locations)
                }));

                if ( $(auto).parent().is('.column') )
                  $(auto).find('.ac_results_loc').css('margin', '0px');

                auto.find('.selectable').first().addClass('selected');
              } else {
                auto.html(JST['root-location-autocomplete-nummatches']({
                  num_matches: data.numMatches
                }));
              }
              auto.show();
            }
          });
        } else {
          auto.hide();
          if ( /^\d{5}$/.test(location) ) {
            this.$('.location .location-path').html('');
            $.manageAjax.add('geolocate', {
              url: LOCATION_API + 'USA-' + location + '/parent',
              dataType: 'json',
              success: function(data) {
                if(data.success) {
                  Craiggers.Search.set({
                    location: {
                      code: data.location.code,
                      level: data.location.level
                    }
                  });
                  getContext(Craiggers.Search.get('location').code);
                }
              },
              error: function(data) {
                Craiggers.Search.update({ location: {code:'all'} })
              }
            });
          } else {
            auto.hide();
            Craiggers.Search.update({ location: {code:'all'} })
          }
        }
      }, 0);
    },

    changeSafe: function(event) {
      Craiggers.Search.set({
        safe: $(event.currentTarget).is(':checked') ? 'yes' : 'no'
      });
      Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
      Craiggers.Search.submit();
    },

    updateSearchQuery: function(event) {
      // TODO: try to move this logic to Craiggers.Search.submit event handler
      var $target = $(event.currentTarget);
      var query = $target.val();
      Craiggers.Search.update({
        query: query
      });
      $('.query .input').not($target).val(query);
    },

    validCategory: function() {
      var val = this.$('.category .input').val();
      if ( !val.length || val === 'all categories' || val == 'see filters') return true;
      return Craiggers.Categories.has(val);
    },

    search: function(event) {
      Craiggers.Search.set({'location_flag_response': Craiggers.Search.get('location_flag_response') + 1});
      if ($('.location.autocomplete').is(':visible')) return false;
      event.preventDefault();
      if ( !this.validCategory() ) {
        this.showAllCategories();
        return false;
      }
      if($('#searchbar').is(':visible')) $('#workspace-link').click();
      Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
      if ($(event.target).parents('#searchbar').size() > 0){
        Craiggers.Search.set({ search_from_homepage: true })
      }
      Craiggers.Search.submit();
    },

    selectCategoryFromList: function(event) {
      var $target = $(event.currentTarget);
      this.$('.category .input').val($target.text());
      if ( $target.hasClass('primary') ) {
        var category = $target.text();
      } else {
        var category = $target.siblings('.primary').first().text();
      }

      if ( $target.hasClass('primary') && (category === 'Real Estate') )
          var code = 'RRRR';
      else
          var code = Craiggers.Categories.codeByName(
            this.$('.category .input').val()//, category
            ) || Craiggers.Search.defaults.category;

      this.clearAllCategories();

      Craiggers.Search.update({
        category: code
      });

      new Craiggers.Views.CategoryFilter({ hideCounts: true });

      this.$('.category .holder').hide();
      this.$('.category .input').focus();
    },

    showAllCategories: function() {
      var viewlist = this.$('.category .viewlist');
      var jumbolist = this.$('.category .jumbolist');
      if ( viewlist.hasClass('closed') || !jumbolist.is(':visible') ) {
        viewlist.removeClass('closed');
        this.showJumboList(jumbolist);
      }
      //this.$('.category .input').focus();
    },

    toggleAllCategories: function() {
      var viewlist = this.$('.category .viewlist');
      if ( viewlist.hasClass('closed') ) {
        this.showAllCategories();
      } else {
        this.clearAllCategories();
      }
    },

    geolocate: function() {
      var searchbar = this;
      navigator.geolocation.getCurrentPosition(callback, noLocation);

      function callback(position) {
        $.ajax({
          url: REVERSE_GEOLOCATION_URL + '?' + AUTH_TOKEN ,
          data: {
            'accuracy': 0,
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
          },
          callback: '?',
          dataType: 'json',
          beforeSend : function(data) {
            $('.location_input').addClass('ml-loading-img');
          },
          complete : function(data) {
            $('.location_input').removeClass('ml-loading-img');
          },
          success: function(data) {
            var location = Craiggers.Locations.deepCodeLevel(data, ['country', 'state', 'metro'])

            getContext(location.code, {
              error_callback: function(data) { noLocation(); }
            });

            Craiggers.Search.update({ location: { 'level': location.level, 'code': location.code  }});
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

    searchByLocation: function(event) {
      $('.location-path').find('.country, .state, .metro, .locality, .region, .city, .county').removeClass('current-search-level');
      var selected = $(event.currentTarget);
      $('.path-code').filter(function() {
        return $(this).text() == $(event.currentTarget).next().text().trim();
      }).prev().addClass('current-search-level');
      $(selected).addClass('current-search-level');
      var level = $(event.currentTarget).next().next().text().trim();
      Craiggers.Search.set({
        location: {
          'code': $(event.currentTarget).next().text().trim(),
          'level': level
        }
      });
      $('.location .input').val($(event.currentTarget).text().replace(level + ":",'').trim());
      this.search(event);
    },

  })
})
