_.extend(Craiggers.Views, {

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

  })
})