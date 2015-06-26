/**
* This module provides methods for syncing and fetching application data
* spec in spec_runner/spec/services/sync_service_spec
*/

var syncService = (function() {

	var _syncCommands =["fetchCategories", "fetchFavorites"]; 

	var module = {};

	/**
	* Syncs application data according to _syncCommands
	*/
	module.sync = function (cb, commandIndex) {
		if (!commandIndex) {
			commandIndex = 0;
		}

		if (commandIndex >= _syncCommands.length) {
			if (cb) {
				app.models.syncModel.set('is_synced', true);
				cb();
			}
			
			return;
		}

		module[_syncCommands[commandIndex]](function() {
			module.sync(cb, ++commandIndex);
		})
	}

	/**
	* Fetches categories data
	*/
	module.fetchCategories = function (cb) {
		app.collections.categories.fetch();
		app.collections.categories.on("sync", function() {
			app.models.syncModel.set('is_categories_synced', true);
			cb();
		});
	}

	/**
	* Fetches favorites data
	*/
	module.fetchFavorites = function (cb) {
		app.collections.favorites.fetch();
		app.collections.favorites.on("sync", function() {
			app.models.syncModel.set('is_favorites_synced', true);
			cb();
		});

		app.collections.favorites.on("error", function() {
			app.models.syncModel.set('is_favorites_synced', false);
			cb();
		});
	}

	module.syncLocationsData = function (cb) {
		locationService.syncLocationsData(function() {
			app.models.syncModel.set('is_locations_synced', true);
			cb();
		});
	}

	return module;
}());