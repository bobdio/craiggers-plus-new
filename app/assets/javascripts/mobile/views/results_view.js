var ResultsView = BaseView.extend({

	events : {
		"click #results #search_button" : "refineSearchHandler",
		"click #results #load_more_results" : "searchNextResults",
		"click #results .posting-details" : "detailsClickHandler",
		"click #results #add_to_favorites_button" : "addToFavoritesHandler",

		"click #results #save_search_button" : "saveSearchButtonHandler",
		"click .posting .source_icon_container" : "sourceIconHandler",
		"click .posting .category_container.sub_category" : "categoryIconHandler",
		"click .posting #contact_button.selectable" : "postingContactButtonHandler"
	},

	refreshScrollPosition : function () {
		if (this.scrollY) {
			window.scrollTo(0, this.scrollY);
		}
	},

	template : JST["mobile/templates/results"],

	render : function (isNotRemoved) {	
		$('html, body').attr('style', 'height:auto;');

		if ((app.models.resultsModel) && (app.models.resultsModel.get("is_complete"))) {

			if (!isNotRemoved) {
				this.delegateEvents(this.events);
				this.bindFavoritesCollecitonEvents();
			}

			$("#results").show();

			this.refreshScrollPosition();

			this.topMenu.show();
			this.refreshTopMenuButtonsState();

			return;
		}

		$("#results, #contact_modal").remove();

		this.$el.append(this.template());
		$("#results").attr({style: "height: 100%"});
		$("#results_scroller").attr({style: "height: auto"});

		this.elements = $("#results");

		this.removeSubPages();
		this.renderProgressBars();

		this.refreshItemsValues();

		this.topMenu = $("#top_menu");
		this.refreshTopMenuButtonsState();

		this.registerForms();

		setTimeout(function () {
			self.startSearching();
		}, 1000);

		this.bindFavoritesCollecitonEvents();

		var self = this;
		
		$('#search_form').submit(function() {
			self.searchHandler();
			$('#searchbar_query_input.input').blur();
			return false;
		});
	},

	refreshItemsValues : function () {
		$("#results #searchbar_query_input").html(this.model.get("text") == "" ? "everything" : this.model.get("text"));
		this.refreshFiltersText();
		var self = this;
		var location = this.model.get('location');
		if ((location) && (!location.get('isDataFull'))) {
			app.models.syncModel.once('change:is_locations_synced', function (value) {
				if (value) {
					self.model.refreshLocationModel();
					self.refreshFiltersText();
				}
			});
		}
	},

	renderProgressBars : function () {
		this.topProgressBar = this.getProgressBar('#top_progress_bar');
		this.topProgressBar.render();

		this.bottomProgressBar = this.getProgressBar('#bottom_progress_bar');
		this.bottomProgressBar.render();
	},

	photoViewHandler : function () {
		$("#results").removeClass('list_view');
		this.refreshTopMenuButtonsState();
	},

	listViewHandler : function () {
		$("#results").addClass('list_view');
		this.refreshTopMenuButtonsState();
	},

	refreshTopMenuButtonsState : function () {
		if ($("#results").hasClass('list_view')) {
			this.topMenu.find("#list_view_button").addClass('active');
			this.topMenu.find("#photo_view_button").removeClass('active');
		} else {
			this.topMenu.find("#photo_view_button").addClass('active');
			this.topMenu.find("#list_view_button").removeClass('active');
		}
	},

	signedIn : function () {
		this.setSignedInTopMenuState();
	},

	postingContactButtonHandler : function (event) {
		event.stopPropagation();

		if (this.model.get("is_searching")) {
			return;
		}

		var postingId = $(event.target).attr('data');

		var posting = this.resultsModel.get('postings').get(postingId);

		if (posting) {
			var sourceAccount = posting.getSourceAccount();
			var sourcePhone = labelsUtils.getPhoneNumberLabel(posting.getSourcePhone());
			var sourceAccountLink = "mailto:" + sourceAccount;
			var sourcePhoneLink = "tel:" + posting.getSourcePhone();

			var email = $("#contact_form").find('.email a');
			email.html("Email: " + sourceAccount);
			email.attr('href', sourceAccountLink);
			var phone = $("#contact_form").find('.phone a');
			phone.html("Phone : " + sourcePhone);
			phone.attr('href', sourcePhoneLink);

			$("#contact_modal").modal("show");
		}
	},

	categoryIconHandler : function (event) {
		var categoryID = $(event.target).attr("id");

        this.model.set("selected_categories", [categoryID]);
        this.model.set("unselected_categories", 'all');

         if ($(event.target).hasClass('selected')) {
        	this.model.set("selected_categories", []);
        	this.model.set("unselected_categories", []);
        } else {
        	this.model.set("selected_categories", [categoryID]);
        	this.model.set("unselected_categories", 'all');
        }

        setTimeout(function() {
                window.scrollTo(0, 0);
        }, 1000);

        this.searchHandler();
	},

	sourceIconHandler : function (event) {
        var sourceID = $(event.target).find('#source-icon').attr("class").toUpperCase();

        if ($(event.target).hasClass('selected')) {
        	this.model.set("selected_source", []);
        	this.model.set("unselected_source", []);
        } else {
        	this.model.set("selected_source", [sourceID]);
        	this.model.set("unselected_source", 'all');
        }

        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 1000);

        this.searchHandler();
    },

	refreshFiltersText : function () {
		var location = this.model.get('location');
		var filtersText = (location ? location.get('name') : "All locations");

		if (this.model.isFiltered()) {
			filtersText += " & filters";
		}
		$("#results #search_filters").html(filtersText);
	},

	removeSubPages : function () {
    	if (this.refineSearchView) {
    		this.refineSearchView.remove();
    	}

    	if (this.saveSearchView) {
    		this.saveSearchView.remove();
    	}
    },

	saveSearchButtonHandler : function () {
		this.saveSearchView = new SaveSearchView({model: this.model});
		this.activateSubPage(this.saveSearchView);
    },

	refineSearchHandler : function () {
		this.refineSearchView = new RefineSearchView({model: this.model})
		this.activateSubPage(this.refineSearchView);
	},

	activateSubPage : function (subPage) {
		var self = this;
		this.scrollY = window.scrollY;

		subPage.render();

		setTimeout(function () {
			subPage.show({
				close: function() {	
					self.render(true);
				}
			});
		}, 10);
	},

	searchHandler : function (event) {
		if (event) {
			event.stopPropagation();
		}

		if (this.model.get("is_searching")) {
			return;
		}

		this.startSearching();
	},

	startSearching : function () {
		this.topProgressBar.show();

		app.collections.postings.reset();

		this.model.set({
			page: 0,
			tier: 0
		});

		searchService.search(this.model, $.proxy(this.searchingComplete, this));
	},

	searchNextResults : function () {
		if (this.model.get("is_searching")) {
			return;
		}

		this.bottomProgressBar.show();
		$('.load_more_results_container').hide();
		
		searchService.searchNextPostings(this.model, $.proxy(this.nextResultsSearchingComplete, this));
	},

	showLoadMoreResults : function () {
		if ((this.resultsModel) && (this.resultsModel.isNextSearchAvailable())) {
			$('.load_more_results_container').show();
			
		} else {
			//$('#load_more_results').html("End of results");
		}
	},

	nextResultsSearchingComplete : function (resultsModel) {
		if (resultsModel) {
			this.resultsModel = app.models.resultsModel = resultsModel;
		}

		this.addResultsModelToTiersMap(resultsModel);

		this.bottomProgressBar.hide();

		this.showLoadMoreResults();
		
		this.renderResults(resultsModel);
	},

	hide : function () {
		$("#results, #refine_search, .save_search_menu, #save_search").hide();
	},

	show : function () {
		$("#results, #refine_search, .save_search_menu, #save_search").show();
		this.unbindFavoritesCollecitonEvents();
		this.bindFavoritesCollecitonEvents();
	},

	searchingComplete : function (resultsModel) {
		if (!resultsModel) {
			return;
		}

		this.resultsModelsMap = {};
		
		this.resultsModel = app.models.resultsModel = resultsModel;
		this.addResultsModelToTiersMap(resultsModel);

		this.clearPreviousResults();

		if ((this.resultsModel.get('num_matches') == 0) && (this.resultsModel.isNextSearchAvailable())) {
			this.topProgressBar.hide();
			this.model.set("is_searching", false);
			this.searchNextResults();
			return;
		}

		this.showLoadMoreResults();
		this.renderResults(resultsModel);

		this.topProgressBar.hide();
	},

	addResultsModelToTiersMap : function (resultsModel) {
		if (!this.resultsModelsMap) {
			this.resultsModelsMap = {};
		}
		this.resultsModelsMap[resultsModel.get('tier')] = resultsModel;
	},

	clearPreviousResults : function () {
		$("#accordion").empty();
	},

	renderResults : function (resultsModel) {
		resultsModel.get("postings").each(function(posting) {

			if ($("#"+posting.get("id")).length == 0) {
				var postingView = new PostingView({model: posting});
				postingView.render();
				
				this.refreshFavoriteButton(posting);
			}
		}, this);

		this.refreshSearchMetrics();

		this.lastPosting = $(_.last($(".posting")));
	},

	refreshSearchMetrics : function () {
		var searchTime = (this.resultsModel.get("time_taken")/1000).toFixed(3);;
		var numMatches = 0;
		var text = "";

		// for results with tier == 0
		if (!this.resultsModelsMap[1]) {
			numMatches = labelsUtils.getNumberLabel(this.resultsModel.get('num_matches'));
			text = " in the last 3 days";
		} else {
			// summing up postings number in result models with different tier value
			numMatches = 0;
			_.each(this.resultsModelsMap, function (resultsModel) {
				numMatches += resultsModel.get('num_matches');
			});
			text = " in the last week";
			numMatches = labelsUtils.getNumberLabel(numMatches);
		}

		$(".search_metrics").html("About " + numMatches + " results (" + searchTime + " seconds)" + text);
	},

	detailsClickHandler : function (event) {

		if (this.model.get("is_searching")) {
			return;
		}

		var postingId = event.target.id;

		if (!$(event.target).is('.posting-details')) {
			postingId = $(event.target).attr('data');
		}

		if (_.isUndefined(postingId)) {
			return;
		}

		event.stopPropagation();

		router.navigate("posting_details/"+postingId, {trigger: true});
	}
});

_.extend(ResultsView.prototype, FavoritesViewMixin.prototype, SignInModalsViewMixin.prototype, {
	remove : function () {
		this.scrollY = window.scrollY;
		this.undelegateEvents(this.events);
		this.hide();
		this.topMenu.find("#photo_view_button, #list_view_button").removeClass('active');
	}
});