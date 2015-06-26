var SearchOptionsView = BaseView.extend({
	el : "#search.page #currentsearch",

	render : function () {
		this.searchContainer = new SearchContainerView({model: this.model});
		this.searchContainer.render();

		this.searchSettings = new SearchSettingsView({model: this.model});
		this.searchSettings.render();

		this.priceRangeFilter = new PriceRangeFilterView({model: this.model});
		this.priceRangeFilter.render();

		this.radiusFilter = new RadiusFilterView({model: this.model});
		this.radiusFilter.render();
	},

	refreshOptions : function () {
		this.searchContainer.refreshOptions();
		this.searchSettings.refreshOptions();
		this.priceRangeFilter.refreshOptions();
		this.radiusFilter.refreshOptions();
	},

	remove : function () {
		this.searchContainer.remove();
		this.searchSettings.remove();
		this.priceRangeFilter.remove();
	}
});