/**
* spec in spec_runner/spec/models/matched_locations_model_spec
*/

var MatchedLocationsModel = BaseModel.extend({
	defaults: {
		numMatches : 0,
		locations : null
	},

	initialize : function () {
		this.setupData();
	},

	setupData : function () {
		var locations = this.get("locations");

		if ((locations) && (locations.length > 0)) {
			this.set("locations", new LocationsCollection(locations));
		} else {
			this.set("locations", null);
		}
	}
});