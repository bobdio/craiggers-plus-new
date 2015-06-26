/**
* spec in spec_runner/spec/collections/categories_spec
*/

var CategoriesCollection = BaseCollection.extend({

	model: CategoryModel,

	url : function () {
		return "/categories";
	},

	getCategoryByName : function (name) {
		var category = null;
		var counter = 0;

		while ((!category) && (counter < this.models.length)) {
			category = this.models[counter].getCategoryByName(name);
			counter++;
		}

		return category;
	},

	getCategoryByCode : function (code) {
		var category = null;
		var counter = 0;

		while ((!category) && (counter < this.models.length)) {
			category = this.models[counter].getCategoryByCode(code);
			counter++;
		}

		return category;
	},

	getCategoriesList : function (categories, parent) {
		categories = categories || [];
		return this.reduce(function(categories, category) {
			categories.push({
				category: category,
				parent : parent
			});

			if (category.hasSubCategories()) {
				category.get("subcats").getCategoriesList(categories, category);
			}

			return categories;
		}, categories);
	}
});