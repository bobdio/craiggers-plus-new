describe("SearchCountModel", function () {
	var searchCountModel = new SearchCountModel({
		counts : [{term : "a"}, {term : "b"}]
	});

	it("count_target default value is empty string", function () {
		expect(searchCountModel.get("count_target")).toBe("");
	});

	it("getMatchedTerms() returns array of terms", function () {
		var matchedTerms = searchCountModel.getMatchedTerms();
		expect(matchedTerms.length).toBe(2);
		expect(matchedTerms).toContain("a");
		expect(matchedTerms).toContain("b");
	});
});