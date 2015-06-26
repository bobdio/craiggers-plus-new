app = {

  version : app_version,

  models : {},

  collections : {},

  views : {},

  SOURCE_NAMES : {
    "craig" : "Craigslist",
    "ebaym" : "Ebay Motors",
    "bkpge" : "Backpage",
    "carsd" : "Cars.com",
    "indee" : "Indeed",
    "hmngs" : "Hemmings Motor News",
    "relms" : "Real Estate MLS",
    "trftr" : "Thryfter.com",
    "aptsd" : "Apartments.com",
    "rentd" : "Rent.com"
  },

  initialize : function () {
    //sets available locations levels
    LocationModel.MATCHED_LOCATIONS_LEVELS = ['country','state','metro','region','county','city','locality'];

    app.models.syncModel = new SyncModel();
    app.models.searchModel = new SearchModel({rpp: 100, has_image: false});
    app.models.userModel = new UserModel();

    app.collections.favorites = new FavoritesCollection();
    app.collections.categories = new CategoriesCollection();
    app.collections.postings = new PostingsCollection();
    app.collections.savedSearches = new SavedSearchesCollection();
    app.collections.locations = new LocationsCollection();

    app.views.newPostingView = new NewPostingView();

    syncService.sync(function () {
    	console.log('data synced')
    });

    app.models.syncModel.once("change:is_categories_synced", function (value) {
      if (value) {
        Backbone.history.start();
      }
    });
  }
}

$(function() {
  app.initialize();
});

isPrivateMode = function () {
  return false;
}