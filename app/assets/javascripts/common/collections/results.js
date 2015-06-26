var ResultsCollection = BaseCollection.extend({
	model : ResultsModel,

	getTotalNumMathces : function () {
		return this.reduce(function(memo, result) {
			return memo + result.get("num_matches");
		}, 0);
	}
});