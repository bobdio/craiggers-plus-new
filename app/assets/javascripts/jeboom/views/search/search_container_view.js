var SearchContainerView = MainSearchBarView.extend({
	el : "#search.page #searchcolumn",

	events : {
		"focus input#query_input" : "inputFieldFocusHandler",
		"blur input#query_input" : "inputFieldBlurHandler",
		"click .savesearch" : "saveSearchHandler"
	},

	render : function () {
		this.inputField = this.$("input#query_input");
		this.inputLabel = this.$(".query.wrapper .holder");
		this.saveSearchContainer = new SaveSearchView();
		this.saveSearchContainer.render();

		this.renderComponents();

		this.registerSearchForm();

		this.refreshOptions();
	},

	saveSearchHandler : function (event) {
		if (app.models.userModel.get("signedin")) {
			this.activateSaveSearch();
		} else {
			this.activateSignUpDialog();
		}
	},

	activateSaveSearch : function () {
		this.saveSearchContainer.show();
	},

	deactivateSaveSearch : function () {
		this.saveSearchContainer.hide();
	},

	closeDialogHandler : function (event) {
		this.deactivateDialogEvents();
		this.deactivateDialog();
	},

	activateDialogEvents : function () {
		$("#popup-dialog .popup-close").on("click", $.proxy(this.closeDialogHandler, this));
		$("#popup-dialog .title .link").on("click", $.proxy(this.signUpLinkHandler, this));
		$("#sign_up_form .info span.link").on("click", $.proxy(this.signInLinkHandler, this));
	},

	signUpLinkHandler : function () {
		this.activateSignUpDialog();
	},

	deactivateDialogEvents : function () {
		$("#popup-dialog .popup-close").off("click", $.proxy(this.closeDialogHandler, this));
		$("#sign_up_form .info span.link").off("click", $.proxy(this.signInLinkHandler, this));
	},

	activateSignUpDialog : function () {
		this.activateDialog(new SignUpDialogView(), true);
		this.activateDialogEvents();
	},

	activateSignInDialog : function () {
		this.activateDialog(new SignInDialogView(), true);
		this.activateDialogEvents();
	},

	signInLinkHandler : function (event) {
		this.activateSignInDialog();
	},

	refreshOptions : function () {
		this.inputField.val(this.model.get("text"));
		this.inputFieldBlurHandler();

		this.inputCategory.refreshValue();
		this.inputLocation.refreshValue();
	},

	inputFieldFocusHandler : function () {
		this.inputLabel.hide();
	},

	inputFieldBlurHandler : function () {
		if (this.inputField.val() == "") {
			this.inputLabel.show();
		} else {
			this.inputLabel.hide();
			this.model.set("text", this.inputField.val());
		}
	}
});