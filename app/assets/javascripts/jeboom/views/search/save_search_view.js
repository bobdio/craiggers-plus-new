var SaveSearchView = BaseView.extend({
	el : "#search.page #searchcolumn #notifysave",

	events : {
		"click #save-notification" : "saveHandler",
		"click #notifysaveclose" : "hide",
		"change #notify-email" : "refreshEmailFieldActivation"
	},

	render : function () {
		this.name = this.$("#search-name");
		this.notifyCheckbox = this.$("#notify-email");
		this.email = this.$("#notify-email-address");
		this.error = this.$("#sms-error");
	},

	saveHandler : function (event) {

		event.preventDefault();

		this.error.hide();
		this.error.text("");
		var emailValue = this.email.val();

		if (this.isReceiveNotifications()) {
			if ((!app.models.userModel.validateEmail(emailValue)) || (emailValue == "")) {
				this.error.text("Invalid email address");
				this.error.show();
				return;
			}
		}

		searchService.saveSearchWithURL(this.name.val(), emailValue, this.isReceiveNotifications(), $.proxy(this.hide, this), function(data) {
			console.log("error: " + data);
		});
	},

	show : function () {
		var searchText = app.models.searchModel.get("text");
		this.name.val(searchText == "" ? "everything" : searchText);
		this.notifyCheckbox.attr("checked", false);
		this.email.val("");
		this.refreshEmailFieldActivation();
		this.$el.show();
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