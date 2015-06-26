/**
* spec in spec_runner/spec/models/category_model_spec
*/

var CategoryModel = BaseModel.extend({

	defaults : {
		category : null,
		code : "",
		created_at : "",
		group : null,
		hidden : false,
		id : 0,
		name : "",
		originate : 1,
		updated_at : "",
		subcats : null,
		cat_id : 0
	},

	CATEGORIES_WITH_PRICE : ['VVVV', 'SSSS', 'RRRR'],

	initialize : function () {
		this._setupData();
	},

	hasPrice : function () {
		return _.indexOf(this.CATEGORIES_WITH_PRICE, this.get("code")) > -1;
	},

	getOptions : function () {

	},

	getCategoryByCode : function (code) {
		if (this.get("code") == code) {
			return this;
		}

		if (this.hasSubCategories()) {
			return this.get("subcats").getCategoryByCode(code);
		}

		return false;
	},

	hasSubCategories : function () {
		return !_.isNull(this.get("subcats"));
	},

	_setupData : function () {
		if (this.hasSubCategories()) {
			this.set({subcats: new CategoriesCollection(this.get("subcats"))});
		}
	}
})