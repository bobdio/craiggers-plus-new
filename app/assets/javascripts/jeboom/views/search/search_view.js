var SearchState = function () {};
SearchState.NAME = "Search"
_.extend(SearchState.prototype, {

	getName : function () {
		return SearchState.NAME;
	},

	activate : function () {
		this.$('.subnavlink').show();
		this.$('#leftcol').show();
		this.$('.main-content').removeClass('shifted-left');
		this.header.activateSearch();
		this.results.startNextResultsTimer();
	},

	deactivate : function () {
		this.results.closeDetails();
		this.results.stopNextResultsTimer();
	}
});

var ManagePostingsState = function () {};
ManagePostingsState.NAME = "ManagePostings";
_.extend(ManagePostingsState.prototype, {
	getName : function () {
		return ManagePostingsState.NAME;
	},

	activate : function () {
		var self = this;

		this.$('.subnavlink').hide();

		this.$('#leftcol').hide();
		this.$('.main-content').addClass('shifted-left');

		this.header.activateSearch();

		this.results.renderUserPostings();

		userService.getUserPostings(function (postings) {
			self.results.renderUserPostings(postings);			
		});
	},

	deactivate : function () {
		this.$('.subnavlink').show();
		this.$('#leftcol').show();
		this.$('.main-content').removeClass('shifted-left');
		this.results.closeDetails();
	}
});

var FavoritesState = function () {};
FavoritesState.NAME = "Favorites";
_.extend(FavoritesState.prototype, {

	getName : function () {
		return FavoritesState.NAME;
	},

	activate : function () {
		var self = this;

		this.$('.subnavlink').hide();

		this.$('#leftcol').hide();
		this.$('.main-content').addClass('shifted-left');

		this.header.activateFavorites();

		if (app.models.syncModel.get("is_favorites_synced")) {
			this.renderFavorites();
		} else {
			app.models.syncModel.once("change:is_favorites_synced", function (value) {
				self.renderFavorites();
			});
		}
	},

	deactivate : function () {
		this.$('.subnavlink').show();
		this.$('#leftcol').show();
		this.$('.main-content').removeClass('shifted-left');
		this.results.closeDetails();
	}
});

var ExploreState = function () {};
ExploreState.NAME = "Explore";

_.extend(ExploreState.prototype, {
	getName : function () {
		return ExploreState.NAME;
	},

	activate : function (id) {
		$('.metrics_container').hide();
		$('#content #container').hide();
		console.log("activate id: " + id);
		this.header.activateExplore();
		this.exploreView.render(id);
	},

	deactivate : function () {
		$('.metrics_container').show();
		$('#content #container').show();
		this.exploreView.remove();
	}
});


var SearchView = BaseView.extend({
	el : "#search.page",

	events : {
		"click #drawer-button" : "savedSearchesHandler"
	},

	render : function () {
		this.show();

		this.header = new SearchHeaderView();
		this.header.render();

		this.results = new SearchResultsView();
		this.results.render();

		this.searchOptions = new SearchOptionsView({model: this.model});
		this.searchOptions.render();

		this.sourceFilters = new SourceFiltersView({model: this.model});
		this.sourceFilters.render();

		this.savedSearches = new SavedSearchesView();
		this.savedSearches.render();

		this.exploreView = new ExploreView();

		$("cancel-running-search").click(function () {
			searchService.abort();
			$.fancybox.close();
		});
	},

	setState : function (state, params) {
		if (this.state) {
			this.state.deactivate.call(this);
		}
		this.state = state;
		state.activate.call(this, params);
	},

	startSearching : function () {

		this.activateSearchingState();

		this.results.clearPostings();

		this.searchOptions.refreshOptions();
		
		searchService.search(this.model, $.proxy(this.searchingComplete, this));

		$.fancybox({
			autoDimensions: false,
			centerOnScroll: true,
			content: JST['searching-popup'](),
			enableEscapeButton: false,
			height: 60,
			hideOnOverlayClick: false,
			onComplete: function() {
				
			},
			showCloseButton: false,
			transitionIn: 'none',
			transitionOut: 'none',
			width: 200
		});
	},

	isFavoritesState : function () {
		if (this.state) {
			return this.state.getName() == FavoritesState.NAME;
		}

		return false;
	},

	activateManagePostingsState : function () {
		this.setState(new ManagePostingsState());
	},

	savedSearchesHandler : function () {
		this.$("#drawer").toggleClass("open");

		this.$(".main-content").toggleClass("shifted-right");

		this.results.closeDetails();
	},

	activateSearchingState : function () {
		this.setState(new SearchState());
	},

	activateFavoritesState : function () {
		this.setState(new FavoritesState());
	},

	activateExploreState : function (id) {
		this.setState(new ExploreState(), id);
	},

	renderFavorites : function () {
		this.results.renderFavorites(app.collections.favorites);
	},

	searchingComplete : function (resultModel) {
		$.fancybox.close();
		this.refreshResults(resultModel);
		this.sourceFilters.refresh();
	},

	refreshResults : function (resultModel) {
		this.results.refresh(resultModel);
	},

	remove : function () {
		this.hide();
		this.header.remove();
		this.results.remove();
		this.searchOptions.remove();
		this.sourceFilters.remove();
		this.exploreView.remove();

		this.model.off("change:safe_search");

		this.undelegateEvents();
	}
});