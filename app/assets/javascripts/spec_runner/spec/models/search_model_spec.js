describe("SearchModel", function () {
	
	it("setupNextSearchDirection() sets correct values of page and tier", function () {

		var searchModel = new SearchModel();

		var resultsModelWithNextPage = new ResultsModel({
			next_page : 1,
			next_tier : 0
		});

		var resultsModelWithNextTier = new ResultsModel({
			next_page : 0,
			next_tier : 1
		});

		searchModel.setupNextSearchDirection(resultsModelWithNextPage);
		expect(searchModel.get("page")).toBe(1);
		expect(searchModel.get("tier")).toBe(0);
		searchModel.setupNextSearchDirection(resultsModelWithNextTier);
		expect(searchModel.get("tier")).toBe(1);
		expect(searchModel.get("page")).toBe(0);
	});

	it("DEFAULT_CATEGORY_GROUP is a constant", function () {
		var searchModel = new SearchModel();

		expect(searchModel.DEFAULT_CATEGORY_GROUP).toBe("~MMMM|~PPPP");
	});

	it("getCategoryCode() returns correct value", function () {
		var searchModelWithCategory = new SearchModel({category : "a"});
		var searchModelWithCategoryGroup = new SearchModel({category_group : "b"});
		var searchModelWithDefaultCategoryGroup = new SearchModel({category_group : "~MMMM|~PPPP"});

		expect(searchModelWithCategory.getCategoryCode()).toBe("a");
		expect(searchModelWithCategoryGroup.getCategoryCode()).toBe("b");
		expect(searchModelWithDefaultCategoryGroup.getCategoryCode()).toBeNull();
	});

	it("buildAnnotations() returns correct string", function () {
		var getAnnotations = function (searchModel) {
			return searchModel.buildAnnotations(searchModel.get("annotations"));
		}
		var searchModelWithAnnotations = new SearchModel({annotations : {a: 1, b: "c"}});
		expect(getAnnotations(searchModelWithAnnotations)).toBe("{a:1 AND b:c}");
		var searchModelWithStartYear = new SearchModel({annotations : {start_year: "2001"}});
		expect(getAnnotations(searchModelWithStartYear)).toBe("{year:2001}");
		var searchModelWithEndYear = new SearchModel({annotations : {end_year : "2010"}});
		expect(getAnnotations(searchModelWithEndYear)).toBe("{year:2010}");
		var searchModelWithWithStartAndEndYear1 = new SearchModel({annotations : {start_year : 2010, end_year : 2013}});
		expect(getAnnotations(searchModelWithWithStartAndEndYear1)).toBe("{(year:2010 OR year:2011 OR year:2012 OR year:2013)}");
		var searchModelWithWithStartAndEndYear2 = new SearchModel({annotations : {start_year : 2013, end_year : 2000}});
		expect(getAnnotations(searchModelWithWithStartAndEndYear2)).toBe("{year:2013}");
	});

	describe("filters functionality", function () {
		var searchModelWithFilters = new SearchModel({
			id : 1,
			has_image : true,
			selected_categories : ["a", "b", "c"],
			unselected_categories : ["d"]
		});

		var searchModelWithoutFilters = new SearchModel({
			has_image : false
		});

		it("getFilters() returns correct map of added filters", function () {
			expect(searchModelWithFilters.getFilters().has_image).toEqual({value: true, name: "has image"});
			expect(searchModelWithFilters.getFilters().has_price).toEqual({value: false, name: "has price"});
			expect(searchModelWithFilters.getFilters().title_only).toEqual({value: false, name: "title only"});
			expect(searchModelWithFilters.getFilters().selected_categories).toEqual([
				{value: true, name: "a"},
				{value: true, name: "b"},
				{value: true, name: "c"}
			]);
			expect(searchModelWithFilters.getFilters().selected_source).toBeUndefined();
			expect(searchModelWithFilters.getFilters().selected_status).toBeUndefined();
		});

		it("isFiltered() returns true only when filters are added into model", function () {
			expect(searchModelWithFilters.isFiltered()).toBeTruthy();
			expect(searchModelWithoutFilters.isFiltered()).toBeFalsy();
		});

		it("getArrayFilterItems() returns array of filters items", function () {
			expect(searchModelWithFilters.getArrayFilterItems(["a", "b", "c"], ["d"])).toEqual([
				{value: true, name: "a"},
				{value: true, name: "b"},
				{value: true, name: "c"}
			]);
			expect(searchModelWithFilters.getArrayFilterItems([], [])).toBeUndefined();
		});

		it("removeFilter() removes filter data and set default value of filter", function () {
			spyOn(searchModelWithoutFilters, "trigger");
			searchModelWithoutFilters.set("has_price", true);
			searchModelWithoutFilters.removeFilter("has_price");
			expect(searchModelWithoutFilters.trigger).toHaveBeenCalled();
			expect(searchModelWithoutFilters.get("has_price")).toBeFalsy();

			searchModelWithoutFilters.set("selected_categories", ["a", "b", "c"]);
			searchModelWithoutFilters.removeFilter("a", "selected_categories");
			expect(searchModelWithoutFilters.get("selected_categories")).toEqual(["b", "c"]);
		});

		it("resetFilters() sets default values to all filter properties", function () {
			searchModelWithoutFilters.set("has_price", true);
			searchModelWithoutFilters.set("selected_categories", ["a", "b", "c"]);
			searchModelWithoutFilters.resetFilters();

			expect(searchModelWithoutFilters.get("has_price")).toBeFalsy();
			expect(searchModelWithoutFilters.get("selected_categories")).toEqual([]);
			expect(searchModelWithoutFilters.get("has_image")).toBeTruthy([]);
		});

		it("refreshUnselectedCategories() refreshes unselected_categories array by new items", function () {
			searchModelWithoutFilters.set({
				selected_categories: ["a", "b", "c"],
				unselected_categories: ["d"]
			});
			searchModelWithoutFilters.refreshUnselectedCategories(["a", "e"], ["b", "c", "d"]);
			expect(searchModelWithoutFilters.get("unselected_categories")).toEqual(["a", "e"]);
		});

		it("refreshUnselectedStatus() refreshes unselected_status array by new items", function () {
			searchModelWithoutFilters.set({
				selected_status: ["a", "b", "c"],
				unselected_status: ["d"]
			});
			searchModelWithoutFilters.refreshUnselectedStatus(["a", "e"], ["b", "c", "d"]);
			expect(searchModelWithoutFilters.get("unselected_status")).toEqual(["a", "e"]);
		});

		it("refreshUnselectedSource() refreshes unselected_source array by new items", function () {
			searchModelWithoutFilters.set({
				selected_source: ["a", "b", "c"],
				unselected_source: ["d"]
			});
			searchModelWithoutFilters.refreshUnselectedSource(["a", "e"], ["b", "c", "d"]);
			expect(searchModelWithoutFilters.get("unselected_source")).toEqual(["a", "e"]);
		});

		it("refreshOptionsBySearchModel() refreshes attributes of the model by another searchModel except id and cid", function () {
			var searchModel = new SearchModel({id : 2});
			searchModel.refreshOptionsBySearchModel(searchModelWithFilters);
			expect(searchModel.get("has_price")).toEqual(searchModelWithFilters.get("has_price"));
			expect(searchModel.get("selected_categories")).toEqual(searchModelWithFilters.get("selected_categories"));
			expect(searchModel.get("unselected_categories")).toEqual(searchModelWithFilters.get("unselected_categories"));
			expect(searchModel.cid).not.toEqual(searchModelWithFilters.cid);
			expect(searchModel.get("id")).not.toEqual(searchModelWithFilters.get("id"));
		});

		it("clearPrice() clears values of max_price and min_price attributes", function () {
			var searchModel = new SearchModel({
				max_price : 10,
				min_price : 1
			});
			searchModel.clearPrice();

			expect(searchModel.get("max_price")).toBe("");
			expect(searchModel.get("min_price")).toBe("");
		});

		it("validatePrice() returns true if max_price and min_price values are valide", function () {
			var searchModel = new SearchModel({
				max_price : 10,
				min_price : 1
			});

			expect(searchModel.validatePrice()).toBeTruthy();
			searchModel.set({max_price: "", min_price : ""});
			expect(searchModel.validatePrice()).toBeFalsy();
			searchModel.set({max_price: "", min_price : 1});
			expect(searchModel.validatePrice()).toBeTruthy();
			searchModel.set({max_price: 1, min_price : ""})
			expect(searchModel.validatePrice()).toBeTruthy();
			expect(searchModel.validatePrice(10, 1)).toBeFalsy();
		});
	});

	describe("setupData method implementation", function () {
		var searchModel1 = new SearchModel({
			key : "1",
			json : {
				name : "searchModel1",
				params : {
					safe : "yes",
					anchor : "anchor1",
					page : "1",
					rpp : 10,
					tier : 1,
					has_image : 1,
					has_price : 1,
					category : "a|b|c",
					status : "1|2|3",
					source : "craig|hmng|ebay",
					unselected_categories : "d|f",
					unselected_source : "abc",
					unselected_status : "4",
					price : "10..20",
					heading : true,
					heading : "heading",
					state : "state1",
					locality : "locality1"
				}
			}
		});
		var searchModel2 = new SearchModel({
			key : "2",
			json : {
				name : "searchModel2",
				params : {
					safe : "no",
					anchor : "anchor2",
					page : "2",
					rpp : 20,
					tier : 2,
					has_image : 0,
					has_price : 0,
					price : "1",
					text : "text",
					metro : "metro1"
				}
			}
		});

		it("id valus is correct", function () {
			expect(searchModel1.id).toBe("1");
			expect(searchModel2.id).toBe("2");
		});

		it("safe_search value is correct", function () {
			expect(searchModel1.get("safe_search")).toBeTruthy();
			expect(searchModel2.get("safe_search")).toBeFalsy();
		});

		it("name value is correct", function () {
			expect(searchModel1.get("name")).toBe("searchModel1");
			expect(searchModel2.get("name")).toBe("searchModel2");
		});

		it("anchor value is correct", function () {
			expect(searchModel1.get("anchor")).toBe("anchor1");
			expect(searchModel2.get("anchor")).toBe("anchor2");
		});

		it("page value is correct", function () {
			expect(searchModel1.get("page")).toBe("1");
			expect(searchModel2.get("page")).toBe("2");
		});	

		it("rpp value is correct", function () {
			expect(searchModel1.get("rpp")).toBe(10);
			expect(searchModel2.get("rpp")).toBe(20);
		});

		it("tier value is correct", function () {
			expect(searchModel1.get("tier")).toBe(1);
			expect(searchModel2.get("tier")).toBe(2);
		});	

		it("has_image value is correct", function () {
			expect(searchModel1.get("has_image")).toBeTruthy();
			expect(searchModel2.get("has_image")).toBeFalsy();
		});

		it("has_price value is correct", function () {
			expect(searchModel1.get("has_price")).toBeTruthy();
			expect(searchModel2.get("has_price")).toBeFalsy();
		});

		it("selected_categories value is correct", function () {
			expect(searchModel1.get("selected_categories")).toEqual(["a", "b", "c"]);
			expect(searchModel2.get("selected_categories")).toEqual([]);
		});

		it("selected_status value is correct", function () {
			expect(searchModel1.get("selected_status")).toEqual(["1", "2", "3"]);
			expect(searchModel2.get("selected_status")).toEqual([]);
		});

		it("selected_source value is correct", function () {
			expect(searchModel1.get("selected_source")).toEqual(["craig","hmng","ebay"]);
			expect(searchModel2.get("selected_source")).toEqual([]);
		});

		it("unselected_categories value is correct", function () {
			expect(searchModel1.get("unselected_categories")).toBe("all");
			expect(searchModel2.get("unselected_categories")).toBe("all");
		});	

		it("unselected_source value is correct", function () {
			expect(searchModel1.get("unselected_source")).toBe("all");
			expect(searchModel2.get("unselected_source")).toBe("all");
		});

		it("unselected_status value is correct", function () {
			expect(searchModel1.get("unselected_status")).toBe("all");
			expect(searchModel2.get("unselected_status")).toBe("all");
		});

		it("min_price and max_price values are correct", function () {
			expect(searchModel1.get("min_price")).toBe("10");
			expect(searchModel1.get("max_price")).toBe("20");
			expect(searchModel2.get("min_price")).toBe("1");
			expect(searchModel2.get("max_price")).toBe("");
		});

		it("title_only and text values are correct", function () {
			expect(searchModel1.get("title_only")).toBeTruthy();
			expect(searchModel1.get("text")).toBe("heading");
			expect(searchModel2.get("title_only")).toBeFalsy();
			expect(searchModel2.get("text")).toBe("text");
		});

		it("location value is correct", function () {
			var location1 = searchModel1.get("location");
			var location2 = searchModel2.get("location");

			expect(location1.get("level")).toBe("locality");
			expect(location1.get("code")).toBe("locality1");
			expect(location1.get("isDataFull")).toBeFalsy();
			expect(location1.get("name")).toBe("locality1");

			expect(location2.get("level")).toBe("metro");
			expect(location2.get("code")).toBe("metro1");
			expect(location2.get("isDataFull")).toBeFalsy();
			expect(location2.get("name")).toBe("metro1");
		});

		it("setup of location data is working correct", function () {
			var searchModelWithLocationData = new SearchModel({location : {level: "state", name: "stateA", code: "state_1"}});
			var searchModelWithLocationModel = new SearchModel({location : new LocationModel({level: "state", name: "stateB", code: "state_2"})});
			expect(searchModelWithLocationData.get("location").get("code")).toBe("state_1");
			expect(searchModelWithLocationModel.get("location").get("code")).toBe("state_2");
		});
	});
});