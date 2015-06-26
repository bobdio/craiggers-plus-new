Craiggers.Models.Favorite = Backbone.Model.extend({

  initialize: function() {
    if ( this.get('timestamp') ) {
      this.set({
        timestamp: this.get('timestamp').replace(/-/g, '/')
      });
    }
  },

  has: function(attr) {
    return !!this.get(attr);
  }

});
