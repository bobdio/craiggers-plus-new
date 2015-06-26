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