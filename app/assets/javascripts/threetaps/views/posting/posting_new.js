_.extend(Craiggers.Views, {
  PostingNew: Craiggers.Views.PostingForm.extend({

    el: $('#new_posting'),

    events: _.extend({}, Craiggers.Views.PostingForm.prototype.events, {
      'click .submit': 'createPosting'
    }),

    initialize: function(){
      this.category = null
      this.location = null
      this.annotations = {}
      this.images = []
      this.constructor.__super__.initialize.apply(this)
      this.clearForm()
      this.$('button.submit').text('Create')
      this.$('new_posting').attr('action', 'postings')
      this.$('form').first().attr('action', 'postings/')
      this.geolocate()
    },  

    createPosting: function (argument) {
      var newPostingView = this

      var data = {
        heading: this.$('.heading input').val(),
        body: this.$('.body textarea').val(),
        location: this.location,
        currency: this.$('#posting_currency').val(),
        price: this.$('#posting_price').val(),
        annotations: this.annotations,
        category: this.category,
        images: this.images
      };

      $.ajax({
        url: this.$('form').attr('action'),
        dataType: 'json',
        type: 'POST',
        data: data,
        success: function(response) {
          if (response['success']) {
            Craiggers.LocalPostings.fetch({
              success: function() {
                new Craiggers.Views.ManagePostings();
                newPostingView.clearForm()
                $.fancybox.close()
              }
            });
          } else {
            newPostingView.removeValidationErrors(newPostingView)
            newPostingView.addValidationErrors(response['errors'], newPostingView)
          }
        }
      })
    }  
  })
})
