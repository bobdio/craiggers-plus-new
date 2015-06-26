Craiggers.Pages.Search = Backbone.View.extend({

  el: $('#search.page'),

  initialize: function() {
    if ( !this.el.is(':visible') ) {
      Craiggers.Pages.clear();
    }
    Craiggers.Pages.setSearchbarPosition();
    this.render();
  },

  render: function() {
    new Craiggers.Views.NavBar();
    new Craiggers.Views.Drawer();

    // <PyotrK 2011-11-8>: Could not find another way to place search query into #searchcolumn inputs
    $('#searchcolumn .query .input').val(Craiggers.Search.get('query') || '');
    if ( Craiggers.Search.get('location') !== Craiggers.Search.defaults.location ) {
      $('#searchcolumn .location .input').val(
        Craiggers.Locations.nameByCode(
          Craiggers.Search.get('location')
          )
        ).click();
      $('#searchcolumn .location .holder').hide();
    }

    if ( Craiggers.Search.get('category') !== Craiggers.Search.defaults.category ) {
      $('#searchcolumn .category .input').val(
        Craiggers.Categories.nameByCode(Craiggers.Search.get('category'))
      ).click();
      $('#searchcolumn .category .holder').hide();
    }
    // </PyotrK>

    this.el.show();
    Craiggers.Pages.setSigninoutPosition();
  }

});
