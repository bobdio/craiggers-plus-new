_.extend(Craiggers.Views, {

  SharePopup: Backbone.View.extend({

    id: 'share-popup',

    events: {
      'click .send': 'sendEmail',
      'submit form': 'sendEmail',
      'click .copy .url': 'selectUrl'
    },

    initialize: function(options) {
      this.link = options.link;
      this.data = options.data;

      $(this.el).html(
        JST['share-popup-template']({
          type: options.link.type,
          url: options.link.url,
        })
      );

      $.fancybox({
        autoDimensions: false,
        centerOnScroll: true,
        content: this.el,
        height: 120,
        hideOnOverlayClick: false,
        scrolling: 'no',
        titleShow: false,
        width: 550
      });
    },

    selectUrl: function(event) {
      event.currentTarget.select();
    },

    sendEmail: function(event) {
      event.preventDefault();
      this.$('.form input').removeClass('error');
      var your, dest;
      if ( !(your = this.$('.form .your')).val().length ) {
        your.addClass('error');
        return;
      }
      if ( !(dest = this.$('.form .dest')).val().length ) {
        dest.addClass('error');
        return;
      }

      this.$('.form .send').attr('disabled', true).hide();
      this.$('.form .loading').show();
      var url = this.link.type === 'posting' ? '/posting/mail' : '/search/mail';
      var popup = this;
      $.ajax({
        url: url,
        type: 'post',
        data: {
          to: dest.val(),
          from: your.val(),
          data: this.data
        },
        success: function() {
          popup.$('.options').hide();
          popup.$('.sent').show();
          _.delay(function() {
            $.fancybox.close();
          }, 3000);
        },
        error: function() {
          popup.$('.options').hide();
          popup.$('.notsent').show();
        }
      });
    }
  })

 
});
