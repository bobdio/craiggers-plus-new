var SignInModalsViewMixin = (function () {
	var module = function() {};

	_.extend(module.prototype, {
		signUpHandler : function (event) {
			if ($("#sign_up_modal").length == 0) {
				this.renderModalsTemplate();	
			}
			$("#sign_up_modal").modal("show");
		},

		signInHandler : function (event) {
			if ($("#sign_in_modal").length == 0) {
				this.renderModalsTemplate();	
			}
			$("#sign_in_modal").modal("show");
		},

		setSignedInTopMenuState : function () {
			$('#top_menu #log_in').hide();
			$('#top_menu #log_out').attr("style", "display: inline-block");
		},

		logOutButtonHandler : function () {
			window.location.href = "/signout";
		},

		signUpButtonHandler : function () {
			if (app.models.userModel.get('is_signing')) {
				return;
			}
			$('#sign_up_modal #errors_holder').html('');
		      
			app.models.userModel.set({
				terms : $('#sign_up_modal #terms').is(':checked'),
				username : $('#sign_up_modal #username').val(),
				password : $('#sign_up_modal #password').val(),
				email : $('#sign_up_modal #email').val()
				//contact_me : $('#sign_up_modal #contact_me').is(':checked')
			});
			var self = this;
			var errorsText = app.models.userModel.validateSignUp();

			if ( errorsText.length == 0 ) {
				app.models.userModel.set('is_signing', true);
				userService.signUp(
					app.models.userModel,

					function (userModel) {
						app.models.userModel.set('is_signing', false);
						//$('#sign_up_modal #errors_holder').html("Thank you for signing up. We have sent an email to verify your account. Please check your inbox.");
						self.signedIn();
						//$("#sign_up_modal").modal("hide");
						if (app.views.topMenu) {
							app.views.topMenu.setSignedInTopMenuState();
						}

						$("#sign_up_modal").modal("hide");
						$("#success_sign_up_dialog").modal('show');
					},

					function (errors) {
						app.models.userModel.set('is_signing', false);
						errorsText = errors.join('<br />');
						$('#sign_up_modal #errors_holder').html(errorsText);
					}
				)
			} else {
				$('#sign_up_modal #errors_holder').html(errorsText.join('<br/>'));
			}
		},

		renderModalsTemplate : function () {
			$("#sign_up_modal").remove();
			$("#sign_in_modal").remove();
			$("#success_sign_up_dialog").remove();

			return JST["mobile/templates/sign_modals"]();
		},

		registerForms : function () {
			var self = this;
			
			$('#sign_up_form').submit(function() {
				return false;
		    });

		    $('#sign_in_form').submit(function() {
		    	if (app.models.userModel.get('is_signing')) {
					return false;
				}
				$('#sign_in_modal #errors_holder').html('');
				app.models.userModel.set('is_signing', true);
		      
				app.models.userModel.set({
					username : $('#sign_in_modal #username').val(),
					password : $('#sign_in_modal #password').val()
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
			})

			$("#success_sign_up_dialog #ok_btn").click(function () {
				$("#success_sign_up_dialog").modal('hide');

				//router.navigate("verify_email", {trigger: true});
			})
		}
	});

	return module;
}());

