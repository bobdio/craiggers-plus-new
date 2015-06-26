_.extend(Craiggers.Views, {
  PostingEdit: Craiggers.Views.PostingForm.extend({

    events: _.extend({}, Craiggers.Views.PostingForm.prototype.events, {
      'click .submit': 'updatePosting'
    }),

    initialize: function(data){
      this.model.set({mode: data.mode}) 
      this.clearForm()
      this.constructor.__super__.initialize.apply(this)
      this.initializeFields()
    },

    updatePosting: function() {
      var editPostingView = this
      var posting = this.model;
      var data = {
        id: posting.get('id'),
        heading: this.el.find('.heading input').val(),
        body: this.el.find('.body textarea').val(),
        location: posting.get('location')['code'] || posting.get('location'),
        currency: this.el.find('#posting_currency').val(),
        price: this.el.find('#posting_price').val(),
        annotations: posting.get('annotations'),
        category: posting.get('category'),
        images: posting.get('images_data'),
        mode: posting.get('mode')
      }

      var model = this.model;

      $.ajax({
        url: this.el.find('form').first().attr('action'),
        dataType: 'json',
        type: 'POST',
        data: data,
        success: function(response) {
          
          if (response['success']){
            Craiggers.LocalPostings.fetch({
              success: function(data) {
                Craiggers.currentPostingDetail = Craiggers.LocalPostings.getByPostingId(posting.id)
                new Craiggers.Views.ManagePostings()
              }
            })
            $.fancybox.close()
          } else {
            editPostingView.removeValidationErrors(editPostingView)
            editPostingView.addValidationErrors(response['errors'], editPostingView)
          }
        }
      })
    },

    initializeFields: function(){
      var posting = this.model;
      var this_el = this.el
      var submit_button_text = posting.get('mode') == 'repost' ? 'Repost' : 'Edit'
      this.$('button.submit').text(submit_button_text) 
      this_el.find('form').first().attr('action', 'postings/' + posting.get('id') + '/update')
      this_el.find('.category_field .input').val(Craiggers.Categories.nameByCode(posting.get('category')));
      Craiggers.Locations.nameByCode(posting.get('location'), function(data){
        this_el.find('.location .input').val(data.name)
      })
      this_el.find('.heading input').val(posting.get('heading'))
      this_el.find('.body textarea').val(posting.get('body'))
      this_el.find('#posting_currency').val(posting.get('currency'))
      this_el.find('#posting_price').val(posting.get('price'))
      if (posting.get('image_urls').length > 0){
        $.each(posting.get('image_urls'), function(key, image_data){
          var img_container = $('<div />').attr({ 'class': 'uploaded_image_container', 'style': 'width: 120px;float:left;'})
          var img_name = $('<div/>').attr({ 'class': 'uploaded_image_name'}).text('image '+(key+1)).appendTo(img_container)
          var img = $('<img />').attr({ 'class': 'uploaded_image', 'style': 'height: 100px;', 'src': image_data }).appendTo(img_container)
          $(img_container).append('<br />')
          var delete_link = $('<a />').attr({ 'class': 'delete_link', 'style': '', 'href': '#' }).text('delete').appendTo(img_container)
          this_el.find('#uploaded_images_container').append(img_container)
        })
      }
      this.tooglePrice(posting.get('category'))
      this.annotations = this.updateAnnotations(posting.get('annotations'), posting.get('category'))
    }
  })
})

