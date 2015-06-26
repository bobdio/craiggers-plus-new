/**
* spec in spec_runner/spec/models/results_model_spec
*/

var ResultsModel = BaseModel.extend({
	defaults: {
		anchor: 0,
		next_page: 0,
		next_tier: 0,
		num_matches: 0,
		postings: [],
		success: true,
		time_fetch: 0,
		time_search: 0,
		time_taken: 0,
		is_complete: false,
		search_count_targets : ["category", "status", "source"],
		search_counts : []
	},

	initialize : function () {
		this._setupData();
	},

	getPreviousPageNumber : function () {
		return this.get("next_page") - 2;
	},

	isNextPageAvailable : function () {
		return this.get("next_page") > 0;
	},

	isPreviousPageAvailable : function() {
		return this.get("next_page") > 1;
	},

	isNextTierAvailable : function () {
		// mobile version supports only postings with tier = 1 because of performance issues
		return this.get("next_tier") == 1;
	},

	isNextSearchAvailable : function () {
		return this.isNextPageAvailable() || this.isNextTierAvailable();
	},

	isCountsDataLoaded : function () {
		return this.get('search_counts').length >= this.get('search_count_targets').length;
	},

	_setupData : function () {
		var postingsData = this.get("postings");
		app.collections.postings.add(postingsData);
		this.set({
			postings: new PostingsCollection(postingsData)
		});
	},

	addSearchCount : function (searchCount) {
		var searchCounts = this.get('search_counts');
		searchCounts.push(searchCount);
		this.set('search_counts', searchCounts);
	},

	clearSearchCounts : function () {
		this.set('search_counts', []);
	}
});