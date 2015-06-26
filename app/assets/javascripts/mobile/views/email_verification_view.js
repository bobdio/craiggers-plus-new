var EmailVerification = BaseView.extend({

	template : JST["mobile/templates/email_verification"],

	render : function () {
		this.$el.append(this.template());

		var self = this;
		$('#email_verification_form').submit(function() {
			self.emailVerificationHandler();
			return false;
		});

		//DOM elements caching
		this.tokenField = $("#email_verification_form #token_input");
		this.message = $("#email_verification .message");
		this.errorMessages = $("#email_verification #error_messages_container");
		this.verificationForm = $("#email_verification_form");

		if (app.models.userModel.get("signedin")) {
			this.signedIn();
		} else {
			this.message.html("Please sign in from top menu");
			this.verificationForm.hide();
			app.models.userModel.once("change:signedin", $.proxy(this.signedIn, this));
		}
	},

	signedIn : function () {
		this.message.html("Please enter token from email");
		this.verificationForm.show();
	},

	emailVerificationHandler : function (event) {
		this.tokenField.blur();
		this.errorMessages.html('');
		var self = this;

		userService.verifyEmail(app.models.userModel, this.tokenField.val(), function () {
			router.navigate("user_profile", {trigger: true});
		}, function () {
			self.errorMessages.html("Email hasn't been verified. Please check token value and try again.")
		});
	},

	remove : function () {
		$("#email_verification").remove();
	}
})