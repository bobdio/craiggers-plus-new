var AppRouter = Backbone.Router.extend({

	DEFAULT_SEARCH_OPTION_VALUE : "all",

	routes : {
		"" : "gotoMain",
		"!/" : "main",
		'!/search': 'search',
		'!/search/:location/:category/:source': 'search',
		'!/search/:location/:category/:source/:query': 'search',
		'!/search/:location/:category/:source/:query': 'searchWithEmptyQuery',
		'!/search/:location/:category/:source/:query/*params': 'search',
		'!/explore/:action': 'explore',
		'!/explore': 'explore'
	},

	/**
	* Stops current view by calling remove method and by set null value of currentView property
	* All views should be stopped by this method
	*/
	stopCurrentView : function () {
		if (this.currentView) {
			this.currentView.remove();
		}
	},

	/**
	* Starts new view and removes previous view
	* All views should be started by this method
	*/
	startView : function (view) {
		this.stopCurrentView();
		this.currentView = view;
		this.currentView.render();
	},

	main : function () {
		this.isSearchViewStarted = false;
		this.startView(new MainView({model:app.models.searchModel}));
	},

	gotoMain : function () {
		this.resetSearchFilters();
		window.location = "/#!/";
	},

	gotoFavorites : function () {
		var params = "/subnav=workspace-link&nav=favorites-link";
		var url =  this.generateSearchURL() + params;

		window.location = url;
	},

	gotoManagePostings : function () {
		this.activateSearchView();

		this.currentView.activateManagePostingsState();
	},

	explore : function (id) {
		id = id || 'stream';
		
		this.activateSearchView();
		this.currentView.activateExploreState(id);
	},

	generateSearchURL : function () {
		var searchModel = app.models.searchModel;
		var location = searchModel.get("location") ? searchModel.get("location").get("level") + "=" +searchModel.get("location").get("code") : this.DEFAULT_SEARCH_OPTION_VALUE;
		var category = searchModel.get("selected_categories").length > 0 ? searchModel.get("selected_categories")[0] : this.DEFAULT_SEARCH_OPTION_VALUE;
		if (searchModel.get('category_group')) {
			category = searchModel.get('category_group');
		}
		var source = searchModel.get("selected_source").length > 0 ? searchModel.get("selected_source").join("|") : this.DEFAULT_SEARCH_OPTION_VALUE;
		var query = searchModel.get("text");

		var url = "#!/search" + "/" + location + "/" + category + "/" +source ;
		if (query !== "") {
			url += "/" + query;
		}

		return url;
	},

	genearteURLWithSearchParams : function (searchModel) {
		var url = this.generateSearchURL();

		url += "/" + searchModel.generateParams();

		return url;
	},

	gotoSearch : function () {
		var searchModel = app.models.searchModel;
		searchModel.set({
			page : 0,
			tier : 0
		});

		var url = this.genearteURLWithSearchParams(searchModel);

		if (window.location.hash == url) {
			this.startSearchView();
		}
		window.location = url;
	},

	parseParams: function(str) {
		if (!str) {
			return;
		}
		var params = {};

		_.each(str.split('&'), function(p) {
			var keyval = p.split('=');
			if ( keyval[0] && keyval[1] )
				params[keyval[0]] = decodeURIComponent(keyval[1]);
		});

		return params;
	},

	startSearchView : function () {
		if (!this.isSearchViewStarted) {
			this.activateSearchView();
			this.currentView.startSearching();
		} else {
			if ((this.currentView.isFavoritesState()) && (app.models.resultModel)) {
				this.currentView.refreshResults(app.models.resultModel);
				this.currentView.activateSearchingState();
			} else {
				this.currentView.startSearching();	
			}
			
		}
	},

	activateSearchView : function () {
		if (!this.isSearchViewStarted) {
			this.startView(new SearchView({model:app.models.searchModel}));
			this.isSearchViewStarted = true;
		}
	},

	startFavoritesView : function () {
		this.activateSearchView();
		this.currentView.activateFavoritesState();
	},

	resetSearchFilters : function (searchModel) {
		searchModel = searchModel || app.models.searchModel;
		searchModel.resetFilters();
		searchModel.set({has_image: false});
	},

	setupSearchModelOptions : function (searchModel, location, category, source, query, params) {
		this.resetSearchFilters(searchModel);
		if (location !== this.DEFAULT_SEARCH_OPTION_VALUE) {
			var locationData = location.split("=");
			if (locationData.length > 1) {
				searchModel.setupLocation(locationData[0], locationData[1]);
			}
		} else {
			searchModel.clearLocation();
		}

		if (category !== this.DEFAULT_SEARCH_OPTION_VALUE) {
			searchModel.setupCategory(category);
		}
		
		if (source !== this.DEFAULT_SEARCH_OPTION_VALUE) {
			searchModel.setupSource(source);
		}

		if (query) {
			searchModel.set("text", query);
		} else {
			searchModel.set("text", "");
		}

		params = this.parseParams(params);

		searchModel.setupParams(params);

		switch (params.nav) {
			case "favorites-link":
				this.startFavoritesView();
				break; 
			default:
				this.startSearchView();
				break;		
		}
		
	},

	searchWithEmptyQuery : function (location, category, source, params) {
		console.log(params);
		this.setupSearchModelOptions(app.models.searchModel, location, category, source, null, params);
	},

	search : function (location, category, source, query, params) {
		console.log(params);
		this.setupSearchModelOptions(app.models.searchModel, location, category, source, query, params);
	}
});

var router = new AppRouter();