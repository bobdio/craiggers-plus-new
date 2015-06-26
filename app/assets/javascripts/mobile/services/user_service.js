/**
* This module provides user service
* spec in spec_runner/spec/services/user_service_spec
*/

var userService = (function() {
	var module = {};

	module.saveLocation = function (location) {
		localStorage.setItem("user_location", JSON.stringify(location.attributes));
	},

	module.saveFrequencyValue = function (value) {
		localStorage.setItem("user_frequency", value);
	},

	module.getFrequencyValue = function () {
		return localStorage.getItem("user_frequency");
	},

	module.getSavedLocation = function () {
		var locationData = localStorage.getItem("user_location");
		if (locationData) {
			return new LocationModel(jQuery.parseJSON(locationData));
		}

		return null;
	},

	module.verifyEmail = function (userModel, token, successCB, errorCB, ajax) {
		var ajax = ajax || $.ajax;
		ajax({
			type: 'GET',
			url: 'user/verify_email',
			data: userModel.serializeVerifyEmail(token),
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			success: function(data) {
				if (!_.isNull(data.email)) {
					app.models.userModel.set(data);
					successCB();
				} else {
					errorCB();
				}
				
			},
			error: function(data) {
				if (errorCB) {
					errorCB();
				}
			}
		});
	},

	module.updateUsername = function (userModel, name, successCB, errorCB, ajax) {
		var ajax = ajax || $.ajax;
		ajax({
			type: 'GET',
			url: 'user/update_username',
			data: userModel.serializeUpdateUsername(name),
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			success: function(data) {
				app.models.userModel.set(data);
				successCB();
			},
			error: function(data) {
				if (errorCB) {
					errorCB(data.responseText);
				}
			}
		});
	},

	module.updateEmail = function (userModel, email, successCB, errorCB, ajax) {
		var ajax = ajax || $.ajax;
		ajax({
			type: 'GET',
			url: 'user/update_email',
			data: userModel.serializeUpdateEmail(email),
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			success: function(data) {
				app.models.userModel.set(data);
				successCB();
			},
			error: function(data) {
				if (errorCB) {
					errorCB();
				}
			}
		});
	},

	/**
	* Sends sign_up query with data based on user data
	* In case of success calls success callback with new user data
	* In case of error calls error callback with error messages
	*/
	module.signUp = function(userModel, successCB, errorCB, ajax) {
		var ajax = ajax || $.ajax;
		ajax({
			type: 'POST',
			url: 'user/sign_up',
			data: userModel.serializeSignUp(),
			success: function(data) {
				app.models.userModel.set(data);
				if (successCB) {
					successCB(app.models.userModel);
				}
			},
			error: function(data) {
				if(errorCB) {
					var errorsText = [];

					if (_.isArray(data.responseText)) {
						_.each(JSON.parse(data.responseText),function(item) {
							errorsText.push(item.message);
						});
					} else {
						errorsText = [data.responseText];
					}

					errorCB(errorsText);
				}

			}
		});
	}

	/**
	* Sends sign_in query with data based on user data
	* In case of success calls success callback with new user data
	* In case of error calls error callback with error messages
	*/
	module.signIn = function (userModel, successCB, errorCB, ajax) {
		var ajax = ajax || $.ajax;
		ajax({
			type: 'POST',
			url: '/user/sign_in',
			data: userModel.serializeSignIn(),
			success: function(data) {
				if ( !data.errors ) {
					app.models.userModel.set(data);
					app.collections.savedSearches.setIsSynced(false);
					if (successCB) {
						successCB(app.models.userModel);
					}
				}
			},
			error: function(data) {
				if (errorCB) {
					errorCB();
				}
			}
		});
	}

	/**
	* Sends signedin query with data based on user data
	* In case of success calls success callback with new user data
	* In case of error calls error callback with error messages
	*/
	module.signedIn = function (successCB, errorCB, ajax, token) {
		var ajax = ajax || $.ajax;
		var token = token || (new Date().getTime());
		ajax({
			url: '/user/signedin?' + token,
			success: function(data) {
				app.models.userModel.set(data);
				app.collections.savedSearches.setIsSynced(false);
				if (successCB) {
					successCB(app.models.userModel);
				}
			},
			error: function() {
				if (errorCB) {
					errorCB();
				}
			}
		});
	}

	return module;
}());