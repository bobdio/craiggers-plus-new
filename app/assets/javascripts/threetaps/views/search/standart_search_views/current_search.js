_.extend(Craiggers.Views, {

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

  })
})