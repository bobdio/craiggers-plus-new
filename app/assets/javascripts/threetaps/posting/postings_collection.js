Craiggers.Collections.Postings = Backbone.Collection.extend({

  model: Craiggers.Models.Posting,

  initialize: function() {
    this.bind('add', this.checkIfFavorite);
    this.bind('add', this.fillAttributes);
    this.page = 0;
    this.rpp = 0;
    this.totalresults = 0;
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
  },

  //obrtashov: if need expand tags fields
  fillAttributes: function(posting) {
    // var localy;
    // if (posting.get('annotations')){
    //   if (posting.get('annotations')["location-raw_in"]){
    //     localy = JSON.parse(posting.get('annotations')["location-raw_in"]);
    //   }
    // }
    // var annotations = posting.get('annotations');
    // if (localy){
    //   annotations.country  = localy[0].country;
    //   annotations.city     = localy[0].city;
    //   annotations.locality = localy[0].locality;
    //   annotations.metro    = localy[0].metro;
    // }
    // posting.set({
    //   'annotations': annotations
    // });
  },

});
