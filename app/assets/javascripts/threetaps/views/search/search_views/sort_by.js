_.extend(Craiggers.Views, {

  SortBy: Backbone.View.extend({

    el: $('#sortby'),

    events: {
      'change .sortby': 'sortby'
    },

    initialize: function() {
      this.$('option').attr('selected', false);

      var sort = Craiggers.Search.get('params').sort;
      var priceable = Craiggers.Categories.isPriceable(
        Craiggers.Search.get('category')
      );
      if ( priceable && sort ) {
        if( sort === 'price' ) {
          this.$('.lotohi').attr('selected', true);
        }
        if( sort === '-price' ) {
          this.$('.hitolo').attr('selected', true);
        }
      } else if ( sort === 'relevant' ) {
        this.$('.relevant').attr('selected', true);
      } else {
        this.$('.recent').attr('selected', true);
      }

      if ( !priceable ) {
        this.$('.hitolo, .lotohi').attr('disabled', true);
      } else {
        this.$('.hitolo, .lotohi').attr('disabled', false);
      }
    },

    sortby: function() {
      var selected = this.$('option:selected');
      var params = {
        sort: null,
        order: null
      };

      if ( selected.hasClass('hitolo') ) {
        params.sort = '-price';
      } else if ( selected.hasClass('lotohi') ) {
        params.sort = 'price';
      } else if ( selected.hasClass('relevant') ) {
        params.sort = 'relevant';
      }

      Craiggers.Search.update({
        params: params
      });
    }

  })
})