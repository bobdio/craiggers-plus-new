var SavedSearchView = BaseView.extend({

	className: 'savedsearch',

	el : "",

	template : JST['savedsearch'],

	events: {
		'click .delete': 'editSearch',
		'click .extras .email': 'popupEmail',
		'click .extras .notification': 'popupNotification',
		'click': 'loadSearch'
	},

	render : function () {
		this.$el.empty();

		var category = this.model.getCategoryModel();
		var data = {
			name : this.model.get("name")
		}

		if (category) {
			data.cat = category.get("name");

			if (category.get("cat_id") !== 0) {
				var categoryParent = app.collections.categories.get(category.get("cat_id"));
				if (categoryParent) {
					data.parent_cat = categoryParent.get("name");
				}
			}
		} else {
			data.cat = "all categories";
		}

		var location = this.model.get("location");

		if (location) {
			if (!location.get("has_context")) {
				location.refreshLocationContext($.proxy(this.render, this));
			} else {
				data.location = location.getLocationName();
				data.parent_locations = location.getParentsNames();
			}
		} else {
			data.location = "all locations";
		}

		this.$el.html(this.template(data));

		this.model.on("change:name", $.proxy(this.nameChangedHandler, this));
	},

	nameChangedHandler : function () {
		this.$(".name .text").html(this.model.get("name"));
	},

	editSearch : function (event) {
		if (this.updateDialog) {
			this.updateDialog.remove();
		}
		this.updateDialog = new SavedSearchUpdateDialogView({model: this.model});
		this.activateDialog(this.updateDialog);
	},

	popupEmail : function () {

	},

	popupNotification : function () {

	},

	loadSearch : function (event) {
		if ( !$(event.currentTarget).is('.savedsearch')
           || $(event.target).is(':input') ) return;

		if ($(event.target).parent(".delete").length > 0) {
			return;
		}

		var searchURL = this.model.get("search_url");
		if (searchURL) {
			router.navigate(searchURL, {trigger: true});
		} else {
			app.models.searchModel.set($.extend(true, {}, this.model.attributes));
			router.gotoSearch();
		}
	},

	remove : function () {
		this.undelegateEvents(this.events);
		this.model.off("change:name", $.proxy(this.nameChangedHandler, this));
		this.$el.remove();
	}
});