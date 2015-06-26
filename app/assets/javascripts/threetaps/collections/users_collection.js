Craiggers.Collections.Users = Backbone.Collection.extend({

  model: Craiggers.Models.User,

  comparator: function(user) {
    return user.get('recentActivity');
  },

  byName: function(name) {
    return this.find(function(user) {
      return user.get('name') === name;
    });
  },

  findOrCreate: function(id) {
    if ( id && !this.get(id) ) {
      this.add({ id: id });
    };
  },

  addOrUpdate: function(attributes) {
    if ( attributes.id == Craiggers.User.get('id') )
      return false;

    var user = this.get(attributes.id);
    if ( typeof(user) != 'undefined' ) {
      user.set(attributes);
      if ( (user.get('is_blocked')) || (user.get('blocksMe')) ) {
        user.set({
          regular: false,
          blocked: false,
          hidden: false
        });
      }
      user.updatePostingHeadings();
    } else {
      this.add(attributes);
    }
    return true;
  },

  updateFromHash: function(attributes) {
    if ( attributes.id != Craiggers.User.get('id') ) {
      var existingUser = this.get(attributes.id);
      if ( typeof(existingUser) != 'undefined' ) {
        existingUser.set(attributes);
        if ( (existingUser.get('is_blocked')) || (existingUser.get('blocksMe')) ) {
          existingUser.set({
            regular: false,
            blocked: false,
            hidden: false
          });
        }
        existingUser.updatePostingHeadings();
        return true;
      }
    }
    return false
  },

  renderUserMenu: function() {
    $.ajax({
      url: '/user/signedin?' + _.cacheBuster(),
      success: function(user) {
        Craiggers.User.set(user);
        Craiggers.Users.add(user);
        if ( Craiggers.User.get('signedin') ) {
          // TODO: consider implementing some logic with css
          $('.user .name').text(user.username);
          $('img', '.photo').attr('src', user.photo);
          $('.signedin').show();
          $('.signin').hide();
          Craiggers.User.set({
            id: Craiggers.User.get('userID').toString(),
            avatarURL: Craiggers.User.get('photo')
          });
        } else {
          $('#signinout .present').html('').hide();
          $('#signinout .absent').show();
        }
        if ( Craiggers.User.get('is_admin') == false) {
          $('.admin_settings').hide();
        }
      },
      error: function() {
        $('#signinout .present').html('').hide();
        $('#signinout .absent').show();
      }
    });

    $.ajax({
      url: '/user/favorites',
      async: false,
      success: function(data) {
        // TODO: refactoring; use native Backbone.Collection.reset
        Craiggers.Favorites._reset();
        _.each(data, function(posting) {
          var extra = JSON.parse(JSON.stringify(posting.extra));
          var favorite = new Craiggers.Models.Favorite({
            source: posting.source,
            postKey: posting.postKey,
            path: extra.path,
            heading: extra.heading,
            price: extra.price,
            utc: extra.utc
          });
          // backwards compatible with old favorites models
          // that include posting as json -- new models
          // only store postkey and lazy load favorite posting
          //if ( posting.json) favorite.set({ posting: JSON.parse(model.json) });
          Craiggers.Favorites.add(favorite);
        });
      }
    });

    $.ajax({
      url: '/user/saved_searches',
      success: function(data) {
        // TODO: refactoring; use native Backbone.Collection.reset
        Craiggers.SavedSearches._reset();
        $('.searches', '#savedsearches').html('');

        _.each(data, function(search) {

          json = search.json

          if ( !json.extra || !json.flag ) return;
          try { // in case of bad saved searches, esp during testing/dev
            // extra is a string if saved in user api, otherwise sent as json object
            var extra = _.isString(json.extra) ? JSON.parse(JSON.stringify(json.extra)) : json.extra;
          } catch(e) {
            console.error(e);
            return;
          }
          if ( !extra.url ) return;

          var saved = new Craiggers.Models.Search();

          saved.set({
            id: search.key,
            notifications: search.notifications,
            name: json.name,
            email: json.email,
            url: extra.url,
          });

          if ( !json.params ) {
            saved.set({ saved_without_params: true });
          }

          Craiggers.SavedSearches.add(saved);
        });
      }
    });
  }
});

Craiggers.User = new Craiggers.Models.User;
Craiggers.Users = new Craiggers.Collections.Users;
