Craiggers.Models.Posting = Backbone.Model.extend({

  init: function() {
    this.deepLocationIndicator = 0;

    var posting = this,
        annotations = this.get('annotations') || {},
        timestamp = this.get('timestamp'),
        location = this.get('location'),
        time = null,
        timeago = null,
        expires_in = null;


    this.setImages();
    posting.bind('change:images', function() {
      posting.setImages();
    });

    if(timestamp) {
      time = new Date(0);
      time.setTime(Number(timestamp) * 1000);
      timeago = Craiggers.Util.DateHelper.time_ago_in_words(time);
      time = Craiggers.Util.DateHelper.formatTimestamp(time);
      if (this.get('source') == 'EBAYM' && annotations['BuyItNowAuction'] == true){
        expires_in = timeago.replace('-','')
      }
    }
    var parent_cat = Craiggers.Categories.parentCode(this.get('category'))
    this.set({
      annotations: annotations,
      'category_name': Craiggers.Categories.nameByCode(this.get('category')),
      'parent_cat': parent_cat,
      'parent_cat_name': Craiggers.Categories.nameByCode(parent_cat),
      'source_full_name': Craiggers.Sources.nameByCode(this.get('source')),
      'timeago': timeago,
      'postKey': this.get('id'),
      'promoted': this.get('promoted'),
      'time': time,
      'JSON': this.stringify(2),
      'expires_in': expires_in,
    });
    this.findExistsLocation(location);
  },

  forTemplate: function() {
    return this.toJSON();
  },

  findExistsLocation: function (location) {
    var posting = this;

    if (!posting.location) {
      posting.set({ locations: [] });
      return;
    }

    if (code = (location.code || Craiggers.Locations.deepCode(location, posting.deepLocationIndicator))) {
      Craiggers.Locations.nameByCode(code, function(data){
        if(data.success) {
          posting.set({ locations: Craiggers.Locations.extractLocationsListS(data) })
        }
        else {
          posting.deepLocationIndicator = posting.deepLocationIndicator - 1
          posting.findExistsLocation(location)
        }
      }, true)
    }
  },

  setImages: function() {
    this.set({
      'image_urls': _.map(this.get('images') || [], function(i) {
        return i.full ? i.full : i;
      })
    });
    this.set({'images_data': _.map(this.get('images'), function(i){ return JSON.stringify(i) })});
    this.set({ silent: true });
    var hasImages = this.get('image_urls').length > 0;
    this.set({
      'thumb': hasImages ? this.get('image_urls')[0] : null,
      'has_images': hasImages,
      'has_multiple_images': (this.get('image_urls').length > 1)
    });
  },

  getAnnotation: function(anno) {
    return this.get('annotations')[anno];
  },

  hasAnnotation: function(anno) {
    _.isPresent(this.get('annotations')[anno]);
  },

  stringify: function(n) {
    return JSON.stringify(this, null, n);
  },

  setFavorited: function(favorited) {
    this.set({
      'favorited': favorited
    });
    if ( favorited ) {
      var posting = _.clone(this);
      posting.unset('body');
      Craiggers.Favorites.add(
        new Craiggers.Models.Favorite({
          postKey: this.id,
          source: this.get('source'),
          posting: posting,
          path: this.get('path'),
          heading: this.get('heading'),
          price: this.get('price'),
          utc: this.get('timestamp')
        })
      );
    } else {
      if (Craiggers.currentFavoriteDetail == this.id)
        Craiggers.currentFavoriteDetail = null;
      Craiggers.Favorites.remove(
        Craiggers.Favorites.getBySourceAndExternalId(this.get('source'), this.id)
      );
    }

    $.ajax({
      url: favorited ? '/posting/favorite' : '/posting/unfavorite',
      type: 'post',
      data: {
        posting: JSON.stringify({
          postKey: this.get('id'),
          source: this.get('source'),
          id: this.get('id'),
          extra: {
            path: this.get('path'),
            heading: this.get('heading'),
            price: this.get('price'),
            utc: this.get('timestamp')
          }
        })
      }
    });
  }

});
