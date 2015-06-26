//States:

var SaveSearchViewFrequencyMenuState = function () {};
_.extend(SaveSearchViewFrequencyMenuState.prototype, OptionMenuViewState.prototype, {

	id : "save_search_frequency_menu",

	saveHandler : function () {
		this.context.refreshFrequencyText();
		this.context.state.deactivate();
	},

	activate : function () {
		this.context.selectFrequencyItem(this.context.frequencyInput.find("[data="+this.context.frequency+"]"));
		this.context.state.activateMenu();
	}
});

var SaveSearchView = ResultsSubPageView.extend({
	template: JST["mobile/templates/save_search"],

	events : {
		"click #save_search .signed_buttons #user_name_button" : "userNameHandler",

		"click #save_search #cancel_button" : "cancelButtonHandler",
		"click #save_search #save_search_button" : "saveSearchButtonHandler",
		"click #save_search #sign_up_header_button" : "signUpHandler",
		"click #save_search #log_in_button" : "signInHandler",
		"click #save_search #logout_button" : "logOutButtonHandler",
		"click #save_search .search_options input:checkbox" : "checkboxHandler",

		"click .save_search_page_active #cancel_button" : "menuCancelHandler",
		"click .save_search_page_active #done_button" : "menuSaveHandler",
		"click #save_search .accordion-heading a" : "activateStateHandler",
		
		"click #save_search .save_search_item.active .state_activation_item" : "activateStateHandler",
		"click #save_search #search_frequency:not(.active)" : "inactiveNotificationItemHandler",
		"click #save_search #notifications:not(.active)" : "inactiveNotificationItemHandler",

		"click #save_search_frequency_menu .frequency_item" : "frequencyMenuItemHandler"
	},

	userNameHandler : function () {
		//this.cancelButtonHandler();
		this.remove();
		router.navigate("user_profile", {trigger: true});
	},

	render : function () {
		this.$el.append(this.template());
		this.delegateEvents(this.events);
		this.animationElement = $("#save_search_page_container");
		$("#save_search_page_container").css({x: "100%"});

		//caching dom elements
		this.searchNameInput = $("#save_search #search_name_input");
		this.frequencyValue  = $("#save_search #search_frequency .name_value");
		this.frequencyInput  = $("#save_search_frequency_menu .frequency_items");
		this.notificationsSlider = this.getCheckboxSlider("#save_search #notifications .slider-frame", true);
		this.notificationsText = $("#notifications.save_search_item .save_search_item_value .name_value");

		this.isNotificationSliderActive = true;
		var savedFrequencyValue = userService.getFrequencyValue();
		this.frequency = savedFrequencyValue;

		this.renderFrequencyItems();
		this.refreshSelectedFrequencyItem();
		this.refreshFilters();
		this.refreshFrequencyText();

		this.refreshSearchOptions();

		var self = this;
		var swipeThreshold = 20;

		this.renderOptionMenus();

		this.searchCounts = new SearchCountsView({model: this.model});

		if (app.models.userModel.get("signedin")) {
			this.signedIn();
		} else {
			app.models.userModel.once("change:signedin", $.proxy(this.signedIn, this));
		}

		$('#verify_email_modal').submit(function() {
			return false;
		});

		this.focusedSearchNameUtils = new FocusedInputFieldUtils();
		this.focusedSearchNameUtils.registerInputField($("#save_search #search_name_input"), 
			$("#save_search #clear_input_button"));
	},


	refreshSearchOptions : function () {
		var hasImageCheckbox = this.getCheckboxSlider("#save_search #has_image .slider-frame", true);
		var titleOnlyCheckbox = this.getCheckboxSlider("#save_search #title_only .slider-frame", true);
		var hasPriceCheckbox = this.getCheckboxSlider("#save_search #has_price .slider-frame", true);

		hasImageCheckbox.setIsChecked(this.model.get('has_image'));
		titleOnlyCheckbox.setIsChecked(this.model.get('title_only'));
		hasPriceCheckbox.setIsChecked(this.model.get('has_price'));
	},

	logOutButtonHandler : function () {
		window.location.href = "/signout";
	},

	inactiveNotificationItemHandler : function (event) {
		$("#access_to_notifications").modal('show');
	},

	showAnimationFinished : function () {
		this.searchCounts.render("#save_search #search_counts");
		$("#sources_menu, #categories_menu, #status_menu, #price_range_menu, .save_search_menu").addClass("save_search_page_active");
		$(".save_search_page_active #min-price-range, .save_search_page_active #max-price-range").attr("disabled", "disabled");
	},

	hide : function () {
		var self = this;

		this.removeFixedHeader($("#save_search_page_container"));
		$("#results").show();

		setTimeout(function() {
			$("#save_search_page_container").transition({
				x: "100%",
				duration: app.PAGE_ANIMAITON_DURATION,
				complete : function () {
					self.hideAnimationFinished();
				}
			});
		}, 100);
	},

	activateStateHandler : function (event) {
		this.activateState($(event.target).attr('data'));
	},

	STATES : {
		save_search_frequency_menu : SaveSearchViewFrequencyMenuState,
		sources_menu : SourcesOptionMenuState,
		categories_menu : CategoriesOptionMenuState,
		status_menu : StatusOptionMenuState,
		price_range_menu : PriceRangeOptionMenuState
	},

	FREQUENCY_ITEMS : [
		{val:1, name:"Once per hour"},
		{val:12, name:"Once per 12 hours"},
		{val:24, name:"Once per day"},
		{val:168, name:"Once per week"}
	],

	frequencyMenuItemHandler : function (event) {
		this.selectFrequencyItem($(event.target));
	},

	refreshSelectedFrequencyItem : function () {
		var item = this.frequencyInput.find(".frequency_item[data=" + this.frequency + "]");
		if (item.length > 0) {
			this.selectFrequencyItem(item);
		}
	},

	selectFrequencyItem : function (item) {
		this.frequencyInput.find('.frequency_item').removeClass('selected');
		item.addClass('selected');
	},

	renderFrequencyItems : function () {
		this.frequencyInput.find(".frequency_item").remove();
		_.each(this.FREQUENCY_ITEMS, function (itemData) {
			var item = this.renderFrequencyItem(itemData);
			this.frequencyInput.append(item);
		}, this)
	},

	renderFrequencyItem : function (data) {
		var item = $(document.createElement("div"));
		item.attr({class: "frequency_item frequency_body_item", data:data.val});
		
		var itemName = $(document.createElement("div"));
		itemName.attr({class: "item_name"});
		itemName.html(data.name);
		var itemIcon = $(document.createElement("i"));
		itemIcon.addClass("icon-ok bootstrap_icon");
		item.append(itemName);
		item.append(itemIcon);

		return item;
	},

	activateReceiveNotifications : function () {
		$("#search_frequency.save_search_item, #notifications.search_option").addClass('active');
		this.notificationsSlider.activate();
		this.notificationsSlider.setIsChecked(true);
	},

	deactivationReceiveNotificaitons : function () {
		if (!app.models.userModel.get("signedin")) {
			$("#search_frequency.save_search_item, #notifications.search_option").removeClass('active');
		}
		this.notificationsSlider.deactivate();
	},

	clearErrorsText : function () {
		$("#verify_email_modal #errors_holder").empty();
	},

	checkboxHandler : function (event) {
		event.stopPropagation();
		event.preventDefault();
	},

	nameMenuClearButtonHandler : function () {
		this.searchNameInput.val("");
	},

	saveSearchButtonHandler : function (event) {
		var self = this;
		var name = this.searchNameInput.val() == "" ? this.getSaveSearchName() : this.searchNameInput.val();
		searchService.saveSearch(
			name, 
			self.model,
			app.models.userModel,
			this.frequency,
			this.notificationsSlider.getIsChecked(),
			function () {
				self.gotoResults();
			},
			function () {
				console.log('save search error');
				self.gotoResults();
			}
		);
	},

	getSaveSearchName : function () {
		return this.model.get('text') !== "" ? this.model.get('text') : "everything";
	},

	refreshSearchNameValue : function (value) {
		this.searchNameInput.val(value);
	},

	refreshEmailValue : function () {
		$("#search_email.save_search_item .save_search_item_value .name_value").html(this.searchEmail);
	},

	refreshFrequencyText : function () {
		var selectedItem = this.frequencyInput.find(".selected");

		if (selectedItem.length > 0) {
			var text = selectedItem.find(".item_name").html();
			this.frequency = selectedItem.attr('data');
			this.frequencyValue.html(text + " > ");	
		}
	},

	refreshFilters : function () {
		var filtersData = this.model.getFilters();
		var searchName = this.model.get('text') !== "" ? this.model.get('text') : "everything"; 
		
		this.refreshSearchNameValue(searchName);

		var location = this.model.get('location');
		$("#search_locations_filter.save_search_item .save_search_item_value").html(location ? location.get('name') : "All");

		var hasImageCheckbox = this.getCheckboxSlider("#save_search #has_image .slider-frame", true);
		var titleOnlyCheckbox = this.getCheckboxSlider("#save_search #title_only .slider-frame", true);
		var hasPriceCheckbox = this.getCheckboxSlider("#save_search #has_price .slider-frame", true);

		hasImageCheckbox.setIsChecked(this.model.get('has_image'));
		titleOnlyCheckbox.setIsChecked(this.model.get('title_only'));
		hasPriceCheckbox.setIsChecked(this.model.get('has_price'));
	},

	refreshSearchCountFilter : function (items, container) {
		if ((!items) || (items.length < 1)) {
			container.html("All");
			return;
		}

		_.each(items, function (item) {
			var name = labelsUtils.generateCategoryLabel(item.name);
			var item = $(document.createElement("div"));

			item.html(name);
			container.append(item);
		});
	},

	cancelButtonHandler : function (event) {
		this.gotoResults();
	},

	gotoResults : function () {
		userService.saveFrequencyValue(this.frequency);
		this.hide();
	},

	remove : function () {
		$("#access_to_notifications, #save_search_page_container, .save_search_page_active").remove();
		app.models.userModel.off("change:signedin", $.proxy(this.signedIn, this));
		this.undelegateEvents(this.events);
	},

	signedIn : function () {
		if ((!this.frequency) || (this.frequency == "null")) {
			this.frequency = this.FREQUENCY_ITEMS[2].val;	
		}
		
		if (!app.models.userModel.isEmailVerified()) {
			this.searchEmail = "your email isn't verified";
		} else {
			this.activateReceiveNotifications();
			this.searchEmail = app.models.userModel.get('email');
		}

		$("#save_search .header_buttons.sign_buttons").hide();
		$("#save_search .header_buttons.sign_buttons.signed_buttons").show();
		var userImage = $(document.createElement("img"));
		userImage.attr({src: app.models.userModel.get("image")});
		$("#save_search .header_buttons.sign_buttons.signed_buttons #user_name_button .user_image img").remove();
		$("#save_search .header_buttons.sign_buttons.signed_buttons #user_name_button .user_image").prepend(userImage);
		$("#save_search .header_buttons.sign_buttons.signed_buttons #user_name_button .button_label").html(app.models.userModel.get("displayName"));

		this.refreshEmailValue();
		$("#search_email.save_search_item .save_search_item_value .sign_in_buttons").hide();
		this.refreshSelectedFrequencyItem();
		this.refreshFrequencyText();		
	}
});

_.extend(SaveSearchView.prototype, SignInModalsViewMixin.prototype, OptionMenuViewMixin.prototype);