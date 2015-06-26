/**
* spec_runner/spec/collections/locations_spec
*/
var LocationsCollection = BaseCollection.extend({
	model: LocationModel,

	getLocationByCode : function (code) {
		return this.find(function(location) {
			return location.get("code") == code;
		});
	},

	getLocationShortNameByCode : function (code) {
		var location = this.getLocationByCode(code);

		if (location) {
			return location.get('short_name');
		}

		return code;
	},
})