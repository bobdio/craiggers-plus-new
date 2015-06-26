describe("PostingsCollection", function () {
	var postings = new PostingsCollection();

	it("model equals to PostingModel", function () {
		expect(postings.model).toEqual(PostingModel);
	});
});