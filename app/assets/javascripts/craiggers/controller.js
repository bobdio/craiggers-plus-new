ThreeTapsController = Backbone.Controller.extend({

  initialize: function() {
    // fallback route to root
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

//    $.ajax({
//      url: '/search/previous',
//      async: false,
//      dataType: 'text',
//      success: function(data) {
//        new Craiggers.Pages.Search();
//        Craiggers.Search.set({ url: data }).submit();
//      },
//      error: function() {
//        Craiggers.Controller.saveLocation('!/');
//        new Craiggers.Pages.Root();
//      }
//    });
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
