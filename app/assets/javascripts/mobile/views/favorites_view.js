var FavoritesView = BaseView.extend({

	template : JST["mobile/templates/favorites"],

	events : {
		"click #favorites .posting-details" : "detailsClickHandler",
		"click #favorites #add_to_favorites_button" : "addToFavoritesHandler",
		"click #favorites .load_more_results_container" : "loadMoreFavoritesHandler"
	},

	POSTINGS_LIMIT : 10,

	render : function () {
		this.expiredPostingsNumber = 0;
		this.$el.append(this.template());

		app.collections.favorites.on("sync", $.proxy(this.renderFavorites, this));
		
		this.posting_container = $("#favorites");
		this.favoritesMetrics = $("#favorites .favorites_metrics");
		this.bindFavoritesCollecitonEvents();
		this.lastPostingPosition = 0;
		$("#favorites").css({y: "100%"});

		this.renderFavorites();
	},

	getHeight : function () {
		return  ($("#favorites #accordion").height() + $("#favorites #header").height());
	},

	show: function () {
		var self = this;
		this.scrollY = window.scrollY;
		//$("#favorites").attr("style", "left: 0px; top: 0px; position: absolute; -webkit-transform: translate(0px, " + self.getHeight() * (-1) + ");");
		$("#favorites").transition({
			y: "0",
			duration: 500,
			complete : function () {
				window.scrollTo(0,0);
				router.currentView.hide();
				$("#favorites").attr("style", "display:block; left: 0px; position: absolute");
				$("#favorites").addClass("fixed_header");
			}
		});
	},

	hide : function () {
		var self = this;
		$("#favorites").removeClass("fixed_header");
		window.scrollTo(0,0);
		$("#favorites").transition({
			y: "100%",
			duration: 500,
			complete : function () {
				self.remove();
				window.scrollTo(0,self.scrollY);
			}
		});
	},

	loadMoreFavoritesHandler : function () {
		this.renderFavorites();
	},

	renderFavorites : function () {
		if (this.lastPostingPosition == 0) {
			$("#favorites #accordion").empty();	
		}

		var lastPosition = this.lastPostingPosition + this.POSTINGS_LIMIT;
		lastPosition = lastPosition > (app.collections.favorites.length) ? app.collections.favorites.length : lastPosition;

		for (var i = this.lastPostingPosition; i < lastPosition; i++) {
			posting = app.collections.favorites.at(i);
			var postingModel;

			if (posting.hasDetails()) {
				postingModel = posting;
			} else {
				postingModel = app.collections.postings.get(posting.get('id'));
			}

			if (postingModel) {
				this.renderFavorite(postingModel);
			} else {
				searchService.refreshPostingDetails(posting, $.proxy(this.renderFavorite, this));	
			}
		}

		this.lastPostingPosition = lastPosition;

		this.refreshLoadMoreFavoritesButtonActivation();
	},

	refreshLoadMoreFavoritesButtonActivation : function () {
		if (this.lastPostingPosition < app.collections.favorites.length) {
			$("#favorites .load_more_results_container").show();
		} else {
			$("#favorites .load_more_results_container").hide();
		}
	},

	detailsClickHandler : function (event) {

		var postingId = event.target.id;

		if (!$(event.target).is('.posting-details')) {
			postingId = $(event.target).attr('data');
		}

		if (_.isUndefined(postingId)) {
			return;
		}

		event.stopPropagation();

		this.remove();

		router.navigate("posting_details/"+postingId, {trigger: true});
	},

	renderFavorite : function (posting) {
		if (!posting.hasDetails()) {
			app.collections.favorites.removeFromFavorites(posting);
			this.expiredPostingsNumber ++;
			this.refreshExpiredFavoritesText();
			return;
		}
		var postingView = new PostingView({el:"#favorites #accordion", model: posting});
			postingView.render("favorites_");

		this.postingsCounter++;

		this.refreshFavoriteButton(posting);

		this.refreshFavoritesMetrics();
	},

	refreshFavoritesMetrics : function () {
		var text = "Showing " + $("#favorites .posting").length + " of " + app.collections.favorites.length + " favorites";
		this.favoritesMetrics.html(text);
	},

	refreshExpiredFavoritesText : function () {
		$("#favorites .expired_favorites").html(this.expiredPostingsNumber + " postings have expired");
	}
});

_.extend(FavoritesView.prototype, FavoritesViewMixin.prototype, {
	remove : function () {
		//this.unbindFavoritesCollecitonEvents();
		$("#favorites").remove();
		this.undelegateEvents(this.events);
	}
});