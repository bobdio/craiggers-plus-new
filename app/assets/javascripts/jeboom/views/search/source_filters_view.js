var SourceFiltersView = SearchFiltersBaseView.extend({
	el : "#search.page #sourcesfilter",

	events : {
		"click .header" : "toggleSettingsActivation",
		"click .allnone .all" : "selectAllSources",
		"click .allnone .none" : "unselectAllSources",
		"click .results .name" : "toggleFilter",
		"change .results input" : "filterSelected" 
	},

	render : function () {
		SearchFiltersBaseView.prototype.render.call(this);

		this.results = this.$(".results");
		this.loader = this.$(".loader");
	},

	refresh : function () {
		searchService.getSearchSourceCount(this.model, $.proxy(this.refreshItemsData, this));
		this.loader.show();
		this.deactivateSettings();
	},

	filterSelected : function (event) {
		this.startSearching();
	},

	startSearching : function () {
		this.setupFilters();
		router.gotoSearch();
	},

	setupFilters : function () {
		var filtersData = _.reduce(this.results.find(".result input"), function(memo, item) {
			var checkbox = $(item);
			if (checkbox.attr("checked")) {
				memo.selected.push(checkbox.val());
			} else {
				memo.unselected.push(checkbox.val());
			}

			return memo;

		}, {selected: [], unselected:[]});

		this.model.set("selected_source", filtersData.selected);
		this.model.refreshUnselectedSource(filtersData.unselected, filtersData.selected);
	},

	toggleFilter : function (event) {
		var checkbox = $(event.target).parent().find("input");
		if (!checkbox) {
			return;
		}
		var selected = checkbox.attr("checked");
		checkbox.attr("checked", !selected);

		this.startSearching();
	},

	selectAllSources : function (event) {
		this.results.find(".result input").attr("checked", true);
		this.setupFilters();
	},

	unselectAllSources : function (event) {
		this.results.find(".result input").attr("checked", false);
		this.setupFilters();
	},

	refreshItemsData : function (searchCount) {
		this.loader.hide();
		this.activateSettings();

		var counts = searchCount.get('counts');
		var unselectedItems = this.model.get("unselected_source");
		var selectedItems = this.model.get("selected_source");
		var items = [];

		if (counts.length > 0) {
			_.each(counts, function (countData, counter) {

				var itemData = {
					selected : unselectedItems.indexOf(countData.term) == -1,
					name : app.SOURCE_NAMES[countData.term.toLowerCase()],
					count : countData.count,
					code : countData.term
				}

				if (unselectedItems == "all") {
					selectedItems.indexOf(countData.term) !== -1 ? itemData.selected = true : itemData.selected = false;
				}

				items.push(itemData);
			}, this);
		}

		this.results.html(JST['filters-list']({
			items: items
		}));
	},

	remove : function () {
		this.undelegateEvents(this.events);
	}
});