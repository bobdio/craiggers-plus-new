/**
* This module contains shared methods for posting views
*/

var PostingViewMixin = (function() {
 	var module = function() {};

 	_.extend(module.prototype, {
 		generateTemplateData : function () {
 			var categoryCode = this.model.get("category");
			var category = app.collections.categories.getCategoryByCode(categoryCode);
			var categoryName, categoryParentName, categoryParentCode, categoryCode;
			var phone = this.model.getSourcePhone();

			if (category) {
				categoryName = category.get("name");
				categoryCode = category.get("code");
				categoryParentName = "";
				if (category.get("cat_id") !== 0) {
					var categoryParent = app.collections.categories.get(category.get("cat_id"));
					
					if (categoryParent) {
						categoryParentCode = categoryParent.get('code');
						categoryParentName = categoryParent.get("name");
					}
				}
			}

			if (phone !== "") {
				if (phone.length == 10) {
					phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
				}
				else {
					phone = phone.replace(/(\d{3})(\d{4})/, '$1-$2');
				}
			}



			var data = {
				source_account : this.model.getSourceAccount(),
				format_phone : phone,
				thumb : this.model.get("images").length > 0 ? this.model.get("images")[0].full : false,
				formated_price : this.model.get("price") == "" ? "0" : utils.getNumberLabel(this.model.get("price")),
				heading : this.model.get("heading"),
				promoted : this.model.get("promoted"),
				parent_cat : categoryParentCode,
				category : categoryCode,
				parent_cat_name : categoryParentName,
				category_name : categoryName,
				timeago : utils.generateTimeAgoLabel(this.model.get("timestamp")),
				favorited : false,
				postKey : this.model.get("postKey"),
				source_full_name : app.SOURCE_NAMES[this.model.get("source").toLowerCase()],
				body : this.model.get('body'),
				external_url : this.model.get('external_url'),
				time : utils.generateDateLabel(this.model.get('timestamp')),
				has_images : this.model.hasImages()
			};

			data = this.appendAnnotationsData(data);

			return data;
 		},

 		appendAnnotationsData : function (data) {
 			var supportedAnnotations = app.models.searchModel.getSupportedAnnotations();
 			var annotations = this.model.get("annotations");

			if (supportedAnnotations) {
				_.each(supportedAnnotations, function (annotation) {
					var value = annotations[annotation];
					if ((value) && (value !== "NO")) {
						data[annotation] = value;  
					}
				}, this);
			}

 			return data;
 		},

 		favoriteHandler : function (event) {
			if (!this.model.isFavorited()) {
				app.collections.favorites.addToFavorites(this.model);
			} else {
				app.collections.favorites.removeFromFavorites(this.model);
			}
		},

		refreshUnfavoriteState : function (value) {
			if (!this.model.isFavorited()) {
				this.$(".favorite").removeClass('favorited');
				this.$('.favorite .text').text('favorite');
			} else {
				this.$(".favorite").addClass('favorited');
				this.$('.favorite .text').text('unfavorite');
			}
		},

 		clearPostingsSelection : function () {
 			$(".posting").removeClass('selected');
 		}
 	});
	return module;
}());