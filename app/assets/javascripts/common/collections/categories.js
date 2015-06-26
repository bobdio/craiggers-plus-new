/**
* spec in spec_runner/spec/collections/categories_spec
*/

var CategoriesCollection = BaseCollection.extend({

	model: CategoryModel,

	url : function () {
		return "/categories";
	},

	getCategoryByCode : function (code) {
		var category = null;
		var counter = 0;

		while ((!category) && (counter < this.models.length)) {
			category = this.models[counter].getCategoryByCode(code);
			counter++;
		}

		return category;
	}
});