describe("LocationsCollection", function () {
	var locations = new LocationsCollection();
	var stateLocation = new LocationModel({code : "state", short_name : "state1"});
	var metroLocation = new LocationModel({code : "metro", short_name : "metro1"});
	locations.add([stateLocation, metroLocation]);

	it("model equals to LocationModel", function () {
		expect(locations.model).toEqual(LocationModel);
	});

	it("getLocationByCode() returns correct location", function () {
		expect(locations.getLocationByCode("state")).toEqual(stateLocation);
		expect(locations.getLocationByCode("metro")).toEqual(metroLocation);
		expect(locations.getLocationByCode("city")).toBeUndefined();
	});

	it("getLocationShortNameByCode() returns correct location short name", function () {
		expect(locations.getLocationShortNameByCode("state")).toBe("state1");
		expect(locations.getLocationShortNameByCode("metro")).toBe("metro1");
		expect(locations.getLocationShortNameByCode("city")).toBe("city");
	});
});