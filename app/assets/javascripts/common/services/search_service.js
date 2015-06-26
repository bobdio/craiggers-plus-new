/**
* This module provides search service
* spec in spec_runner/spec/services/search_service_spec
*/

var searchService = (function () {

	var SEARCH_URL = ((window.location.protocol == 'https:') ? 'https' : 'http') + "://" + "search.3taps.com";

	var module = {};

	var _retvals = "heading,timestamp,category,location,images,source,price,currency,status,id,external_url,body,annotations";

	var _setupFilterParam = function (model, params, paramname, selectedItems, unselectedItems) {
		// if unselected items array is empty filter shouldn't be setuped
		if ((_.isArray(unselectedItems)) && (unselectedItems.length == 0)) {
			return params;
		}

		params[paramname] = selectedItems.join("|");		

		return params;
	}

	var _setupPriceRangeParam = function (model, params) {
		if (model.validatePrice()) {
			params.price = model.get('min_price') + ".." + model.get('max_price');
		} else {
			model.clearPrice();
		}

		return params;
	}

	var _setupCategoryParam = function (model, params) {
		
		params = _setupFilterParam(model, params, "category", model.get("selected_categories"), model.get("unselected_categories"));
		//in case of no selected categories add category_group param
		if ((!params.category) || (params.category == "")) {
			if (model.get("category_group")) {
				params.category_group = model.get("category_group");	
			}
		}
		return params;
	}

	var _setupStatusParam = function (model, params) {

		return _setupFilterParam(model, params, "status", model.get("selected_status"), model.get("unselected_status"));
	}

	var _setupSourceParam = function (model, params) {

		return _setupFilterParam(model, params, "source", model.get("selected_source"), model.get("unselected_source"));
	}

	var _getLocationParam = function (model) {
		var location = model.get("location");
		if (location) {
			if (location.get("code") !== "all") {
				return "&location." + location.get("level") + "=" + location.get("code");
			}
		}

		return "";
	}

	var _setupAdvancedParams = function (model, params) {

		if (model.get("title_only")) {
			params.heading = model.get("text");
		} else {
			params.text = model.get("text");
		}

		if (model.get("has_image")) {
			params.has_image = 1;
		}

		if (model.get("has_price")) {
			params.has_price = 1;
		}

		return params;
	}

	var _setupRadiusParam = function (model, params) {
		if ((model.get("radius")) && (model.get("radius") !== "")) {
			var location = model.get("location");

			if ((location) && (location.get("lat") !== 0) && (location.get("long") !== 0)) {
				params.radius = model.get("radius");
				params.lat = location.get("lat");
				params.long = location.get("long");
			}
		}

		return params;
	}

	// generates search parameters according to state of the model
	var _getSearchParams = function(model) {
		var params = {
			anchor: model.get("anchor"),
			page: model.get("page"),
			retvals: _retvals,
			rpp: model.get("rpp"),
			safe: model.get("safe_search") ? "yes" : "no",
			tier: model.get("tier")/*,
			text: model.get("text")*/
		}

		params = _setupAdvancedParams(model, params);
		params = _setupStatusParam(model, params);
		params = _setupSourceParam(model, params);
		params = _setupPriceRangeParam(model, params); 
		params = _setupCategoryParam(model, params);
		params = _setupRadiusParam(model, params);

		if (model.get("sort") !== "") {
			params.sort = model.get("sort");
		}

		var annotations = model.getAnnotationsData();

		if (annotations) {
			params.annotations = annotations;
		}

		return params;
	}

	var _searchXHR = null;

	module.getSourceMetric = function (source_code, cb) {
		$.ajax({
	      url: SEARCH_URL + '/?' + AUTH_TOKEN,
	      data: {
	      	rpp : 1,
	      	source : source_code
	      },
	      dataType: 'json',
	      type: 'get',
	      
	      success : function (data) {
	      	if (cb) {
	      		var resultsModel = new ResultsModel(data);
	      		
	      		cb(resultsModel);
	      	}
	      },

	      error : function () {
	      	cb(new ResultsModel());
	      }
	  });
	},

	/**
	* Sends search request with specific parameters according to state of the model. 
	* In case of success calls callback (cb) function with new instance of ResultsModel
	*/
	module.search = function (model, cb, ajax) {
		var startTime = (new Date()).getTime();
		var ajax = ajax || $.ajax;
		model.set("is_searching", true);
		_searchXHR = ajax({
	      url: SEARCH_URL + '/?' + AUTH_TOKEN + _getLocationParam(model),
	      data: _getSearchParams(model),
	      dataType: 'json',
	      type: 'get',
	      
	      success : function (data) {
	      	if (cb) {
	      		var resultsModel = new ResultsModel(data);
	      		var exectime = new Date().getTime() - startTime;
	      		
				resultsModel.set("exectime", exectime);
	      		resultsModel.set({is_complete: true, tier: model.get('tier')});
	      		app.models.resultModel = resultsModel;
	      		cb(resultsModel);
	      		model.set("is_searching", false);
	      	}

	      	_searchXHR = null;
	      },

	      error : function (jqXHR, textStatus, errorThrown) {
	      	model.set("is_searching", false);
	      }

	    });

	    return _searchXHR;
	}

	module.searchNextPostings = function (model, cb, resultsModel) {
		resultsModel = resultsModel || app.models.resultsModel;
		if (resultsModel) {
			model.setupNextSearchDirection(resultsModel);
			module.search(model, cb);
		}
		
	}

	/**
	* Aborts search request
	*/
	module.abort = function () {
		if (_searchXHR) {
			_searchXHR.abort();
		}
	}

	/**
	* Sends detailed search request for specific posting
	* In case of success refreshes posting fields 
	*/
	module.refreshPostingDetails = function (posting, cb, tier, useExternalID, ajax) {
		var ajax = ajax || $.ajax;
		if (!tier) {
			tier = 0;
		}
		var data = {
	      	retvals: _retvals,
			rpp: 1,
			tier : tier
		}
		if (!useExternalID) {
			data.id = posting.get('postKey');
		} else {
			data.external_id = posting.get('postKey');
		}
		ajax({
	      url: SEARCH_URL + '/?' + AUTH_TOKEN,
	      data: data,
	      dataType: 'json',
	      type: 'get',
	      success : function (data) {
	      	if ((data.postings.length == 0) && (tier == 0) && (!useExternalID)) {
	      		module.refreshPostingDetails(posting,cb, 1, false, ajax);
	      		return;
	      	}
	      	if ((data.postings.length == 0) && (!useExternalID)) {
	      		module.refreshPostingDetails(posting, cb, 0, true, ajax);
	      		return;
	      	}
	      	if ((data.postings.length == 0) && (useExternalID) && (tier == 0)) {
	      		module.refreshPostingDetails(posting, cb, 1, true, ajax);
	      		return;
	      	}
	      	posting.set(data.postings[0]);
	      	posting.setupData();
	      	if (cb) {
	      		cb(posting)
	      	}	
	      },

	      error : function (jqXHR, textStatus, errorThrown) {

	      }
	  });
	}

	module.getPostingOlderVersions = function (posting, cb, ajax) {
		var ajax = ajax || $.ajax;
		ajax({
	      url: SEARCH_URL + '/?' + AUTH_TOKEN,
	      data: {
	      	retvals: _retvals,
			rpp: 1,
			id: posting.get('id'),
			tier : 1
	      },
	      dataType: 'json',
	      type: 'get',
	      success : function (data) {
	      	cb(new ResultsModel(data));
	      },

	      error : function (jqXHR, textStatus, errorThrown) {

	      }
	    });
	}

	module.saveSavedSearchesData = function (savedSearches) {
		if (!window.localStorageService) {
			return;
		}
		localStorageService.setItem("saved_searches", JSON.stringify(savedSearches.toJSON()));
	}

	module.getSavedSearchByID = function (id, cb) {
		var savedSearch = app.collections.savedSearches.get(id);

		if (savedSearch) {
			cb(savedSearch);
			return;
		}

		if ((!savedSearch) && (!app.collections.savedSearches.getIsSynced())) {
			module.fetchSavedSearches(function () {
				savedSearch = app.collections.savedSearches.get(id);
				cb(savedSearch);
			});
		} else {
			cb();
		}
	}

	module.saveSearchWithURL = function (name, email, notifications, successCB, errorCB) {
		var searchModel = app.models.searchModel;
		var data = {
			name: name,
			email : email,
			params: _getSearchParams(searchModel),
			flag: true,
			extra : {
				url : router.genearteURLWithSearchParams(searchModel)
			},
			timestamp: Math.round(new Date().getTime()/1000)
		};

		var location = searchModel.get('location');
		if (location) {
			data.params[location.get('level')] = location.get('code');
		}

		var send_data = { 
			json: JSON.stringify(data),
			notifications : notifications
		}

		$.ajax({
			url: '/search/save',
			type: 'post',
			data: send_data,
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			success: function (data, textStatus, XMLHttpRequest) {
				if (app.collections.savedSearches.getIsSynced()) {
					searchModel.set({
						id: data.key,
						name : name,
						notifications : notifications,
						notification_email : email
					});
					app.collections.savedSearches.add(searchModel);	
				}
				successCB();
			},
			error : function (data) {
				errorCB(data);
			}
		});
	}

	/**
	* Sends save search query
	* In case of success calls success call back function
	* In case of error calls error call back function with error message
	*/
	module.saveSearch = function (name, searchModel, userModel, interval, receiveNotifications, successCB, errorCB) {
		searchModel.set({name: name});
		app.collections.savedSearches.add(searchModel);
		module.saveSavedSearchesData(app.collections.savedSearches);

		if ((receiveNotifications) && (userModel.isEmailVerified())) {
			var data = {
				name: name,
				params: _getSearchParams(searchModel),
				flag: true,
				timestamp: Math.round(new Date().getTime()/1000)
			};

			var location = searchModel.get('location');
			if (location) {
				data.params[location.get('level')] = location.get('code');
			}

			var send_data = { 
				json: JSON.stringify(data),
				notifications : true,
				interval : interval
			}
			$.ajax({
				url: '/search/save',
				type: 'post',
				data: send_data,
				headers: {
				    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
				},
				success: function (data, textStatus, XMLHttpRequest) {
					/*send_data.key = data.key;
					send_data.json = JSON.parse(send_data.json);
					app.collections.savedSearches.add(send_data);*/
					searchModel.set("id", data.key);
					module.saveSavedSearchesData(app.collections.savedSearches);
					successCB();
				},
				error : function (data) {
					errorCB();
				}
			});
		} else {
			successCB();
		}
	}

	module.fetchSavedSearches = function (cb) {
		$.get("/user/saved_searches").done(function (data) {
			app.collections.savedSearches.setupSavedSearchesData(data);
			module.saveSavedSearchesData(app.collections.savedSearches);
			cb();
		});
	}

	module.getSavedSearchesData = function () {
		return jQuery.parseJSON(localStorageService.getItem("saved_searches"));
	}

	/**
	* Sends update saved search query
	*/
	module.updateSavedSearch = function (model) {
		var modelKey = model.id ? model.id : model.get('key');
		if (!modelKey) {
			return;
		}
		$.ajax({
			url: '/search/update/' + modelKey,
			type: 'put',
			data: {
				name: model.get("name"),
				notifications: model.get("notifications"),
				email: model.get("notification_email")
			},
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			complete: function() {

			}
		});
	}

	/**
	* Sends delete saved search query if model has id
	* Also deletes model from collection of saved searches and saves updated collection
	*/
	module.deleteSavedSearch = function (model) {
		var modelKey = model.id ? model.id : model.get('key');
		if (modelKey) {
			$.ajax({
				url: '/search/delete/' + modelKey,
				type: 'delete',
				headers: {
				    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
				},
				complete: function() {
				}
			});
		}

		app.collections.savedSearches.remove(model);
		this.saveSavedSearchesData(app.collections.savedSearches);
	}

	module.getSearchCount = function (model, countTarget, cb, tier, ajax) {
		var ajax = ajax || $.ajax;

		var params = {
			text : model.get("text")
		}

		params = _setupAdvancedParams(model, params);

		if (tier) {
			params.tier = tier;
		}

		return ajax({
	      url: SEARCH_URL+"/?pretty&" + AUTH_TOKEN+"&count=" + countTarget+_getLocationParam(model),
	      dataType: 'json',
	      type: 'get',
	      data: params,
	      success : function (data) {
	      	data.count_target = countTarget;
	      	if (cb) {
	      		cb(new SearchCountModel(data));
	      	}
	      },

	      error : function (jqXHR, textStatus, errorThrown) {

	      }
	  });
	}

	module.getSearchCounts = function (resultsModel, searchModel, cb, tier) {
		var searchCountTargets = resultsModel.get('search_count_targets');
		resultsModel.clearSearchCounts();

		_.each(searchCountTargets, function (countTarget) {
			module.getSearchCount(searchModel, countTarget, function(searchCount) {
				resultsModel.addSearchCount(searchCount);
				cb(searchCount);
			}, tier);
		})
	}

	module.getSearchCategoryCount = function (model, cb) {
		return module.getSearchCount(model, "category", $.proxy(function(countModel) {
			model.set("selected_categories", countModel.getMatchedTerms());
			cb(countModel);
		}, this));
	}

	module.getSearchPriceCount = function (model, cb) {
		return module.getSearchCount(model, "price", cb);
	}

	module.getSearchStatusCount = function (model, cb) {
		return module.getSearchCount(model, "status", cb);
	}

	module.getSearchSourceCount = function (model, cb) {
		return module.getSearchCount(model, "source", cb);
	}

	return module;
})();