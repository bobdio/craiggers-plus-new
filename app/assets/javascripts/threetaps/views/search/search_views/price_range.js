_.extend(Craiggers.Views, {


  PriceRange: Backbone.View.extend({

    el: $('#price-range'),

    events: {
      'keyup .min, .max': 'minmaxKeyup',
      'blur .min, .max': 'minmaxBlur',
      'focus .min, .max': 'minmaxFocus',
      'click .reset': 'minmaxReset',
    },

    max: 9999999,
    min: 0,
    mintext: 'min',
    maxtext: 'max',

    initialize: function() {
      this.toggle()

      this.render();
      Craiggers.Search.bind('change:category', this.toggle)

    },

    toggle: function () {
      var priceable = Craiggers.Categories.isPriceable(
        Craiggers.Search.get('category')
      );
      if ( priceable ) {
        $('#price-range').show();
      } else {
        $('#price-range').hide();
      }
    },

    render: function() {
      // TODO: this is ugly
      var price = Craiggers.Search.get('params').price;
      if ( price ) {
        var range = price.split('..');
        if ( range.length === 2 ) {
          this.$('.min').val(range[0]).removeClass('default');
          this.$('.max').val(range[1]).removeClass('default');
          return;
        }
      } else {
        this.$('.min').val(this.mintext).addClass('default');
        this.$('.max').val(this.maxtext).addClass('default');
      }
    },

    minmaxKeyup: function(e) {
      var minmax = $(e.currentTarget);
      minmax.val(minmax.val().replace(/\D/g, ''));
      Craiggers.Search.update({ params: { price: this.range() } });

      if ( e.keyCode === 13 ){
        Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
        Craiggers.Search.set({ type_of_search: 'new_search' })
        Craiggers.Search.submit();
      }
    },

    minmaxBlur: function(e) {
      if ( $(e.currentTarget).is('.min') && !this.$('.min').val() ) {
        this.$('.min').val(this.mintext).addClass('default');
      }
      if ( $(e.currentTarget).is('.max') && !this.$('.max').val() ) {
        this.$('.max').val(this.maxtext).addClass('default');
      }
    },

    minmaxFocus: function(e) {
      if ( $(e.currentTarget).is('.default') ) {
        $(e.currentTarget).val('').removeClass('default');
      }
    },

    minmaxReset: function() {
      this.$('.min').val(this.mintext).addClass('default');
      this.$('.max').val(this.maxtext).addClass('default');
      Craiggers.Search.update({ params: { price: null } });
    },

    range: function() {
      var min = this.$('.min').is('.default') ? this.min : this.$('.min').val();
      var max = this.$('.max').is('.default') ? this.max : this.$('.max').val();
      if ( min.length && max.length) return min + '..' + max;
      if ( min.length) return min + '..';
      if ( max.length) return '..' + max;
      return null;
    },
  })
})