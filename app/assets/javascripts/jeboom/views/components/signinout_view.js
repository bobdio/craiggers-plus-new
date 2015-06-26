var SigninOutView = BaseView.extend({

	events : {
		"click #navbar #sign_in_link" : "signInHandler",
		"click #navbar #sign_up_link" : "signUpHandler",
		"click #popup-dialog .popup-close" : "deactivateDialog",
		"click #navbar .create_new_posting" : "createNewPosting",
		"click #navbar #manage_postings_link" : "managePostings"
	},

	template : JST["signinout"],

	render : function (container) {
		this.container = container;
		this.container.append(this.template());

		if (app.models.userModel.get("signedin")) {
			this.signedIn();
		} else {
			userService.signedIn();

			app.models.userModel.once("change:signedin", $.proxy(this.signedIn, this));
		}

		this.newPostingDialog = app.views.newPostingView;
		
	},

	createNewPosting : function () {
		this.newPostingDialog.render();
	},

	managePostings : function () {
		router.gotoManagePostings();
	},

	signedIn : function () {
		console.log("signedin");

		this.container.find(".signin").hide();
		this.container.find(".signedin").show();
		this.container.find(".user .name").html(app.models.userModel.get("username"));
		this.container.find(".photo img").attr({src: app.models.userModel.get("image")});
	},

	signUpHandler : function (event) {
		this.activateDialog(new SignUpDialogView());
	},

	signInHandler : function (event) {
		this.activateDialog(new SignInDialogView());
	},

	remove : function () {
		this.undelegateEvents(this.events);
	}
})