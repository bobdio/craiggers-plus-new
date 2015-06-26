_.extend(Craiggers.Views, {

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
      console.log('Annotation Search updateParam')
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
        Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
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

  })
})
