ThreeTapsController = Backbone.Controller.extend({

  initialize: function() {
    // fallback route to root

    $('#postings').css('min-height', document.body.clientHeight)
    $(window).resize(function() {
      $('#postings').css('min-height', document.body.clientHeight)
    });
    this.route(/^.*$/, 'catchall', this.root);
  },

  root: function() {
    Craiggers.Controller.saveLocation('!/');
    new Craiggers.Pages.Root();

    Craiggers.Search.set({
      params: {
        subnav: 'workspace-link',
        nav: 'search-link'
      }
    })
  },

  blankSearch: function() {
    new Craiggers.Pages.Search();
  },

  posting: function(postkey) {
    new Craiggers.Pages.Posting({
      postkey: postkey
    });
  }
});
