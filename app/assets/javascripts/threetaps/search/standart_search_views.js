function getContext(code) {
  var location = code || Craiggers.Search.get('location').code,
      extension = {};

  if(arguments[1]) extension =  arguments[1]

  if ( _.isArray(location) || location == 'all') {
    Craiggers.Search.set({ radius: { } })
    return false;
  }

  $.manageAjax.add('geolocate', {
    url: LOCATION_API + location,
    dataType: 'json',
    success: callback
  });

  function callback (data) {
    if ( data.error ) {
      if(typeof(extension.error_callback) == 'function')
        extension.error_callback(data)

      $('.location-path').html('');
      return
    }

    var loc = data;
    var plurLevels = ['countries', 'states', 'metros', 'regions', 'counties',
                      'cities', 'localities'];
    var levels = ['country', 'state', 'metro', 'region', 'county', 'city',
                  'locality'];
    var locations = {};

    _.each(_.zip(plurLevels, levels), function(level) {
      if ( loc.context[level[0]] ) {
        locations[level[0]] = _.map(loc.context[level[0]], function(item) {
          return {
            name: item.name,
            code: item.code
          }
        })
        return
      }
      if ( loc.level == level[1] ) {
        locations[level[0]] = [{
          name: loc.name,
          code: loc.code
        }]

        $('#searchcolumn .location .input').val(loc.name);
        $('#searchcolumn .location .holder').hide();

        Craiggers.Search.set({
          radius: {
            lat: loc.lat,
            long: loc.long
          }
        })
      };
    });

    if ( location == Craiggers.Search.get('location').code ) {
      $('.location-path').each(function() {
        var n = $(this);
        if ( n.parent().is('.column') ) {
          n.html(JST['location-path-show-hide'](locations));
        } else {
          n.html(JST['location-path'](locations));
        }
      });
      $('.path-code').filter(function() {
        return $(this).text() == location;
      }).prev().addClass('current-search-level');
    }
  }
}

_.extend(Craiggers.Views, {

  SourcesFilter: Craiggers.Views.Filter.extend({

    DEFAULT_VISIBLE_FILTERS: 5,

    el: $('#sourcesfilter'),

    events: {
      'click .results .name': 'search',
      'click .allnone .none': 'deselectAll',
      'click .allnone .all': 'selectAll',
      'change .selector input': 'update',
      'click .seemore': 'toggleMore'
    },

    initialize: function() {
      if ( Craiggers.Search.get('source') != 'all' ) {
        if ( !this.$('.text').is('.selected') ) {
          this.$('.text').addClass('selected')
          this.$('.body').show();
        }
      } else {
        this.$('.text').removeClass('selected');
        this.$('.body').hide();
      }

      _.bindAll(this, 'render');

      var source = Craiggers.Search.get('source');
      this.selectall = false;
      var codes;

      // 2011-11-14 20:00 Author: Igor Novak
      // TODO: clean up
      if ( _.isArray(source) ) {
        codes = Craiggers.Sources.siblingCodes(source[0]);
        if ( source[0] == 'all' ) {
          this.selectall = true;
        };
      } else if ( source === 'all' ) {
        codes = Craiggers.Sources.siblingCodes(source);
        this.selectall = true;
      } else {
        var checked = this.$('.selector input:checked');
        if ( checked.size() == 1 && $(checked[0]).val() == source ) {
          codes = Craiggers.Sources.siblingCodes(source);
        } else {
          codes = Craiggers.Sources.childrenCodes(source);
        }
      }
      if ( !_.isArray(source) ) source = [source];
      this.source = source;

      var params = Craiggers.Search.params(false, { source: null });
      params.dimension = 'source';
      // params.codes = codes.join(',');

      if ( this.currentRequest ) this.currentRequest.abort();
      this.currentRequest = Craiggers.Search.summary(params, this.render);
    },

    render: function(data) {
      var view = this;

      var total = 0;
      var items = _.map(data.summary, function(data) {
        var name = Craiggers.Sources.nameByCode(data[1]);
        if(name) {
          total += data[2];
          return {
            name: name,
            count: _.commatizeNumber(data[2]),
            code: data[1],
            selected: view.selectall || _.include(view.source, data[1])
          };
        }
      });

      this.$('.allcountnumber').html(_.commatizeNumber(total));
      this.$('.results').html(JST['filters-list']({
        items: _.compact(items)
      }));
    },

    update: function(event) {
      var params = {};
      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        params.source = $(event.currentTarget).parent().find('.code').text();

        // deselect all checkboxes so we make sure to populate filters correctly
        this.$('.selector input').filter('.' + params.source).attr('checked', 'checked');
        this.$('.selector input').not($('.' + params.source)).removeAttr('checked');
      } else {
        // populate from select boxes
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        if ( checkedCheckBoxes.size() < checkBoxes.size() ) {
          params.source = _.map(checkedCheckBoxes, function(c) {
            return $(c).val();
          });
        } else {
          params.source = ['all'];
        }
      }
      Craiggers.Search.update(params);
    },

    search: function(event) {
      this.$('.selector').find('input').removeAttr('checked');
      $(event.currentTarget).siblings('.selector').find('input').attr('checked', 'checked');
      this.update();
      Craiggers.Search.submit();
    }

  }),

  LocationFilter: Craiggers.Views.LocationFilter.extend({

    DEFAULT_VISIBLE_FILTERS: 5,

    el: $('#locationfilter'),

    events: {
      'change .selector input': 'update',
      'click .name': 'search',
      'click .seemore': 'toggleMore',

      'click .allnone .none': 'deselectAll',
      'click .allnone .all': 'selectAll',
      'click .allnone .none-neighbors': 'deselectAllNeighbors',
      'click .allnone .all-neighbors': 'selectAllNeighbors',
    },

    initialize: function() {
      if ( Craiggers.Search.get('location') != 'all' ) {
        if ( !this.$('.text').is('.selected') ) {
          this.$('.text').addClass('selected')
          this.$('.body').show();
        }
      } else {
        this.$('.text').removeClass('selected');
        this.$('.body').hide();
      }
      this.render();
    },

    render: function() {
      _.bindAll(this);

      this.$('.allcount').hide();
      this.$('.neighbors-allnone').show();
      this.$('.results-title').html('<p>current location</p>');
      this.$('.neighbors-title').html('<p>neighbors</p>');
      this.$('.seemore').text('see more...').hide();
      var view = this;

      var location = Craiggers.Search.get('location').code;

      if ( _.isArray(location) ) {
        this.selectall = false;
        this.currentCode = this.$('.result .selector').first().parent().find('.code').text() || location[0];
      } else {
        this.currentCode = location;
        this.selectall = true;
        location = [location];
      }

      this.location = location;

      var params = Craiggers.Search.params(false, { location: null });

      params.dimension = 'location';
      Craiggers.Search.summary(params, view.renderCurrentLocation);

      view.$('.results').empty();
      view.$('.results-neighbors').empty();
      view.$('.allcountnumber').html('');
    },

    renderCurrentLocation: function(data) {
      var view = this;

      this.renderFilters(data.summary, '.results');

      if ( this.currentCode == 'all' ) return

      // Craiggers.Locations.neighborsCodes(this.currentCode, function(data) {
      //   var params = Craiggers.Search.params(false, { location: null });
      //   params.codes = data.join(',');
      //   params.dimension = 'location';
      //   //Craiggers.Search.summary(params, view.renderNeighbors);
      // })
    },

    renderNeighbors: function(data) {
      this.renderFilters(data, '.results-neighbors');
    },

    renderFilters: function(data, selector) {
      var view = this,
          codes = [],
          total = 0,
          totals = {};

      _.each(data, function(location) {
        codes.push(location[1]);
        totals[location[1]] = location[2]
        total += location[2];
      })

      codes.unshift(this.location[0]);
      totals[this.location[0]] = total

      Craiggers.Locations.namesByCodes(codes, function(data) {
        var items = _.map(data.locations, function(location) {
          if ( location.level == 'zipcode' ) return

          return {
            name: location.name,
            count: _.commatizeNumber(totals[location.code] || 0),
            code: location.code,
            selected: view.selectall || _.include(view.location, location.code)
          };
        });

        view.renderFiltersList(_.compact(items), selector);
      });
    },

    selectAllNeighbors: function() {
      this.$('.results-neighbors .selector input').attr('checked', 'checked');
      this.update();
    },

    deselectAllNeighbors: function() {
      this.$('.results-neighbors .selector input').removeAttr('checked');
      this.update();
    },

    update: function(event) {
      var params = {};
      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        params.location = {
          'code': $(event.currentTarget).parent().find('.code').text(),
          'level': $(event.currentTarget).parent().find('.level').text()
        }
        // deselect all checkboxes so we make sure to populate filters correctly
        $(event.currentTarget).prev().find('input').attr('checked',true);
        $('.location .input').val($(event.currentTarget).text());
        Craiggers.Search.set({
          'location': params.location
          });
        // get location context
        getContext();
      } else {
        // populate from select boxes
        if ( event ) {
          if ( $(event.currentTarget).val() == this.$('.result .selector').first().parent().find('.code').text() ) {
            if ( this.$('.result .selector input').first().prop("checked") ) {
              this.$('.result .selector input').prop("checked", true);
            }
          } else {
            if ( this.$('.result .selector input:checked').length !=  this.$('.result .selector input').length ) {
              this.$('.result .selector input').first().prop("checked", false);
            }
          }
        }
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        params.location = _.map(checkedCheckBoxes, function(c) {
          return $(c).val();
        });
        if ( params.location.length == 1 ) {
          getContext(params.location[0].code);
          $('.location .input').val($(checkedCheckBoxes).parent().next().text());
        }else if ( params.location.length > 1 ) {
          $('.location .input').val('');
          $('#searchcolumn .form .location .input').val('see filters');
          $('.location-path').html('');
        } else {
          $('.location .input').val('');
          $('.location-path').html('');
          Craiggers.Search.set({location : { 'code': 'all'}});
        }

      }
      if ( !_.isEmpty(params.location)) Craiggers.Search.update(params);
    },

  }),

  CategoryFilter: Craiggers.Views.CategoryFilter.extend({

    dimension: function(codes) {
      return 'category'
    },

  }),

  CurrentSearch: Craiggers.Views.CurrentSearch.extend({

    render: function() {
      new Craiggers.Views.PriceRange();
      new Craiggers.Views.SortBy();
      new Craiggers.Views.SearchFilters();
      new Craiggers.Views.RadiusFilter();
      if ( $('#currentsearch').is(':visible') ) {
        new Craiggers.Views.CategoryFilter();
        new Craiggers.Views.LocationFilter();
        new Craiggers.Views.StatusFilter();

        new Craiggers.Views.SourcesFilter();
      }

      $(window).resize();
    }

  }),

  SearchBar: Craiggers.Views.SearchBar.extend({

    events: {
      'submit .form': 'search',
      'click .search': 'search',
      'focus .wrapper .input': 'clearHolder',
      'blur .wrapper .input': 'updateHolder',
      'click .category .viewlist': 'toggleAllCategories',
      'click .location .jumbolist .selectable': 'selectLocationFromList',
      'click .category .jumbolist .selectable': 'selectCategoryFromList',
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
      this.$('.category .input').result(function(event, data, formatted) {
        Craiggers.Search.set({ category: data.code });
        $('.category .input').val(data.name);

        new Craiggers.Views.CategoryFilter({
          hideCounts: true,
          category: data.code
        });
      });

      // 2011-12-01 12:11 Author: Igor Novak
      // be careful with actions sequence!
      this.init();

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
              getContext();
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
          $(".location .input").val('');
          $('.location .location-path').html('');
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
          this.$('.location .input').val(
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
                  getContext();
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
      Craiggers.Search.update({
        safe: $(event.currentTarget).is(':checked') ? 'yes' : 'no'
      });
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
      // if ( navigator.geolocation )
      //   return

      var searchbar = this;
      navigator.geolocation.getCurrentPosition(callback, noLocation);

      function callback(position) {
        $.ajax({
          url: 'http://geolocator.3taps.com/reverse/?' + AUTH_TOKEN ,
          data: {
            'accuracy': 0,
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
          },
          callback: '?',
          dataType: 'json',
          beforeSend : function(data) {
            $('#location_input').addClass('ml-loading-img');
          },
          complete : function(data) {
            $('#location_input').removeClass('ml-loading-img');
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

  }),

  RadiusFilter: Craiggers.Views.RadiusFilter.extend({

    el: $('#radiusfilter'),

    events: {
      'keyup .distance': 'updateDistance',
      'change select': 'updateDimension'
    },

    initialize: function() {
      this.dimension = 'km';
      this.distance = 0;

      Craiggers.Search.bind('change:radius', this.toggleRadius)

      if(this.updateFromModel()) 
        this.showResults()
    },

    toggleRadius: function() {
      if((lat = Craiggers.Search.get('radius').lat) && (long = Craiggers.Search.get('radius').long)) {
        $('#radiusfilter').find('.distance').attr('disabled', false)
      }
      else {
        $('#radiusfilter').find('.distance').attr('disabled', true)
      }
    },

    updateFromModel: function() {
      var radius = Craiggers.Search.get('params').radius;

      if(radius) {
        this.dimension = radius.replace(/[0-9]/g, '');
        this.distance = radius.replace(/[a-z]/g, '');

        this.el.find('.dimension option[value="' + this.dimension + '"]').attr('selected', true);
        this.el.find('.distance').val(this.distance);
      }
      else {
        this.el.find('.dimension option[value="km"]').attr('selected', true);
        this.el.find('.distance').val('');
      }

      this.toggleRadius()

      return radius
    },

    updateDistance: function(event) {
      this.distance = $(event.currentTarget).val();

      Craiggers.Search.update({
        params: { radius: this.radius() }
      });

      if ( event.keyCode === Craiggers.Util.KEY.ENTER )
        Craiggers.Search.submit();
    },

    updateDimension: function(event) {
      this.dimension = $(event.currentTarget).val();

      Craiggers.Search.update({
        params: { radius: this.radius() }
      });
    },

    radius: function() {
      if(this.distance) return this.distance + this.dimension
      else return null
    },
  }),

  PriceRange: Craiggers.Views.PriceRange.extend({
    minmaxReset: function() {
      this.$('.min').val(this.mintext).addClass('default');
      this.$('.max').val(this.maxtext).addClass('default');
      Craiggers.Search.update({
        params: { price: null }
      });
      Craiggers.Search.submit();
    }
  }),

  SavedSearch: Craiggers.Views.SavedSearch.extend({
    initialize: function() {
      var view = this;
      this.location = this.model.get('location');

      Craiggers.Locations.nameByCodeWithCallback(this.location.code, callback, true);

      function callback(data) {
        if ( !data.error ){
          view.location = data.name;
        }

        view.render();
      };
    }
  }),

});
