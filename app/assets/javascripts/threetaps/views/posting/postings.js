_.extend(Craiggers.Views, {

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
      this.select_posting = options.select;
      this.page = options.page;

      if ( this.options.blank ) {
        this.options.page = 0;
        this.options.rpp = 0;
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
        // $('#postings .posting .postkey:contains(' + selected + ')').parents('.posting').click();
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
          // newselected.click();
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
      event.stopPropagation()
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
      // Craiggers.Search.set({ timestamp_left_border: '7d' })
      // Craiggers.Search.set({ timestamp_right_border: Craiggers.Search.get('oldest_posting_timestamp') })
      this.showMore()
      Craiggers.Search.set({ type_of_search: 'show_older_postings' })
    },

    showMore: function() {
      Craiggers.Search.set({ type_of_search: 'show_more_postings' })
      Craiggers.Search.set({ page: Craiggers.Search.get('next_page') })
      Craiggers.Search.set({ tier: Craiggers.Search.get('next_tier') })
      this.$('.moreresults').html(JST["moreresults-loading"]());
      Craiggers.Search.submit({
        page: this.options.page + 1,
        rpp: this.options.rpp
      })
    },

    updateNumResults: function() {
      var search = Craiggers.Search
      if (Craiggers.Util.handle_blank_postings_options(this)){ return false}

      var numresults = Craiggers.Search.get('total_amount_of_shown_postings') || 0
      var total_results = Craiggers.Search.get('total_results') || 0

      this.$('.numresults .current').text(_.commatizeNumber(numresults))
      this.$('.numresults .total').text(_.commatizeNumber(total_results));


      var type = this.favorites ? 'favorites' : 'results';
      this.$('.numresults .type').text(type);
      
      var exectime = search.get('exectime')
      var exectimeSearch = (this.favorites || !exectime) ? '' : (search.get('exectimeSearch') / 1000);
      var exectimeFetch = (this.favorites || !exectime) ? '' : (search.get('exectimeFetch') / 1000);
      var exectimeTotal = (this.favorites || !exectime) ? '' : (search.get('exectimeTotal') / 1000);

      if (isNaN(exectimeFetch)){
        var search_metrics = exectimeTotal
      } else {
        var search_metrics = exectimeSearch + ' / ' + exectimeFetch
      }
      var exectime = (this.favorites || !exectime) ? '' : '(' + search_metrics + ' / ' + (exectime / 1000) + ' seconds)';

      this.$('.numresults .exectime').text(exectime);
      this.$('.numresults').show();

      if ( numresults === total_results ) {
        if(Craiggers.Search.get('type_of_search') == 'show_older_postings' || Craiggers.Search.get('total_results_of_older_postings') > 0 
          || Craiggers.Search.get('next_tier') == -1) {
          this.$('.older_results').hide();
          this.$('.end_of_results').show();
        } else {    
          this.$('.end_of_results').hide();
          this.$('.older_results').show();
        }
        this.$('.moreresults').hide();
      } else {
        this.$('.end_of_results').hide();
        this.$('.older_results').hide();
        var diff = total_results - numresults;
        var count = diff < this.options.rpp ? diff : this.options.rpp;
        this.$('.moreresults').text('next ' + count + ' results').show();
      }
    },

    showNewMatches: function() {
      Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
      Craiggers.Search.submit();
    }

  })
})
