/**
* spec in spec_runner/spec/collections/favorites_spec
*/

var FavoritesCollection = BaseCollection.extend({

	model: PostingModel,

	url : function () {
		return "user/favorites";
	},

	addToFavorites : function (posting, ajax) {
		ajax = ajax || $.ajax;
		var self = this;
		ajax({
			url: '/posting/favorite',
			type: 'post',
			data: self._generateFavoriteData(posting),
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			  },
		});

		posting.set({unfavorite: false});
		
		if (this.get(posting.get("id"))) {
			this.trigger("add", posting);
		} else {
			this.add(posting);	
		}
		
	},

	removeFromFavorites : function (posting, ajax) {
		var self = this;
		ajax = ajax || $.ajax;
		ajax({
			url: '/posting/unfavorite',
			type: 'post',
			data: self._generateFavoriteData(posting),
			headers: {
			    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			  },
		});

		posting.set({unfavorite: true});

		this.trigger("remove", posting);
	},

	_generateFavoriteData : function (posting) {
		return {
				posting: JSON.stringify({
					postKey: posting.get('id'),
					source: posting.get('source'),
					id: posting.get('id'),
					extra: {
						path: posting.get('path'),
						heading: posting.get('heading'),
						price: posting.get('price'),
						utc: posting.get('timestamp')
					}
				})
			}
	}
})