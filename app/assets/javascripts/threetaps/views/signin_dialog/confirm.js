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