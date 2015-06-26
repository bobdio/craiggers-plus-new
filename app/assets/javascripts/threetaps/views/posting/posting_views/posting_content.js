_.extend(Craiggers.Views, {

  PostingContent: Backbone.View.extend({

    // Ancestor for Craiggers.Views.PostingDetail
    // and Craiggers.Pages.Posting

    events: {
      'click .email': 'sharePopup',
      'click .location .tag': 'updateAndSearchLocation',
      'click .category .tag': 'updateAndSearchCategory',
      'click .annotations .annotag': 'updateAndSearchAnnotation'
    },

    highlightLocations: function() {
      var params = Craiggers.Search.get('params');
      var locations = Craiggers.Search.get('location').code;
      if ( !_.isArray(locations) ) locations = [locations];
      _.each(locations, function(code) {
        if ( params.original_locality && Craiggers.Locations.hasNeighborhoods(code) ) {
          var codes = decodeURIComponent(params.original_locality).split(' OR ');
          var locality = this.$('.annotations .location .tag.location_3');
          if ( _.include(codes, locality.find('.code').text()) ) {
            locality.addClass('highlight');
          }
        } else {
          code = code.toLowerCase();
          this.$('.annotations .location .tag .code').filter(function() {
            return $(this).text().toLowerCase() === code;
          }).parents('.tag').addClass('highlight');
        }
      });
    },

    highlightAnnotations: function() {
      var params = Craiggers.Search.get('params');
      var hoptions = { className: 'anno-highlight' };
      var $annotations = this.$('.annotations');
      var highlight = _.compact([
        // gigs
        params.compensation && $annotations.find('.compensation'),
        // personals
        (params.maxage || params.minage) && $annotations.find('.age'),
        // price
        params.price && $annotations.find('.price')
      ]);
      _.each(highlight, function(el) {
        el.highlight(el.text().replace(/^\s*|\s*$|,\s*$/g,''), hoptions);
      });

      // job status
      _(['sqft', 'make', 'vin', 'model', 'year', 'age', 'telecommute', 'contract', 'internship', 'part-time', 'non-profit', 'cats', 'dogs']).each(function(el) {
        if ( params[el] ) $annotations.find('.' + el).addClass('highlight');
      });
      if ( params.bedrooms ) { 
       $annotations.find('.bedrooms').find('.annotag').addClass('highlight');
      }
      if ( params['has-image'] ) {
       $annotations.find('.status .has-image').addClass('highlight');
      }


      // this.disableUnrelatedTags();

      this.highlightCategory();
    },

    highlightCategory: function() {
       var $annotations = this.$('.annotations');
        // category
       $annotations.find('.category .tag .code').filter(function() {
        var cat = Craiggers.Search.get('category');
        if ( !_.isArray(cat) ) cat = [cat];
        return _.include(cat, $(this).text());
      }).parents('.tag').addClass('highlight');
    },

    updateAndSearchAnnotation: function(event) {
      var tag = $(event.currentTarget);
      if ( tag.is('.disabled') )
        return

      var update = {};
      var param = tag.find('.param').text();
      if ( tag.hasClass('highlight') ) {
        tag.removeClass('highlight');
        update[param] = null;
      } else {
        tag.addClass('highlight');
        update[param] = tag.find('.val').text();
      }
      Craiggers.Search.update({
        params: update
      }).submit();
    },

    updateAndSearchLocation: function(event) {
      // TODO: check if it's working properly
      var tag = $(event.currentTarget);
      this.$('.location .tag').removeClass('highlight');
      tag.addClass('highlight');
      if ( tag.hasClass('location_3') ) {
        Craiggers.Search.update({
          location: tag.siblings('.location_1').find('.code').text(),
          params: {
            original_locality: encodeURIComponent(
              tag.find('.code').text()
            )
          }
        });
      } else {
        Craiggers.Search.update({
          location: { code: tag.find('.code').text(), level: tag.find('.level').text() }
        }).submit();
      }
    },

    updateAndSearchCategory: function(event) {
      var tag = $(event.currentTarget);
      tag.addClass('highlight').siblings('.tag').removeClass('highlight');
      Craiggers.Search.update({
        category: tag.find('.code').text()
      }).submit();
    },

    disableUnrelatedTags: function() {
      // var $annotations = this.$('.annotations'),
      //     code = Craiggers.Search.get('category'),
      //     housingCodes = Craiggers.Categories.childrenCodes(this.housingCode),
      //     jobsCodes = Craiggers.Categories.childrenCodes(this.jobsCode);

      // if ( code !== this.housingCode && !_.include(housingCodes, code) && code !== 'all') {
        // $annotations.find('.bedrooms, .catsdogs').find('.annotag').addClass('disabled');
      // }
      // if ( code !== this.jobsCode && !_.include(jobsCodes, code) && code !== 'all' ) {
      //   $annotations.find('.telecommute, .contract, .internship, .part-time, .non-profit')
      //       .addClass('disabled');
      // }
    },

    initImages: function(posting) {
      this.$('.images').html(
        new Craiggers.Views.PostingImageViewer({ model: posting }).el
      );
    },

    shareParams: function() {
      // probably can be moved to the Posting model
      var text = encodeURIComponent(this.model.get('heading') + ': ');
      var url = encodeURIComponent('http://' + window.location.host
                + '/#!/posting/'
                + this.model.get('id'));
      var twitterUrl = 'https://twitter.com/share?url=' + url + '&text=' + text;
      var facebookUrl = 'http://www.facebook.com/sharer/sharer.php?s=100&'
                        + encodeURIComponent('p[title]')
                        + '=' + text + '&' + encodeURIComponent('p[url]')
                        + '=' + url;
      return {
        type: 'posting',
        facebook: facebookUrl,
        text: text,
        url: url,
        twitter: twitterUrl,
        hostname: window.location.hostname
      }
    },

    sharePopup: function(event) {
      event.preventDefault();

      var postKey = this.model.get('id');
      new Craiggers.Views.SharePopup({
        link: {
          type: 'posting',
          url: 'http://' + window.location.host + '/#!/posting/' + postKey
        },
        data: { postkey: postKey }
      });
    }
  })
});
