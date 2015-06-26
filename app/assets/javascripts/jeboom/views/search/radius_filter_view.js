var RadiusFilterView = SearchFiltersBaseView.extend({
	el : "#search.page #radiusfilter",

	events : {
		"click .header" : "toggleSettingsActivation",
		"keyup .distance" : "inputKeyUpHandler"
	},

	render : function () {
		this.input = this.$(".distance");
		this.dimension = this.$(".dimension");

		this.refreshInputActivation();

		this.model.on("change:location", $.proxy(this.refreshInputActivation, this));

		SearchFiltersBaseView.prototype.render.call(this);
	},

	inputKeyUpHandler : function (event) {
		var value = this.input.val().replace(/[^0-9\.]/g,'');
		this.input.val(value);

		if (value !== "") {
			this.model.setupRadius(value, this.dimension.val());	
		}
	},

	refreshOptions : function () {
		var radius = this.model.get("radius");

		if ((radius) && (radius !== "")) {
			var km = radius.split("km");
			var miles = radius.split("mi");

			if (km.length > 1) {
				this.dimension.val("km");
				this.input.val(km[0]);
			}

			if (miles.length > 1) {
				this.dimension.val("mi");
				this.input.val(miles[0]);
			}
		} else {
			this.input.val("");
		}
	},

	refreshInputActivation : function () {
		var location = this.model.get("location");

		if (location) {
			if ((location.get("lat") !== 0) && (location.get("long") !== 0)) {
				this.activateInput();
			} else {
				location.refreshLocationContext($.proxy(this.refreshInputActivation, this));
				this.deactivateInput();
			}
		} else {
			this.deactivateInput();
		}
	},

	deactivateInput : function () {
		this.input.attr("disabled", true);
	},

	activateInput : function () {
		this.input.removeAttr("disabled");
	},

	remove : function () {
		this.undelegateEvents(events);
		this.model.off("change:location", $.proxy(this.refreshInputActivation, this));
	}
});