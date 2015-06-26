var SavedSearchesView = BaseView.extend({

	template : JST["mobile/templates/saved_searches"],

	savedSearchTemplate : JST["mobile/templates/saved_search"],

	events : {
		"click #update_search" : "updateSearchHandler",
		"click #delete_search" : "deleteSearchHandler"
	},

	remove : function () {
		$("#saved_searches").remove();
		this.undelegateEvents(this.events);
	},

	updateSearchHandler : function (event) {
		/*event.stopPropagation();
		var options = {
			name : $("#search_name").val()
		}

		searchService.updateSavedSearch(this.selectedSearch, options);

		this.selectedSearch.set(options);
		$("#"+this.selectedSearch.get('id') + " .saved_search_name").html(options.name);
		this.deactivateUpdateSearchDialog();*/
	},

	show: function () {
		var self = this;
		this.scrollY = window.scrollY;
		//$("#favorites").attr("style", "left: 0px; top: 0px; position: absolute; -webkit-transform: translate(0px, " + self.getHeight() * (-1) + ");");
		$("#saved_searches").transition({
			y: "0",
			duration: 500,
			complete : function () {
				window.scrollTo(0,0);
				router.currentView.hide();
				$("#saved_searches").attr("style", "display:block; left: 0px; position: absolute");
				$("#saved_searches").addClass("fixed_header");
			}
		});
	},

	hide : function () {
		var self = this;
		$("#saved_searches").removeClass("fixed_header");
		window.scrollTo(0,0);
		$("#saved_searches").transition({
			y: "100%",
			duration: 500,
			complete : function () {
				self.remove();
				window.scrollTo(0,self.scrollY);
			}
		});
	},

	deleteSearchHandler : function (event) {
		var target = $(event.target);
		var id = target.parent().attr('id');
		var searchModel = app.collections.savedSearches.get(id);
		event.stopPropagation();

		searchService.deleteSavedSearch(searchModel);

		$("#"+searchModel.cid).remove();

		this.deactivateUpdateSearchDialog();
	},

	updateButtonHandler : function (event) {
		var target = $(event.target);
		var id = target.parent().attr('id');

		this.activateUpdateSearchDialog(id);
	},

	activateUpdateSearchDialog : function (id) {
		var searchModel = app.collections.savedSearches.get(id);
		if (searchModel) {
			$("#update_search_dialog").modal("show");
			$("#search_name").val(searchModel.get('name'));
			this.selectedSearch = searchModel;
		}
		
	},

	deactivateUpdateSearchDialog : function () {
		$("#update_search_dialog").modal("hide");
		this.selectedSearch = null;
	},

	render : function () {
		var self = this;

		$("#saved_searches").remove();

		this.$el.append(this.template());

		$("#saved_searches").css({y: "100%"});

		if ((app.models.userModel.get("signedin")) && (!app.collections.savedSearches.getIsSynced())) {
			searchService.fetchSavedSearches(function () {
				self.renderSavedSearches();
			})
		} else {
			this.renderSavedSearches();
		}

		/*$('#update_search_form').submit(function() {
			console.log('update_search_form submit');
			self.deactivateUpdateSearchDialog();
			return false;
		});*/
	},

	renderSavedSearches : function () {
		var savedSearchesContainer = $(".saved_searches_container");

		app.collections.savedSearches.each($.proxy(function(saved_search) {
			var categoryCode = saved_search.getCategoryCode();
			var location = saved_search.get('location');
			
			savedSearchesContainer.append(this.savedSearchTemplate({
				name : saved_search.get('name'),
				id : saved_search.cid,
				category : categoryCode ? labelsUtils.generateCategoryLabel(categoryCode) : "all categories",
				location: location ? location.getLocationName() : 'all locations'
			}));

			if (saved_search.get('location')) {
				this.refreshSavedSearchLocation(saved_search);
			} else {
				locationService.refreshSavedSearchLocation(saved_search, $.proxy(this.refreshSavedSearchLocation, this));
			}
		}, this));
	},

	refreshSavedSearchLocation : function (savedSearch) {
		$("#"+savedSearch.get('id') + " .saved_search_location").html(labelsUtils.generateLocationLabel(savedSearch.get('location')));
	}
});