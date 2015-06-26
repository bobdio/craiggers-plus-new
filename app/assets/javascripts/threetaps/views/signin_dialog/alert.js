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