describe("CategoryModel", function () {
	var category = new CategoryModel({code: "category1"});
	var categoryWithSubcats = new CategoryModel({subcats: [category], code: "category2"});

	it("created", function () {
		expect(category).toBeDefined();
	})

	it("code value is correct", function () {
		expect(category.get('code')).toBe("category1");
	});

	it("hasSubCategories returns false if model doesn't contain subcategories", function () {
		expect(category.hasSubCategories()).toBeFalsy();
	});

	it("hasSubCategories returns true if model contains subcategories", function () {
		expect(categoryWithSubcats.hasSubCategories()).toBeTruthy();
	});

	it("subcats property of category with subcategories is collection", function () {
		expect(categoryWithSubcats.get("subcats").length).toBe(1);
		expect(categoryWithSubcats.get("subcats").models.length).toBe(1);
	});

	it("getCategoryByCode returns correct category model", function () {
		var category1 = category.getCategoryByCode("category1");
		var category2 = categoryWithSubcats.getCategoryByCode("category1");
		expect(category1.cid).toBe(category.cid);
		expect(category2.cid).toBe(category.cid);
		expect(category.getCategoryByCode()).toBeFalsy();
	});
})