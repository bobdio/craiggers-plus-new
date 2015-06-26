var AddPostingState = function () {};
_.extend(AddPostingState.prototype, {

	render : function () {
		this.$('button.submit').text('Create');
	},

	submit : function () {
		userService.createPosting(this.model, function () {
			$.fancybox.close();
		});
	}
});

var EditPostingState = function () {};
_.extend(EditPostingState.prototype, {

	render : function () {
		this.$('button.submit').text('Edit');
	},

	submit : function () {
		var self = this;
		this.model.unset("mode");
		userService.updatePosting(this.model, function () {
			$.fancybox.close();
			self.model.updated();
		});
	}
});

var RepostPostingState = function () {};
_.extend(RepostPostingState.prototype, {

	render : function () {
		this.$('button.submit').text('Repost');
	},

	submit : function () {
		var self = this;
		this.model.set("mode", "repost");
		userService.updatePosting(this.model, function () {
			$.fancybox.close();
			self.model.unset("mode");
			self.model.updated();
		});
	}
});


var NewPostingView = BaseView.extend({
	el: '#new_posting',

	events : {
		"keyup .heading input" : "headingChanged",
		"keyup .body textarea" : "descriptionChanged",
		"click .submit" : "saveSearch",
		"click .reset_all" : "reset",
		'change #annotations_block select': 'updateAnnotation',
		'keyup #annotations_block input:text': 'updateAnnotation',
		'change #annotations_block input:checkbox': 'updateAnnotationCheckbox',
		'click .delete_link' : 'deleteImage',
		"blur .price" : "priceChanged",
		'change #posting_currency' : "currencyChanged"
	},

	STATES : {
		add : AddPostingState,
		edit : EditPostingState,
		repost : RepostPostingState
	},

	render : function (model, mode) {
		this.remove();

		this.model = model || new PostingModel();

		this.$el.find('.annotations').html($('#annotations_block').clone());

		var new_posting_popup = $('<div/>', {width: 620, class: 'posting-manage-popup'})
		new_posting_popup.html(this.el);

		$.fancybox({
			content: new_posting_popup,
			padding: 0,
			onComplete: function () {
				$('#fancybox-close').text('x').addClass('manage-postings-close-button');
				$('head').append('<link rel="stylesheet" href="vendcss" type="text/css" />');
			}
		});

		this.$('.posting-form-header').text('Post your item');

		var state = mode ? this.STATES[mode] : AddPostingState;
		this.setState(new state);

		this.show();

		this.category = new InputCategoryView({el : this.$(".category_field"), model : this.model});
		this.category.render();

		this.location = new InputLocationView({el : this.$(".location.wrapper"), model : this.model});
		this.location.render();

		this.heading = this.$(".heading input");
		this.body = this.$(".body textarea");
		this.price = this.$(".price input");
		this.currency = this.$("#posting_currency");

		this.refresh();

		this.model.on("change:category", $.proxy(this.refreshPostingAnnotations, this));
		this.refreshPostingAnnotations();

		this.initFileUploader();

		this.price.keyup(function () { 
		    this.value = this.value.replace(/[^0-9\.]/g,'');
		});

		this.delegateEvents(this.events);
	},

	setState : function (state) {
		this.state = state;
		this.state.render.call(this);
	},

	priceChanged : function () {
		this.model.set('price', this.price.val());
		this.currencyChanged();
	},

	currencyChanged : function () {
		this.model.set('currency', this.currency.val());
	},

	refreshPostingAnnotations : function () {
		this.refreshAnnotations();

		if (this.model.hasPrice()) {
			this.$('.price').show();
		} else {
			this.$('.price').hide();
		}
	},

	deleteImage : function (event) {
		event.preventDefault();
		var deleted_container = $(event.currentTarget).parents('.uploaded_image_container');
		var url = deleted_container.find("img").attr("src");
		$(deleted_container).slideUp("normal", function(){$(this).remove()});
		this.model.removeImage(url);
	},

	clearImages : function () {
		this.$('#uploaded_images_container').empty();
	},

	initFileUploader : function (event) {
		var self = this;
		this.$('#files_upload').fileupload({
			dataType: 'json',
			loadImageMaxFileSize: 1000000,

			add : function (e, data) {
				self.$('.pictures .uploading').show();
				self.$('.pictures .error_message').remove();
				data.submit();
			},

			done : function (e, data) {
				self.$('.pictures .uploading').hide()
				if (data.result.success) {
					var imageData = JSON.parse(data.result.image);
					self.model.addImage(imageData);
					self.appendUploadedImage(imageData.full, data.files[0].name);
				} else {
					var error = $('<span/>').attr({ class: 'error_message', style: 'display: block; margin-bottom: 5px;' }).text(data.result.error)
					self.$('.pictures').prepend(error);
				}
			}
		});
	},

	appendUploadedImage : function (url, name) {
		this.$('.pictures .uploading').hide();
		var img_container = $('<div />').attr({ 'class': 'uploaded_image_container', 'style': 'width: 120px;float:left;'});
		var img_name = $('<div/>').attr({ 'class': 'uploaded_image_name'}).text(name).appendTo(img_container);
		var img = $('<img />').attr({ 'class': 'uploaded_image', 'style': 'height: 100px;', 'src': url }).appendTo(img_container);
		$(img_container).append('<br />');

		var delete_link = $('<a />').attr({ 'class': 'delete_link', 'style': '', 'href': '#' }).text('delete').appendTo(img_container);
		this.$('#uploaded_images_container').append(img_container);
	},

	refresh : function () {
		this.refreshPostingAnnotations();
		this.location.refreshValue();
		this.category.refreshValue();

		this.clearImages();

		_.each(this.model.get("images"), function (image) {
			this.appendUploadedImage(image.full, image.full.replace(/^.*\/|\.[^.]*$/g));
		}, this);

		this.heading.val(this.model.get('heading'));
		this.body.val(this.model.get('body'));
		this.price.val(this.model.get('price'));
	},

	reset : function () {
		this.model.resetOptions();
		this.refresh();
	},

	saveSearch : function () {
		this.clearErros();

		var errors = this.model.validatePostingCreationData();

		if (_.size(errors) > 0) {

			if (errors.heading) {
				this.$(".heading").addClass("error");
			}

			if (errors.location) {
				this.$(".location.wrapper").addClass("error");
			}

			if (errors.category) {
				this.$(".category_field").addClass("error");
			}

			if (errors.body) {
				this.$(".body").addClass("error");
			}

			return;
		}

		this.state.submit.call(this);	
	},

	clearErros : function () {
		this.$("div").removeClass("error");
	},

	headingChanged : function () {
		this.model.set("heading", this.heading.val());
	},

	descriptionChanged : function () {
		this.model.set("body", this.body.val());
	},

	remove : function () {
		this.undelegateEvents(this.events);
	}
});

_.extend(NewPostingView.prototype, AnnotationViewMixin.prototype);