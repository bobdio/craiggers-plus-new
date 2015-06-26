var MainView = BaseView.extend({

	events : {
		"click #main_scroller #search_button" : "searchHandler",
		"blur #main_scroller #searchbar_query_input" : "searchbarBlurHandler",
		"focus #main_scroller #searchbar_query_input" : "searchbarFocusHandler",
		"click #main_scroller #location_value" : "activateLocationMenu",
		"click #location_menu #done_button" : "menuSaveHandler",
		"click #location_menu #cancel_button" : "locationMenuCancelHandler",
		
		"click #location_menu .list_item" : "selectLocationsListItem",
		"keyup #location_menu #location" : "locationKeyUpHandler",
		"click #location_menu #location" : "locationClickHandler",
		"focus #location_menu #location" : "locationFocusHandler",
		"blur #location_menu #location" : "locationBlurHandler",
		"change #location_menu #matched_locations" : "locationSelectedHandler",
		"click #location_error_dialog #ok_btn" : "locationErrorOkBtnHandler",
		"click #location_menu #clear_location_button" : "clearLocationHandler"
	},

	template : JST["mobile/templates/main"],

	STATES : {
		location_menu : LocationOptionMenuState
	},

	render : function () {		

		this.header = new MainHeaderView();
		this.header.render({showFavorites : false });

		this.$el.append(this.template());
		this.renderLocationMenu();

		this.delegateEvents(this.events);

		this.refreshItemsValues();

		var self = this;
		$('#main_scroller #search_form').submit(function() {
			self.searchHandler();
			return false;
		});

		this.elements = $(".main_header, #main_scroller, .main_footer");
	},

	refreshItemsValues : function () {
		if (!this.model.get('location')) {
			var savedLocation = userService.getSavedLocation();
			if (savedLocation) {
				this.model.set('location', savedLocation);
			} else {
				this.refreshLocationHandler();
			}
		}

		this.refreshLocation(this.model.get('location'));

		$("#main_scroller input#remember_location").attr("checked", this.model.get('save_location'));

		$("#main_scroller input#searchbar_query_input").val(this.model.get("text"));
	},

	signedIn : function () {
		this.header.signedIn();
	},

	locationClickHandler : function () {
		this.handleCloseKeyboard = false;
	},

	searchbarBlurHandler : function (event) {
		setTimeout($.proxy(function () {
			var focusedElement = $(':focus');
			if ((focusedElement) && (focusedElement.is("#main_scroller #location"))) {
				return;
			}
			if (($("#searchbar_query_input").val() !== "") && (this.handleCloseKeyboard)) {
				this.searchHandler();
			}
		}, this), 100);
	},

	searchbarFocusHandler : function (event) {
		this.handleCloseKeyboard = true;
	},

	searchHandler : function () {
		this.model.resetFilters();
		this.model.set("text", $("#main_scroller #searchbar_query_input").val());
		this.model.set("save_location", $("#main_scroller input#remember_location").attr("checked"));

		if (app.models.resultsModel) {
			app.models.resultsModel.set("is_complete", false);	
		}

		if (this.model.get("save_location")) {
			if (this.model.get('location')) {
				userService.saveLocation(this.model.get('location'));
			}
		}
		
		router.navigate("results", {trigger: true});
	},

	remove : function () {
		this.elements.remove();
		this.removeLocationMenu();
		this.undelegateEvents(this.events);
	}
});

_.extend(MainView.prototype, LocationViewMixin.prototype, OptionMenuViewMixin.prototype);