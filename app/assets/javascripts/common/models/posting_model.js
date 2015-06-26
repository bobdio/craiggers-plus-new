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

	removePosting : function () {
		userService.deletePosting(this);
		this.trigger("remove");
	},

	updated: function () {
		this.trigger("updated");
	},

	getCategory : function () {
		return this.get("category");
	},

	setupCategory : function (value) {
		this.set("category", value);
	},

	getMinutesAgo : function () {
		return this.getSecondsAgo()/60;
	},

	isFavorited : function () {
		if ((_.isUndefined(this.get("unfavorite"))) || (this.get("unfavorite"))) {
			return false;
		}

		return true;
	},

	getSecondsAgo : function () {
		var from = this.get("timestamp");
		var to = new Date().getTime()/1000;

		return (to - from);
	},

	getDaysAgo : function () {
		return this.getSecondsAgo()/60/24;
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

	hasImages : function () {
		return this.get("images").length > 0;
	},

	hasPrice : function () {
		var parentCode = this.getCategoryParentCode();
		if (parentCode == 'AAAA' || parentCode == 'SSSS' || parentCode == 'RRRR') {
			return true;
		} else {
			return false;
		}
	},

	getCategoryParentCode : function () {
		var category = this.get("category");

		if (category == "") {
			return;
		}
		var categoryModel = app.collections.categories.getCategoryByCode(category);

		if (!categoryModel) {
			return;
		}

		var parentModel = categoryModel.getParent();
		
		var parentCode = category;
		if (parentModel) {
			parentCode = parentModel.get("code");	
		}

		return parentCode;
	},

	getSupportedAnnotations : function () {
		var category = this.get("category");
		var parentCode = this.getCategoryParentCode();
		//copied from threetaps/views/posting/posting_form.js
		switch(parentCode) {
			case 'AAAA':
				if(category === 'APET')
					return ['phone', 'make', 'age'];
				break;
			case 'CCCC': 
				return ['phone'];
				break;
			case 'DDDD': 
				return ['phone']; 
				break;
			case 'SSSS':
				if($.inArray(category, ['SANT', 'SBIK', 'SCOL', 'SMUS']) !== -1)
					return ['phone', 'make', 'model', 'year'];
				if($.inArray(category, ['SAPL', 'SELE']) !== -1)
					return(['phone', 'make', 'model', 'vin', 'year']);
				if($.inArray(category, ['SAPP', 'SANC', 'SKID', 'SBAR', 'SEDU', 'SFNB', 'SFUR', 'SGFT',
				'SHNB', 'SHNG', 'SIND', 'SJWL', 'SLIT', 'SMNM', 'SOTH', 'SSNF', 'STIX', 'STOO',
				'STOY', 'SWNT']) !== -1)
				return ['phone', 'make', 'model'];
				break;
			case 'JJJJ':
				return ['phone', 'compensation', 'partTime', 'telecommute', 'contract', 'internship', 'nonprofit'];
				break;
			case 'MMMM':
				if($.inArray(category, ['MADU', 'MMFM', 'MMFW', 'MWFM']) !== -1)
				return ['phone', 'age', 'sex', 'personal_flavor'];
				break;
			case 'ZZZZ': 
				return ['phone'];
				break;
			case 'PPPP':
				return ['phone', 'age', 'sex', 'personal_flavor'];
			break;
			case 'RRRR':
				if($.inArray(category, ['RCRE','RLOT','ROTH','RPNS']) !== -1)
					return ['phone', 'sqft'];
				if($.inArray(category, ['RHFS', 'RSHR']) !== -1)
					return ['phone', 'bedrooms', 'sqft'];
				if($.inArray(category, ['RHFR','RSUB','RSWP','RVAC','RWNT']) !== -1)
					return ['phone', 'bedrooms', 'sqft', 'cats', 'dogs'];
				break;
			case 'SVCS':
				return ['phone', 'scheduling'];
				break;
			case 'VVVV':
				return ['seller', 'phone', 'make', 'model', 'vin', 'year','mileage', 'price', 'bodyStyle', 'exteriorColor', 'interiorColor', 'wheelbase', 'drivetrain', 'transmission', 'engine', 'fuel'];
			break;

			default:
				break;
		}
	},

	resetOptions : function () {
		this.set(this.defaults);
		this.setupData();
	},

	setupData : function () {
		this.set({location: new LocationModel(this.get("location"))});

		var annotations =  this.get("annotations");
		// console.log(annotations);
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

_.extend(PostingModel.prototype, AnnotationsModelMixin.prototype);