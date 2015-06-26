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
      console.log('------------------------')
      console.log('sended data: ' + $(this).serialize())
      $.ajax({
        type: 'POST',
        url: '/user/sign_in',
        data: $(this).serialize(),
        success: function(data) {
          console.log('data from success response: ')
          console.log(data)
          if ( !data.errors ) {
            Craiggers.Users.renderUserMenu();
            $.get('/user/update_identities_data');
            if ( undefined !== data["response"]){
              $('#errors_holder').text(data["response"]["error"]);
            }
            setTimeout(function(){view.close()}, 5000);
            if( Craiggers.postingsMode == 'favorites' ) {
              Craiggers.Favorites.lazyLoadAndRenderPostings()
            }
          }
        },
        error: function(data) {
          console.log('data from error response: ')
          console.log(data)
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
            console.log(data)
            var successText = data['response']['error'];
            if (successText == "Duplicate username"){
              $('#errors_holder').html(successText)
            }
            else {
              $('#success_holder').html(successText)
            }
            Craiggers.Users.renderUserMenu();
            setTimeout(function(){view.close()}, 10000);
          },
          error: function(data) {
            var errorsText = [];
            errorsText.push(data.responseText);
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