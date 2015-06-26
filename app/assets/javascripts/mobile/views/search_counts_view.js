var SearchCountsView = BaseView.extend({

	template : JST["mobile/templates/search_count"],

	render : function (el) {
		this.$el = $(el);
		this.$el.append(this.template());

		$('#price_range_menu #min-price-range, #price_range_menu #max-price-range').keyup(function () { 
		    this.value = this.value.replace(/[^0-9\.]/g,'');
		});

		this.refreshSearchCounts();	
	},

	selectAllContainerItems : function (containerID) {
		var countContainerID = $(event.target).attr('data');
		this.searchCountsItems[containerID].attr({checked: true});
	},

	clearContainerItems : function (containerID) {
		var countContainerID = $(event.target).attr('data');
		this.clearCountItemsSelection(containerID);
	},

	clearCountItemsSelection : function (containerID) {
		this.searchCountsItems[containerID].attr({checked: false});
	},

	refreshSearchCounts : function (tier) {
		if ((!app.models.resultsModel) || (!app.models.resultsModel.get("is_complete"))) {
			return;
		}

		this.checkboxes = {};

		this.searchCountsItems = {};
		if (app.models.resultsModel.isCountsDataLoaded()) {
			_.each(app.models.resultsModel.get('search_counts'), function (searchCount) {
				this.searchCountIsLoaded(searchCount);
			}, this);
		} else {
			searchService.getSearchCounts(app.models.resultsModel, this.model, $.proxy(this.searchCountIsLoaded, this), tier);
		}

		this.refreshPriceRangeCount();
	},

	searchCountIsLoaded : function (searchCount) {
		var searchCountsHandlers = {
			category : $.proxy(this.refreshSearchCategoryCount, this),
			status : $.proxy(this.refreshSearchStatusCount, this),
			source : $.proxy(this.refreshSearchSourceCount, this)
		}

		var countHandler = searchCountsHandlers[searchCount.get('count_target')];

		if (app.models.resultsModel.isCountsDataLoaded()) {
			
		}

		if (countHandler) {
			countHandler(searchCount);
		}
	},

	applyFilters : function () {
		this.refreshCategoryFilter();
		this.refreshSourceFilter();
		this.refreshStatusFilter();
	},

	refreshCategoryFilter : function () {
		var categories = this.getCountItemsState($("#categories_count_holder"));

		this.model.set("selected_categories", categories.selected);

		this.model.refreshUnselectedCategories(categories.unselected, categories.selected);
	},

	refreshSourceFilter : function () {
		var source = this.getCountItemsState($("#sources_count_holder"));

		this.model.set("selected_source", source.selected);

		this.model.refreshUnselectedSource(source.unselected, source.selected);
	},

	refreshStatusFilter : function () {
		var status = this.getCountItemsState($("#status_count_holder"));

		this.model.set("selected_status", status.selected);

		this.model.refreshUnselectedStatus(status.unselected, status.selected);
	},

	getCountItemsState : function (container) {
		var items = $(container.find(".item_count_tr"));
		var self = this;
		return _.reduce(items, function(memo, item) {
			var checkbox = $(item).find('.checkmark');
			if (self.isCheckboxSelected(checkbox)) {
				memo.selected.push($(item).attr('data'));
			} else {
				memo.unselected.push($(item).attr('data'));
			}

			return memo;

		}, {selected: [], unselected:[]});
	},

	refreshPriceRangeCount : function () {
		$("#price_range_menu #min-price-range").val(this.model.get('min_price'));
		$("#price_range_menu #max-price-range").val(this.model.get('max_price'));
	},

	refreshSearchStatusCount : function (searchCount) {
		this.renderSearchCountItemsView(searchCount, $("#status_wrapper"), 
			this.model.get("unselected_status"), this.model.get("selected_status"), "status_count_holder");
	},

	refreshSearchSourceCount : function (searchCount) {
		this.renderSearchCountItemsView(searchCount, $("#sources_wrapper"), 
			this.model.get("unselected_source"), this.model.get("selected_source"), "sources_count_holder");
	},

	refreshSearchCategoryCount : function (searchCount) {
		this.renderSearchCountItemsView(searchCount, $("#categories_wrapper"), 
			this.model.get("unselected_categories"), this.model.get("selected_categories"), "categories_count_holder");
	},

	SOURCE_NAMES : {
		"craig" : "Craigslist",
		"ebaym" : "Ebay Motors",
		"bkpge" : "Backpage",
		"carsd" : "Cars.com",
		"indee" : "Indeed",
		"hmngs" : "Hemmings Motor News",
		"relms" : "Real Estate MLS",
		"trftr" : "Thryfter.com",
		"aptsd" : "Apartments.com"
	},

	renderSearchCountItemsView : function (searchCount, container, unselectedItems, selectedItems, key) {
		var table = $(container.find('table'));

		table.empty();

		var counts = searchCount.get('counts');

		if (counts.length > 0) {
			_.each(counts, function (countData, counter) {
				var id = key + counter;
				var name = this.SOURCE_NAMES[countData.term.toLowerCase()];
				//hotfix of issue with incorrect status data
				if ((countData.term !== "") && (countData.term !== "status: ")) {
					var item = JST["mobile/templates/search_count_item"]({
						item_id : id,
						item_data : countData.term,
						name : name ? name : labelsUtils.generateCategoryLabel(countData.term),
						count :labelsUtils.getNumberLabel(countData.count),
						icon_class: countData.term.toLowerCase()
					})
					
					table.append(item);

					var checkbox = $("#" + id + ".item_count_tr").find(".checkmark");

					if (unselectedItems !== "all") {
						unselectedItems.indexOf(countData.term) == -1 ? this.selectCheckbox(checkbox) : this.unselectCheckbox(checkbox);
					} else {
						selectedItems.indexOf(countData.term) !== -1 ? this.selectCheckbox(checkbox) : this.unselectCheckbox(checkbox);
					}
				}
			}, this);

			if (key !== "sources_count_holder") {
				$(container.find('.item_icon_td')).hide();
			}
		}

		this.searchCountsItems[key] = $(container.find('input:checkbox'));
	},

	isCheckboxSelected : function (checkbox) {
		return checkbox.hasClass('selected');
	},

	selectCheckbox : function (checkbox) {
		checkbox.addClass("selected");
	},

	unselectCheckbox : function (checkbox) {
		checkbox.removeClass("selected");
	}
});