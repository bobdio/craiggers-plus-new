var RefineSearchView = ResultsSubPageView.extend({

	events : {
		"click #refine_search #cancel_button" : "cancelButtonHandler",
		"click #refine_search #search_button" : "searchButtonHandler",
		"click .refine_search_menu.refine_page_active .count_items_holder tr.item_count_tr" : "countItemHandler",
		"click .refine_search_menu.refine_page_active #clear_all" : "clearAllHandler",
		"click #refine_search .accordion-heading a" : "activateStateHandler",
		"click #refine_search #location_value" : "activateLocationMenu",
		"click #location_menu #cancel_button" : "locationMenuCancelHandler",
		"click .refine_search_menu.refine_page_active #done_button" : "menuSaveHandler",
		"blur .refine_search_menu.refine_page_active #max-price-range" : "refreshInputPriceState",
		"blur .refine_search_menu.refine_page_active #min-price-range" : "refreshInputPriceState",

		"keyup #location_menu #location" : "locationKeyUpHandler",
		"focus #location_menu #location" : "locationFocusHandler",
		"blur #location_menu #location" : "locationBlurHandler",
		"change #location_menu #matched_locations" : "locationSelectedHandler",
		"click #location_menu #location_error_dialog #ok_btn" : "locationErrorOkBtnHandler",
		"click #location_menu #clear_location_button" : "clearLocationHandler",
		"click #location_menu .list_item" : "selectLocationsListItem"
	},

	template: JST["mobile/templates/refine_search"],

	render : function () {
		$("#refine_search_container").remove();
		this.$el.prepend(this.template());
		this.animationElement = $("#refine_search");
		this.renderLocationMenu();
		$("#refine_search").css({x: "-100%"});

		this.renderOptionMenus();
		
		this.delegateEvents(this.events);

		this.searchCounts = new SearchCountsView({model: this.model});

		var self = this;
		$('#refine_search #search_form').submit(function() {
			self.searchButtonHandler();
			return false;
		});

		this.hasImageCheckbox = this.getCheckboxSlider("#refine_search #has_image .slider-frame");
		this.titleOnlyCheckbox = this.getCheckboxSlider("#refine_search #title_only .slider-frame");
		this.hasPriceCheckbox = this.getCheckboxSlider("#refine_search #has_price .slider-frame");

		this.refreshSearchOptions();

		this.focusedSearchBarUtils = new FocusedInputFieldUtils();
		this.focusedSearchBarUtils.registerInputField($("#refine_search #searchbar_query_input"), 
			$("#refine_search #clear_search_query_button"));
	},

	STATES : {
		sources_menu : SourcesOptionMenuState,
		categories_menu : CategoriesOptionMenuState,
		status_menu : StatusOptionMenuState,
		price_range_menu : PriceRangeOptionMenuState,
		location_menu : LocationOptionMenuState
	},

	activateStateHandler : function (event) {
		this.activateState($(event.target).attr('data'));
	},

	refreshSearchOptions : function () {
		$("#refine_search #searchbar_query_input").val(this.model.get('text'));

		this.hasImageCheckbox.setIsChecked(this.model.get('has_image'));
		this.titleOnlyCheckbox.setIsChecked(this.model.get('title_only'));
		this.hasPriceCheckbox.setIsChecked(this.model.get('has_price'));

		this.refreshLocation(this.model.get('location'));

		this.searchCounts.refreshSearchCounts();
	},

	showAnimationFinished : function () {
		this.searchCounts.render("#refine_search #search_counts");

		$("#sources_menu, #categories_menu, #status_menu, #price_range_menu, #location_menu").addClass("refine_page_active");
	},

	hide : function () {
		var self = this;

		this.removeFixedHeader($("#refine_search"));
		$("#results").show();

		setTimeout(function() {
			
			$("#refine_search").transition({
				x: "-100%",
				duration: app.PAGE_ANIMAITON_DURATION,
				complete : function () {
					self.hideAnimationFinished();
				}
			});
		}, 100);
	},

	refreshInputPriceState : function () {
		var minValue = this.getMinPriceValue();
		var maxValue = this.getMaxPriceValue();

		if ((minValue !== "") || (maxValue !== "")) {
			if (this.model.validatePrice(minValue, maxValue)) {
				$("#price_range_holder").removeClass('incorrect');
			} else {
				$("#price_range_holder").addClass('incorrect');
			}
		} else {
			$("#price_range_holder").removeClass('incorrect');
		}
	},

	getMinPriceValue : function () {
		return $("#price_range_menu #min-price-range").val();
	},

	getMaxPriceValue : function () {
		return $("#price_range_menu #max-price-range").val();
	},

	clearAllHandler : function (event) {
		var holderID = $(event.target).attr('data');
		//$("#" + holderID + " .slider-frame").removeClass('on');
		$("#" + holderID + " .checkmark").removeClass('selected');

		if (holderID == "price_range_holder") {
			$("#" + holderID + " input").val('');
			this.refreshInputPriceState();
		}
		
	},

	clearHandler : function () {
		var countContainerID = $(event.target).attr('data');
		this.searchCounts.clearContainerItems(countContainerID);
	},
	
	selectAllHandler : function () {
		var countContainerID = $(event.target).attr('data');
		this.searchCounts.selectAllContainerItems(countContainerID);
	},

	cancelButtonHandler : function (event) {
		this.hide();
	},

	searchButtonHandler : function (event) {
		this.model.set({
			text: $("#refine_search #searchbar_query_input").val(),

			title_only : this.titleOnlyCheckbox.getIsChecked(),
			has_image :  this.hasImageCheckbox.getIsChecked(),
			has_price : this.hasPriceCheckbox.getIsChecked(),
			min_price : this.getMinPriceValue(),
			max_price : this.getMaxPriceValue()
		});

		if (app.models.resultsModel) {
			app.models.resultsModel.set("is_complete", false);	
		}

		this.searchCounts.applyFilters();
		this.hide();
	},

	countItemHandler : function (event) {
		if ($(event.target).is("input:checkbox")) {
			return;
		}

		var tr = $(event.target).parent();
		var checkbox = $(tr.find('.checkmark'));

		this.searchCounts.isCheckboxSelected(checkbox) ? this.searchCounts.unselectCheckbox(checkbox) : this.searchCounts.selectCheckbox(checkbox);
	},

	remove : function () {
		$(".refine_page_active").remove();
		$("#refine_search").remove();
		this.removeLocationMenu();
		this.undelegateEvents(this.events);
	}
})

_.extend(RefineSearchView.prototype, OptionMenuViewMixin.prototype, LocationViewMixin.prototype);