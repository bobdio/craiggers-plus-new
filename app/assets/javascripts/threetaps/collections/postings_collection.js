Craiggers.Collections.Postings = Backbone.Collection.extend({

  model: Craiggers.Models.Posting,

  initialize: function() {
    this.bind('add', this.checkIfFavorite);
    this.page = 0;
    this.rpp = 0;
  },

  getByPostingId: function(id) {
      return this.find(function(posting) {
          return posting.get('id') === id;
      });
  },

  checkIfFavorite: function(posting) {
    if(Craiggers.Favorites.getByPostingId(posting.get('id'))) {
      posting.set({
        'favorited': true
      });
    }
  },

  params: {
    retvals: [
      'external_url', 'heading', 'timestamp', 'annotations', 'category', 'location', 'images',
      'source', 'price', 'currency', 'status', 'id', 'body'
    ].join(','),
  }
});
