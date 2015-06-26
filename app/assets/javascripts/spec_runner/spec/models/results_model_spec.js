describe("ResultsModel", function () {
    window.app = window.app || {};
    window.app.collections = window.app.collections || {};
    window.app.collections.postings = new BaseCollection();

	var posting1 = new PostingModel({id : 1});
	var posting2 = new PostingModel({id : 2});
	var sourceSearchCount = new SearchCountModel({count_target : "source"});
	var categorySearchCount = new SearchCountModel({count_target : "category"});
	var statusSearchCount = new SearchCountModel({count_target : "status"});

	var emptyResults1 = new ResultsModel({
		next_page : 0,
		next_tier : 0
	});

	var resultsModelWithLoadedCounts = new ResultsModel({
		next_page : 2,
		next_tier : 0,
		search_counts : [sourceSearchCount, categorySearchCount, statusSearchCount]
	});

	var resultsWithPostings1 = new ResultsModel({
		postings: [posting1],
		next_page : 1,
		next_tier : 1
	});

	var resultsWithPostings2 = new ResultsModel({
		postings: [posting2],
		next_page : 0,
		next_tier : 2
	});

	it("postings value is correct after initializing", function () {
		expect(resultsWithPostings1.get("postings").models.length).toBe(1);
		expect(emptyResults1.get("postings").models.length).toBe(0);
	});

	it("global postings collection contains postings of all results", function () {
		expect(window.app.collections.postings.models.length).toBe(2);
	});

	it("getPreviousPageNumber() returns correct value", function () {
		expect(resultsWithPostings1.getPreviousPageNumber()).toBe(-1);
	});

	it("isNextPageAvailable() returns correct value", function () {
		expect(emptyResults1.isNextPageAvailable()).toBeFalsy();
		expect(resultsWithPostings1.isNextPageAvailable()).toBeTruthy();
		expect(resultsWithPostings2.isNextPageAvailable()).toBeFalsy();
	});

	it("isPreviousPageAvailable() returns correct value", function () {
		expect(emptyResults1.isPreviousPageAvailable()).toBeFalsy();
		expect(resultsWithPostings1.isPreviousPageAvailable()).toBeFalsy();
		expect(resultsWithPostings2.isPreviousPageAvailable()).toBeFalsy();
		expect(resultsModelWithLoadedCounts.isPreviousPageAvailable()).toBeTruthy();
	});

	it("isNextTierAvailable() returns correct value", function () {
		expect(emptyResults1.isNextTierAvailable()).toBeFalsy();
		expect(resultsWithPostings1.isNextTierAvailable()).toBeTruthy();
		expect(resultsWithPostings2.isNextTierAvailable()).toBeFalsy();
	});

	it("isNextSearchAvailable() returns correct value", function () {
		expect(emptyResults1.isNextSearchAvailable()).toBeFalsy();
		expect(resultsWithPostings1.isNextSearchAvailable()).toBeTruthy();
		expect(resultsWithPostings2.isNextSearchAvailable()).toBeFalsy();
		expect(resultsModelWithLoadedCounts.isNextSearchAvailable()).toBeTruthy();
	});

	it("search_count_targets array contains category, status and source", function () {
		expect(emptyResults1.get("search_count_targets").length).toBe(3);
		expect(emptyResults1.get("search_count_targets")).toContain("category");
		expect(emptyResults1.get("search_count_targets")).toContain("status");
		expect(emptyResults1.get("search_count_targets")).toContain("source");
	});

	it("addSearchCount() adds searchCounts into search_counts array", function () {
		expect(resultsWithPostings1.get("search_counts").length).toBe(0);
		resultsWithPostings1.addSearchCount(sourceSearchCount);
		expect(resultsWithPostings1.get("search_counts").length).toBe(1);
		resultsWithPostings1.addSearchCount(categorySearchCount);
		expect(resultsWithPostings1.get("search_counts").length).toBe(2);
	});

	it("clearSearchCounts() clears search_counts array", function () {
		resultsWithPostings1.clearSearchCounts();
		expect(resultsWithPostings1.get("search_counts").length).toBe(0);
		resultsWithPostings1.addSearchCount(sourceSearchCount);
		resultsWithPostings1.addSearchCount(categorySearchCount);
		resultsWithPostings1.clearSearchCounts();
		expect(resultsWithPostings1.get("search_counts").length).toBe(0);
	});

	it("isCountsDataLoaded() returns true only when all types of search counts from search_count_targets are added into search_counts array", function() {
		resultsWithPostings1.clearSearchCounts();
		resultsWithPostings1.addSearchCount(sourceSearchCount);
		expect(resultsWithPostings1.isCountsDataLoaded()).toBeFalsy();
		resultsWithPostings1.addSearchCount(categorySearchCount);
		expect(resultsWithPostings1.isCountsDataLoaded()).toBeFalsy();
		resultsWithPostings1.addSearchCount(statusSearchCount);
		expect(resultsWithPostings1.isCountsDataLoaded()).toBeTruthy();
		expect(resultsModelWithLoadedCounts.isCountsDataLoaded()).toBeTruthy();
	});
});