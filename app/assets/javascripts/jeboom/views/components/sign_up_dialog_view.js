var SignUpDialogView = DialogView.extend({
	template : JST['sign_up_dialog'],

	init : function (showInfo) {
		var self = this;

		if (showInfo) {
			$("#sign_up_form .info").show();
		} else {
			$("#sign_up_form .info").hide();
		}
		
		$("#sign_up_form").submit(function () {

			if (app.models.userModel.get('is_signing')) {
				return;
			}
			$('#sign_up_form #errors_holder').html('');
		      
			app.models.userModel.set({
				terms : $('#sign_up_form #terms').is(':checked'),
				username : $('#sign_up_form #username').val(),
				password : $('#sign_up_form #password').val(),
				email : $('#sign_up_form #email').val()
				//contact_me : $('#sign_up_modal #contact_me').is(':checked')
			});
			
			var errorsText = app.models.userModel.validateSignUp();

			if ( errorsText.length == 0 ) {
				app.models.userModel.set('is_signing', true);
				userService.signUp(
					app.models.userModel,

					function (userModel) {
						app.models.userModel.set('is_signing', false);
	
						self.signedIn();					
					},

					function (errors) {
						app.models.userModel.set('is_signing', false);
						errorsText = errors.join('<br />');
						$('#sign_up_form #errors_holder').html(errorsText);
					}
				)
			} else {
				$('#sign_up_form #errors_holder').html(errorsText.join('<br/>'));
			}

			return false;
		});
	},

	signedIn : function () {
		this.remove();
	}
});