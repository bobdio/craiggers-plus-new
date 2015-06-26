var SavedSearchUpdateDialogView = DialogView.extend({
	template : JST["saved_search_update_dialog"],

	events : {
		'click .popup-close': 'remove',
		'click .cancel': 'remove',
		'click .update': 'update',
		'click .destroy': 'destroy',
		'change .notifications input' : 'refreshEmailFieldActivation'
	},

	update : function (event) {
		this.error.html("");		

		if (this.isReceiveNotifications()) {
			if (!app.models.userModel.validateEmail(this.email.val())) {
				this.error.html("Invalid email address");
				return;
			}
		}

		this.model.set("name", this.name.val());
		this.model.set("notification_email", this.email.val());
		this.model.set("notifications", this.isReceiveNotifications());

		searchService.updateSavedSearch(this.model);

		this.remove();
	},

	destroy : function (event) {
		this.remove();
		this.confirmDialog = new ConfirmDialogView();
		this.confirmDialog.render({
			message: "Are you sure you want to delete this saved search?",
			callback: $.proxy(this.destroyHandler, this),
			okLabel: 'delete'
		});

	},

	destroyHandler : function () {
		searchService.deleteSavedSearch(this.model);
	},

	init : function () {
		this.name = this.$(".name input");
		this.email = this.$('.email input');
		this.notifyCheckbox = this.$('.notifications input');
		this.error = this.$(".error");

		this.name.val(this.model.get("name"));

		if (this.model.get("notification_email")) {
			this.email.val(this.model.get("notification_email"));
		}

		if (this.model.get("notifications")) {
			this.notifyCheckbox.attr("checked", true);
		}

		this.refreshEmailFieldActivation();
	},

	isReceiveNotifications : function () {
		return this.notifyCheckbox.attr("checked") == "checked";
	},

	refreshEmailFieldActivation : function () {
		if (this.isReceiveNotifications()) {
			this.email.removeAttr("disabled");
		} else {
			this.email.attr("disabled", true);
		}
	}
});