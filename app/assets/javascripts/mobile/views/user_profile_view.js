var UserNameOptionMenuState = function () {};
_.extend(UserNameOptionMenuState.prototype, OptionMenuViewState.prototype, {

	id : "user_name",

	saveHandler : function () {
		this.context.state.deactivate();
	},

	activate : function () {
		$("#user_name #user_name_input_field").val(app.models.userModel.get("displayName"));
		$("#user_name #errors_holder").html('');
		this.context.state.activateMenu();
	}
});

var UserEmailOptionMenuState = function () {};
_.extend(UserEmailOptionMenuState.prototype, OptionMenuViewState.prototype, {

	id : "user_email",

	saveHandler : function () {
		this.context.state.deactivate();
	},

	activate : function () {
		$("#user_email #errors_holder").html('');
		$("#user_email #user_email_input_field").val(app.models.userModel.get("email"));
		this.context.state.activateMenu();
	}
});

var UserProfileView = BaseView.extend({

	events : {
		"click #user_profile .name" : "activateNameMenu",
		"click #user_profile .email" : "activateEmailMenu",
		"click #user_email #cancel_button" : "menuCancelHandler",
		"click #user_name #done_button" : "menuCancelHandler",
		"click #user_email #done_button" : "menuCancelHandler"
	},

	template : JST["mobile/templates/user_profile"],

	render : function () {
		this.$el.append(this.template());
		if (this.model.get("signedin")) {
			this.renderProfileData();
		} else {
			this.model.once("change:signedin", $.proxy(this.renderProfileData, this));
		}

		this.nameFieldUtils = new FocusedInputFieldUtils();
		this.nameFieldUtils.registerInputField($("#user_name #user_name_input_field"), $("#user_name #clear_location_button"));

		this.emailFieldUtils = new FocusedInputFieldUtils();
		this.emailFieldUtils.registerInputField($("#user_email #user_email_input_field"), $("#user_email #clear_location_button"));

		var self = this;
		$('#user_name form#update_name_form').submit(function() {
			var newName = $("#user_name #user_name_input_field").val();
			var errors = self.model.validateUserName(newName)

			if (errors.length == 0) {
				userService.updateUsername(self.model, newName, function () {
					self.renderProfileData();
					self.menuCancelHandler();
				}, function (errorText) {
					$("#user_name #errors_holder").html(errorText);
				});
			} else {
				errorsText = errors.join('<br />');
				$("#user_name #errors_holder").html(errorsText);
			}
			
			return false;
	    });

	    $('#user_email form#update_email_form').submit(function() {
	    	var newEmail = $("#user_email #user_email_input_field").val();
	    	if (self.model.validateEmail(newEmail)) {
	    		userService.updateEmail(self.model, newEmail, function () {
					router.navigate("verify_email", {trigger: true});
				});
	    	} else {
	    		$("#user_email #errors_holder").html("Invalid email address");
	    	}
			
			return false;
	    });
	},

	STATES : {
		user_name: UserNameOptionMenuState,
		user_email : UserEmailOptionMenuState
	},

	activateEmailMenu : function (event) {
		this.activateState("user_email");
	},

	activateNameMenu : function (event) {
		this.activateState("user_name");
	},

	renderProfileData : function () {
		$("#user_profile .user_image img").attr({src: this.model.get("image")});
		if (_.isNull(this.model.get("email"))) {
			$("#user_profile .email").html("Please verify email");
		} else {
			$("#user_profile .email").html(this.model.get('email'));
		}
		$("#user_profile .name").html(this.model.get("displayName"));
	},

	remove : function () {
		this.undelegateEvents(this.events);
		$("#user_profile").remove();
		$("#user_name").remove();
		$("#user_email").remove();
		app.models.userModel.off("change:signedin", $.proxy(this.renderProfileData, this));
	}
});

_.extend(UserProfileView.prototype, OptionMenuViewMixin.prototype);

