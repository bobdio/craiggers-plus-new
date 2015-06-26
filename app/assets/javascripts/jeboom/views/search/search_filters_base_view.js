var SearchFiltersBaseView = BaseView.extend({
	render : function () {
		this.headerText = this.$(".header .text");
		this.bodyContainer = this.$(".body");

		this.refreshOptions();
	},

	refreshOptions : function () {
		
	},

	toggleSettingsActivation : function (event) {
		if (this.isSettingsActive()) {
			this.deactivateSettings();
		} else {
			this.activateSettings();
		}
	},

	isSettingsActive : function () {
		return this.headerText.hasClass('selected');
	},

	activateSettings : function () {
		this.headerText.addClass('selected');
		this.bodyContainer.show();
	},

	deactivateSettings : function () {
		this.headerText.removeClass('selected');
		this.bodyContainer.hide();
	},

	remove : function () {
		this.undelegateEvents(this.events);
	}
});