var AppRouter = Backbone.Router.extend({
	routes : {
		"main" : "main",
		"" : "main",
		"results" : "results",
		"results/:id" : "results",
		"saved_searches" : "savedSearches",
		"posting_details/:id" : "postingDetails",
		"verify_email" : "verifyEmail",
		"user_profile" : "userProfile"/*,
		"favorites" : "favorites",
		"saved_searches" : "savedSearches",
		"refine_search" : "refineSearch",
		"save_search" : "saveSearch"*/
	},

	back: function() {
		if (app.history.length>1) {
			var ref = app.history.splice(app.history.length - 2, 2)[0];
			this.navigate(ref, {trigger: true});
		} else {
			this.navigate("", {trigger: true});
		}
	},

	/**
	* Stops current view by calling remove method and by set null value of currentView property
	* All views should be stopped by this method
	*/
	stopCurrentView : function () {
		if (this.currentView) {
			this.currentView.remove();
			//this.currentView = null;
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

	photoView : function () {
		if (_.last(app.history) !== "results" ) {
			this.navigate("results", {trigger: true});
		}

		app.views.resultsView.photoViewHandler();
	},

	listView : function () {
		if (_.last(app.history) !== "results" ) {
			this.navigate("results", {trigger: true});
		}

		app.views.resultsView.listViewHandler();
	},

	saveSearch : function () {
		if (!app.views.resultsView) {
			this.navigate("results", {trigger: true});
			return;
		}
		this.startView(new SaveSearchView({model: app.models.searchModel}));
		app.history.push("save_search");
	},

	refineSearch : function () {
		if (!app.views.resultsView) {
			this.navigate("results", {trigger: true});
			return;
		}
		this.startView(new RefineSearchView({model: app.models.searchModel}));
		app.history.push("refine_search");
	},

	savedSearches : function () {
		this.startView(new SavedSearchesView());
		app.history.push("saved_searches");
	},

	main : function () {
		this.startView(new MainView({model: app.models.searchModel}))
		app.history.push("main");
	},

	favorites : function () {
		this.startView(new FavoritesView());
		app.history.push("favorites");
	},

	userProfile : function () {
		this.startView(new UserProfileView({model: app.models.userModel}));
		app.history.push("user_profile");
	},

	verifyEmail : function () {
		this.startView(new EmailVerification());
		app.history.push("verify_email");
	},

	results : function (id) {
		var self = this;
		if (id) {
			searchService.getSavedSearchByID(id, function (searchModel) {
				if (searchModel) {
					app.models.searchModel.refreshOptionsBySearchModel(searchModel);

					if (app.models.resultsModel) {
						app.models.resultsModel.set("is_complete", false);	
					}
				}

				self.startResultsView();
			});
		} else {
			this.startResultsView();
		}
	},

	startResultsView : function () {
		if ((!app.models.resultsModel) || (!app.models.resultsModel.get("is_complete")) || (!app.views.resultsView)) {
			app.views.resultsView = new ResultsView({model: app.models.searchModel});
		}

		this.startView(app.views.resultsView);
		
		app.history.push("results");
	},

	postingDetails : function (id) {
		var postingModel = app.collections.postings.get(id);//app.models.resultsModel ? app.models.resultsModel.get("postings").get(id) : null;
		if (!postingModel) {
			postingModel = app.collections.favorites.get(id) || new PostingModel({postKey: id});
		}

		if (postingModel) {
			this.startView(new PostingDetailsView({model:postingModel}));
			app.history.push("posting_details");
		} else {
			this.navigate("results", {trigger: true});
		}
		
	}
});

var router = new AppRouter();