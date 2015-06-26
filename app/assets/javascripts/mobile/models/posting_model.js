/**
* spec in spec_runner/spec/models/posting_model_spec
*/

var PostingModel = BaseModel.extend({
	defaults: {
		annotations: {},
		body: "",
		category: "",
		currency: "",
		external_url: "",
		heading: "",
		id: "",
		images: [],
		location: null,
		price: "",
		source: "",
		status: "",
		timestamp: ""
	},

	getSourceAccount : function () {
		var annotations = this.get('annotations');

		return annotations.source_account ? annotations.source_account : "";
	},

	getSourcePhone : function () {
		var annotations = this.get('annotations');

		return annotations.phone ? annotations.phone : "";
	},

	getSourceMapGoogle : function () {
		var annotations = this.get('annotations');

		return annotations.source_map_google ? annotations.source_map_google : "";
	},

	initialize : function () {
		this.setupData();
	},

	hasDetails : function () {
		return this.get("timestamp") !== "";
	},

	setupData : function () {
		this.set({location: new LocationModel(this.get("location"))});
		/*var location = this.get("location");

		if ((location) && (location.formatted_address !== "") && (!_.isNull(location.formatted_address))) {
			this.set({location: new LocationModel(location)});
		} else {
			locationService.findLocation(location, $.proxy(function (location) {
				this.set({location: location});
				this.trigger("location_updated");
			}, this));
		}*/
	}
});