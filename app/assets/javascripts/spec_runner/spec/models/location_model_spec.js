describe("LocationModel", function () {
	var stateLocation = new LocationModel({level: "state", name: "stateA", code: "state_1"});
	var cityLocaiton = new LocationModel({level: "city", locationName: "cityB", code: "city_2"});
	var metroLocation = new LocationModel({level: "metro", short_name: "metroC", code: "metro_3"});

	it("MATCHED_LOCATIONS_LEVELS value is constant", function () {
		expect(LocationModel.MATCHED_LOCATIONS_LEVELS.length).toBe(2);
		expect(LocationModel.MATCHED_LOCATIONS_LEVELS).toContain("state");
		expect(LocationModel.MATCHED_LOCATIONS_LEVELS).toContain("metro");
	});

	it("isMatchedLevel() returns correct values", function () {
		expect(stateLocation.isMatchedLevel()).toBeTruthy();
		expect(cityLocaiton.isMatchedLevel()).toBeFalsy();
		expect(metroLocation.isMatchedLevel()).toBeTruthy();
	});

	it("name has correct value after initializing", function () {
		expect(stateLocation.get("name")).toBe("stateA");
		expect(cityLocaiton.get("name")).toBe("cityB");
		expect(metroLocation.get("name")).toBe("metroC");
	});

	it("id has correct value after initalizing", function () {
		expect(stateLocation.get("id")).toBe("state_1");
	});

	it("getLocationName returns correct value", function () {
		stateLocation.set("formatted_address", "stateB");
		cityLocaiton.set("name", "");
		expect(stateLocation.getLocationName()).toBe("stateB");
		expect(cityLocaiton.getLocationName()).toBe("city_2");
		expect(metroLocation.getLocationName()).toBe("metroC");
	});
})