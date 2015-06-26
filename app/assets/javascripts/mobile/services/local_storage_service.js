/**
* This module contains API for storing data into localStorage. 
* It is used for replacing native localStorage in case of browser doesn't support it
*/

var localStorageService = (function () {
	var data = {};
	var module = {};
	var storage;

	if (isLocalStorageSupported()) {
		storage = localStorage;
	} else {
		storage = new LocalStorageModel();
	}

	module.setItem = function (key, value) {
		if (storage) {
			return storage.setItem(key, value)
		}
	}

	module.getItem = function (key) {
		if (storage) {
			return storage.getItem(key)
		}
	}

	module.removeItem = function (key) {
		if (storage) {
			return storage.removeItem(key);
		}
	}

	return module;
})();