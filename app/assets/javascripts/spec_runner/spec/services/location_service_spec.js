describe("LocationService", function () {
	var manageAjaxParams = {};
	var manageAjax = {
		add : function (name, data) {
			manageAjaxParams.name = name;
			manageAjaxParams.data = data;
		}
	}
	var ajaxParams = {};
	var ajax = function (params) {
		ajaxParams = params;
	}

	it("created", function () {
		expect(locationService).toBeDefined();
	});

	it("searchLocation() creates correct request params", function () {
		var cb = function () {};

		locationService.searchLocation("123", cb, manageAjax);

		expect(manageAjaxParams.data.url).toBe("/location/search");
		expect(manageAjaxParams.name).toBe("geolocate");
		expect(manageAjaxParams.data.data).toEqual({
			levels: "zipcode,metro",
			text: "123",
			type: "istartswith"
		});

		locationService.searchLocation("aaa", cb, manageAjax);

		expect(manageAjaxParams.data.url).toBe("/location/search");
		expect(manageAjaxParams.name).toBe("geolocate");
		expect(manageAjaxParams.data.data).toEqual({
			levels: LocationModel.MATCHED_LOCATIONS_LEVELS.join(),
			text: "aaa",
			type: "istartswith"
		});
	});

	it("searchLocation() calls success callback with correct params", function () {
		var cbData;
		var cb = function (data) {
			cbData = data;
		}

		var locationsData = [{level: "state", name: "state_1", code: 1}, {level: "city", name: "city_1", code: 2}];

		locationService.searchLocation("123", cb, manageAjax);
		manageAjaxParams.data.success({
			locations : locationsData
		});
		expect(cbData.get("locations").models.length).toBe(locationsData.length);
	});

	it("findLocation() creates correct request params", function () {
		var cb = function () {};
		expect(locationService.findLocation()).toBeUndefined();

		locationService.findLocation({state: "state_1", locality : "locality_1"}, cb, 0, ajax);

		expect(ajaxParams.url).toBe(LOCATION_API + "locality_1");
		expect(ajaxParams.dataType).toBe("json");

		locationService.findLocation({country: "country_1"}, cb, 0, ajax);
		expect(ajaxParams.url).toBe(LOCATION_API + "country_1");
	});

	it("findLocation() handles response correctly", function () {
		var cbData;
		var cb = function (data) {
			cbData = data;
		}

		locationService.findLocation({state: "state_1", locality : "locality_1"}, cb, 0, ajax);
		ajaxParams.success({success: true, name: "state_1", id : 1});

		expect(cbData.get("name")).toBe("state_1");

		ajaxParams.success({success: false, name: "state_1", id : 1});
	});
});