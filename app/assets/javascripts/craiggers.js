Craiggers.Controller = new (function() {
  return ThreeTapsController.extend({
    routes: {
      '': 'root',
      '!/': 'root',
      '!/search': 'search',
      '!/search/': 'search',
      '!/search/:query': 'querySearch',
      '!/search/blank': 'blankSearch',
      '!/search/:location/:category': 'search',
      '!/search/:location/:category/:query': 'search',
      '!/search/:location/:category/:query/*params': 'fullSearch',
      '!/posting/:postkey': 'posting'
    },
    search: function() {
      if($('#searchbar').is(':visible')) $('#workspace-link').click();
      new Craiggers.Pages.Search();
      Craiggers.Search.set({
        url: Backbone.history.fragment
      }).submit();
    },
    querySearch: function(query) {
      if($('#searchbar').is(':visible')) $('#workspace-link').click();
      new Craiggers.Pages.Search();
      Craiggers.Search.set({
        query: decodeURIComponent(query || '')
      }).submit();
    },
    fullSearch: function(location, category, query, params) {
      if($('#searchbar').is(':visible')) $('#workspace-link').click();
      new Craiggers.Pages.Search();
      Craiggers.Search.set({
        location: decodeURIComponent(location || ''),
        category: decodeURIComponent(category || ''),
        query: decodeURIComponent(query || '')
      }).submit();
    }
  });
}());

Craiggers.appName = 'craiggers';

Craiggers.Search = new Craiggers.Models.Search();
Craiggers.Postings = new Craiggers.Collections.Postings;
Craiggers.Favorites = new Craiggers.Collections.Favorites;
Craiggers.Locations = new Craiggers.Collections.StaticLocations;
Craiggers.Neighborhoods = new Craiggers.Collections.CraiggersNeighborhoods;
Craiggers.Categories = new Craiggers.Collections.CraiggersCategories;
Craiggers.SavedSearches = new Backbone.Collection({
  model: Craiggers.Models.Search
});
//PyotrK use this for navigation and other states
Craiggers.PageState = new Backbone.Model();

$(function() {
  if ( $.browser.msie ) {
    window.location.hash = '';
    window.location.pathname = '/unsupported';
  }
  Craiggers.init();
});
