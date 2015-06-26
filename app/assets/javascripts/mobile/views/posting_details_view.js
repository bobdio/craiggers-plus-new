var PostingDetailsView = BaseView.extend({

	events : {
		"click #posting_details #add_to_favorites_button" : "addToFavoritesHandler"
	},

	template : JST["mobile/templates/posting_details"],

	render : function () {
		
		this.searchModel = app.models.searchModel.clone();
		this.resultsModel = app.models.resultsModel;
		
		if (this.model.hasDetails()) {
			this.renderDetails(this.model);
		} else {
			searchService.refreshPostingDetails(this.model, $.proxy(this.renderDetails, this));
		}

		this.bindFavoritesCollecitonEvents();
	},

	renderDetails : function (model) {
		this.model = model;

		var galleryHolderID = "details_gallery_holder_" + this.model.get("id");

		this.$el.append(this.template({
			id: this.model.get("id"),
			category : labelsUtils.generateCategoryLabel(this.model.get("category")),
			location : labelsUtils.generatePostingDetailsLocationLabel(this.model.get("location")),
			external_url : this.model.get("external_url"),
			timeAgo : labelsUtils.generateTimeAgoLabel(this.model.get("timestamp")),
			gallery_holder_id : galleryHolderID
		}));

		this.model.get("location").once("location_udpated", $.proxy(this.locationUpdated, this));

		this.renderGoogleMapURL();

		this.elements = $("#posting_details");

		$(".body_text").html(this.model.get("body"));
		$(".body_text img").remove();

		this.posting_container = $("#posting_details");

		this.renderPostingHeader($("#posting_details .posting_header"), this.model);

		this.refreshFavoriteButton(this.model);

		this.renderPostingImages(this.model, $("#posting_details #" +this.model.get("id") + " #gallery.gallery"), galleryHolderID, true);

		$(".body_text").highlightQuery();

		hideAddressBar();

		this.progressBar = this.getProgressBar('#posting_details_progress_bar');
		this.progressBar.render();

		var self = this;

		this.bindSwipeLeft("#posting_details", function(event) {
			if (!$(event.target).is(".posting_image")) {
		  		self.postingDragLeftHandler();
		  	}
		});

		this.bindSwipeRight("#posting_details", function(event) {
			if (!$(event.target).is(".posting_image")) {
		  		self.postingDragRightHandler();
		  	}
		});

		searchService.getPostingOlderVersions(this.model, $.proxy(this.refreshPostingOlderVersionsText, this));

		//this.renderMap();
	},

	locationUpdated : function () {
		$("#posting_details .location").html(labelsUtils.generatePostingDetailsLocationLabel(this.model.get("location")));
	},

	renderGoogleMapURL : function () {
		var mapURL = this.model.getSourceMapGoogle();

		if (mapURL !== "") {
			var googlemap = $(document.createElement("iframe"));
			googlemap.attr({
				width:"300",
				height:"300",
				frameborder:"0",
				scrolling:"no",
				marginheight:"0",
				marginwidth:"0",
				src:mapURL + "&output=embed"
			});
			var linkContainer = $(document.createElement('div'));
			linkContainer.addClass("map_link_container");
			var link = $(document.createElement('a'));
			link.html("view in Google maps");
			link.attr({href:mapURL, target : "_blank"});
			linkContainer.append(link);
			$("#posting_details .google_map").append(googlemap);
			$("#posting_details .google_map").append(linkContainer);
		}
	},

	renderMap : function () {
		var location  = this.model.get('location')
		if (!location) {
			return;
		}
		var mapCanvas = document.getElementById('map_canvas');
	    var mapOptions = {
	      center: new google.maps.LatLng(location.get('lat'), location.get('long')),
	      zoom: 8,
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	    }
	    var map = new google.maps.Map(mapCanvas, mapOptions);
	},

	refreshPostingOlderVersionsText : function (results) {
		var postings = results.get('postings');
		
		if (postings.length > 1) {
			
			var dates = [];
			postings.each(function (posting) {
				var date = new Date(posting.get('timestamp')*1000);
				dates.push(date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear());
			}, this);

			var text = "Older versions posted on: " + dates.join();

			$("#posting_details #" +this.model.get("id") + " .older_versions").html(text);
		}
		
	},

	postingDragLeftHandler : function () {
		var posting = app.collections.postings.getNextModel(this.model);

		if (posting) {
			this.navigateToPostingDetailsPage(posting);
		} else {
			this.searchNextResults();
		}
	},

	navigateToPostingDetailsPage : function (posting) {
		if (posting) {
			this.elements.remove();
			this.renderDetails(posting);
		}
	},

	searchNextResults : function () {
		if (this.searchModel.get("is_searching")) {
			return;
		}

		if ((this.resultsModel) && (this.resultsModel.isNextSearchAvailable())) {
			this.progressBar.show();
			window.scrollTo(0,0);
			this.searchModel.setupNextSearchDirection(this.resultsModel);
			searchService.search(this.searchModel, $.proxy(this.nextResultsLoaded, this));
		}
		
	},

	show : function () {
		this.elements.show();
		this.bindFavoritesCollecitonEvents();
	},

	nextResultsLoaded : function (resultsModel) {
		this.progressBar.hide();
		this.resultsModel = resultsModel;
		console.log('nextResultsLoaded')
		this.postingDragLeftHandler();
	},

	postingDragRightHandler : function () {

		this.navigateToPostingDetailsPage(app.collections.postings.getPreviousModel(this.model));
	}
});

_.extend(PostingDetailsView.prototype, FavoritesViewMixin.prototype, PostingViewMixin.prototype, {
	remove : function () {
		this.unbindFavoritesCollecitonEvents();
		this.elements.remove();
		this.undelegateEvents(this.events);
		$('html, body, #content').attr('style', 'height:auto;');
		this.model.get("location").off("location_udpated");
	}
});