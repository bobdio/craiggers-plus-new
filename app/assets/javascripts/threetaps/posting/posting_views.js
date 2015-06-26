_.extend(Craiggers.Views, {

  Posting: Backbone.View.extend({

    className: 'posting',

    events: {
      'click .favorite': 'favorite',
      'click': 'showDetail',
      'dblclick': 'showDetail',
      'mouseover': 'userClick'//added for iPhone, opening posting detail view
    },

    initialize: function(options) {
      this.sort = this.options.sort;
      var posting = this;
      var model = this.model;

      // for jeboom only
      model.bind('change:locations', function() {
        posting.showLocationPath();
      });

      // TODO: check if it's working properly
      model.bind('change', function() {
        if ( this.get('favorited') ) {
          posting.$('.favorite').addClass('favorited').find('.text').text('unfavorite');
          $(posting.el).addClass('favorited');
        } else {
          posting.$('.favorite').removeClass('favorited').find('.text').text('favorite');
          $(posting.el).removeClass('favorited');
        }
      });
      if ( model.get('favorited') ) {
        $(this.el).addClass('favorited');
      }
    },

    showLocationPath: function(){
      locations = _.rest(this.model.get('locations'), 1)


      var locations_name = [];

      _.each(locations, setName);

      var locPath = _(locations_name).join(' > ');
      $(this.el).find('.location-path_').text(locPath);

      function setName (location) {
        if(location.level == 'county') return

        name = location.level == 'state'
          ? location.name.slice(0,2).toUpperCase()
          : location.name

        switch(location.code) {
          case 'USA-DC': name = 'DC'; break;
          case 'USA-KAN': name = 'KCI'; break;
          case 'USA-CTN': name = 'CLT'; break;
          case 'USA-PHI': name = 'PHI'; break;
          case 'USA-LOU': name = 'Louisville/Jefferson'; break;
          case 'USA-WAS-NOR': name = 'Northern VA'; break;
          case 'USA-WAS-DIS': name = 'DC'; break;
          case 'USA-WAS-NYM': name = 'NYC'; break;
          case 'USA-PHX-CEN': name = 'C/S Phoenix'; break;
          case 'USA-STL-SAL': name = 'St. Louis'; break;
          case 'USA-SAN-CIT': name = 'City of SD'; break;
        }

        locations_name.push(name)
      }
    },

    render: function() {
      if ( Craiggers.visited[this.model.get('id')] ) {
        $(this.el).addClass('visited');
      }
      if ( this.model.get('flagged') ) {
        $(this.el).addClass('flagged');
      }
      if (( Craiggers.postingsMode == 'favorites' && Craiggers.currentFavoriteDetail == this.model.id) ||
          ( Craiggers.postingsMode == 'search' && Craiggers.currentPostingDetail == this.model.id))
        $(this.el).addClass('selected');

      $(this.el).html(JST['posting'](_.extend(this.model.toJSON())));
      if(this.model.get('locations'))
        this.showLocationPath();

      var postings = $('.posting', '#postings'),
          numpostings = postings.length;

      if ( !this.sort || !numpostings ) {
        $('.postings', '#postings').append(this.el);
      } else {
        var time = Number(this.$('.utc').text())
        for (var i = 0; i < numpostings; i++) {
          var posting = $(postings[i]);
          var t = Number(posting.find('.utc').text());
          // > assumes low/most recent to high/least recent
          // TODO should probably come up with a way to determine
          // place based on current order, tried _.sortIndex - slow
          if ( time > t ) {
            posting.before(this.el);
            return;
          }
        }
        if ( $('#postings .posting.expired.favorited').length ) {
          $('#postings .posting.expired.favorited').first().before(this.el);
        } else {
          $('#postings .postings').append(this.el);
        }
      }
    },

    userClick: function(){
      var isiPhone = navigator.userAgent.toLowerCase().search("iphone") > -1 ? true : false;
      if (isiPhone)
        $(this.el).click();
    },

    showDetail: function(event) {
      event.preventDefault();

      $(this.el).addClass('visited');

      if ( $(this.el).hasClass('selected') ) {
        new Craiggers.Views.PostingDetail().close();
        if (Craiggers.postingsMode == 'search') {
          Craiggers.currentPostingDetail = null;
          Craiggers.openPosting = false;
        }
        else
          Craiggers.currentFavoriteDetail = null;

        return false;
      }
      $('#postings .posting').removeClass('selected mostrecent');
      $(this.el).addClass('selected mostrecent');
      new Craiggers.Views.PostingDetail({ model: this.model }).render();
      var postKey = this.model.get('id');

      if (Craiggers.postingsMode == 'search')
        Craiggers.currentPostingDetail = postKey;
      else {
        Craiggers.currentFavoriteDetail = postKey;
        if (Craiggers.currentPostingDetail)
          Craiggers.openPosting = true;
      }
    },

    favorite: function(event) {
      event.stopImmediatePropagation();

      var favorited = !this.$('.favorite').hasClass('favorited');
      this.model.setFavorited(favorited);
    }

  }),

  Postings: Backbone.View.extend({

    el: $('#postings'),

    events: {
      'click .moreresults': 'showMore',
      'click .older_results': 'showOlder',
      'searching': 'searchInProgress',
      'update_num_results': 'updateNumResults',
      'missing_favorite': 'missingFavorite',
      'mouseover .posting .thumb': 'mouseoverThumb',
      'mouseout .posting .thumb': 'mouseoutThumb',
      'click .newmatches': 'showNewMatches'
    },

    initialize: function(options) {
      this.favorites = options.favorites;
      this.claims = options.claims;
      this.select_posting = options.select;
      this.page = options.page;

      if ( this.options.blank ) {
        this.options.page = 0;
        this.options.rpp = 0;
        this.options.totalresults = 0;
        this.options.exectime = 0;
        this.options.exectimeAPI = 0;
      }

      if ( this.favorites ) {
        Craiggers.Favorites.bind('add', function(item) {
          var posting = Craiggers.Postings.get(item.get('postkey'));
          if ( posting ) posting.set({ favorited: true });
        });
        Craiggers.Favorites.bind('remove', function(item) {
          var posting = Craiggers.Postings.get(item.get('postkey'));
          if ( posting ) posting.set({ favorited: false });
        });
      }

      this.render();
    },

    render: function() {
      this.$('.searching').hide();
      this.$('.postings').show();
      this.$('.postings').html('');

      // stuff for favorites etc
      // TODO: clean up
      this.el.removeClass('favorites');
      if ( this.favorites ) {
        // needed for lazyload
        this.el.addClass('favorites');

        // sort newest to oldest
        this.collection = new Craiggers.Collections.Favorites(
          this.collection.sortBy(function(item) {
            return new Date(item.get('timestamp')).getTime()
          }).reverse()
        );
      }
      if ( this.collection ) {
        this.collection.each(function(posting) {
          new Craiggers.Views.Posting({ model: posting }).render();
        });
      }

      $('#thumb-popup').hide();

      var self = this;
      //<PyotrK(2011-11-09)>: This should show posting from params on the top and hide newer ones
      //and provide '12 new matches' link
      //If there is no such posting in first 50 results, it does nothing and hides '12 new matches' link
      var selected = this.select_posting || $('#postings .posting.mostrecent .postkey').text();
      var page = this.page || this.options.page || 0;
      if (! page && selected.length ) {
         $('.posting', '#postings').each( function (index, posting) {
           var current = $(posting);
           if ( current.find('.postkey').text() == selected ) {
             _.extend(self, {new_matches: index});
             return false;
           } else {
             current.hide();
           }
        });
        $('#postings .posting .postkey:contains(' + selected + ')').click();
        if ( this.new_matches && Craiggers.PageState.get('sub_nav') === 'treemap' ) {
          var res = ( this.new_matches == 1 ) ?
                      "At least 1 newer result" :
                      "At least " + this.new_matches + " newer results";
          this.$('.newmatches').text(res).show();
        } else {
          $('.posting', '#postings').show();
          this.$('.newmatches').hide();
        }
      } else {
        _.extend(self, {new_matches: false});
        this.$('.newmatches').hide();
      }
      // keep the mostrecent posting selected if not rendering a
      // set of new postings, this covers the case for 'next 100 results'
      if ( page && selected.length ) {
        var newselected = $('#postings .posting .postkey:contains(' + selected + ')').parents('.posting');
        if ( $('#detail').is(':visible') ) {
          newselected.addClass('mostrecent');
        } else {
          newselected.click();
        }
      }
      //</PyotrK(2011-11-09)>

      if ( !this.favorites ) {
        this.$('.postings .heading').highlightQuery();
      }

      this.$('.numresults .expired').hide();
      this.updateNumResults();

      // TODO: make sure we don't need it and remove (02.01.2012)
      // $(window).resize();
    },

    missingFavorite: function() {
      if (!favorites_popup_shown && Craiggers.Favorites.missing_count > 0) {
        new Craiggers.Views.MissingFavoritesPopup({count: Craiggers.Favorites.missing_count})
        favorites_popup_shown = true
      }
//      this.$('.numresults .expired').show();
//      var count = this.$('.numresults .expired .count');
//      count.text(
//        Craiggers.Favorites.missing_count
//      );
    },

    mouseoverThumb: function(event) {
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

    searchInProgress: function() {
      this.$('.searching').show();
      this.$('.postings, .moreresults').hide();
    },

    showOlder: function() {
      if(this.$('.posting').length < this.options.rpp)
        this.options.page = this.options.page - 1

      Craiggers.Search.set({ days_back: 5 })
      this.showMore()
    },

    showMore: function() {
      this.$('.moreresults').html(JST["moreresults-loading"]());
      Craiggers.Search.submit({
        page: this.options.page + 1,
        rpp: this.options.rpp
      })
    },

    updateNumResults: function() {
      if ( this.options.blank ) {
        this.$('.numresults .current').text('--');
        this.$('.numresults .total').text('--');
      } else {
        var numresults = this.$('.posting').length;
        this.$('.numresults .current').text(
          _.commatizeNumber(numresults)
        );
        if ( this.claims ) { 
          this.options.totalresults = numresults; // kind of hack
        };

        this.$('.numresults .total').text(
          _.commatizeNumber(this.options.totalresults)
        );
      }

      var type = this.favorites ? 'favorites' : 'results';
      this.$('.numresults .type').text(type);

      var exectimeAPI = (this.favorites || !this.options.exectime) ? '' : ' / ' + (this.options.exectimeAPI / 1000);
      var exectime = (this.favorites || !this.options.exectime) ? '' : '(' + (this.options.exectime / 1000) + exectimeAPI + ' seconds)';
      this.$('.numresults .exectime').text(exectime);
      this.$('.numresults').show();

      if ( this.options.blank || numresults === this.options.totalresults || this.favorites ) {
        if(Craiggers.Search.get('days_back') == 1) {
            this.$('.end_of_results').hide();
            this.$('.older_results').show();
        }
        else {
            this.$('.older_results').hide();
            this.$('.end_of_results').show();
        }

        this.$('.moreresults').hide();
      } else {
        this.$('.end_of_results').hide();
        this.$('.older_results').hide();
        var diff = this.options.totalresults - numresults;
        var count = diff < this.options.rpp ? diff : this.options.rpp;
        this.$('.moreresults').text('next ' + count + ' results').show();
      }
    },

    showNewMatches: function() {
      Craiggers.Search.submit();
    }

  }),

  MissingFavoritesPopup: Backbone.View.extend({
    id: 'missing-favorites-popup',

    events: {
    },

    initialize: function(options){
//        $(this.el).html(
//            ich['missing-favorites-popup-template']({
//                count: options.count
//            })
//        );

        $.fancybox({
            autoDimensions: false,
            centerOnScroll: true,
            content: JST['missing-favorites-popup-template']({count: options.count}),
            height: 60,
            hideOnOverlayClick: false,
            scrolling: 'no',
            titleShow: false,
            width: 200
        });
    }

//    render: function(){
//        $(this).show();
//    }
  }),

  SharePopup: Backbone.View.extend({

    id: 'share-popup',

    events: {
      'click .send': 'sendEmail',
      'submit form': 'sendEmail',
      'click .copy .url': 'selectUrl'
    },

    initialize: function(options) {
      this.link = options.link;
      this.data = options.data;

      $(this.el).html(
        JST['share-popup-template']({
          type: options.link.type,
          url: options.link.url,
        })
      );

      $.fancybox({
        autoDimensions: false,
        centerOnScroll: true,
        content: this.el,
        height: 120,
        hideOnOverlayClick: false,
        scrolling: 'no',
        titleShow: false,
        width: 550
      });
    },

    selectUrl: function(event) {
      event.currentTarget.select();
    },

    sendEmail: function(event) {
      event.preventDefault();
      this.$('.form input').removeClass('error');
      var your, dest;
      if ( !(your = this.$('.form .your')).val().length ) {
        your.addClass('error');
        return;
      }
      if ( !(dest = this.$('.form .dest')).val().length ) {
        dest.addClass('error');
        return;
      }

      this.$('.form .send').attr('disabled', true).hide();
      this.$('.form .loading').show();
      var url = this.link.type === 'posting' ? '/posting/mail' : '/search/mail';
      var popup = this;
      $.ajax({
        url: url,
        type: 'post',
        data: {
          to: dest.val(),
          from: your.val(),
          data: this.data
        },
        success: function() {
          popup.$('.options').hide();
          popup.$('.sent').show();
          _.delay(function() {
            $.fancybox.close();
          }, 3000);
        },
        error: function() {
          popup.$('.options').hide();
          popup.$('.notsent').show();
        }
      });
    },

  }),

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
    },

  }),

  PostingImageViewer: Backbone.View.extend({

    className: 'posting-image-viewer',

    events: {
      'click .mini': 'image',
      'click .main': 'zoom'
    },

    initialize: function() {
      var posting = this.model;

      $(this.el).html(
        JST['posting-image-viewer']()
      );
      if ( !posting.get('has_images') ) {
        $(this.el).hide();
        return;
      }

      var viewer = this;
      this.imagesLoaded = false;
      _.each(posting.get('images'), function(img) {
        viewer.$('.minis').append(
          $('<img>').addClass('mini').attr('src', img)
        );
      });
      _.bindAll(this, 'showImages');
      $('.minis', this.el).hide().onImagesLoad({
        selectorCallback: this.showImages
      });
      // in case of error
      setTimeout(function() {
        if ( !viewer.imagesLoaded ) viewer.showImages($('.minis'));
      }, 10000);

      if ( !posting.get('has_multiple_images') ) {
        this.$('.minis').hide();
        this.$('.frame').removeClass('static');
      }
    },

    showImages: function(images) {
      // 2011-10-06 13:06 Author: Igor Novak
      this.imagesLoaded = true;

      $('.mini').each(function() {
        $(this).addClass(imageQuality(this));
      });

      // There are three kinds of images: 'good', 'bad', and 'small'
      // ('small' are worse than 'bad').
      // By default all 'small' minis are hidden.
      // If there is only one image in the set or there are only 'small' ones,
      // show first (and 'mini' for it though).
      // If there are 'good' images show first one.
      // Otherwise choose from the 'bad' images the best one and show it.
      if ( $('.mini').length > 1 ) {
        if ( $('.mini.good').length ) {
          $('.mini.good').first().click();
        } else {
          if ( $('.mini.bad').length ) {
            $('.mini[src="' + bestImage() + '"]').click();
          } else {
            $('.mini').first().show().click();
          };
        };
      } else {
        $('.mini').first().show().click();
      };

      images.show();

      function imageQuality(img) {
        var SMALL_HEIGHT = 50,
            SMALL_WIDTH = 50,
            MIN_HEIGHT = 101,
            MIN_WIDTH = 101,
            MAX_HEIGHT = 1000,
            MAX_WIDTH = 1000,
            MAX_RATIO = 2.1;

        var imgObj = new Image;
        imgObj.src = img.src;

        var height = imgObj.height;
        var width = imgObj.width;

        // sometimes height and width happen to be 0
        // temp solution
        if ( !height || !width ) return 'bad';

        if ( height < SMALL_HEIGHT || width < SMALL_WIDTH ) {
          return 'bad small'
        };

        var ratio = width / height;
        if ( ratio < 1 ) ratio = 1 / ratio;

        if ( height < MIN_HEIGHT
             || width < MIN_WIDTH
             || height > MAX_HEIGHT
             || width > MAX_WIDTH
             || ratio > MAX_RATIO ) {
          return 'bad'
        };
        return 'good'
      };

      function bestImage() {
        // current strategy: find the image with the best width/height ratio
        // probably it is possible to find better strategy

        var imageAr = $('.mini:not(.small)').get();
        var len = imageAr.length;
        if ( !len ) return;

        var index = 0;
        var bestRatio = ratio(imageAr[0]);
        for (var i = 1; i < len; i++) {
          var curRatio = ratio(imageAr[i]);
          if ( bestRatio > curRatio ) {
            index = i;
            bestRatio = curRatio;
          };
        };
        return imageAr[index].src

        function ratio(img) {
          var ratio = img.width / img.height;
          if ( ratio < 1 ) {
            ratio = 1 / ratio;
          };
          return ratio
        };
      };
    },

    image: function(event) {
      var mini = $(event.target);
      this.$('.main').attr('src', mini.attr('src'));
      mini.addClass('selected').siblings('.mini').removeClass('selected');
    },

    zoom: function() {
      var re = new RegExp(/maps.googleapis.com/i);
      var src = this.$('.main').attr('src');
      var posting = this.model;
      if ( re.test(src) ) {
        var latlon = posting.get('latitude') + ',' + posting.get('longitude');
        var href = 'http://maps.google.com/maps?q=' + latlon;
        var popupWin = window.open(href, 'map', 'location,width=800,height=600,top=100');
        popupWin.focus();
        return false;
      }

      $.fancybox({
        href: src,
        title: this.model.get('heading'),
        enableEscapeButton: false
      });
    }

  }),

});

Craiggers.Views.PostingDetail = Craiggers.Views.PostingContent.extend({

  el: $('#detail'),

  events: {
    'click .favorite': 'favorite',
    'click .close': 'close',
    'click .email': 'sharePopup',
    'click .location .tag': 'updateAndSearchLocation',
    'click .category .tag': 'updateAndSearchCategory',
    'click .annotations .annotag': 'updateAndSearchAnnotation',
//    'close': 'close',
    'click .button': 'showDialog',
    'click .link': 'showDialog',
    'mouseenter .details-popup-holder': 'showDetailsPopup',
    'mouseleave .details-popup-holder': 'hideDetailsPopup',
    'click .contact a': 'emailClicked'
  },

  initialize: function() {
    var detail = this;

    this.view = this.$('.view');
    this.content = this.$('.content');

    if ( !this.model ) return;
    this.model.bind('change', function() {
      if ( this.get('favorited') ) {
        detail.$('.favorite').addClass('favorited');
      } else {
        detail.$('.favorite').removeClass('favorited');
      }
    });

    // TODO: refactoring (take codes from somewhere else)
    this.housingCode = this.model.get('housingCode');
    this.jobsCode = this.model.get('jobsCode');
  },

  resize: function(){
    var setSize = function (diff) {
      $('#detail').css({'max-width': $('#container').width() - diff})
      $('#detail').css({'min-width': $('#container').width() - diff})
    }

    setTimeout(function() {
      if (Craiggers.drawerOpen)
        setSize(Craiggers.postingsMode == 'favorites' ? 612 : 802);
      else
        setSize(Craiggers.postingsMode == 'favorites' ? 442 : 652);
    }, 300)
  },

  render: function() {
    var view = this;
    var model = this.model;

    Craiggers.Search.update({
      params: _.extend(
        Craiggers.Search.get('params'),
        { postKey: Craiggers.currentPostingDetail }
      )
    });

    Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));
    this.el.show();

    var params = _.extend(model.toJSON(), this.shareParams());

    if(!model.get('location').country)
      params.show_annotations_locations_tag = true;

    view.content.html(JST['posting-detail'](params));

    // show message me link if we've got a phone number
    if (params.annotations.phone) {
      var number = parseInt(params.annotations.phone.replace(/[^0-9]/g, ''));
      if (number && number.toString().length > 9) {
        number = number.toString(36);
        var label = params.heading.replace(/[^a-zA-Z 0-9]/g, '').replace(/ /g, '');
        label = label.substr(0, 15).toLowerCase();
        this.$('#message-me').attr('href', 'http://messageme.anoni.com/n/' + number + '/l/' + label).show();
        //mixpanel.track('MessageMe Link Viewed');
      }
    }

    _gaq.push(['_trackPageview', '/view']);

    if ( !model.get('body') ) {
      view.$('.body').text('loading...');
      $.ajax({
        url: BASE_URL + '/search/?timestamp=5d..&source=' + model.get('source') + '&id=' + model.id + '&' + AUTH_TOKEN,
        dataType: 'json',
        data: Craiggers.Postings.params,
        success: function(response) {
          var data = response.postings[0];
          var body = data.body && data.body.replace(/\n|\r/g, '<br />') || '<br />';
          data.images = data.images || [];

          // if ( _.include(['housing'], data.annotations.category)
          //     && data.latitude
          //     && data.longitude
          //     && data.annotations.original_map_google ) {
          //   var latlon = data.latitude + ',' + data.longitude;
          //   data.images.push('http://maps.googleapis.com/maps/api/staticmap?center='
          //       + latlon + '&zoom=15&size=400x400&markers=color:orange|'
          //       + latlon + '&sensor=true');
          // }
          model.set({
            annotations: data.annotations,
            body: body || '',
            images: data.images
          });

          postRender();
        }
      });
    } else {
      postRender();
    }

    this.resize();
    this.view.show();

    var id = model.get('id');
    if ( Craiggers.visited[id] ) {
      Craiggers.visited.trigger && Craiggers.visited.trigger('visitTwice');
    } else {
      Craiggers.visited[id] = true;
    }

    //comment section - need refactoring
    if ( !model.get('supportComments') )
      return
    var currentdetail = this;
    currentdetail.refreshComments();
    if ( Craiggers.commentRefreshIntervalID != 9999 ) {
      clearInterval(Craiggers.commentRefreshIntervalID);
      Craiggers.commentRefreshIntervalID = 9999;
    }
    Craiggers.commentRefreshIntervalID = setInterval(function() {
      currentdetail.refreshComments();
    }, 45000);

    function postRender() {
      annotations = model.get('annotations')

      if(price = model.get('price'))
        model.set({ format_price: _.commatizeNumber(price) })

      if(phone = annotations.phone){
        if(phone.length == 10)
          phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        else
          phone = phone.replace(/(\d{3})(\d{4})/, '$1-$2');
        annotations['format_phone'] =  phone
      }

      var checkboxes = 'cats dogs telecommute contract internship partTime nonprofit'.split(' ');
      _.each(checkboxes, cleanAnnotations)

      function cleanAnnotations (type) {
        if(annotations[type] != 'YES' && annotations[type] != 'ON') 
          delete(annotations[type])
      }

      var params = _.extend(model.toJSON(), view.shareParams());
      _.extend(params, annotations);
      view.content.html(JST['posting-detail-complete'](params));
      view.highlightAnnotations();
      view.$('.heading, .annotations').highlightQuery();

      if( (code = Craiggers.Locations.deepCode(model.get('location'))) && !model.get('locations') )
        Craiggers.Locations.nameByCode(code, function(data){
          view.content.find('.location').html(
            JST['locations-tagrow']({
              locations: Craiggers.Locations.extractLocationsListS(data)
            })
          );
          Craiggers.Views.PostingContent.prototype.highlightLocations();
        })
      else
          Craiggers.Views.PostingContent.prototype.highlightLocations();

      view.initImages(model);
      if ( model.get('images').length == 0 ) {
        view.$('.images').hide();
      };
      ( !view.$('.body').text() ) && view.$('.body').hide();
      view.$('.body').stripFontColor().highlightQuery().targetBlankifyLinks();
    };
  },

  close: function() {
    Craiggers.Search.update({
      params: _.extend(Craiggers.Search.get('params'), {postKey: ''})
    });
    //Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));

    if ( Craiggers.commentRefreshIntervalID != 9999 ) {
      clearInterval(Craiggers.commentRefreshIntervalID);
      Craiggers.commentRefreshIntervalID = 9999;
    }

    var detail = this.el;
    $('#postings .posting').removeClass('selected');
    this.view.hide();
    detail.hide();
  },

  hideThenClose: function() {
    this.el.hide();
    var detail = this.el;
    $('#postings .posting').removeClass('selected');
    this.view.hide();
    detail.hide();
  },

  favorite: function(event) {
    event.stopImmediatePropagation();

    var favorited = !this.$('.favorite').hasClass('favorited');
    this.model.setFavorited(favorited);
  },

  emailClicked: function(event) {
    if ($('#message-me').is(':visible')) {
      mixpanel.track('Email Preferred', null, function() {
        location.href = 'mailto:' + $(event.target).html()
      });
    }
    return false;
  },

  refreshComments: function(event) {
    return false; // disabling
    var current = this;
    $.ajax({
      url: '/posting/comments?postKey=' + this.model.get('id'),
      dataType: 'json',
      success: function(data) {
        $('.view-comments').html('');
        if ( Craiggers.currentPostingDetail != current.model.get('id') )
          return

        for (i in data) {
          Craiggers.Users.findOrCreate(data[i].commenterID);
          var current_parent = data[i].parentID;
          data[i].timestamp = Craiggers.Util.DateHelper.time_ago_in_words(
            new Date(data[i].timestamp.replace(/-/g, '/'))
          );
          data[i].text = data[i].text.replace(/\+/g, ' ').replace(/(%0D)?%0A/g, '\n');
          if ( current_parent ) {
            var reply = JST['reply-comment-view']({ comments : data[i] });
            if ( $('#comment-view-' + current_parent).is('.flagged-comment') ) {
              reply.addClass('flagged-comment');
            }
            $('#comment-view-' + current_parent).append(reply);
          } else {
            if ( data[i].flagTypeID ) {
              data[i].flag = current.flagReasonName(data[i].flagTypeID);
              $('.view-comments').append(JST['root-flag-comment-view']({
                comments : data[i]
              }));
            } else {
              $('.view-comments').append(JST['root-comment-view']({
                comments : data[i]
              }));
            }
          }
        }

        // apply alternating style
        $('.comment-view', '#detail').each(function(a) {
          if ( a % 2 ) $(this).addClass('even');
        });
      }
    });
    return false;
  },

  flagReasonName: function (flagcode) {
    switch(flagcode) {
      case 1:
        return "Miscategorized"
      case 2:
        return "Not my posting"
      case 3:
        return "Deceptive Offering"
      case 4:
        return "Obscene Offering"
      case 5:
        return "Illegal Offering"
      case 6:
        return "Stolen Goods"
      case 7:
        return "Posting attached to the wrong or unauthorized identity"
      case 8:
        return "Other"
    }
  },

  fancybox: function(params) {
    $.fancybox({
      autoDimensions: false,
      centerOnScroll: true,
      content: JST['comment-popup'](params),
      enableEscapeButton: true,
      height: content,
      hideOnOverlayClick: false,
      showCloseButton: true,
      width: 480
    });
  },

  showDialog: function(event) {
    event.stopImmediatePropagation();
    if ( !Craiggers.User.attributes.signedin ) {
      new Craiggers.Views.Dialog('must_sign_in');
      return;
    };

    var target = $(event.target);
    var curposting = this;
    var postKey = this.model.get('id');

    if ( target.is('.flag') ) {
      this.showFlagDialog(curposting, postKey)
    } else if ( target.is('.comment') ) {
      this.showCommentDialog(curposting, postKey)
    } else if ( target.is('.link') ) {
      this.replyToComment(curposting, postKey, target)
    };

    return false;
  },

  showFlagDialog: function(curposting, postKey) {
    var params = {
      title: 'Flag posting',
      subtitle: curposting.model.get('heading'),
      heading: curposting.model.get('heading'),
      type: 'flag'
    };
    var current_posting = this;
    this.fancybox(params);

    $('#flag_comment').focus();

    // set the events for flag form
    $('form', '#comment-posting').submit(function(e) {
      e.preventDefault();
      var self = $(this);
      var currentposting = $('.posting.selected');
      var params = self.serialize() + '&postKey=' + postKey;
      if ( $('#flag_code').val() != "Pick a reason" ) {
        var form_data = self.serializeArray();
        $('.view-comments').append(JST['root-flag-comment-view']({
          comments : {
            flag: current_posting.flagReasonName(parseInt(form_data[0].value)),
            id: 'xx',
            credit: Craiggers.User.get('username'),
            timestamp: 'less than a min',
            text: form_data[1].value
          }
        }));
        $.fancybox.close();
        $.ajax({
          url: '/posting/comment?' + params,
          success: function(data) {
            currentposting.addClass('flagged');
            current_posting.refreshComments();
          },
          error: function() {
            alert("You must be signed in to do that");
          }
        });
        return false;
      } else {
        new Craiggers.Views.Alert("Please pick a reason");
      }
    });
    return false;
  },

  replyToComment: function(curposting, postKey, target) {
    var commentId = target.attr('id');
    var params = {
      title: 'Reply to',
      subtitle: $('.comment-text', '#comment-view-' + commentId).first().text(),
      heading: curposting.model.get('heading'),
      type: 'text'
    };

    this.fancybox(params);
    this.setCommentFormEvent(curposting, postKey, commentId);
  },

  showCommentDialog: function(curposting, postKey) {
    var params = {
      title: 'New comment',
      heading: curposting.model.get('heading'),
      type: 'text'
    };

    this.fancybox(params);
    this.setCommentFormEvent(curposting, postKey);
  },

  setCommentFormEvent: function(curposting, postKey, commentId) {
    $('#flag_code').remove();
    $('#text_comment').focus();
    var current_posting = this;
    $('form', '#comment-posting').submit(function(e) {
      e.preventDefault();
      var self = $(this);
      var currentposting = $('.posting.selected');
      if ( $('#text_comment').val() ) {
        var form_data = self.serializeArray();
        var comment = {
          id: 'xx',
          credit: Craiggers.User.get('username'),
          timestamp: 'less than a min',
          text: form_data[0].value
        };
        var params = self.serialize() + '&postKey=' + postKey;
        if ( commentId ) {
          var reply = JST['reply-comment-view']({
            comments : comment
          });
          if ( $('#comment-view-' + commentId).hasClass('flagged-comment') ) {
            reply.addClass('flagged-comment');
          }
          $('#comment-view-' + commentId).append(reply);
          params += '&parentID=' + commentId;
        } else {
          $('.view-comments').append(JST['root-comment-view']({
            comments : comment
          }));
        }
        $.fancybox.close();
        $.ajax({
          url: '/posting/comment?' + params,
          success: function() {
            var commentCount = parseInt(curposting.model.get('commentCount')) + 1;
            commentCount += (commentCount == 1) ? ' comment': ' comments';
            curposting.model.set({
              'commentCount': commentCount
            });
            currentposting.find('.numcomments').html(commentCount);
            current_posting.refreshComments();
          }
        });
      } else {
        new Craiggers.Views.Alert("Please enter a comment");
      }
      return false;
    });
  },

  showDetailsPopup: function(event) {
    var $target = $(event.currentTarget);
    if ( !$target.find('.user-details-popup').length ) {
      var user = Craiggers.Users.get($target.data('uid'));
      if ( !user ) {
        // 2011-10-26 17:01 Author: Igor Novak
        // TODO: impove behavior
        //   the error is occured when user data is not yet loaded
        //   consider calling this in callback
        //   (or just reduce ajax requests number)
        $(this.el).find('.user-details-popup').hide();
        return;
      }

      user.bind('change', renderDetailsPopup);
      renderDetailsPopup();
    };
    $target.find('.user-details-popup').show();

    function renderDetailsPopup() {
      var html = ich['user-details-popup'](user.toJSON());
      $target.append(html);
    };
  },

  hideDetailsPopup: function() {
    $(this.el).find('.user-details-popup').hide();
  },

});

