var PriceRangeFilterView = BaseView.extend({
	el : "#search.page #price-range",

	events : {
		"blur #min-price-range" : "priceChanged",
		"blur #max-price-range" : "priceChanged",
		"click .reset" : "clearPrice"
	},

	render : function () {
		this.minPrice = this.$("#min-price-range");
		this.maxPrice = this.$("#max-price-range");

		this.refreshOptions();

		this.$('#min-price-range, #max-price-range').keyup(function () { 
		    this.value = this.value.replace(/[^0-9\.]/g,'');
		});
	},

	clearPrice : function () {
		this.model.set("min_price", "");
		this.model.set("max_price", "");

		this.refreshOptions();
	},

	priceChanged : function (event) {
		var minValue = this.minPrice.val();
		var maxValue = this.maxPrice.val();

		if (this.model.validatePrice(minValue, maxValue)) {
			this.model.set("min_price", minValue);
			this.model.set("max_price", maxValue);
		}
	},

	refreshOptions : function () {
		this.minPrice.val(this.model.get("min_price"));
		this.maxPrice.val(this.model.get("max_price"));
	},

	remove : function () {
		this.undelegateEvents(this.events);
		this.clearPrice();
	}
});