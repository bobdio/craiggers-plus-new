describe("BaseCollection", function () {
	var collection = new BaseCollection();
	var model1 = new BaseModel({id : 1});
	var model2 = new BaseModel({id : 2});
	collection.add(model1);
	collection.add(model2);

	it("getNextModel() returns correct model", function () {
		expect(collection.getNextModel(model1).get("id")).toBe(2);
		expect(collection.getNextModel(model2)).toBeUndefined();
	});

	it("getPreviousModel() returns correct model", function () {
		expect(collection.getPreviousModel(model1)).toBeUndefined;
		expect(collection.getPreviousModel(model2).get("id")).toBe(1);
	});
});