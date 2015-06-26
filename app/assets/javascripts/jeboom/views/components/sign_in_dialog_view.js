var SignInDialogView = DialogView.extend({

	events : {
		"click #sign_in_form #forgot_it" : "forgotItHandler"
	},

	template : JST['sign_in_dialog'],

	init : function (showInfo) {

		if (showInfo) {
			$("#sign_in_form").parent().find(".title").show();
		} else {
			$("#sign_in_form").parent().find(".title").hide();
		}

		var self = this;
		
	    $('#sign_in_form').submit(function() {
	    	if (app.models.userModel.get('is_signing')) {
				return false;
			}

			$('#sign_in_form #errors_holder').html('');
			app.models.userModel.set('is_signing', true);
	      
			app.models.userModel.set({
				username : $('#sign_in_form #username').val(),
				password : $('#sign_in_form #password').val()
			});

			userService.signIn(
				app.models.userModel,

				function (userModel) {
					app.models.userModel.set('is_signing', false);
					$("#sign_in_modal").modal("hide");
					app.models.userModel = userModel;
					self.signedIn();
				},

				function (errors) {
					app.models.userModel.set('is_signing', false);
					$('#sign_in_modal #errors_holder').html("Wrong username or password");
				}
			)
			return false;
		});
	},

	forgotItHandler : function (event) {
		this.remove();
		this.activateDialog(new ChangePasswordView());
	},

	signedIn : function () {
		this.remove();
	},

	remove : function () {
		DialogView.prototype.remove.call(this);
		this.undelegateEvents(this.events);
	}
});