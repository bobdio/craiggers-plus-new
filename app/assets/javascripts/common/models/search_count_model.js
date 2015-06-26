/**
* spec in spec_runner/spec/models/search_count_model_spec
*/

var SearchCountModel = BaseModel.extend({
	defaults : {
		counts: [], 
		num_matches: 0, 
		success: false, 
		time_search: 0, 
		time_taken: 0,
		// contains type of search count model
		count_target : ""
	},

	getMatchedTerms : function () {
		return _.map(this.get("counts"), function(count) {
			return count.term;
		})
	}

})