var PostingDetailsView = BaseView.extend({
	el: '#search.page #detail',

	events : {
		"click .close" : "closeDetails",
		"click .category.tags .tag .text" : "categoryTagHandler",
		"click .location.tags .tag .text" : "locationTagHandler",
		"click .favorite" : "favoriteHandler",
		"click .annotations_table .tag .text" : "annotationsTagHandler",
		"click .local_posting_actions .delete_posting" : "deletePostingHandler",
		"click .local_posting_actions .edit_posting" : "editPostingHandler",
		"click .local_posting_actions .repost_posting" : "repostPostingHandler"
	},

	template : JST['posting-detail-complete'],

	render : function () {
		this.view = this.$('.view');
    	this.content = this.$('.content');
    	this.view.show();
		this.hide();
		this.editPostingDialog = app.views.newPostingView;
	},

	repostPostingHandler : function (event) {
		this.editPostingDialog.render(this.model, 'repost');
		this.closeDetails();
	},

	editPostingHandler : function (event) {
		this.editPostingDialog.render(this.model, 'edit');
		this.closeDetails();
	},

	deletePostingHandler : function (event) {
		if (confirm('Are you sure you want to delete this posting?')) {
			this.model.removePosting();
			this.closeDetails();
		}
		
	},

	categoryTagHandler : function (event) {
		var tagElement = $(event.target).parents(".tag");
		var code = tagElement.find(".code").html();

		app.models.searchModel.setCategory(code);
		router.gotoSearch();
	},

	locationTagHandler : function (event) {
		var tagElement = $(event.target).parents(".tag");
		var code = tagElement.find(".code").html();
		var level = tagElement.find(".level").html();

		app.models.searchModel.setupLocation(level, code);
		router.gotoSearch();
	},

	annotationsTagHandler : function (event) {
		var parent = $(event.target).parents(".tag");
		var name = parent.find(".param").text();
		var value = parent.find(".val").text();

		if (name == "has-image") {
			app.models.searchModel.set("has_image", !app.models.searchModel.get("has_image"));
		} else {
			if ((name !== "") && (value !== "")) {
				if (app.models.searchModel.getAnnotation(name) == value) {
					app.models.searchModel.removeAnnotation(name);
				} else {
					app.models.searchModel.addAnnotation(name, value);
				}
			} else {
				return;
			}
			
		}
		
		router.gotoSearch();
	},

	closeDetails : function (event) {
		this.content.empty();
		this.hide();
		this.clearPostingsSelection();
		if (this.model) {
			this.model.off("change:unfavorite", $.proxy(this.refreshUnfavoriteState, this));
			this.model = null;
		}
	},

	show : function (posting) {
		if ((!this.model) || (this.model.get('id') !== posting.get('id'))) {
			this.model = posting;

			this.renderDetails();

			return true;
		}

		return false;
	},

	resize: function() {
	    this.$el.css({'width' : ($(window).width() - this.$el.offset().left - 50).toString() + 'px'});
	    var contentWithoutFooter = this.$('.content_without_footer');
	    contentWithoutFooter.height(contentWithoutFooter.height() - $('.publicdomain_and_powered').height() - 5);
	},

	renderDetails : function () {
		var params = this.generateTemplateData();
		var self = this;
		params.local_posting = this.model.get("is_local");

		this.content.html(this.template(params));

		this.$el.show().css('opacity', '0').animate({
			opacity: 1
		}, 800, function(){
			//self.refreshLocation();
		});		

		this.resize();

		this.initImages();

		this.hightlightDetails();

		this.model.on("change:unfavorite", $.proxy(this.refreshUnfavoriteState, this));
		this.refreshUnfavoriteState();
		this.refreshLocation();
	},

	refreshLocation : function () {
		var data = {};
		var location = this.model.get("location");

		if (location) {
			if (!location.get("has_context")) {
				location.refreshLocationContext($.proxy(this.refreshLocation, this));
			} else {
				data.locations = location.getParentsNames();
			}
		}
		
		this.$(".location.tagrow").html(JST["locations-tagrow"](data));

		var searchLocation = app.models.searchModel.get("location");

		if (searchLocation) {
			this.$('.location.tags .tag .text').highlightQuery(searchLocation.getLocationName());	
		}
		
	},

	hightlightDetails : function () {
		var searchModel = app.models.searchModel;
		this.$('.heading').highlightQuery();

		var category = searchModel.getCategoryModel();
		if (category) {
			this.$('.category.tags .tag .text').highlightQuery(category.get("name"));
		}

		if (searchModel.get("has_image")) {
			this.$('.annotations_table .has-image .text').highlightQuery("has-image");
		}

		var annotations = searchModel.getSupportedAnnotations();

		if (annotations) {
			_.each(annotations, function (annotation) {
				var value = searchModel.getAnnotation(annotation);
				if (value == "YES") {
					value = annotation;
				}
				if (value) {
					this.$(".annotations_table ." + annotation).highlightQuery(value);
				}
			}, this);
		}
	},

	initImages: function(posting) {
      this.$('.images').html(
        new PostingImageViewer({ model: this.model }).el
      );
    },

    remove : function () {
    	this.undelegateEvents();
    	this.closeDetails();
    }
});

_.extend(PostingDetailsView.prototype, PostingViewMixin.prototype);