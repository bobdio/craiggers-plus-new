var ChangePasswordView = DialogView.extend({
	template : JST["change_password"],

	init : function () {
		$('#change_password_request_form').submit(function() {
	      
			$('#change_password_request_form #errors_holder').html('');
			var email = $('#change_password_request_form #email').val();
			var username = $('#change_password_request_form #username').val();

			if ((email == "") || ( !app.models.userModel.validateEmail(email))) {
		        $('#change_password_request_form #errors_holder').text("Invalid email address");
		        return false;
		    }

			userService.changePassword(username, email, 
				function (data) {
					$('#change_password_request_form #errors_holder').text('');
		          	$('#change_password_request_form #submit_change_password_request_form').hide();
		          	$('#change_password_request_form #confirmation_holder').html("We've sent you an email that describes how to reset your password");
				}, 
				function (data) {
					$('#errors_holder').text("Hmm, that email address doesn't match our records. Try re-entering it again.");
				}
			)	

			return false;
		});
	}
});