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

	addImage : function (imageData) {
		var images = this.get("images");
		images.push(imageData);
		this.set("images", images);
	},

	removeImage : function (url) {
		var images = this.get("images");
		var index = _.map(images, function (image) {
			return image.full;
		}).indexOf(url);

		if (index > -1) {
			images.splice(index, 1);
		}
		
		this.set("images", images);
	},

	url : function () {
		return "/postings";
	},

	getSourceAccount : function () {
		var annotations = this.get('annotations');

		return annotations.source_account ? annotations.source_account : "";
	},

	setSourceAccount : function (value) {
		var annotations = this.get('annotations');

		annotations.source_account = value;
		this.set("annotations", annotations);
	},

	setSourcePhone : function (value) {
		var annotations = this.get('annotations');

		annotations.phone = value;
		this.set("annotations", annotations);
	},

	getSourcePhone : function () {
		var annotations = this.get('annotations');

		return annotations.phone ? annotations.phone : "";
	},

	getSourceMapGoogle : function () {
		var annotations = this.get('annotations');

		return annotations.source_map_google ? annotations.source_map_google : "";
	},

	validatePostingCreationData : function () {
		var errors = {};
		if (this.get("heading") == "") {
			errors.heading = true;
		}

		if (this.get("location").get("code") == "") {
			errors.location = true;
		}

		if (this.get("category") == "") {
			errors.category = true;
		}

		if (this.get("body") == "") {
			errors.body = true;
		}

		return errors;
		//return {};
	},

	initialize : function () {
		this.setupData();
	},

	hasDetails : function () {
		return this.get("timestamp") !== "";
	},

	setupData : function () {
		this.set({location: new LocationModel(this.get("location"))});

		var annotations = this.get("annotations");
		if (_.isArray(annotations)) {
			annotations = {};
			this.set("annotations", annotations);
		}
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