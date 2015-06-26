describe("BaseModel", function () {
	var baseModel = new BaseModel();

	it("created", function () {
		expect(baseModel).toBeDefined();
	});

	it("contains attributes", function () {
		expect(baseModel.attributes).toBeDefined();
	});

	it("contains cid", function () {
		expect(baseModel.cid).toBeDefined();
	});

	it("able to create new property", function () {
		baseModel.set("new_property", true);
		expect(baseModel.get("new_property")).toBe(true);
	});

	it("able to change property", function () {
		baseModel.set("new_property", false);
		expect(baseModel.get("new_property")).toBe(false);
	});
});