var TopMenuView = BaseView.extend({

	el : "#content",

	events : {
		"click .favorites" : "favoritesHandler",
		"click .saved_searches a" : "savedSearchesHandler",
		"click #top_menu #log_in" : "topMenuSignInHandler",
		"click #top_menu #log_out" : "logOutButtonHandler",
		"click #top_menu #photo_view_button" : "photoViewHandler",
		"click #top_menu #list_view_button" : "listViewHandler",
		"click #top_menu #top_menu_activation_button" : "topMenuActivationHandler",
		"click #subpage_header_back_button" : "backButtonHandler",
		"click #saved_searches .saved_search_container" : "savedSearchButtonHandler"
	},

	render : function () {
		this.$el.append(JST["mobile/templates/top_menu"]());
		this.topMenu = $("#top_menu");
		this.topMenuOffset = $("#top_menu .top_menu_container").height();
		this.topMenu.css({y : - this.topMenuOffset});
		this.refreshButtonsState();
		this.$el.append(this.renderModalsTemplate());
		this.registerForms();
	},

	topMenuSignInHandler : function () {
		this.topMenuActivationHandler();
		this.signInHandler();
	},

	savedSearchButtonHandler : function (event) {
		event.stopPropagation();

		if ($(event.target).hasClass('remove')) {
			this.activeSubpage.deleteSearchHandler(event);
			return;
		}

		var id = event.target.id;
		var searchModel = app.collections.savedSearches.get(id);
		app.models.searchModel.refreshOptionsBySearchModel(searchModel);

		if (app.models.resultsModel) {
			app.models.resultsModel.set({is_complete : false});	
		}
		
		this.backButtonHandler();
		
		if (_.last(app.history) == "results" ) {
			router.currentView.render();
		} else {
			router.navigate("results", {trigger: true});
		}
	},

	signedIn : function () {
		this.setSignedInTopMenuState();
	},

	refreshButtonsState : function () {
		var self = this;
		if (app.models.userModel.get("signedin")) {
			this.signedIn();
		} else {
			if (!this.isSignedInChecked) {
				userService.signedIn(
					function (userModel) {
						self.isSignedInChecked = true;
						if (userModel.get("signedin")) {
							self.signedIn();	
						}
					}
				)
			}
		}
	},

	photoViewHandler : function () {
		this.topMenuActivationHandler();
		router.photoView();
	},

	listViewHandler : function () {
		this.topMenuActivationHandler();
		router.listView();
	},

	topMenuActivationHandler : function (event) {
		var self = this;
		var topMenuContainer = self.topMenu.find('.top_menu_container');
		topMenuContainer.attr({style: "position: static"});
		this.topMenu.toggleClass('active');

		if (this.topMenu.hasClass('active')) {
			this.topMenu.transition({
				y: 0,
				duration: app.PAGE_ANIMAITON_DURATION,
				complete : function () {
					topMenuContainer.attr({style: "position: relative"});
				}
			});
		} else {
			this.topMenu.transition({
				y: -this.topMenuOffset,
				duration: app.PAGE_ANIMAITON_DURATION
			});
		}
	},

	setSignedInTopMenuState : function () {
		$('#top_menu #log_in').hide();
		$('#top_menu #log_out').attr("style", "display: inline-block");
	},

	favoritesHandler : function (event) {
		this.topMenuActivationHandler();
		this.showSubPage(new FavoritesView());
	},

	backButtonHandler : function () {
		var self = this;
		router.currentView.show();
		this.activeSubpage.hide();
	},

	savedSearchesHandler : function (event) {
		this.topMenuActivationHandler();
		this.showSubPage(new SavedSearchesView());
	},

	showSubPage : function (view) {
		if (this.activeSubpage) {
			this.activeSubpage.remove();
		}
		
		this.activeSubpage = view;
		this.activeSubpage.render();
		this.activeSubpage.show();
	}
})

_.extend(TopMenuView.prototype, SignInModalsViewMixin.prototype);