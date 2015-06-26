var currentPostingDetailTimeout
_.extend(Craiggers.Views, {

  Posting: Backbone.View.extend({

    className: 'posting',

    events: {
      'click .favorite': 'favorite',
      'mouseover .content': 'showDetail',
      'dblclick': 'showDetail'
     // 'mouseover': 'userClick'//added for iPhone, opening posting detail view
    },

    initialize: function(options) {
      var posting = this,
          model = this.model;

      this.sort = options.sort;

      model.bind('change:locations', function() {
        posting.showLocationPath();
      });

      model.bind('change:favorited', function() {
        posting.checkFavorited();
      });
    },

    checkFavorited: function() {
      var favorite = this.$('.favorite');

      if(this.model.get('favorited')) {
        favorite.addClass('favorited');
        favorite.find('.text').text('unfavorite');
      } else {
        favorite.removeClass('favorited');
        favorite.find('.text').text('favorite');
      }
    },

    showLocationPath: function(){
      var locations_name = [];

      locations = _.rest(this.model.get('locations'), 1)

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
      if(Craiggers.visited[this.model.get('id')])
        $(this.el).addClass('visited');

      if(this.model.get('flagged'))
        $(this.el).addClass('flagged');

      if(Craiggers.Search.get('params').postKey == this.model.id) {
        $(this.el).addClass('selected');
      }
      if (typeof this.model.get('price') !== 'undefined' && typeof this.model.get('price') !== 'object' ){
        var handled_price = Craiggers.Util.commitize_price(this.model.get('price'))
        handled_price = Craiggers.Util.remove_cents_in_price(handled_price)
        this.model.set({ formated_price: handled_price})
      }
      $(this.el).html(JST['posting'](_.extend(this.model.toJSON())));

      if(this.model.get('locations'))
        this.showLocationPath();

      var postings = $('.posting', '#postings'),
          numpostings = postings.length;


      if(!this.sort || !numpostings) {
        $('.postings', '#postings').append(this.el);
      } else {
        var time = Number(this.$('.utc').text())
        for(var i = 0; i < numpostings; i++) {
          var posting = $(postings[i]),
              t = Number(posting.find('.utc').text());
          if ( time > t ) { posting.before(this.el); return; }
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
      if(isiPhone) $(this.el).click();
    },

    showDetail: function(event) {
      posting = this
      $('#thumb-popup').hide()

      if($(this.el).hasClass('selected')) {
        // new Craiggers.Views.PostingDetail().close();
        return false;
      }

      $('#postings .posting').removeClass('selected mostrecent visited');
      $(this.el).addClass('selected mostrecent visited');

      clearTimeout(currentPostingDetailTimeout)
      currentPostingDetailTimeout = setTimeout(function(){
          new Craiggers.Views.PostingDetail({ model: posting.model }).render()
      }, 300)
      
    },

    favorite: function(event) {
      event.stopImmediatePropagation();

      var favorited = !this.$('.favorite').hasClass('favorited');
      this.model.setFavorited(favorited);
    }
  })
})
