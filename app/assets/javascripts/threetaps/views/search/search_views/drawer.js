_.extend(Craiggers.Views, {


  Drawer: Backbone.View.extend({

    el: $('#drawer-button'),

    events: {
      'click': 'toggleDrawer'
    },

    initialize: function() {
      this.render();
      this.open = false;
    },

    render: function() {
      $('#drawer-button').show();
      this.closeDrawer();
    },

    closeDrawer: function() {
      $('#drawer').removeClass('open');
      $('.main-content').removeClass('shifted-right');
    },

    toggleDrawer: function() {
      $('#drawer').toggleClass('open');
      $('.main-content').toggleClass('shifted-right');
      Craiggers.drawerOpen = !Craiggers.drawerOpen;
      new Craiggers.Views.PostingDetail().resize();
//      if (Craiggers.drawerOpen) {
//          if (Craiggers.postingsMode == 'favorites') {
//              $('#detail').css({'max-width': $('#container').width() - 992})
//              $('#detail').css({'min-width': $('#container').width() - 992})
//          }
//          else {
//              $('#detail').css({'max-width': $('#container').width() - 802})
//              $('#detail').css({'min-width': $('#container').width() - 802})
//          }
//      }
//      else {
//          if (Craiggers.postingsMode == 'favorites') {
//              $('#detail').css({'max-width': $('#container').width() - 842})
//              $('#detail').css({'min-width': $('#container').width() - 842})
//          }
//          else {
//              $('#detail').css({'max-width': $('#container').width() - 652})
//              $('#detail').css({'min-width': $('#container').width() - 652})
//          }
//      }

    }

  })
})