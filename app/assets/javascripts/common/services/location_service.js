/**
* This module provides location service
* spec in spec_runner/spec/services/location_service_spec
*/

var locationService = (function () {

	var LOCATION_URL = "http://reference.3taps.com/locations";

	var module = {};

	//var _locationLevels = ['country', 'state', 'metro', 'region', 'county', 'city', 'locality'];
	var _locationLevels = ['locality', 'city', 'county', 'region', 'metro', 'state', 'country'];
	var _locationContextLevels = ['country', 'state', 'metro'];

	// copied from threetaps/views/search/standart_search_views/common_functions
	function api_call_for_geolocation(code) {
		var url = LOCATION_LOOKUP_URL + '?' + AUTH_TOKEN + '&code=' + code
		return $.get(url)
	}

	function generateLocationsDataHeadRequest (code) {
		return generateLocationsDataRequest(code, "HEAD");
	}

	function generateLocationsDataRequest (code, type) {
		var url = LOCATION_URL + '/?' + AUTH_TOKEN+"&level="+code
		if (type == "HEAD") {
			return $.ajax({
		        type: "HEAD",
		        url: url
		    });
		}
		return $.get(url);
	}

	function buildLocationsDataStructure () {
		var locationData = getSavedLocationsData();
		if (!locationData) {
			return;
		}
		app.collections.state = new LocationsCollection(locationData.state.locations);
		app.collections.metro = new LocationsCollection(locationData.metro.locations);
		app.collections.locality = new LocationsCollection(locationData.locality.locations);
	}

	function refreshLocationsDataStructure (isUpToDate, cb) {
		if (isUpToDate) {
			buildLocationsDataStructure();
			cb();
			return;
		}

		var lastModifiedStateXhr = generateLocationsDataHeadRequest('state');
		var lastModifiedMetroXhr = generateLocationsDataHeadRequest('metro');
		var lastModifiedLocalityXhr = generateLocationsDataHeadRequest('locality');

		var stateXhr = generateLocationsDataRequest('state');
		var metroXhr = generateLocationsDataRequest('metro');
		var localityXhr = generateLocationsDataRequest('locality');

		$.when(
			stateXhr, 
			metroXhr,
			localityXhr, 
			lastModifiedStateXhr, 
			lastModifiedMetroXhr,
			lastModifiedLocalityXhr).done(function(stateData, metroData, localityData) {

				stateData = stateData[0];
				stateData.lastModified = getLastModifiedValue(lastModifiedStateXhr);
				metroData = metroData[0];
				metroData.lastModified = getLastModifiedValue(lastModifiedMetroXhr);
				localityData = localityData[0];
				localityData.lastModified = getLastModifiedValue(lastModifiedLocalityXhr);

				saveLocationsData(stateData, metroData, localityData);
				buildLocationsDataStructure();
				cb();
			}
		);
	}

	function saveLocationsData (stateData, metroData, localityData) {
		refreshLocationData({
			state: stateData,
			metro: metroData, 
			locality: localityData,
			last_checked : new Date().getTime()/1000
		});
	}

	function refreshLocationData (data) {
		localStorageService.setItem("location", JSON.stringify(data));
	}

	function getLastModifiedValue (request) {
		return request.getResponseHeader('Last-Modified')
	}

	function getSavedLocationsData () {
		return jQuery.parseJSON(localStorageService.getItem("location"));
	}

	//checks last modified value of saved locations data and values of HEAD requests
	function isSavedLocationsDataUpToDate (cb) {

		var savedLocationsData = getSavedLocationsData();

		if (savedLocationsData) {
			var lastChecked = savedLocationsData.last_checked;
			var currentTime = new Date().getTime()/1000;

			//if last check was less than а day ago
			if ((currentTime - lastChecked) < 60*60*24) {
				cb(true);
				return;
			}

			var lastModifiedStateXhr = generateLocationsDataHeadRequest('state');
			var lastModifiedMetroXhr = generateLocationsDataHeadRequest('metro');
			var lastModifiedLocalityXhr = generateLocationsDataHeadRequest('locality');
			var lastModifiedStateValue, lastModifiedMetroValue,lastModifiedLocalityValue

			$.when(
				lastModifiedStateXhr, 
				lastModifiedMetroXhr,
				lastModifiedLocalityXhr).done(function() {
					lastModifiedStateValue = getLastModifiedValue(lastModifiedStateXhr);
					lastModifiedMetroValue = getLastModifiedValue(lastModifiedMetroXhr);
					lastModifiedLocalityValue = getLastModifiedValue(lastModifiedLocalityXhr);

					if ((savedLocationsData.state.lastModified == lastModifiedStateValue) &&
						(savedLocationsData.metro.lastModified == lastModifiedMetroValue) &&
						(savedLocationsData.locality.lastModified == lastModifiedLocalityValue)) {
							savedLocationsData.last_checked = currentTime;
							refreshLocationData(savedLocationsData);
							cb(true);
					} else {
						cb(false);
					}
				}
			);
		} else {
			cb(false);
		}
	}

	/**
	* Syncs state, metro, locality data. In case of success builds locations data structure and saves data into local storage.
	*/
	module.syncLocationsData = function (cb) {
		isSavedLocationsDataUpToDate(function (isUpToDate) {
			refreshLocationsDataStructure(isUpToDate, cb);
		});
	}

	/**
	* Searches locations matched with location value
	* In case of success calls callback function with MatchedLocationsModel
	*/
	module.searchLocation = function (location, cb, manageAjax) {
		var manageAjax = manageAjax || $.manageAjax;
		manageAjax.add('geolocate', {
            url: '/location/search',
            dataType: 'json',
            data: {
				levels: /^\d+$/.test(location) ? "zipcode,metro" : LocationModel.MATCHED_LOCATIONS_LEVELS.join(),
				text: location,
				type: 'istartswith'
			},
            success: function(data) {
            	if (cb) {
            		cb(new MatchedLocationsModel(data));	
            	}
            }
        });
	}

	/**
	* Searches location by specific location code
	*/
	module.translateLocationCode = function (code, cb) {
		$.when(api_call_for_geolocation(code)).done(function(data) {
			if (!data["success"]) {
				cb(false);
			} else {
				cb(data.location);
			}
		})
	}

	// copied from threetaps/views/search/standart_search_views/common_functions
	module.getLocationContext = function (locationDeep, cb) {

		var code = locationDeep.code;

		$.get(LOCATION_API + code).done(function(loc) {
			if ( loc.error ) {
				$.when(api_call_for_geolocation(code)).done(function(data){
					if (!data["success"]) {
						return;
					}

					loc = {};
					loc.name = data.location.short_name;
					loc.lat = (data.location.bounds_min_lat +  data.location.bounds_max_lat) / 2;
					loc.long = (data.location.bounds_min_long +  data.location.bounds_max_long) / 2;
					loc.level = locationDeep.level;
					loc.code = locationDeep.code;

					cb(new LocationModel(loc));
				})
				return;
			}

			cb(new LocationModel(loc));
		})
	}

	/**
	* Sends requests with location code to Location API while request isn't success and level index is correct
	* In case of success request calls callback function with new instance of Location model
	* In case of code == "all" calls callback function with new instance of Location model with name="all locations"
	*/
	module.findLocation = function (location, cb, levelIndex, ajax) {
		var ajax = ajax || $.ajax;
		if (!location) {
			return;
		}

		if (!levelIndex) {
			levelIndex = 0;
		} else {
			if (levelIndex >= _locationLevels.length) {
				return;
			}
		}

		var code = location[_locationLevels[levelIndex]];

		if (code) {
			if ( code != 'all' ) {
		      var params = {
		        url: LOCATION_API + code,
		        dataType: 'json',
		        success: function (data) {
		        	if (data.success) {
			        	cb(new LocationModel(data));
			        } else {
			        	module.findLocation(location, cb, ++levelIndex, ajax);
			        }
		        }
			}
		      ajax(params);
		    } else {
		    	cb(new LocationModel({name: 'all locations'}));
		    }
		} else {
			module.findLocation(location, cb, ++levelIndex, ajax);
		}
	}

	/**
	* Refreshes current location
	*/
	module.geolocate = function(cb, errorCB) {
		if (isPrivateMode()) {
			return false;
		}
		var searchbar = this;
		if(geo_position_js.init()){
			geo_position_js.getCurrentPosition(callback, noLocation, {maximumAge:60000, timeout:5000, enableHighAccuracy:true});
		}
		else{
			noLocation();
		}
		
		/*navigator.geolocation.getCurrentPosition(callback, noLocation,
		{
			enableHighAccuracy: true,
			timeout : 5000
		});*/

		function callback(position) {
			$.ajax({
				url: REVERSE_GEOLOCATION_URL + '/?' + AUTH_TOKEN ,
				data: {
					'accuracy': 0,
					'latitude': position.coords.latitude,
					'longitude': position.coords.longitude
				},
				callback: '?',
				dataType: 'json',
				success: function(data) {
					_.each(_locationContextLevels, function(level) {
						if(data[level]) {
							locationDeep = {level: level, code: data[level]};
						}
					});

					module.getLocationContext(locationDeep, cb);
				},
				
				error: noLocation
			});
		};

		function noLocation(err) {
			if (errorCB) {
				errorCB();
			}
		}
	}

	/**
	* Searches location with specific coordinates (lat,lon)
	*/
	module.getLocationByPosition = function (latitude, longitude, cb) {
		$.ajax({
			url: REVERSE_GEOLOCATION_URL + '/?' + AUTH_TOKEN ,
			data: {
				'accuracy': 0,
				'latitude': latitude,
				'longitude': longitude
			},
			callback: '?',
			dataType: 'json',
			success: function(data) {
				cb(data);
			}
		});
	}

	/**
	* Refreshes location of saved search model
	* In case of success refreshes location attribute of the model by new location modal and
	* calls call back function with saved search model
	*/
	module.refreshSavedSearchLocation = function (savedSearch, cb) {
		module.findLocation(savedSearch.getSavedLocationData(), function (location) {
			savedSearch.set("location", location);
			cb(savedSearch);
		});
	}

	return module;
})();