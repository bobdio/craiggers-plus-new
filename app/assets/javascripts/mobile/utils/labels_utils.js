/**
* This module provides util functions for labels
*/

var labelsUtils = (function() {
	var module = {};

	function _getLocationNames (location) {
		var locations = [];

		_.each(["state", "metro", "locality"], function (locationName) {
			if (location.get(locationName) !== "") {
				var locationCollection = app.collections[locationName]
				if  (locationCollection) {
					locations.push(locationCollection.getLocationShortNameByCode(location.get(locationName)));
				} else {
					locations.push(location.get(locationName));
				}
			}
		});

		var city = location.get('city');
		if ((location.get('locality') == "") && (city !== "")) {
			if (_.isString(city)) {
				locations.push(city);
				location.translateLocationLevel('city');
			} else {
				locations.push(city.short_name);
			}
		}

		return locations;
	}

	module.getNumberLabel = function (number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	module.getPhoneNumberLabel = function (s) {
		var s2 = (""+s).replace(/\D/g, '');
		var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
		return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
	}
	/**
	* Generates category text of specific category in format: Category: Category Parent name > Category name
	* If category doesn't have parent, will return category name
	*/
	module.generateCategoryLabel = function (categoryCode) {
		var category = app.collections.categories.getCategoryByCode(categoryCode);
		var name = "";

		if (category) {
			name = "Category: " + category.get("name");

			if (category.get("cat_id") !== 0) {
				var categoryParent = app.collections.categories.get(category.get("cat_id"));

				if (categoryParent) {
					name = categoryParent.get("name") + " > " + category.get("name");
				}
			}
		} else {
			name = categoryCode;
		}

		return name;
	}

	/**
	* Generates price text by price and currency in format : Price: currency price
	* Will set currency = $ if currency is empty or is == USD
	*/
	module.generatePriceLabel = function (price, currency) {
		var priceText = "";
		if ((price !== "") && (price > -1)) {
			if ((currency == "USD") || (currency == "")) {
				currency = "$";
			}
			// format price with decimal precision
			if (price % 1 !== 0) {
				price = price.toFixed(2);
			}
			priceText = currency + module.getNumberLabel(price);
		}
		return priceText;
	}

	/**
	* Generates location text by location model in format: Location: location name
	*/
	module.generateLocationLabel = function (location) {
		if ((!location) || (!location.getLocationName)) {
			return "";
		}

		
		return location.getLocationName();
	}

	/**
	* Generates location text according to posting location data model
	*/
	module.generatePostingLocationLabel = function (location) {
		var locations = _getLocationNames(location);
		if (locations.length > 0) {
			return _.last(locations);
		} else {
			return "";	
		} 
	}

	module.generatePostingDetailsLocationLabel = function (location) {
		var locations = _getLocationNames(location);
		
		return locations.join(" > ");
	}

	module.generateTimeAgoLabel = function (timestamp) {
		if (timestamp == "") {
			return "";
		}
		var from = timestamp * 1000;
		var to = new Date().getTime();
		// copied from Craiggers.Util.DateHelper.time_ago_in_words
		var max_hours_in_minutes = new Date().getHours() * 60;

		var distance_in_seconds = (to - from) / 1000;
		var distance_in_minutes = Math.floor(distance_in_seconds / 60);

		if ( distance_in_minutes == 0 ) { return 'less than a min'; }
		if ( distance_in_minutes == 1 ) { return '1 min'; }
		if ( distance_in_minutes < 45 ) { return distance_in_minutes + ' mins'; }
		if ( distance_in_minutes < max_hours_in_minutes) {
		if ( distance_in_minutes < 120 ) { return '1 hour'; }
		if ( distance_in_minutes < 1440 ) { return Math.floor(distance_in_minutes / 60) + ' hours'; }
		} else {
		var time_by_days_in_minutes = distance_in_minutes - max_hours_in_minutes;
		if ( time_by_days_in_minutes < 1440 ) { return '1 day'; }
		if ( time_by_days_in_minutes < 43200 ) { return Math.ceil(time_by_days_in_minutes / 1440) + ' days'; }
		}
		if ( distance_in_minutes < 86400 ) { return '1 month'; }
		if ( distance_in_minutes < 525960 ) { return Math.floor(distance_in_minutes / 43200) + ' months'; }
		if ( distance_in_minutes < 1051199 ) { return '1 year'; }

		return 'over ' + Math.floor(distance_in_minutes / 525960) + ' years';
	}

	module.generateDateLabel = function (timestamp) {
		if (timestamp == "") {
			return "";
		}
		var date = new Date(timestamp * 1000);
		// copied from Craiggers.Util.DateHelper.formatTimestamp
		if(!date) return '';

		var hours = date.getHours(),
		  minutes = date.getMinutes(),
		  ampm = hours >= 12 ? 'PM' : 'AM';

		hours = hours % 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0'+minutes : minutes;

		var time = hours + ':' + minutes + ampm;
		var timezone = /\((.*)\)$/.exec(date)[1]
		date = $.datepicker.formatDate('yy-mm-dd', date)

		return  date + ' ' + time + ' ' + timezone;
	}

	return module;
}());