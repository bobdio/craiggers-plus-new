_.extend(Craiggers.Views, {
  ManagePostings: Backbone.View.extend({
    el: $('#postings'),

    initialize: function() {
      this.render()
    },

    render: function(){
      $('#leftcol').hide();
      $('.main-content').addClass('shifted-left');
      Craiggers.postingsMode = 'favorites';
      $('#root, .metrics_container').hide();
      $('#search').show();
      $('#navbar').removeClass('root').addClass('search');
      this.$('.postings').show();
      this.$('.postings').html('');
      Craiggers.LocalPostings.each(function(item){
        var posting = new Craiggers.Models.LocalPosting(item)
        new Craiggers.Views.Posting({ model: posting }).render();
      })
      if (!Craiggers.currentPostingDetail) {
        Craiggers.currentPostingDetail = Craiggers.LocalPostings.first();
      }
      clearTimeout(currentPostingDetailTimeout)
      var manage_postings = this;
      currentPostingDetailTimeout = setTimeout(function(){
        var detailsArea = new Craiggers.Views.PostingDetail({ model: Craiggers.currentPostingDetail });
        manage_postings.show_num_results(Craiggers.LocalPostings)
        detailsArea.render();
        detailsArea.resize();
      }, 300)
    },

    // temporary stub
    show_num_results: function(local_postings){
      this.$('.current').text(local_postings.length) 
      this.$('.total').text(local_postings.length) 
      this.$('.exectime').text('') 
    }
  })
})
