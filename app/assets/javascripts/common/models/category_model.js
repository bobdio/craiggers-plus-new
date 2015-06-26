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

	getParent : function () {
		return app.collections.categories.get(this.get("cat_id"));
	},

	getAnnotations : function () {
		var parent = this.getParent();
		var category = this.get("code");
		var parentCode = category;
		if (parent) {
			parentCode = parent.get("code");	
		}

		var type = ['bedrooms', 'cats', 'dogs'
					, 'sqft'
					, 'make', 'model', 'vin', 'start_year', 'end_year', 'seller', 'mileage', 'price', 'bodyStyle', 'exteriorColor', 'interiorColor', 'wheelbase', 'drivetrain', 'transmission', 'engine', 'fuel'
					, 'age', 'personal_flavor'
					, 'compensation', 'partTime', 'telecommute', 'contract', 'internship', 'nonprofit'];

        switch(parentCode) {
			case 'RRRR':
				if($.inArray(category, ['RCRE', 'RLOT', 'RPNS']) == -1)
					return (type.slice(0, 4))
				else if (category !== 'RLOT')
					return(type.slice(3, 4));
			break;

			case 'VVVV': return(type.slice(4, 21)); break;
			case 'PPPP': return(type.slice(21, 23)); break;
			case 'JJJJ': return(type.slice(23, 29)); break;
			case 'all': return([]); break;
			default:
				break;
		}
	},

	hasPrice : function () {
		return _.indexOf(this.CATEGORIES_WITH_PRICE, this.get("code")) > -1;
	},

	getOptions : function () {

	},

	getCategoryByName : function (name) {
		if (this.get("name") == name) {
			return this;
		}

		if (this.hasSubCategories()) {
			return this.get("subcats").getCategoryByName(name);
		}

		return false;
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