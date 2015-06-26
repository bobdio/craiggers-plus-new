var SavedSearchesView = BaseView.extend({

	el : "#search.page #savedsearches",

	render : function () {
		this.savedSearchesContainer = this.$(".searches");
		this.savedSearches = [];

		app.collections.savedSearches.on("remove", $.proxy(this.savedSearchRemoved, this));

		if (!app.models.userModel.get("signedin")) {
			app.models.userModel.once("change:signedin", $.proxy(this.signedIn, this));
		}
	},

	signedIn : function () {
		searchService.fetchSavedSearches($.proxy(this.renderSavedSearches, this));
	},

	refresh : function () {
		if (app.collections.savedSearches.getIsSynced()) {
			this.renderSavedSearches();
		} else {
			searchService.fetchSavedSearches($.proxy(this.renderSavedSearches, this));
		}
	},

	clearSavedSearches : function () {
		_.each(this.savedSearches, function (savedSearch) {
			savedSearch.remove();
		});
		this.savedSearches = [];
	},

	savedSearchRemoved : function (savedSearchModel) {
		_.each(this.savedSearches, function (savedSearch) {
			if (savedSearch.model.id == savedSearchModel.id) {
				savedSearch.remove();
			}
		});
	},

	renderSavedSearches : function () {
		this.clearSavedSearches();
		
		if (app.collections.savedSearches.length > 0) {
			this.$(".none").hide();
			var self = this;
			app.collections.savedSearches.each(function (searchModel) {
				self.renderSavedSearch(searchModel);
			});
		} else {
			this.$(".none").show();
		}


	},

	renderSavedSearch : function (searchModel) {
		var savedSearch = new SavedSearchView({model: searchModel});
		savedSearch.render();
		this.savedSearchesContainer.append(savedSearch.$el);
		this.savedSearches.push(savedSearch);
	},

	remove : function () {
		app.collections.savedSearches.off("remove", $.proxy(this.savedSearchRemoved, this));
		app.models.userModel.off("change:signedin", $.proxy(this.signedIn, this));
		this.clearSavedSearches();
	}
});