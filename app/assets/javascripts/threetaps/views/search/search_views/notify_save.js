_.extend(Craiggers.Views, {

  NotifySave: Backbone.View.extend({
    // 2011-12-19 15:50 Author: Igor Novak
    // currently notification is disabled
    // TODO: clean up

    el: $('#notifysave'),

    events: {
      'click #notifysaveclose': 'close',
      'click #save-notification': 'saveSearch',
      'click #notify-email': 'notifyEmail',
      'click #notify-sms': 'notifySms',
      'keydown': 'setEnterHandler'
    },

    initialize: function() {
      Craiggers.Search.bind('search:submit', function() {
        if ( $('#notifysave').is(':visible') ) new Craiggers.Views.NotifySave;
      });
      this.render();
    },

    render: function() {
      this.$('#search-name').val(Craiggers.Search.get('query') || 'everything');
      $('#notify-sms').removeAttr('disabled');
      this.setNotifySave();
      this.el.show();
    },

    setEnterHandler: function(event) {
      if ( event.keyCode === Craiggers.Util.KEY.ENTER ) {
        this.saveSearch()
        event.preventDefault()
      }
    },

    close: function() {
      this.el.hide();
    },

    notifyEmail: function() {
      $('#notify-email-address').attr('disabled',!$('#notify-email').is(':checked'));
      if ($('#notify-email').is(':checked'))
        $('#notify-email-address').focus();
    },

    notifySms: function() {
      if ( Craiggers.Search.get('num_matches') > 1400 ) {
        $('#notify-sms').attr('disabled', true).removeAttr('checked');
        $('#sms-error').text("Sorry, there are too many results that match this search for us to set up SMS notifications. Try narrowing your search parameters. You can still save this search and subscribe for email notifications.").show();
      } else {
        $('#notify-sms-address').attr('disabled', !$('#notify-sms').is(':checked'));
      }
    },

    setNotifySave: function() {
      var email = $('#notify-email-address').val('').attr('disabled',true);
      var phone = $('#notify-sms-address').val('').attr('disabled',true);
      $('#notify-email').attr('checked',false);
      $('#notify-sms').attr('checked',false);

      if ( Craiggers.User.get('signedin') ) {
        var settings = Craiggers.User.get('settings');
        if ( settings ) {
          email.val(settings.email)
          phone.val(settings.phone)
        }
      }

      $('#sms-error').val('').hide();
    },

    validateNotifySave: function() {
      var errors = [];
      if ( $('#notify-email').is(':checked') && !emailCheck($('#notify-email-address').val())) errors.push("Invalid email address") ;
      if ( $('#notify-sms').is(':checked') && !phoneCheck($('#notify-sms-address').val())) errors.push('Your number must be a valid US phone number.');
      if ( errors.length == 0 ) {
        return true;
      } else {
        $('#sms-error').html(errors.join('<br />')).show();
        return false;
      }

      function phoneCheck(phone) {
        var phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        return phoneNumberPattern.test(phone);
      }

    },

    saveSearch: function() {
      if ( !this.validateNotifySave() ) return false;
      var name = $('#search-name').val();
      var search = Craiggers.Search.clone();

      // HACK
      // Without this all new SavedSearch'es would have the same "params"
      // attribute, thus would have same original_locality
      // search.set({
      //   params: {
      //     original_locality: Craiggers.Search.get('params').original_locality
      //   }
      // });

      var data = {
        name: name,
        params: search.params(),
        extra: { url: search.generateUrl() },
        flag: true,
        timestamp: Craiggers.Postings.at(0).get('timestamp')
      };
      var notifications = false;

      if ( $('#notify-email').is(':checked') ) {
        data.email = $('#notify-email-address').val();
        notifications = true;
      }

      send_data = { json: JSON.stringify(data)  }
      if (notifications) { send_data.notifications = true}

      $.ajax({
        url: '/search/save',
        type: 'post',
        data: send_data,
        success: function(data_, textStatus, XMLHttpRequest) {
          $.fancybox.close();
          search.set({
            url: data.extra.url,
            name: data.name,
            id: data_.key,
            email: data.email,
            notifications: data_.notifications
          });
          Craiggers.SavedSearches.add(search);
        },
      });
      $('#notifysave').hide();

      // if the user wants notifications, create them and pop up a notice
      // TODO: this doesn't feel like a great place for this
      var self = this;
      _.each(['email', 'sms'], function(method) {
        if ( $('#notify-' + method).is(':checked') ) {
          var params = search.params();
          params.app = Craiggers.appName;
          if (Craiggers.Search.defaultSearchParams) $.extend(params, Craiggers.Search.defaultSearchParams);
          params.search_url = search.get('url');
          params.name = search.get('name');
          params[method] = $('#notify-' + method + '-address').val();
          if ( params.sms) params['number'] = params.sms;

          $.ajax({
            url: 'http://3taps.net/notifications/create',
            type: 'get',
            dataType: 'jsonp',
            data: params,
            success: function(data) { },
            error: function() { }
          });
        }
      });

      // don't run the search
      return false;
    },

  })
})