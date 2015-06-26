var BaseView = Backbone.View.extend({
	el : "#content",

	KEY: {
		UP: 38,
		DOWN: 40,
		J: 74,
		K: 75,
		F: 70,
		ESC: 27,
		S: 83,
		'/': 191,
		ENTER: 13,
		LEFT: 37,
		RIGHT: 39,
		Z: 90,
		H: 72,
		L: 76,
		TAB: 9
	},

	render : function () {
		if (this.template) {
			this.$el.append(this.template());
		}
	},

	activateDialog : function (dialog, showInfo) {
		if (this.dialog) {
			this.deactivateDialog(this.dialog);
		}

		this.dialog = dialog;
		this.dialog.render(showInfo);
	},

	deactivateDialog : function (event, dialog) {
		dialog = dialog || this.dialog;
		if (!dialog) {
			return;
		}
		dialog.remove();
		dialog = null;
	},

	remove : function () {
		this.undelegateEvents(this.events);
	},

	show : function () {
		this.$el.show();
	},

	hide : function () {
		this.$el.hide();
	},
})