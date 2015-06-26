/**
* spec in spec_runner/spec/models/location_model_spec
*/

var LocationModel = BaseModel.extend({
	defaults: {
		code: "",
		context: {},
		lat: 0,
		level: "",
		long: 0,
		name: "",
		accuracy: "1",

		city: "",
		country: "",
		county: "",
		formatted_address: "",
		locality: "",
		metro: "",
		region: "",
		state: "",
		zipcode: "",
		locationName : "",
		short_name : "",
		isDataFull: true
	},

	getAdditionalRadius : function (dimension) {
		var additional = 0;

		switch(this.get("level")) {
			case 'state': additional = 50; break;
			case 'metro': additional = 20; break;
			case 'region': additional = 15; break;
			case 'locality': additional = 2; break;
			case 'city':
			case 'zip': additional = 10; break;
		}

		if ( additional ) {
			switch(dimension) {
				case 'km':
				additional = additional * 1.6; break;
				case 'mi':
				additional = additional * 1609; break;
				case 'ft':
				additional = additional * 5280; break;
			}  
		}

		return additional;
	},

	/**
	* Checks if location level exists on available location levels
	*/
	isMatchedLevel : function (level) {
		level = level || this.get('level');
		
		return _.indexOf(LocationModel.MATCHED_LOCATIONS_LEVELS, level) > -1;
	},

	initialize : function () {
		if (this.get('name') == "") {
			if (this.get("locationName") !== "") {
				this.set("name", this.get("locationName"));
			} else {
				if (this.get("short_name") !== "") {
					this.set("name", this.get("short_name"));
				}
			}
		}

		this.set("id", this.get("code"));
		/*var self = this;
		if ((this.get('name') == "") && (this.get('lat') !== 0) && (this.get('long') !== 0)) {
			locationService.getLocationByPosition(this.get('lat'), this.get('long'), function (data) {
				self.set(data);
				self.trigger("location_udpated");
			});
		}*/

		if (this.get("code") == "") {
			var self = this;
			_.each(LocationModel.MATCHED_LOCATIONS_LEVELS, function (level) {
				var code = self.get(level);
				if ((code) && (code !== "")) {
					self.set({code: code, level: level});
				}
			});
		}
	},

	translateLocationLevel : function (level) {
		var code = this.get(level);

		if (code == "") {
			return;
		}

		var self = this;

		locationService.translateLocationCode(this.get(level), function (data) {
			if (data) {
				self.set(level, data);
				self.trigger("location_udpated");
			}
		});
	},

	refreshLocationContext : function (cb) {
		var self = this;
		var savedLocation = app.collections.locations.getLocationByCode(this.get("code"));

		if (savedLocation) {
			contextFetched(savedLocation);
			return;
		}		

		locationService.getLocationContext(this.get("code"), this.get("level"), function(location) {
			contextFetched(location);
		});

		function contextFetched (location) {
			self.set(location.attributes);
			self.trigger("location_updated");
			if (cb) {
				cb();
			}
		}
	},

	getParentsNames : function () {
		var items = [];
		var context = this.get("context");
		var levels = ['states', 'metros', 'regions', 'counties', 'cities', 'localities'];

		_.each(levels, function(level) {
			if(context[level]) {
				items.push(context[level][0]);
			}
		});

		/*items.push({
			code : this.get("code"),
			level : this.get("level"),
			name : this.getLocationName()
		})*/
		
		return items;
	},

	getLocationName : function () {
		if (this.get("formatted_address") !=="") {
			return this.get("formatted_address");
		}

		if (this.get("name") !=="") {
			return this.get("name");
		}

		return this.get("code");
	}
})
//'country,state,metro,region,county,city,locality'
LocationModel.MATCHED_LOCATIONS_LEVELS = ["state","metro"];