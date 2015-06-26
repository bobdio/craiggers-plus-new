var SourcesMetricsView = BaseView.extend({

	el : "#navbar .metrics_container",

	template : JST["source_metric"],

	render : function () {
		var self = this;
		_.each(this.model.SOURCES, function (source_code) {
			self.renderSourceMetric(source_code);
		});

		this.results = new ResultsCollection();

		this.renderSourceMetric("TOTAL");
	},

	renderSourceMetric : function (code) {
		var self = this;
		if (code !== "TOTAL") {

			this.$el.append(this.template({
				code : code,
				ago : "0, ",
				num_matches : "Loading..."
			}));

			searchService.getSourceMetric(code, function (result) {
				self.results.add(result);
				
				//displays num_matches value for current source
				self.$("#" + code + " .source_num_matches").html(self.generateNumMatchesText(result.get("num_matches")));
				//displays ago value for current source
				self.$("#" + code + " .source_last_posting_ago").html(self.generateAgoText(result));

				if (self.results.length == self.model.SOURCES.length) {
					self.metricsDataLoaded();
				}
			});
		} else {
			this.$el.append(this.template({
				code : code,
				ago : "",
				num_matches : ""
			}));
		}
	},

	generateAgoText : function (result) {
		var ago = 0;
		if (result.get("postings").length > 0) {
			var posting = result.get("postings").first();
			ago = Math.round(posting.getMinutesAgo());
		}
		return ago + ", ";
	},

	generateNumMatchesText : function (value) {
		return Math.round(value/1000);		
	},

	metricsDataLoaded : function () {
		this.$("#TOTAL .source_num_matches").html(this.generateNumMatchesText(this.results.getTotalNumMathces()));
	}
});