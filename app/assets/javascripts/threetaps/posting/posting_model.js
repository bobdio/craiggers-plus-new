Craiggers.Models.Posting = Backbone.Model.extend({

  init: function() {
    var posting = this;
    var annotations = this.get('annotations');

    //A.Bratashov: fixed bad annotaions field which use at 'ich[categories-tagrow]' template
    if(annotations === undefined){
      annotations = this.set({'annotations':{}})
    }

    if (annotations.cat === undefined) {
      annotations.cat = annotations.original_cat;
    }
    if (annotations.subcat === undefined) {
      annotations.subcat = annotations.original_subcat;
    }
    if (annotations.subcat_2 === undefined) {
      annotations.subcat_2 = annotations.original_subcat_2;
    }
    if (annotations.state === undefined) {
      annotations.state = annotations.original_state;
    }
    if (annotations.location_1 === undefined) {
      annotations.location_1 = annotations.original_location_1;
    }
    if (annotations.loc_1 === undefined) {
      annotations.loc_1 = annotations.original_loc_1;
    }
    if (annotations.location_2 === undefined) {
      annotations.location_2 = annotations.original_location_2;
    }
    if (annotations.loc_2 === undefined) {
      annotations.loc_2 = annotations.original_loc_2;
    }
    if (annotations.location_3 === undefined) {
      annotations.location_3 = annotations.original_location_3;
    }
    if (annotations.loc_3 === undefined) {
      annotations.loc_3 = annotations.original_loc_3;
    }
    if (annotations.original_cat == 'ppp') {
      if (annotations.flavor === undefined) {
        annotations.flavor = annotations.original_flavor;
      }
    }
    if (annotations.original_cat == 'hhh') {
      if (annotations.bedrooms === undefined) {
        annotations.bedrooms = annotations.original_bedrooms;
      }
      if (annotations.cats === undefined) {
        annotations.cats = annotations.original_cats;
      }
      if (annotations.dogs === undefined) {
        annotations.dogs = annotations.original_dogs;
      }
    }
    if (annotations.original_cat == 'jjj') {
      if (annotations.telecommuting === undefined) {
        annotations.telecommuting = annotations.original_telecommuting;
      }
      if (annotations.partTime === undefined) {
        annotations.partTime = annotations.original_partTime;
      }
      if (annotations.contract === undefined) {
        annotations.contract = annotations.original_contract;
      }
      if (annotations.internship === undefined) {
        annotations.internship = annotations.original_internship;
      }
      if (annotations.nonprofit === undefined) {
        annotations.nonprofit = annotations.original_nonprofit;
      }
    }
    if (annotations.original_cat == 'ggg') {
      if (annotations.compensation === undefined) {
        annotations.compensation = annotations.original_compensation;
      }
    }
    // end

    posting.bind('change:images', function() {
      posting.setImages();
    });
    this.setImages();

    var timeago = false;
    var timestamp = this.get('timestamp');
    if(timestamp) {
      var t = new Date(0);
      t.setTime(Number(this.get('timestamp')) * 1000);
      this.set({ timestamp: String(timestamp) });
      timeago = Craiggers.Util.DateHelper.time_ago_in_words(t);
    }

    this.set({
      'category_name': Craiggers.Categories.nameByCode(this.get('category')),
      'parent_cat': ( parent_cat = Craiggers.Categories.parentCode(this.get('category'))),
      'parent_cat_name': Craiggers.Categories.nameByCode(parent_cat),
      'accountName': this.get('account_id'),
      'id': this.get('id'),
      'timeago': timeago,
      'clienttime': Craiggers.Util.DateHelper.formatTimestamp(t),
      'JSON': this.stringify(2),
      'flag': 0,
      'comment': 0,
    });

//    var commentCount = parseInt(this.get('commentCount')) || 0;
//    commentCount += (commentCount == 1) ? ' comment': ' comments';
//    this.set({ commentCount: commentCount });

    if ( _.isString(annotations) ) {
      this.set({ annotations: JSON.parse(annotations).post });
    }

    _.each(annotations, function(value, key) {
      if ( !value ) annotations[key] = '';
    });

    this.setLocationPath();
  },

  setLocationPath: function(){
    var model = this;
    if( code = Craiggers.Locations.deepCode(model.get('location')) )
      Craiggers.Locations.nameByCode(code, function(data){
        model.set({ locations: Craiggers.Locations.extractLocationsListS(data) })
      }, true)
  },

  setImages: function() {
    this.set({
      'images': _.map(this.get('images') || [], function(i) {
        return i.full ? i.full : i;
      })
    }, { silent: true });
    var hasImages = this.get('images').length > 0;
    this.set({
      'thumb': hasImages ? this.get('images')[0] : null,
      'has_images': hasImages,
      'has_multiple_images': (this.get('images').length > 1)
    });
  },

  getAnnotation: function(anno) {
    return this.get('annotations')[anno];
  },

  hasAnnotation: function(anno) {
    _.isPresent(this.get('annotations')) && _.isPresent(this.get('annotations')[anno]);
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
