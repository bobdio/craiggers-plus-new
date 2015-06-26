Craiggers.Views.ExpiredFavorite = Backbone.View.extend({

  className: 'posting expired favorited',

  events: {
    'click .favorite': 'unfavorite'
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    $(this.el).html(JST['expired-favorited-posting'](this.model.toJSON()));

    var postings = $('#postings .postings .posting.expired.favorited'),
        numpostings = postings.length;

    if(numpostings) {
      var time = Number(this.$('.utc').text());
      for(var i = 0; i < numpostings; i++) {
        var posting = $(postings[i]);
        var t = Number(posting.find('.utc').text());
        // > assumes low/most recent to high/least recent
        // TODO should probably come up with a way to determine
        // place based on current order, tried _.sortIndex - slow
        if(time > t) {
          posting.before(this.el); return;
        }
      }
    }
    $('#postings .postings').append(this.el);
  },

  unfavorite: function() {
    $(this.el).remove();
    $.ajax({
      url: '/posting/unfavorite',
      type: 'post',
      data: {
        postkey: this.model.get('postkey')
      }
    });
  }

});
