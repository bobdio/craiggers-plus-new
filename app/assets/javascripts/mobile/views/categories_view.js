var CategoriesView = BaseView.extend({

	template : Handlebars.templates['categories.tmpl'],

	categoryTemplate : Handlebars.templates['category.tmpl'],

	initialize : function () {
		this.refreshNavigationBar(this.type);
	},

	type : "search",

	render : function (categories) {
		this.categories = categories;

		this.$el.append(this.template());
		var categoriesHolder = this.$el.find("#categories");
		this.categories.each(function(category) {
			categoriesHolder.append(this.categoryTemplate({name: category.getName()}));
		}, this);

		this.activateScroll("page_container");
	}
});