var AddNewPostingState = function () {};
_.extend(AddNewPostingState.prototype, OptionMenuViewState.prototype, {

	id : "add_new_posting_menu",

	activated : function () {
		$("#postings_manager").hide();
	},

	deactivate : function () {
		this.context.state.deactivateMenu();
		$("#postings_manager").show();
	},

	activateUpdateState : function () {
		$("#add_new_posting_menu #header .title").html("Update Posting");
		$("#add_new_posting_menu #save_button").hide();
		$("#add_new_posting_menu #update_button").show();
		$("#add_new_posting_menu #remove_button").show();
	},

	deactivateUpdateState : function () {
		$("#add_new_posting_menu #header .title").html("Add New Posting");
		$("#add_new_posting_menu #save_button").show();
		$("#add_new_posting_menu #update_button").hide();
		$("#add_new_posting_menu #remove_button").hide();
	}
});

var PostingCategoryGroupState = function () {};
_.extend(PostingCategoryGroupState.prototype, OptionMenuViewState.prototype, {

	id : "posting_category_groups_menu",

	activated : function () {
		$("#add_new_posting_menu").hide();
	},

	deactivate : function () {
		this.context.state.deactivateMenu();
		$("#add_new_posting_menu").show();
	}
});

var PostingCategoryState = function () {};
_.extend(PostingCategoryState.prototype, OptionMenuViewState.prototype, {

	id : "posting_categories_menu",

	activated : function () {
		$("#posting_category_groups_menu").hide();
	},

	deactivate : function () {
		this.context.state.deactivateMenu();
		$("#posting_category_groups_menu").show();
	}
});

var PostingImagesState = function () {};
_.extend(PostingImagesState.prototype, OptionMenuViewState.prototype, {
	id : "posting_images_menu",

	activated : function () {
		$("#add_new_posting_menu").hide();
	},

	deactivate : function () {
		this.context.state.deactivateMenu();
		$("#add_new_posting_menu").show();
	}
});

var PostingsManagerView = BaseView.extend({

	events : {
		"click #postings_manager #add_new_posting" : "activateAddNewPostingMenu",
		"click #postings_manager .user_posting .item_name" : "userPostingClickHandler",
		"click #add_new_posting_menu .items_holder #posting_location" : "activateLocationMenuHandler",
		"click #add_new_posting_menu .items_holder #posting_category" : "activateCategoryMenu",
		"click #add_new_posting_menu .items_holder #posting_images" : "activatePostingImagesMenu",
		"click #add_new_posting_menu #done_button" : "menuCancelHandler",
		"click #add_new_posting_menu .items_holder #update_button" : "updatePosting",
		"click #add_new_posting_menu .items_holder #remove_button" : "removePosting",

		"click #posting_category_groups_menu #done_button" : "postingCategoryGroupsMenuDoneHandler",
		"click #posting_category_groups_menu .option_item_container.category" : "categoryGroupHandler",

		"click #posting_images_menu #done_button" : "postingImagesMenuDoneHandler",
		"click #posting_images_menu #choose_image" : "chooseImageHandler",
		"click #posting_images_menu #remove_button" : "removeImageButtonHandler",

		"click #posting_categories_menu #done_button" : "postingCategoriesMenuDoneHandler",
		"click #posting_categories_menu .option_item_container.category" : "categoryItemHandler",

		"click #location_menu #done_button" : "locationMenuSaveHandler",
		"click #location_menu #cancel_button" : "deactivateAddNewPostingSubMenu",
		"click #location_menu .list_item" : "selectLocationsListItem",
		"keyup #location_menu #location" : "locationKeyUpHandler",
		"click #location_menu #location" : "locationClickHandler",
		"focus #location_menu #location" : "locationFocusHandler",
		"blur #location_menu #location" : "locationBlurHandler",
		"change #location_menu #matched_locations" : "locationSelectedHandler",
		"click #location_error_dialog #ok_btn" : "locationErrorOkBtnHandler",
		"click #location_menu #clear_location_button" : "clearLocationHandler"
	},

	template : JST["mobile/templates/postings_manager"],

	render : function () {
		this.$el.append(this.template());

		this.message = $("#postings_manager #message");
		this.itemsContainer = $("#postings_manager .items_container");
		this.postingHeading =  $("#add_new_posting_menu #heading");
		this.postingDescription = $("#add_new_posting_menu #description");

		this.postingPrice = $("#add_new_posting_menu .items_holder #posting_price");
		this.postingCurrency = $("#add_new_posting_menu .items_holder #posting_currency");
		this.postingLocation = $("#add_new_posting_menu .items_holder #posting_location");
		this.postingCategory = $("#add_new_posting_menu .items_holder #posting_category");
		this.postingImages = $("#add_new_posting_menu .items_holder #posting_images");
		this.postingsContainer = $("#postings_manager .items_container");
		this.postingPhone = $("#add_new_posting_menu .items_holder #posting_phone");
		this.postingEmail = $("#add_new_posting_menu .items_holder #posting_email");

		if (app.models.userModel.get("signedin")) {
			this.signedIn();
		} else {
			this.itemsContainer.hide();
			app.models.userModel.once("change:signedin", $.proxy(this.signedIn, this));
		}
	},

	chooseImageHandler : function (event) {
		$("#posting_images_menu #error_messages").html("");
		$("#posting_images_menu input#file-1").click();
		//this.appendUploadedImage("http://s3.amazonaws.com/3taps_storage/r693b5c44d66a78887825f0f09f8a6e4b426e603a.jpg");
	},

	initFileUploader : function (event) {
		var self = this;
		$("#posting_images_menu #upload_posting_image").fileupload({
			dataType: 'json',
        	loadImageMaxFileSize: 1000000,

        	add : function (e, data) {
        		self.addProgressBar();
        		data.submit();
        	},

        	done : function (e, data) {
        		console.log(data);
        		self.removeProgressBar();
        		if (data.result.success) {
        			var imageData = JSON.parse(data.result.image);
        			self.model.addImage(imageData);
        			self.appendUploadedImage(imageData.full);
        		} else {
        			$("#posting_images_menu #error_messages").html(data.result.error);
        		}
        	}
		});
	},

	userPostingClickHandler : function (event) {
		var id = event.target.id;

		var posting = this.postings.get(id);
		if (posting) {
			this.activateAddNewPostingMenu(event, posting);
		}
	},

	removeImageButtonHandler : function (event) {
		var removeButton = $(event.target);
		var url = removeButton.attr("data");
		this.model.removeImage(url);
		removeButton.parent().remove();
	},

	addProgressBar : function () {
		var div = $(document.createElement("div"));
		div.attr({id: "uploading_progress_bar"});
		$("#posting_images_menu #uploaded_images").append(div);
		this.progressBar = this.getProgressBar('#posting_images_menu #uploaded_images #uploading_progress_bar');
		this.progressBar.render();
		this.progressBar.show();
	},

	removeProgressBar : function () {
		this.progressBar.hide();
		$('#posting_images_menu #uploaded_images #uploading_progress_bar').remove();
	},

	activateLocationMenuHandler : function () {
		var locationState = this.activateLocationMenu();
		locationState.setParentMenuID("add_new_posting_menu");
	},

	appendUploadedImage : function (url) {
		var div = $(document.createElement("div"));
		div.attr({class: "posting_gallery_image"});

		var image = this.renderImage(url);
		var removeButton = this.renderRemoveImageButton(url);

		div.append(image);
		div.append(removeButton);
		$("#posting_images_menu #uploaded_images").append(div);
	},

	appendPostingImages : function () {
		var self = this;
		$("#posting_images_menu #uploaded_images").empty();

		_.each(this.model.get("images"), function (image) {
			self.appendUploadedImage(image.full);
		});
	},

	renderRemoveImageButton : function (url) {
		var removeButtonContainer = $(document.createElement("button"));
		removeButtonContainer.attr({class: "remove_button_container", id: "remove_button", data: url});

		var removeButton = $(document.createElement("div"));
		removeButton.attr({class: "clear_button_image"});

		removeButtonContainer.append(removeButton);

		return removeButtonContainer;
	},

	postingCategoriesMenuDoneHandler : function (event) {
		this.menuCancelHandler();
		this.setState(this.categoryState);
	},

	postingImagesMenuDoneHandler : function (event) {
		this.deactivateAddNewPostingSubMenu();
		this.refreshPostingImages();
	},

	categoryGroupHandler : function (event) {
		var categoryCode = event.target.id;
		var category = app.collections.categories.getCategoryByCode(categoryCode);

		if (category) {
			this.activateState("posting_categories_menu");

			this.renderCategoriesMenu(category);
		}
	},

	categoryItemHandler : function (event) {
		var categoryCode = event.target.id;

		if (this.model.get("category") == categoryCode) {
			this.clearMarkedCategories();
			return;	
		}

		var category = app.collections.categories.getCategoryByCode(categoryCode);

		if (category) {
			this.markCategoryAsSelected(category.get("code"));
		}
	},

	renderCategoriesMenu : function (categoryGroup) {
		$("#posting_categories_menu .title").html(categoryGroup.get("name"));
		var categoriesHolder = $("#posting_categories_menu .items_holder");
		categoriesHolder.empty();
		var self = this;

		categoryGroup.get("subcats").each(function (category) {
			categoriesHolder.append(self.renderCategory(category));

			if (self.model.get("category") == category.get("code")) {
				self.markCategoryAsSelected(category.get("code"));
			}
		});

		this.refreshPostingCategory();
	},

	activatePostingImagesMenu : function (event) {
		this.appendPostingImages();
		this.activateState("posting_images_menu");
	},

	activateCategoryMenu : function (event) {
		this.categoryState = this.activateState("posting_category_groups_menu");
	},

	deactivateAddNewPostingSubMenu : function () {
		this.menuCancelHandler();
		this.setState(this.addNewPostingsState);
	},

	postingCategoryGroupsMenuDoneHandler : function (event) {
		this.deactivateAddNewPostingSubMenu();
		this.refreshPostingCategory();
	},

	locationMenuSaveHandler : function (event) {
		event.stopPropagation();
		this.menuCancelHandler();
		this.setState(this.addNewPostingsState);
		this.refreshPostingLocation();
	},

	refreshPostingLocation : function () {
		if ((this.model) && (this.model.get('location').get('name') !== "")) {
			this.postingLocation.html(this.model.get('location').get('name'));
		} else {
			this.postingLocation.html("Enter location");
		}

		this.refreshLocation(this.model.get('location'));
	},

	refreshPostingCategory : function () {
		if ((this.model) && (this.model.get('category') !== "")) {
			var category = app.collections.categories.getCategoryByCode(this.model.get('category'));

			if (category) {
				this.postingCategory.html(labelsUtils.generateCategoryLabel(category.get("code")));
			}
		} else {
			this.postingCategory.html("Enter category");
		}
	},

	refreshPostingImages : function () {
		if (this.model.get("images").length > 0) {
			this.postingImages.html("Images attached");
		} else {
			this.postingImages.html("Attach images");
		}
	},

	STATES : {
		add_new_posting_menu : AddNewPostingState,
		location_menu : LocationOptionMenuState,
		posting_category_groups_menu : PostingCategoryGroupState,
		posting_categories_menu : PostingCategoryState,
		posting_images_menu : PostingImagesState
	},

	renderCategoryGroups : function () {
		if (app.models.syncModel.get("is_categories_synced")) {
			this.categoriesSynced();
		} else {
			app.models.syncModel.once("change:is_categories_synced", $.proxy(this.categoriesSynced, this));
		}
	},

	categoriesSynced : function () {
		var categoriesGroupHolder = $("#posting_category_groups_menu .items_holder");
		var self = this;
		app.collections.categories.each(function(category) {
			categoriesGroupHolder.append(self.renderCategoryGroup(category));
		});

		this.refreshPostingCategory();
	},

	clearMarkedCategories : function () {
		$(".categories_menu .checkmark").removeClass("selected");
		this.model.set("category", "");
	},

	markCategoryAsSelected : function (categoryCode) {
		this.clearMarkedCategories();
		$(".categories_menu #" + categoryCode + " .checkmark").addClass("selected");
		this.model.set("category", categoryCode);
	},

	renderCategory : function (category) {
		var element = $(document.createElement("div"));
		element.attr({class: "option_item_container category", id: category.get("code")});

		var categoryName = $(document.createElement("div"));
		categoryName.attr({class : "posting_category_name"});
		categoryName.html(category.get("name"));

		var checkmarkContainer = $(document.createElement("div"));
		checkmarkContainer.attr({class: "checkmark_container"});
		var checkmark = $(document.createElement("div"));
		checkmark.attr({class: "checkmark"});
		checkmarkContainer.append(checkmark);

		element.append(checkmarkContainer);

		element.append(categoryName);

		return element;
	},

	renderCategoryGroup : function (category) {
		var element = this.renderCategory(category);

		var arrow = this.renderArrow();

		element.prepend(arrow);

		return element;
	},

	renderArrow : function () {
		var arrow = $(document.createElement("div"));
		arrow.attr({class: "arrow"});
		arrow.html(">");

		return arrow;
	},

	signedIn : function () {

		this.message.hide();

		this.renderLocationMenu();

		this.itemsContainer.show();

		this.renderCategoryGroups();

		var self = this;

		this.refreshUserPostingsList();

		this.initFileUploader()

		$("#new_posting_form").submit(function(event) {
			self.refreshPostingModelState();

			var errors = self.model.validatePostingCreationData();
			self.refreshPostingForm(errors);

			if (_.size(errors) == 0) {
				userService.createPosting(self.model, $.proxy(self.postingCreated, self));
			}

			return false;
		});
	},

	removePosting : function (event) {
		userService.deletePosting(this.model, $.proxy(this.postingRemoved, this));
	},

	updatePosting : function (event) {
		this.refreshPostingModelState();

		var errors = this.model.validatePostingCreationData();
		this.refreshPostingForm(errors);

		if (_.size(errors) == 0) {
			userService.updatePosting(this.model, $.proxy(this.postingUpdated, this));
		}
	},

	postingRemoved : function (event) {
		var posting = $("#" + this.model.get("id") + ".user_posting");
		this.postings.remove(this.model);
		posting.remove();

		this.menuCancelHandler();
	},

	postingUpdated : function (posting) {
		var postingTitle = $("#" + this.model.get("id") + ".user_posting .item_name");
		postingTitle.html(this.model.get("heading"));
		this.menuCancelHandler();
	},

	refreshPostingModelState : function () {
		this.model.set("heading", this.postingHeading.val());
		this.model.set("body", this.postingDescription.val());
		this.model.set("price", this.postingPrice.val());
		this.model.set("currency", this.postingCurrency.val());
		this.model.setSourcePhone(this.postingPhone.val());
		this.model.setSourceAccount(this.postingEmail.val());
	},

	refreshPostingForm : function (errors) {
		this.postingHeading.removeClass("invalid");
		this.postingLocation.removeClass("invalid");
		this.postingCategory.removeClass("invalid");
		this.postingDescription.removeClass("invalid");

		if (errors.heading) {
			this.postingHeading.addClass("invalid");
		}

		if (errors.location) {
			this.postingLocation.addClass("invalid");
		}

		if (errors.category) {
			this.postingCategory.addClass("invalid");
		}

		if (errors.body) {
			this.postingDescription.addClass("invalid");
		}
	},

	refreshUserPostingsList : function () {
		var self = this;

		userService.getUserPostings(function(postings) {
			self.renderUserPostings(postings);
		});
	},

	renderUserPostings : function (postings) {
		this.postings = postings;
		var self = this;
		this.postingsContainer.find(".user_posting").remove();
		postings.each(function (posting) {
			self.appendPosting(posting);
		});
	},

	appendPosting : function (posting) {
		var postingElement = $(document.createElement("div"));
		postingElement.attr({class: "option_item_container user_posting", id: posting.get("id")});
		postingElement.append(this.renderArrow());

		var postingTitle = $(document.createElement("div"));
		postingTitle.html(posting.get("heading"));
		postingTitle.attr({class: "item_name", id: posting.get("id")});

		postingElement.append(postingTitle);
		this.postingsContainer.append(postingElement);
	},

	postingCreated : function (posting) {
		this.postings.add(posting);
		this.appendPosting(posting);
		this.menuCancelHandler();
	},

	activateAddNewPostingMenu : function (event, posting) {
		this.addNewPostingsState = this.activateState("add_new_posting_menu");
		if (!posting) {
			this.model = new PostingModel();
			this.addNewPostingsState.deactivateUpdateState();
		} else {
			this.model = posting;
			this.addNewPostingsState.activateUpdateState();
		}

		this.refreshPostingOptions();
	},

	refreshPostingOptions : function () {
		this.refreshPostingLocation();
		this.refreshPostingCategory();
		this.refreshPostingImages();

		this.postingHeading.val(this.model.get("heading"));
		this.postingDescription.val(this.model.get("body"));
		this.postingPrice.val(this.model.get("price"));
		this.postingCurrency.val(this.model.get("currency"));
		this.postingPhone.val(this.model.getSourcePhone());
		this.postingEmail.val(this.model.getSourceAccount());
	},

	remove : function () {
		$("#postings_manager").remove();
		$("#add_new_posting_menu").remove();
		this.removeLocationMenu();
		this.undelegateEvents(this.events);
	}
});

_.extend(PostingsManagerView.prototype, LocationViewMixin.prototype, OptionMenuViewMixin.prototype, PostingViewMixin.prototype);