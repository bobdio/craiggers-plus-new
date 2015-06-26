var forceSearch = false;

_.extend(Craiggers.Views, {

  NavBar: Backbone.View.extend({

    el: $('#navbar'),

    events: {
      'click #favorites-link': 'showFavorites',
      'click #search-link': 'showSearch',
      'click #explore-link': 'showExplore',
      'click .subnavlink': 'showSubnav'
    },

    showPostingForm: function() {
      new Craiggers.Views.PostingNew()
    },

    showMyPostings: function() {
      new Craiggers.Views.NavBar();
      Craiggers.LocalPostings.fetch({
        success: function(data) {
          new Craiggers.Views.ManagePostings()
        }
      })
    },

    initialize: function() {
      _.bindAll(this, 'toggle');
      this.render();
      this.toggle();
    },

    render: function() {
      this.el.show().removeClass('root posting').addClass('search');
    },

    showSubnav: function(event) {
      var target, id, contentId, subnav;
      subnav = Craiggers.Search.get('params').subnav;
      if ( event ) {
        target = event.target;
        Craiggers.PageState.set({sub_nav: target.id.replace(/-link/, '')});
      } else if ( subnav ) {
        target = $('#' + subnav)[0];
      } else {
        target = $('#workspace-link')[0];
      }
      id = target.id;
      contentId = id.replace(/-link/, '');
      $(target).addClass('active').siblings('.active').removeClass('active');
      $('.main-content').hide();
      $('#' + contentId).show();

      if ( contentId != 'treemap') {
        $('.tooltip').hide();
      }

      Craiggers.Search.update({ params: { subnav: id } });

      // Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));
    },

    showNav: function(id, postings, ext) {
      $('#explore-iframe').hide()
      $('#content #container').show()
      var params = { nav: id + '-link' };
      if(ext) _.extend(params, ext)

      Craiggers.Search.update({
        params: _.extend( Craiggers.Search.get('params'), params)
      });

      this.$('.navlink').removeClass('active');
      this.$('#' + id + '-link').addClass('active');

      if(postings) new Craiggers.Views.Postings(postings);

      Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));
    },

    showFavorites: function() {
      $('#explore-iframe').remove()
      var ext = null
      var params = {
            collection:   Craiggers.Favorites.postings(),
            page:         0,
            rpp:          Craiggers.Favorites.length,
            totalresults: Craiggers.Favorites.length,
            favorites: true
          }
      if(Craiggers.postingsMode == 'search'){
        ext = {postKey: Craiggers.currentFavoriteDetail};
        if(Craiggers.currentPostingDetail)
          new Craiggers.Views.PostingDetail().hideThenClose();
      }

      new Craiggers.Views.PostingDetail().resize();

      Craiggers.postingsMode = 'favorites';
      this.showNav('favorites', params, ext);

      $('#workspace-link').click();

      this.$('.subnavlink').hide();

      $('#leftcol').hide();
      $('.main-content').addClass('shifted-left');

      Craiggers.Favorites.lazyLoadAndRenderPostings();
      $('#postings .posting').removeClass('selected mostrecent visited');
    },

    showExplore: function(url_params){
      if (url_params['id']==undefined){
        url_params['id']= 'stream'
      }
      Craiggers.Controller.saveLocation('!/explore/'+url_params['id']);
      $('.metrics_container').hide()
      $('#content #container').hide()

      var iframe = $('<iframe>', {src: "http://108.175.161.106/#dimension=category&id="+url_params['id']+"&keyword=", id: 'explore-iframe', style: 'width:100%; height:850px; padding-top:40px;',
        align: "center", seamless: true}).text("Your browser doesn't support floating frames!")
      $('#content').prepend(iframe)
      forceSearch = true

      this.$('.navlink').removeClass('active')
      this.$('#explore-link').addClass('active')
    },

    showSearch: function() {
      $('#explore-iframe').remove()
      $('#container #root').hide()
      $('#container #search').show()
      // Craiggers.Search.submit()
      var ext = null,
          params = {
            collection:   Craiggers.Postings,
            page:         Craiggers.Postings.page,
            rpp:          Craiggers.Postings.rpp,
            totalresults: Craiggers.Search.get('num_matches'),
            exectime:     Craiggers.Search.get('exectime'),
            exectimeTotal:  Craiggers.Search.get('exectimeTotal'),
            exectimeSearch:  Craiggers.Search.get('exectimeSearch'),
            exectimeFetch:  Craiggers.Search.get('exectimeFetch')
          };

      if (Craiggers.currentFavoriteDetail) {
        new Craiggers.Views.PostingDetail().hideThenClose();
      }

      if(Craiggers.currentPostingDetail && Craiggers.postingsMode == 'favorites') {

        if (Craiggers.currentPostingDetail)
          ext = {postKey: Craiggers.currentPostingDetail.get('id')}
        else
          Craiggers.currentPostingDetail = null;
      }

      Craiggers.postingsMode = 'search';
      this.showNav('search', params, ext);
      this.$('.subnavlink').show();
      this.showSubnav();
      // 2011-11-10 12:58 Author: Igor Novak
      // TODO: add animation, improve behavior
      $('#leftcol').show();
      $('.main-content').removeClass('shifted-left');
      // if ( $('#leftcol').is(':hidden') )
      //   $('#leftcol').show('slide', {direction: 'right'}, 300);
      // Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));

      $('#postings .posting').removeClass('selected mostrecent visited')
      if (Craiggers.currentPostingDetail){
        new Craiggers.Views.PostingDetail({ model: Craiggers.currentPostingDetail }).render()
      }
      if (forceSearch){
        Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
        Craiggers.Search.set({ type_of_search: 'new_search' })
        Craiggers.Search.submit();
        forceSearch = false
      }
    },

    toggle: function() {
      if(Craiggers.Search.get('params')['nav'] == 'favorites-link') this.showFavorites();
      else this.showSearch()
    }
  })
})

