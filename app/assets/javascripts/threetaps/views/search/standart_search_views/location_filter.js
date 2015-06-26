_.extend(Craiggers.Views, {
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
        getContext(Craiggers.Search.get('location').code);
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

  })
})