_.extend(Craiggers.Views, {

  // TODO: are we still using this? -- df
  // date < 2011-10-26 00:35
  SavedSearchNotificationPopup: Backbone.View.extend({

    className: 'emailpopup',

    events: {
      'click .setup': 'setup'
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      $(this.el).html(
        JST['savedsearch-notificationpopup']()
      );
      $.fancybox({
        content: this.el,
        scrolling: 'no'
      });
    },

    setup: function() {
      this.$('input').removeClass('error');
      if ( !this.$('.email').val().length ) {
        this.$('.email').addClass('error');
        return;
      }
      this.$('.setup').attr('disabled', true);
      var popup = this;
      var params = this.model.params();
      delete params.retvals;
      delete params.page;
      delete params.rpp;
      params.app = Craiggers.appName;
      if (Craiggers.Search.defaultSearchParams) $.extend(params, Craiggers.Search.defaultSearchParams);
      params.email = this.$('.email').val();
      params.search_url = this.model.get('url');
      params.name = this.model.get('name');
      $.ajax({
        url: 'http://3taps.net/notifications/create',
        type: 'get',
        dataType: 'jsonp',
        //jsonpCallback: 'ThreeTapsNotificationsCreate',
        data: params,
        success: function(data) {
          if ( data.success ) {
            popup.$('.form').hide();
            popup.$('.sent').show();
            _.delay(function() {
              $.fancybox.close();
            }, 8000);
          } else {
            popup.$('.form').hide();
            if ( data.error && data.error.message ) {
              popup.$('.notsent').text(
                data.error.message
              );
            }
            popup.$('.notsent').show();
          }
        },
        error: function() {
          popup.$('.form').hide();
          popup.$('.notsent').show();
        }
      });

    }

  })
})