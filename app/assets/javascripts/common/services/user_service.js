/**
* This module provides user service
* spec in spec_runner/spec/services/user_service_spec
*/

var userService = (function() {
	var module = {};

	var _generatePostingData = function (posting) {
		var postingData = {
			heading: posting.get("heading"),
			body: posting.get("body"),
			location: posting.get("location").get("code"),
			currency: posting.get("currency"),
			price: posting.get("price"),
			annotations:posting.get("annotations"),
			category: posting.get("category"),
			images : JSON.stringify(posting.get("images"))
		}

		if (posting.get('mode')) {
			postingData.mode = posting.get('mode');
		}

		return postingData;
	}

	module.saveLocation = function (location) {
		localStorageService.setItem("user_location", JSON.stringify(location.attributes));
	},

	module.saveFrequencyValue = function (value) {
		localStorageService.setItem("user_frequency", value);
	},

	module.getFrequencyValue = function () {
		return localStorageService.getItem("user_frequency");
	},

	module.getSavedLocation = function () {
		var locationData = localStorageService.getItem("user_location");
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

	module.deletePosting = function (posting, cb, ajax) {
		var ajax = ajax || $.ajax;

		ajax({
			type: "POST",
			url: "/postings/"+posting.get("id") + "/delete",
			data : {
				id: posting.get("id")
			},
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			success: function(data) {
				if (cb) {
					cb();
				}
			},
			error: function(data) {
			}
		});
	}

	module.getUserPostings = function (cb, ajax) {
		var ajax = ajax || $.ajax;

		ajax({
			type: "GET",
			url: "postings/by_user",
			data: {
				name : app.models.userModel.get("username")
			},

			success : function (data) {
				var postings = new PostingsCollection(data);
				postings.each(function (posting) {
					posting.set("is_local", true);
				});
				cb(postings);
			},

			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
		})
	}

	module.updatePosting = function (posting, cb, ajax) {
		var ajax = ajax || $.ajax;

		ajax({
			type: "POST",
			url: "/postings/" + posting.get("id") +"/update",
			data : _generatePostingData(posting),
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			
			success : function (data) {
				if (data.success) {
					if (cb) {
						posting.set(data.posting)
						cb(posting);
					}
				}
			}, 

			error : function (data) {
				console.log(data);
			}
		})
	}

	module.createPosting = function (posting, cb, ajax) {
		var ajax = ajax || $.ajax;

		ajax({
			type: "POST",
			url: "/postings",
			data : _generatePostingData(posting),
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},

			success : function (data) {
				if (data.success) {
					if (cb) {
						posting.set(data.posting)
						cb(posting);
					}
				}
			}, 

			error : function (data) {
				console.log(data);
			}
		})
	}

	module.getProfile = function (ajax) {
		var ajax = ajax || $.ajax;
		ajax({
			type: 'GET',
			url: '/profile',
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			success: function(data) {
				console.log(data);
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
				if (data.response) {
					if (!data.response.success) {
						errorCB([data.response.error]);
						return;
					}
				}
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

	module.changePassword = function (email, name, successCB, errorCB) {
		$.ajax({
	        type: 'POST',
	        url: '/user/change_password_request',
	        data: {
	        	name : "name",
	        	email : "email"
	        },

	        success : function (data) {
	        	successCB(data);
	        },

	        error : function (data) {
	        	errorCB(data);
	        }
	    });
	}

	return module;
}());