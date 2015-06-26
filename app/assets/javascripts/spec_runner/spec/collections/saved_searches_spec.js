describe("SavedSearchesCollection", function () {
	it("model is equals to SearchModel", function () {
		var savedSearches = new SavedSearchesCollection();
		expect(savedSearches.model).toEqual(SearchModel);
	});

	it("setIsSynced() and getIsSynced() are working as expected", function () {
		var savedSearches = new SavedSearchesCollection();

		expect(savedSearches.getIsSynced()).toBeFalsy();

		savedSearches.setIsSynced(true);
		expect(savedSearches.getIsSynced()).toBeTruthy();
		
		savedSearches.setIsSynced(false);
		expect(savedSearches.getIsSynced()).toBeFalsy();
	});

	it("setupSavedSearchesData() adds new search models", function () {
		var savedSearches = new SavedSearchesCollection();
		var savedSearchData1 = {key : "1", id : 1, name : "saved_search_1"};
		var savedSearchData2 = {key : "2", id : 2, name : "saved_search_2"};

		savedSearches.setupSavedSearchesData([savedSearchData1, savedSearchData2]);

		expect(savedSearches.models.length).toBe(2);
		expect(savedSearches.get(1).get("name")).toBe("saved_search_1");
		expect(savedSearches.get(2).get("name")).toBe("saved_search_2");

		savedSearches.setupSavedSearchesData([savedSearchData1]);

		expect(savedSearches.models.length).toBe(2);
	});
});