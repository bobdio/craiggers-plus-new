var SearchResultsView = BaseView.extend({
	el : "#search.page #postings",

	events : {
		'click .moreresults': 'searchNextResults',
		'click .older_results': 'searchNextResults',
		'click .newmatches' : 'newMatchesHandler'
	},

	render : function () {
		this.displayedResultsElement = this.$(".numresults .current");
		this.totalResultsElement = this.$(".numresults .total");
		this.expiredElement = this.$(".numresults .expired");
		this.exectimeElement = this.$(".numresults .exectime");
		this.postingsContainer = this.$(".postings");
		this.endOfResults = this.$('.end_of_results');
		this.olderResults = this.$('.older_results');
		this.moreResults = this.$('.moreresults');

		this.results = new ResultsCollection();

		this.postingDetails = new PostingDetailsView();
		this.postingDetails.render();

		this.$(".searching").hide();

		this.expiredElement.hide();
	},

	refreshPostingdetailsSize : function () {
		this.postingDetails.resize();
	},

	renderFavorites : function (postings) {
		this.clearPostings();
		this.refreshPostings(postings);

		//this.$(".numresults").hide();
		this.totalResultsElement.html(postings.models.length);
		this.displayedResultsElement.html(postings.models.length);

		this.endOfResults.hide();
		this.olderResults.hide();
		this.moreResults.hide();
	},

	renderUserPostings : function (postings) {
		this.clearPostings();

		if (postings) {
			this.refreshPostings(postings);

			this.totalResultsElement.html(postings.models.length);
			this.displayedResultsElement.html(postings.models.length);

			this.endOfResults.hide();
			this.olderResults.hide();
			this.moreResults.hide();
		}
	},

	closeDetails : function () {
		this.postingDetails.closeDetails();
	},

	stopNextResultsTimer : function () {
		if(this.newPostingsInterval) {
			clearInterval(this.newPostingsInterval);	
		}
	},

	startNextResultsTimer : function () {
		if (this.searchModel) {
			this.newPostingsInterval = setInterval($.proxy(this.searchNewPostings, this), 10000);	
		}
	},

	refresh : function (resultsModel, isNextResuts) {
		if (!isNextResuts) {
			this.$(".numresults").show();
			this.endOfResults.show();
			this.olderResults.show();
			this.moreResults.show();
			
			this.clearPostings();
			
			this.searchModel = new SearchModel($.extend(true, {}, app.models.searchModel.attributes));
			this.startNextResultsTimer();
		}
		
		this.results.add(resultsModel);

		this.model = resultsModel;

		this.refreshExectTime();
		this.refreshPostings(this.model.get("postings"));
		this.refreshNumMatches();

		this.postingDetails.closeDetails();
	},

	newMatchesHandler : function () {
		$('.newmatches').hide();
		router.gotoSearch();
	},

	searchNewPostings : function () {
		searchService.search(this.searchModel, $.proxy(this.refreshNewPostingsData, this));
	},

	refreshNewPostingsData : function (result) {
		$('.newmatches').hide();
		var firstPosting = this.results.at(0) ? this.results.at(0).get('postings').at(0) : null;
		
		if (!firstPosting) {
			return;
		}

		var currentPosting = result.get('postings').get(firstPosting.id);
		if (!currentPosting) {
			$('.newmatches').text('more than 100 newer results').show();
			return;
		}
		var currentPostingIndex = result.get('postings').indexOf(currentPosting);
        if (currentPostingIndex == 1){ $('.newmatches').text(currentPostingIndex + ' newer result').show() }
        if (currentPostingIndex > 1){ $('.newmatches').text(currentPostingIndex + ' newer results').show() }
        
	},

	searchNextResults : function () {
		searchService.searchNextPostings(this.searchModel, $.proxy(this.nextResultsSearchingComplete, this), this.model);
		this.moreResults.html(JST["moreresults-loading"]());
		this.olderResults.html(JST["moreresults-loading"]());
		this.moreResults.find("img").attr({style: "width: 16px; height: 16px"});
	},

	nextResultsSearchingComplete : function (resultsModel) {
		this.olderResults.html("see older results");
		this.refresh(resultsModel, true);
	},

	refreshExectTime : function () {
		var timeTaken = (this.model.get("time_taken") / 1000).toFixed(3);
		var execTime = (this.model.get("exectime") / 1000).toFixed(3);

		this.exectimeElement.html("( " + timeTaken + " / " + execTime + " )");
	},

	clearPostings : function () {
		//this.postingsContainer.empty();
		_.each(this.postings, function (posting) {
			posting.remove();
		});
		this.postings = [];
		this.results.reset();
		this.stopNextResultsTimer();
		$('.newmatches').hide();
	},

	refreshPostings : function (postings) {
		postings.each(function (posting) {

			if (posting.hasDetails()) {
				postingModel = posting;
			} else {
				postingModel = app.collections.postings.get(posting.get('id'));
			}

			if (postingModel) {
				this.renderPosting(postingModel);
			} else {
				searchService.refreshPostingDetails(posting, $.proxy(this.renderPosting, this));	
			}
		}, this);

		this.$('.heading').highlightQuery();
	},

	renderPosting : function (posting) {
		if (!posting.hasDetails()) {
			app.collections.favorites.removeFromFavorites(posting);
			return;
		} else {
			var posting = new PostingView({model : posting});
			posting.render(this.postingDetails);
			this.postings.push(posting);
			this.postingsContainer.append(posting.$el);
		}
	},

	getDisplayedPostings : function () {
		return this.postingsContainer.find(".posting").length;
	},

	refreshNumMatches : function () {
		var displayedMatchesNumber = this.getDisplayedPostings();
		var numMatches = this.results.getTotalNumMathces();
		this.totalResultsElement.html(numMatches);
		this.displayedResultsElement.html(displayedMatchesNumber);

		if (displayedMatchesNumber < numMatches ) {
			var diff = numMatches - displayedMatchesNumber;
			var rpp = this.searchModel.get('rpp');
			var count = diff < rpp ? diff : rpp;

			this.endOfResults.hide();
			this.olderResults.hide();
			this.moreResults.text('next ' + count + ' results').show();
		} else {
			if (this.model.isNextTierAvailable()) {
				this.olderResults.show();
				this.endOfResults.hide();
			} else {
				this.olderResults.hide();
				this.endOfResults.show();
			}
			
			this.moreResults.hide();
		}
	},

	remove : function () {
		this.clearPostings();
		this.postingDetails.remove();
	}
});