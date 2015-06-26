describe("CategoriesCollection", function () {

	var categories = new CategoriesCollection();

	it("model equals to CategoryModel", function () {
		expect(categories.model).toEqual(CategoryModel);
	});

	it("url is correct", function () {
		expect(categories.url()).toBe("/categories");
	});	

	it("getCategoryByCode() returns correct category", function () {
		expect(categories.getCategoryByCode("a")).toBeNull();
		var categoryA = new CategoryModel({code : "a", id : 1});
		categories.add(categoryA);
		expect(categories.getCategoryByCode("a")).toEqual(categoryA);
		var categoryB = new CategoryModel({code : 'b', id : 2});
		var categoryC = new CategoryModel({code : "c", id : 3, subcats : [categoryB]});
		categories.add(categoryC);
		expect(categories.getCategoryByCode("b")).toEqual(categoryB);
	});
});