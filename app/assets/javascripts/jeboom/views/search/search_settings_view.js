var SearchSettingsView = SearchFiltersBaseView.extend({
	el : "#search.page #searchfilters",

	events : {
		"click .header" : "toggleSettingsActivation",
		"change .title-only" : "titleOnlyChanged",
		"change .has-image" : "hasImageChanged",
		"change .safe_checkbox_container .safe" : "safeSearchChanged",
		"change .sortby" : "sortChanged",
		'change #annotations_block select': 'updateAnnotation',
		'keyup #annotations_block input:text': 'updateAnnotation',
		'change #annotations_block input:checkbox': 'updateAnnotationCheckbox'
	},

	render : function () {
		SearchFiltersBaseView.prototype.render.call(this);

		this.activateSettings();

		this.refreshAnnotations();

		this.model.on("category_changed", $.proxy(this.refreshAnnotations, this));
	},

	refreshOptions : function () {
		if (this.model.get("title_only")) {
			this.$(".title-only").attr("checked", true);
			this.$(".entire-post").attr("checked", false);
		} else {
			this.$(".title-only").attr("checked", false);
			this.$(".entire-post").attr("checked", true);
		}
		
		this.$(".safe_checkbox_container .safe").attr("checked", this.model.get("safe_search"));
		this.$(".has-image").attr("checked", this.model.get("has_image"));

		var sort = this.model.get("sort");

		if ( sort !== "") {
			this.$(".sortby [data=" + this.model.get("sort") + "]").attr('selected', true);
		} else {
			this.$('.recent').attr('selected', true);
		}

		this.refreshAnnotations();
	},

	sortChanged : function (event) {
		var selected = this.$('.sortby option:selected');

		this.model.set("sort", selected.attr("data"));
	},

	safeSearchChanged : function (event) {
		this.model.set("safe_search", $(event.target).attr("checked"));
		router.gotoSearch();
	},

	hasImageChanged : function (event) {
		this.model.set("has_image", $(event.target).attr("checked"));
	},

	titleOnlyChanged : function (event) {
		this.model.set("title_only", $(event.target).attr("checked"));
	},

	remove : function () {
		SearchFiltersBaseView.prototype.remove.call(this);

		this.model.off("category_changed", $.proxy(this.refreshAnnotations, this));
	}
});

_.extend(SearchSettingsView.prototype, AnnotationViewMixin.prototype);