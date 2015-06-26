var PostingView = BaseView.extend({
	el : "",

	events : {
		'mouseover .content': 'showDetails',
		'mouseover .thumb': 'mouseoverThumb',
      	'mouseout .thumb': 'mouseoutThumb',
      	'click .favorite' : 'favoriteHandler'
	},

	className: 'posting',

	template : JST['posting'],

	render : function (postingDetails) {
		this.postingDetails = postingDetails;

		this.renderTemplate();

		var favoritedPosting = app.collections.favorites.get(this.model.id);
		if (favoritedPosting) {
			this.model = favoritedPosting;
		}

		this.model.on("change:unfavorite", $.proxy(this.refreshUnfavoriteState, this));

		this.model.on("remove", $.proxy(this.remove, this));
		this.model.on("updated", $.proxy(this.renderTemplate, this));

		this.refreshUnfavoriteState();
	},

	renderTemplate : function () {
		this.$el.empty();
		this.$el.append(this.template(this.generateTemplateData()));
	},

	showDetails : function (event) {
		if (this.postingDetails.show(this.model)) {
			this.clearPostingsSelection();
			this.$el.addClass('selected');
		}
		this.changePostKey();
	},

	changePostKey : function()	{
		href = window.location.href
		if (href.indexOf("postKey") > -1) {
			pattern = new RegExp('postKey='+this.model.id);
			if(pattern.test(href)){
				return;
			} else{
				window.history.pushState("ChangePostKey", "ChangePostKey", href.replace(/postKey=\d*/,'postKey='+this.model.id));					
			}
			
		} else {
			 window.history.pushState("ChangePostKey", "ChangePostKey", href+"postKey="+this.model.id)	
			 return;
		}
	},

	mouseoverThumb: function(event) {
		event.stopPropagation()
		var thumb = $(event.currentTarget);
		var image = thumb.find('img');
		var popup = $('#thumb-popup');

		if ( !image.length ) return;

		popup.html('<img src="' + image.attr('src') + '" />');
		popup.show();

		var top = thumb.offset().top - thumb.height();
		var height = popup.find('img').height();
		var bottom = $(document).scrollTop() + $(window).height();
		var buffer = 60;

		if ( bottom < top + height + buffer ) {
			popup.css({ 'top': top - (top + height + buffer - bottom) });
		} else {
			popup.css({ 'top':  top });
		}
    },

    mouseoutThumb: function(event) {
      var thumb = $(event.currentTarget);
      $('#thumb-popup').hide();
    },

	remove : function () {
		this.$el.remove();
		this.undelegateEvents(this.events);
		this.model.off("change:unfavorite", $.proxy(this.refreshUnfavoriteState, this));
		this.model.off("remove", $.proxy(this.remove, this));
	}
});

_.extend(PostingView.prototype, PostingViewMixin.prototype);