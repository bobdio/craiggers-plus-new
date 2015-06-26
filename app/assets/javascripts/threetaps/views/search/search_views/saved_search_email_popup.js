_.extend(Craiggers.Views, {
  // TODO: are we still using this? --df
  // date < 2011-10-26 00:35
  SavedSearchEmailPopup: Backbone.View.extend({

    className: 'emailpopup',

    events: {
      'click .send': 'submit'
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      $(this.el).html(
        JST['savedsearch-emailpopup']({
          orjust: 'http://craiggers.com/#' + this.model.generateUrl()
        })
      );
      $.fancybox({
        content: this.el
      });
    },

    submit: function() {
      this.$('input').removeClass('error');
      if ( !this.$('.your').val().length ) {
        this.$('.your').addClass('error');
        return;
      }
      if ( !this.$('.dest').val().length ) {
        this.$('.dest').addClass('error');
        return;
      }

      this.$('.send').attr('disabled', true);
      var popup = this;
      $.ajax({
        url: '/search/mail',
        type: 'post',
        data: {
          to: this.$('.dest').val(),
          from: this.$('.your').val(),
          data: { search: this.model.get('url') }
        },
        success: function() {
          popup.$('.form').hide();
          popup.$('.sent').show();
          $.fancybox.close();
        },
        error: function() {
          popup.$('.form').hide();
          popup.$('.notsent').show();
        }
      });
    }

  })
})