/**
* This mixin module contains view methods for searching, refreshing and rendering locations
*/

var LocationViewMixin = (function () {

	var module = function() {};

	_.extend(module.prototype, {
		locationSelectedHandler : function (event) {
			this.refreshLocation(this.matchedLocations.get("locations").get($(event.target).val()));
		},

		locationFocusHandler : function (event) {

			if (!this.focusedLocationUtils) {
				this.focusedLocationUtils = new FocusedInputFieldUtils();
			}

			this.focusedLocationUtils.focus();

			var self = this;
			setTimeout(function () {
				self.addLocationInputEvents();
			}, 100)
			
		},

		deactiveLocationInput : function (event) {
			$("#location_menu #location").blur();
		},

		/**
		* Focus of location field should be removed in case of scrolling
		*/
		addLocationInputEvents : function () {
			$(window).on("scroll", $.proxy(this.deactiveLocationInput, this));
		},

		removeLocationInputEvents : function () {
			$(window).off("scroll", $.proxy(this.deactiveLocationInput, this));
		},

		locationBlurHandler : function (event) {
			this.removeLocationInputEvents();

			// Set first location in case of exist only one rendered location
			if ((this.renderedLocations) && (this.renderedLocations.length == 1)) {
				this.refreshLocation(this.renderedLocations[0]);
				return;
			}

			// If there are no matched locations set previous location
			if ((!this.matchedLocations) || (this.matchedLocations && (this.matchedLocations.get("numMatches") <= 0))) {
				this.refreshLocation(this.model.get("location"));
			}

			this.focusedLocationUtils.blur();
		},

		locationKeyUpHandler : function (event) {
			$("#matched_locations, #matched_locations_message").hide();

			var location = event.target.value;

			if (location.length < 3) {
				return;
			}

			locationService.searchLocation(location, $.proxy(this.refreshMatchedLocations, this));
		},

		refreshMatchedLocations : function (matchedLocations) {
			this.matchedLocations = matchedLocations;
			var locations = matchedLocations.get("locations");
			this.renderedLocations = [];

			if (locations) {
				var locationsHolder = $("#matched_locations");
				locationsHolder.show();
				locationsHolder.empty();
				
				locations.each(function (location) {
					if (location.isMatchedLevel()) {
						locationsHolder.append(this.renderMatchedLocation(location.get("code"), location.get("level") + ": "+location.get("locationName")));
						this.renderedLocations.push(location);
					}
				}, this);

			} else {
				if (matchedLocations.get("numMatches") > 0) {
					$("#matched_locations_message").show();
					$("#matched_locations_message").html("Found " + matchedLocations.get("numMatches") + " locations");
				}
			}
		},

		selectLocationsListItem : function (item) {
			//var val = $(item).attr("data");
			$("#matched_locations").find('.list_item').removeClass('selected');
			var selectedItem = $(event.target);
			selectedItem.addClass('selected');
			this.refreshLocation(this.matchedLocations.get("locations").get(selectedItem.attr('id')));
		},

		renderMatchedLocation : function (id, name) {
			var item = $(document.createElement("div"));
			item.attr({class: "list_item list_body_item", id:id});
			
			var itemName = $(document.createElement("div"));
			itemName.attr({class: "item_name"});
			itemName.html(name);
			itemName.highlightQuery($("#location_menu #location").val(), true);
			var itemIcon = $(document.createElement("i"));
			itemIcon.addClass("icon-ok bootstrap_icon");
			item.append(itemName);
			item.append(itemIcon);

			return item;
		},

		refreshLocationHandler : function () {
			locationService.geolocate($.proxy(this.refreshLocation, this), $.proxy(this.noLocationHandler, this));
			$("#location").addClass("ml-loading-img");
		},

		noLocationHandler : function () {
			console.log('no location handler');
			this.refreshLocation(null);

			if ($("#location_error_dialog").length > 0) {
				$("#location_error_dialog").modal("show");
			}
		},

		locationErrorOkBtnHandler : function (event) {
			$("#location_error_dialog").modal("hide");
		},

		locationMenuCancelHandler : function () {
			this.refreshLocation(this.savedLocation);
			this.menuCancelHandler();
		},

		activateLocationMenu : function () {
			this.savedLocation = this.model.get('location');
			this.hideMatchedLocations();
			this.activateState("location_menu");
		},

		refreshLocation : function (location) {
			$("#location_menu #location").removeClass("ml-loading-img");

			var locationValue = "All locations";
			if (location) {
				locationValue = location.get("name");
				this.model.set("location", location);
				this.checkSaveLocationActivation();
			}

			$("#location_menu #location").val(locationValue);
			$("#location_value").html(locationValue);
		},

		renderLocationMenu : function () {
			this.removeLocationMenu();
			this.$el.append(JST["mobile/templates/location_menu"]());
		},

		removeLocationMenu : function () {
			$("#location_menu").remove();
		},

		clearLocationHandler : function (event) {
			if ((this.focusedLocationUtils) && (this.focusedLocationUtils.isFocused())) {
				$("#location_menu input#location").val("");
				$("#location_menu #location").focus();
			} else {
				this.refreshLocation(app.models.allLocations);
			}
			
			this.hideMatchedLocations();
		},

		hideMatchedLocations : function () {
			$("#matched_locations, #matched_locations_message").hide();
		},

		checkSaveLocationActivation : function () {
			if (this.model.get('location')) {
				$('.remember_location').css({display: "inline-block"});
			} else {
				$('.remember_location').css({display: "none"});
			}
		}
	})

	return module;
}());

var LocationOptionMenuState = function () {};
_.extend(LocationOptionMenuState.prototype, OptionMenuViewState.prototype, {

	id : "location_menu",

	saveHandler : function () {
		this.context.state.deactivate();
	},

	activate : function () {
		this.context.state.activateMenu();
	}
});