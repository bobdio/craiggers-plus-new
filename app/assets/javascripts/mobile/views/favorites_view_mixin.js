/**
* This mixin module contains view methods for favorites functionality
*/

 var FavoritesViewMixin = (function() {
 	var module = function() {};

 	_.extend(module.prototype, {

 		bindFavoritesCollecitonEvents : function () {
 			this.unbindFavoritesCollecitonEvents();
 			app.collections.favorites.on("add", $.proxy(this.postingAddedToFavorites, this));
			app.collections.favorites.on("remove", $.proxy(this.postingRemovedFromFavorites, this));
 		},

 		unbindFavoritesCollecitonEvents : function () {
 			app.collections.favorites.off("add");
			app.collections.favorites.off("remove");
 		},

 		remove: function () {
			this.unbindFavoritesCollecitonEvents();
			BaseView.prototype.remove.call(this);
		},

 		/**
	 	* Handler function of adding posting into favorites collection
	 	*/
	 	postingAddedToFavorites : function (posting) {
	 		var container = this.posting_container ? this.posting_container : this.$el;
			var postingButton = $(container.find("#add_to_favorites_button[data='"+posting.get("id").toString() + "']"));
			if (postingButton) {
				postingButton.addClass("added");
				postingButton.find(".favorite_button").html("unfavorite");
				postingButton.find(".favorite_star").addClass("unfavorite_star");
			}
		},

		/**
	 	* Handler function of removing posting from favorites collection
	 	*/
		postingRemovedFromFavorites : function (posting) {
			var container = this.posting_container ? this.posting_container : this.$el;
			var postingButton = $(container.find("#add_to_favorites_button[data='"+posting.get("id").toString() + "']"));
			
			if (postingButton) {
				postingButton.removeClass("added");
				postingButton.find(".favorite_button").html("favorite");
				postingButton.find(".favorite_star").removeClass("unfavorite_star");
			}
		},

		/**
		* Handler function of favorite/unfavorite button
		*/
		addToFavoritesHandler : function (event) {
			event.stopPropagation();
			var target = $(event.target).parent();
			var postingID = target.attr("data");
			var posting = app.collections.favorites.get(postingID);

			if ((!posting) && (app.collections.postings)) {
				posting = app.collections.postings.get(postingID);
			}

			if (posting) {
				target.hasClass("added") ? 
					app.collections.favorites.removeFromFavorites(posting) : app.collections.favorites.addToFavorites(posting);	
			}
		},

		/**
		* Refreshes style of favorite button of specific posting
		*/
		refreshFavoriteButton : function (posting) {
			if (app.collections.favorites.get(posting.get("id")) && (!posting.get("unfavorite"))) {
				this.postingAddedToFavorites(posting);
			} else {
				this.postingRemovedFromFavorites(posting);
			}
		}
 	});

 	return module;
 }());