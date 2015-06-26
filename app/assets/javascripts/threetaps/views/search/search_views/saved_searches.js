_.extend(Craiggers.Views, {

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

  })
})