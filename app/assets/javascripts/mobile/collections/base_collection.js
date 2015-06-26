/**
* spec in spec_runner/spec/collections/base_collection_spec
*/

var BaseCollection = Backbone.Collection.extend({

	/**
	* Returns next model according to model position
	* If model isn't passed return first model
	*/
	getNextModel : function (model) {
		if (model) {
			return this.at(this.indexOf(model) + 1);
		}
	},

	/**
	* Returns previous model according to model position
	* If model isn't passed return last model
	*/
	getPreviousModel : function (model) {
		if (model) {
			return this.at(this.indexOf(model) - 1);
		}
	}
});