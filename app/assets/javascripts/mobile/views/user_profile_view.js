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
		"click #user_profile .user_location" : "activateLocationMenu",
		"click #user_profile .manage_postings" : "activatePostingsManagerPage",

		"click #user_email #cancel_button" : "menuCancelHandler",
		"click #user_name #done_button" : "menuCancelHandler",
		"click #user_email #done_button" : "menuCancelHandler",

		"click #location_menu #done_button" : "locationMenuSaveHandler",
		"click #location_menu #cancel_button" : "locationMenuCancelHandler",
		"click #location_menu .list_item" : "selectLocationsListItem",
		"keyup #location_menu #location" : "locationKeyUpHandler",
		"click #location_menu #location" : "locationClickHandler",
		"focus #location_menu #location" : "locationFocusHandler",
		"blur #location_menu #location" : "locationBlurHandler",
		"change #location_menu #matched_locations" : "locationSelectedHandler",
		"click #location_error_dialog #ok_btn" : "locationErrorOkBtnHandler",
		"click #location_menu #clear_location_button" : "clearLocationHandler"
	},

	template : JST["mobile/templates/user_profile"],

	render : function () {
		this.$el.append(this.template());

		this.locationValue = $("#user_profile .user_location");

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
		user_email : UserEmailOptionMenuState,
		location_menu : LocationOptionMenuState
	},

	locationMenuSaveHandler : function (event) {
		this.refreshUserLocation();
		userService.saveLocation(this.model.get('location'));
		this.menuCancelHandler();
	},

	refreshUserLocation : function () {
		var location = this.model.get("location");
		if (location) {
			this.locationValue.html(location.get("name"));	
			$("#location_menu #location").val(location.get("name"));
			this.locationValue.removeClass("no_value");
		} else {
			this.locationValue.addClass("no_value");
			this.locationValue.html("Select location");
		}
	},

	activatePostingsManagerPage : function (event) {
		router.navigate("postings_manager", {trigger: true});
	},

	activateEmailMenu : function (event) {
		this.activateState("user_email");
	},

	activateNameMenu : function (event) {
		this.activateState("user_name");
	},

	renderProfileData : function () {
		var savedLocation = userService.getSavedLocation();
		if (savedLocation) {
			this.model.set('location', savedLocation);
		}

		this.renderLocationMenu();

		this.refreshUserLocation();

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

_.extend(UserProfileView.prototype, OptionMenuViewMixin.prototype, LocationViewMixin.prototype);
