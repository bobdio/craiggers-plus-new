Craiggers.Collections.LocalPostings = Backbone.Collection.extend({
  model: Craiggers.Models.LocalPosting,
  url: '/postings',

  initialize: function() {
    this.bind('remove', this.destroyPosting, this);
    this.bind('reset', this.refreshPostings, this);
  },

  destroyPosting: function(posting) {
    $.post('/postings/'+posting.id+'/delete')
    .done(function() {
      new Craiggers.Views.ManagePostings()
    })
    .fail(function() {
      alert('Sorry, but somthing went wrong')
    })
  },

  getByPostingId: function(id) {
      return this.find(function(posting) {
          return posting.get('id') === id;
      });
  },

  refreshPostings: function() {
    new Craiggers.Views.ManagePostings()
  }

})
