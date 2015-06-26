_.extend(Craiggers.Views, {

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

      if ( e.keyCode === 13 ) {
        Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
        Craiggers.Search.submit();
      }  
    },

  })
})