var InputLocationView = BaseView.extend({

	DEFAULT_VALUE : "All Locations",

	events : {
		"focus #location_input" : "inputFocusHandler",
		"blur #location_input" : "inputBlurHandler",
		"keyup #location_input" : "inputKeyUpHandler",
		"click .viewlist" : "searchLocationHandler",
		'click .selectable': 'locationSelectedHandler',
	},

	render : function () {

		if (!this.model) {
			this.model = app.models.searchModel;
		}

		this.show();

		this.$(".holder").hide();

		this.inputField = this.$("#location_input");
		this.autocomplete = this.$(".location.autocomplete");
		this.autocomplete.show();

		this.refreshValue();
	},

	refreshValue : function () {
		var location = this.model.get("location");

		if (location) {
			if (location.get("has_context")) {
				this.inputField.val(location.getLocationName());	
			} else {
				location.refreshLocationContext($.proxy(this.refreshValue, this));
			}
		} else {
			this.setDefaultValue();
		}
	},

	locationSelectedHandler : function (event) {
		var code = event.target.id;

		var location = this.matchedLocations.get("locations").getLocationByCode(code);

		this.refreshLocation(location);

		this.clearAutoComplete();
	},

	inputKeyUpHandler : function (event) {
		var location = event.target.value;

		switch(event.keyCode) {
			case this.KEY.ENTER:
				this.keyEnterHandler();
				break;
			case this.KEY.UP:
				this.keyUpHandler(event);
				break;
			case this.KEY.DOWN:
				this.keyDownHandler(event);
				break;
			default:
				if (location.length < 3) {
					return;
				}
				locationService.searchLocation(location, $.proxy(this.refreshMatchedLocations, this));
				break;
		}
	},

	keyEnterHandler : function (event) {
		if (this.isLocationsListDisplayed()) {
			this.refreshLocation(this.selectedLocation);
			this.clearAutoComplete();
		} 
	},

	keyUpHandler : function (event) {
		if (this.isLocationsListDisplayed()) {
			this.selectPreviousLocation();
		}
	},

	keyDownHandler : function (event) {
		if (this.isLocationsListDisplayed()) {
			this.selectNextLocation();
		}
	},

	isLocationsListDisplayed : function () {
		return this.autocomplete.find(".ac_results_loc").length > 0;
	},

	clearAutoComplete : function () {
		this.autocomplete.empty();
		$('body').off('click');
	},

	refreshMatchedLocations : function (matchedLocations) {
		if (!matchedLocations) {
			return;
		}

		this.matchedLocations = matchedLocations;

		this.clearAutoComplete();		

		if (matchedLocations.get("locations")) {
			this.renderMatchedLocations(matchedLocations.get("locations"));
		} else {
			this.autocomplete.append(JST['root-location-autocomplete-nummatches']({
				num_matches : matchedLocations.get('numMatches')
			}));
		}
	},

	renderMatchedLocations : function (locations) {
		var self = this;
		var locationsData = locations.map(function(location, i) {
			var item = {
				name: location.getLocationName(),
				code: location.get('code'),
				level: location.get('level'),
				oddeven: i % 2 ? 'ac_odd' : 'ac_even'
			}

			if( location.get('code') != 'all')
				item.metro = location.get('level') + ': ';

			return item;
		});

		// sort locations by level
		levels = LocationModel.MATCHED_LOCATIONS_LEVELS;
		locationsData.sort(function (a, b) {
			if( levels.indexOf(a.level) > levels.indexOf(b.level) ) return 1
			else if ( levels.indexOf(a.level) < levels.indexOf(b.level) ) return -1
			else return 0
		});
		// render matched locations
		this.autocomplete.append(JST['root-location-autocomplete']({
			locations: locationsData,
			present: !_.isEmpty(locations)
		}));

		if ( $(this.autocomplete).parent().is('.column') ) {
			$(this.autocomplete).find('.ac_results_loc').css('margin', '0px');
		}

		this.selectLocation(locations.at(0));

		$('body').on("click", function (event) {
			var el = $(event.target);
			
        	if (( !el.parents('.searchcontainer .wrapper').length ) && (!el.is('.search'))) {
        		self.clearAutoComplete();
        	}

        	if (el.is('.search')) {
        		event.preventDefault();
				self.keyEnterHandler();
        	}
		});
	},

	selectNextLocation : function () {
		var location = this.matchedLocations.get('locations').getNextModel(this.selectedLocation);

		if (location) {
			this.selectLocation(location);
		}
	},

	selectPreviousLocation : function () {
		var location = this.matchedLocations.get('locations').getPreviousModel(this.selectedLocation);

		if (location) {
			this.selectLocation(location);
		}
	},

	selectLocation : function (location) {
		this.selectedLocation = location;
		this.autocomplete.find('.selectable').removeClass('selected');
		this.autocomplete.find('#'+location.get('code')+'.selectable').addClass('selected');
	},

	searchLocationHandler : function (event) {
		var self = this;
		locationService.geolocate($.proxy(this.refreshLocation, this), $.proxy(this.noLocationHandler, this)); 
		this.inputField.addClass("ml-loading-img");
	},

	noLocationHandler : function () {
		this.inputField.removeClass("ml-loading-img");
		$.fancybox({
			content: '<div id="geolocate-loading-popup">hm, your location wasn\'t found... yo, where you at? try your location in the field below</div>',
			autoScale: false,
			autoDimensions: false,
			height: 70,
			width: 300
		});
		_.delay(function() {
			$.fancybox.close()
		}, 5000);
	},

	refreshLocation : function (location) {
		if (location) {
			this.inputField.val(location.getLocationName());
			this.model.set("location", location);	
		}

		this.inputField.removeClass("ml-loading-img");
	},

	setDefaultValue : function () {
		this.inputField.val(this.DEFAULT_VALUE);
	},

	inputBlurHandler : function (event) {
		if (this.inputField.val() == "") {
			this.setDefaultValue();
		}
	},

	inputFocusHandler : function (event) {
		if (this.inputField.val() == this.DEFAULT_VALUE) {
			this.inputField.val("");	
		}
	},

	remove : function () {
		this.undelegateEvents(this.events);
		this.hide();
		this.clearAutoComplete();
	}
})