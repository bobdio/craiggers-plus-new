function emailCheck(str) {
  var reg = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
  return reg.test(str);
}

Craiggers.Views.Alert = Backbone.View.extend({

  el: $('#popup-dialog'),

  events: {
    'click .popup-close': 'close',
  },

  initialize: function(message) {
    this.el.show().find('.content').html('<h2>' + message + '</h2>');
    this.el.find('.popup-close').clone().appendTo(this.el.find('.content')).show();
  },

  close: function() {
    this.el.hide();
  },

});

Craiggers.Views.Confirm = Craiggers.Views.Alert.extend({

  events: {
    'click .popup-close': 'close',
    'click .cancel': 'close',
    'click .ok': 'ok',
  },

  initialize: function(options) {
    this.el.show().find('.content').html(JST['confirm-popup-dialog'](options));
    this.el.find('.popup-close').clone().appendTo(this.el.find('.content')).show();
    this.callback = options.callback;
  },

  ok: function() {
    this.callback();
    this.close();
  },

});

Craiggers.Views.UpdateSavedSearch = Backbone.View.extend({

  el: $('#popup-dialog'),

  events: {
    'click .popup-close': 'close',
    'click .cancel': 'close',
    'click .update': 'update',
    'click .destroy': 'destroy',
  },

  initialize: function(options) {
    this.el.show().find('.content').html(
      $('#update-form-saved-search').html()
    );
    this.email = $('.content .email input');
    this.name = $('.content .name input');
    this.notifications = $('.content .notifications input');

    this.email.val(options.email);
    this.name.val(options.name);
    this.notifications.attr('checked', options.notifications);

    this.el.find('.popup-close').clone().appendTo(this.el.find('.content')).show();

    this.destroy_callback = options.destroy_callback
    this.update_callback = options.update_callback
  },

  close: function() {
    this.el.hide();
  },

  update: function() {
    data = { name: this.name.val() }

    if(this.notifications.attr('checked')) {

      if(!emailCheck(this.email.val())) {
        this.el.find('.error').html('Invalid email address');
        return false;
      }

      data.notifications = true
      data.email = this.email.val()
    }

    this.update_callback(data);
    this.close();
  },

  destroy: function() {
    new Craiggers.Views.Confirm({
      message: "Are you sure you want to delete this saved search?",
      callback: this.destroy_callback,
      okLabel: 'delete'
    });
  },
});

Craiggers.Views.Dialog = Craiggers.Views.Alert.extend({

  initialize: function(action) {
    // TODO: check if it's needed and working
    if ( $('#search.page').is(':visible') ) {
      $.post('/search/latest', { url: Backbone.history.fragment });
    };

    var view = this;
    var showInfo = false;
    if ( action == 'must_sign_up' ) {
      action = 'sign_up';
      showInfo = true;
    }
    else if ( action == 'must_sign_in' ) {
      action = 'sign_in';
      showInfo = true;
    };
    this.el.find('.content').load('/user/' + action, function() {
      view.el.find('.popup-close').clone().appendTo(view.el.find('.content')).show();
      view.el.show().find('.textfield').first().focus();

      if ( action == 'sign_in' ) {
        view.signIn(showInfo);
      } else if ( action == 'sign_up' ) {
        view.signUp(showInfo);
      } else if ( action == 'change_password_request' ) {
        view.changePasswordRequest();
      } else if ( action == 'change_password' ) {
        view.changePassword();
      };
    });
  },

  signIn: function(showInfo) {
    var view = this;
    ( showInfo ) && view.el.find('.title').show();
    $('#sign_in_form').submit(function() {
      $.ajax({
        type: 'POST',
        url: '/user/sign_in',
        data: $(this).serialize(),
        success: function(data) {
          if ( !data.errors ) {
            Craiggers.Users.renderUserMenu();
            $.get('/user/update_identities_data');
            view.close();
            if( Craiggers.postingsMode == 'favorites' ) {
              Craiggers.Favorites.lazyLoadAndRenderPostings()
            }
          }
        },
        error: function(data) {
          $('#errors_holder').text("Wrong username or password");
        }
      });
      return false;
    });
  },

  signUp: function(showInfo) {
    var view = this;
    ( showInfo ) && view.el.find('.info').show();
    $('#sign_up_form').submit(function() {
      var errorsText = [];
      if ( !$('#terms').is(':checked') ) errorsText.push("Please confirm that you agree with our terms of service");
      if ( !$('#username').val() ) errorsText.push("Username field is blank");
      if ( $('#username').val().length > 15 ) errorsText.push("Username can't be longer than 15 charaters");
      if ( /\W/.test($('#username').val()) ) errorsText.push("Your username can only contain letters, numbers, and \"_\"");
      if ( $('#password').val().length < 6 ) errorsText.push("Your password must be at least 6 characters");
      if ( !emailCheck($('#email').val()) ) errorsText.push("Invalid email address");
      if ( errorsText.length == 0 ) {
        $.ajax({
          type: 'POST',
          url: '/user/sign_up',
          data: $('#sign_up_form').serialize(),
          success: function(data) {
            Craiggers.Users.renderUserMenu();
            view.close();
          },
          error: function(data) {
            var errorsText = [];
            _.each(JSON.parse(data.responseText),function(item) {
              errorsText.push(item.message);
            });
            errorsText = errorsText.join('<br />');
            $('#errors_holder').html(errorsText);
          }
        });
      } else {
        $('#errors_holder').html(errorsText.join('<br/>'));
      }
      return false;
    });
  },

  changePasswordRequest: function() {
    var view = this;
    $('.ok', '#change_password_request_form').click(function() {
      view.el.hide();
    });
    $('#change_password_request_form').submit(function() {
      if ( !emailCheck($('#email').val()) ) {
        $('#errors_holder').text("Invalid email address");
        return false;
      }
      $.ajax({
        type: 'POST',
        url: '/user/change_password_request',
        data: $('#change_password_request_form').serialize(),
        success: function(data) {
          // title: "To reset your password, enter your email address",
          $('#errors_holder').text('');
          $('#submit_change_password_request_form').hide();
          $('#confirmation_holder').html("We've sent you an email that describes how to reset your password");
          $('.ok', '#change_password_request_form').show();
        },
        error: function(data) {
          if ( data.responseText.length > 0 ) {
            $('.ok', '_change_password_request_form').show();
            $('#submit_change_password_request_form').remove();
            $('#errors_holder').text(data.responseText);
            return;
          }
          $('#errors_holder').text("Hmm, that email address doesn't match our records. Try re-entering it again.");
        }
      });
      return false;
    });
  },

  changePassword: function() {
    var view = this;
    $('#change_password_form').submit(function() {
      if ( $('#confirmation').val().length == 0 ) {
        $('#errors_holder').text("Please confirm your password");
        return false;
      }
      if ( $('#password').val()!=$('#confirmation').val() ) {
        $('#errors_holder').text("Your passwords don't match");
        return false;
      }
      $('#errors_holder').text('');
      $('#confirmation_holder').text("Thanks!");

      var token = /token=(\w+)/.exec(window.location.search)[1];
      $.ajax({
        type: 'POST',
        url: '/user/change_password?token=' + token,
        data: $('#change_password_form').serialize(),
        success: function(data) {
          Craiggers.Users.renderUserMenu();
          view.close();
        },
        error: function(data) {
          $('#errors_holder').text("Uh oh, something's wrong. Please try this again later.");
        }
      });
      return false;
    });
  }

});
