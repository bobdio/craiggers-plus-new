/**
* This module contains methods for storing data into object. It has the same API as localStorage.
*/

var LocalStorageModel = (function () {
	var module = function () {};
	var data = {};

	_.extend(module.prototype, {
		setItem : function (key, value) {
			return data[key] = value;
		},

		getItem : function (key) {
			return data[key];
		},

		removeItem : function (key) {
			return delete data[key];
		}
	});

	return module;
}());