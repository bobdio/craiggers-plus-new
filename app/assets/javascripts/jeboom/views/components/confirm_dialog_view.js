var ConfirmDialogView = DialogView.extend({

  events: {
    'click .popup-close': 'remove',
    'click .cancel': 'remove',
    'click .ok': 'ok'
  },

  template : JST['confirm-popup-dialog'],

  init: function(options) {
    this.callback = options.callback;
  },

  render : function (options) {
    this.$el.append(this.template(options));
    this.callback = options.callback;
    $("#popup-dialog").show();
    this.$(".popup-close").show();

    this.callback = options.callback;
  },

  ok: function() {
    this.callback();
    this.remove();
  }
});