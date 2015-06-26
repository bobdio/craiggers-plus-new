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