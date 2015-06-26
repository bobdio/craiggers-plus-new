Craiggers.Pages.Search = Backbone.View.extend({

  el: $('#search.page'),

  initialize: function() {
    if ( !this.el.is(':visible') ) {
      Craiggers.Pages.clear();
    }
    this.render();
  },

  render: function() {
    // MAJOR HACK.
    if ( location.hash == '#!/search/' ) new Craiggers.Views.CurrentSearch();
    new Craiggers.Views.NavBar();
    new Craiggers.Views.Drawer();

    // <PyotrK 2011-11-8>: Could not find another way to place search query into #searchcolumn inputs
    $('#searchcolumn .query .input').val(Craiggers.Search.get('query') || '');
    if ( Craiggers.Search.get('location') !== Craiggers.Search.defaults.location ) {
      $('#searchcolumn .location .input').val(
        Craiggers.Locations.nameByCode(
          Craiggers.Search.get('location')
          )
        );
      $('#searchcolumn .location .holder').hide();
    }

    if ( Craiggers.Search.get('category') !== Craiggers.Search.defaults.category ) {
      $('#searchcolumn .category .input').val(
        Craiggers.Categories.nameByCode(Craiggers.Search.get('category'))
      );
      $('#searchcolumn .category .holder').hide();
    }
    // </PyotrK>

    this.el.show();
    Craiggers.Pages.setSigninoutPosition();
  }

});

Craiggers.Pages.Treemap = Backbone.View.extend({

  el: $('#treemap'),

  events: {
    'click #showme_treemap_results': 'runSearch',
    'click .photos a': 'runSearchFromHref',
  },

  render: function() {
    this.el.show();
  },

  updateSearch: function(e) {
  },

  runSearch: function() {
    var params = {};
    var locations = window.locations.state;
    var categories = window.categories.state;

    params.location = locations.context[locations.context.length - 1];
    params.category = categories.context[categories.context.length - 1];
    params.query = locations.query.text;

    Craiggers.Search.update(params).submit();
  },

  runSearchFromHref: function(e) {
    e.preventDefault();
    Craiggers.Search.set({
      url: $(e.currentTarget).attr('href').replace('http://craiggers.com/#', '')
    });
    Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
    Craiggers.Search.submit();
  }

});

new Craiggers.Pages.Treemap();
