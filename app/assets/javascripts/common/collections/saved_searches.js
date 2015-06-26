/**
* spec in spec_runner/spec/collections/saved_searches_spec
*/
var SavedSearchesCollection = BaseCollection.extend({
	model: SearchModel,

	initialize : function () {
		this._isSynced = false;
	},

	setupSavedSearchesData : function (savedSearchesData) {
		_.each(savedSearchesData, function (savedSearchData) {
			var searchModel = this.get(savedSearchData.key);

			if (!searchModel) {
				searchModel = new SearchModel(savedSearchData);
				this.add(searchModel);
			}
		}, this);

		this.setIsSynced(true);
	},

	setIsSynced : function (value) {
		this._isSynced = value;
	},

	getIsSynced : function () {
		return this._isSynced;
	}
})