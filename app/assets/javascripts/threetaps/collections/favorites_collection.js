// TODO: consider inheriting Collections.Favorites from postings collection

Craiggers.Collections.Favorites = Backbone.Collection.extend({

  model: Craiggers.Models.Favorite,

  initialize: function() {
    this.missing_count = 0;
    this.complete_count = 0;
  },

  postings: function() {
    var postings = new Craiggers.Collections.Postings;
    items = this.models
    items.sort(function(a, b) {
      return( Number(a.get('utc')) - Number(b.get('utc')))
    })
    _.each(items, function(item){
      var posting = item.get('posting');
      if ( posting ) {
        postings.add(posting);
      }
    });
    return postings;
  },

  getByPostingId: function(id) {
    return this.find(function(favorite) {
      return favorite.get('postKey') === id;
    });
  },

  getBySourceAndExternalId: function(source, id){
      return this.find(function(favorite) {
          return (favorite.get('source') === source && favorite.get('postKey') === id)
      })
  },

  lazyLoadAndRenderPostings: function() {
    Craiggers.Favorites.missing_count = 0;
    this.each(function(item) {
      if ( item.get('posting') ) return;
      $.ajax({
        async: false,
        url: BASE_URL + '/?timestamp_left_border=5&source=' + item.get('source') + '&id=' + item.get('postKey') + '&' + AUTH_TOKEN,
        dataType: 'json',
        data: Craiggers.Postings.params,
        //jsonpCallback: 'ThreeTapsPostingGet',
        success: function(data) {
          if ( !$('#postings').hasClass('favorites') ) return;
          var expired = data.num_matches == 0;
          // some items may exist before heading, path etc
          // were added to item model
          if ( expired ) {
            item.set({ expired: true });
            if ( item.has('heading') && item.has('path') ) {
              new Craiggers.Views.ExpiredFavorite({ model: item });
              $('#postings').trigger('update_num_results');
            } else {
              Craiggers.Favorites.missing_count++;
            }
              $.ajax({
                  url: '/posting/unfavorite',
                  type: 'post',
                  data: {
                      posting: JSON.stringify({
                          postKey: item.get('id'),
                          source: item.get('source'),
                          id: item.get('id'),
                          extra: {
                              path: item.get('path'),
                              heading: item.get('heading'),
                              price: item.get('price'),
                              utc: item.get('timestamp')
                          }
                      })
                  }

              })
            return;
          }
          var posting = new Craiggers.Models.Posting(data.postings[0])
          posting.set({ 'favorited': true });
          item.set({ posting: posting });
          Craiggers.Favorites.complete_count++;
          $('#postings').trigger('update_num_results');

          var resp_count = Craiggers.Favorites.complete_count + Craiggers.Favorites.missing_count;
          if(resp_count == Craiggers.Favorites.length){
            Craiggers.Views.NavBar.prototype.showFavorites();
          }
        }
      });
    });
    $('#postings').trigger('missing_favorite');

    var favs = new Craiggers.Collections.Favorites();
    Craiggers.Favorites.each(function(favorite) {
      if (favorite.get('expired') == undefined)
        favs.add(favorite)
    })
    Craiggers.Favorites = favs;
  }

});
