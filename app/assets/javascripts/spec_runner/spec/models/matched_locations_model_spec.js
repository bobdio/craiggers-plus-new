describe("MatchedLocationsModel", function () {
	var stateLocation = new LocationModel({level: "state", name: "stateA", code: "state_1"});
	var cityLocaiton = new LocationModel({level: "city", locationName: "cityB", code: "city_2"});
	var matchedLocationsEmpty = new MatchedLocationsModel();
	var matchedLocations = new MatchedLocationsModel({locations: [stateLocation, cityLocaiton]});

	it("locations has null value for empty locations array", function () {
		expect(matchedLocationsEmpty.get("locations")).toBeNull();
	});

	it("locations value is a collection of locations for locations array", function () {
		expect(matchedLocations.get("locations").length).toBe(2);
		expect(matchedLocations.get("locations").models.length).toBe(2);
	});
});