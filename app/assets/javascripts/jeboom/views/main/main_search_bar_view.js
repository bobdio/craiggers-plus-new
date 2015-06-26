var MainSearchBarView = BaseView.extend({
	el : "#root #searchbar",

	events : {
		"click .advanced a" : "advancedLinkHandler"
	},

	render : function () {
		this.isAdvancedMenuActive = false;

		this.inputField = this.$("input#searchbar_query_input");

		this.renderComponents();

		this.refreshAdvancedMenuState();

		this.registerSearchForm();
	},

	renderComponents : function () {
		this.inputCategory = new InputCategoryView({el : this.$(".category.wrapper"), model : this.model});
		this.inputCategory.render();

		this.inputLocation = new InputLocationView({el : this.$(".location.wrapper"), model : this.model});
		this.inputLocation.render();
	},

	registerSearchForm : function () {
		var self = this;

		this.$('form').submit(function () {
			var locationInput = $(this).find("#location_input");

			if ((locationInput.val() == "all") || (locationInput.val() == "all locations")) {
				self.model.clearLocation();
			}

			self.model.set('text', self.inputField.val());

			router.gotoSearch();

			return false;
		});
	},

	advancedLinkHandler : function (event) {
		this.isAdvancedMenuActive = !this.isAdvancedMenuActive;
		this.refreshAdvancedMenuState();
	},

	refreshAdvancedMenuState : function () {
		if (this.isAdvancedMenuActive) {
			this.inputCategory.show();
			this.inputLocation.show();
			this.$(".advanced a").html("hide");
		} else {
			this.inputCategory.hide();
			this.inputLocation.hide();
			this.$(".advanced a").html("advanced search");
		}
	},

	remove : function () {
		this.undelegateEvents(this.events);

		this.inputCategory.remove();
		this.inputLocation.remove();
	}
});