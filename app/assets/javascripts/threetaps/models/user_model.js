Craiggers.Models.User = Backbone.Model.extend({

  initialize: function(params) {
    if ( params && params.id ) {
      var user = this;
      $.ajax({
        url: 'http://cdn.3taps.net/users/get/' + params.id,
        dataType: 'jsonp',
        success: function(data) {
          var identities = JSON.parse(data.settings).identities;
          if ( identities ) {
            _(data.identities).each(function(id) {
              _(['facebook', 'twitter']).each(function(i) {
                if ( id.provider == i )
                  id.otherData = identities[i] && identities[i].otherData;
              });
            });
          };
          user.set(data);
        }
      });
    }
  },

  defaults: {
    signedin: false,
    anonymous:false,
    email: '',
    facebookID: '',
    linkedinID: '',
    newPostingPresent: false,
    twitterID: '',
    userID: '',
    id: ''
  }

});
