_.extend(Craiggers.Views, {


  RadiusFilter: Craiggers.Views.RadiusFilter.extend({

    el: $('#radiusfilter'),

    events: {
      'keyup .distance': 'updateDistance',
      'change select': 'updateDimension'
    },

    initialize: function() {
      this.dimension = 'km';
      this.distance = 0;

      Craiggers.Search.bind('change:radius', this.toggleRadius)

      if(this.updateFromModel()) 
        this.showResults()
    },

    toggleRadius: function() {
      if((lat = Craiggers.Search.get('radius').lat) && (long = Craiggers.Search.get('radius').long)) {
        $('#radiusfilter').find('.distance').attr('disabled', false)
      }
      else {
        $('#radiusfilter').find('.distance').attr('disabled', true)
      }
    },

    updateFromModel: function() {
      var radius = Craiggers.Search.get('params').radius;

      if(radius) {
        this.dimension = radius.replace(/[0-9]/g, '');
        this.distance = radius.replace(/[a-z]/g, '');

        this.el.find('.dimension option[value="' + this.dimension + '"]').attr('selected', true);
        this.el.find('.distance').val(this.distance);
      }
      else {
        this.el.find('.dimension option[value="mi"]').attr('selected', true);
        this.el.find('.distance').val('');
      }

      this.toggleRadius()

      return radius
    },

    updateDistance: function(event) {
      this.distance = $(event.currentTarget).val();

      Craiggers.Search.update({
        params: { radius: this.radius() }
      });

      if ( event.keyCode === Craiggers.Util.KEY.ENTER ){
        Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
        Craiggers.Search.set({ type_of_search: 'new_search' })
        Craiggers.Search.submit();
      }
    },

    updateDimension: function(event) {
      this.dimension = $(event.currentTarget).val();

      Craiggers.Search.update({
        params: { radius: this.radius() }
      });
    },

    radius: function() {
      if(this.distance) return this.distance + this.dimension
      else return null
    },
  }),

  PriceRange: Craiggers.Views.PriceRange.extend({
    minmaxReset: function() {
      this.$('.min').val(this.mintext).addClass('default');
      this.$('.max').val(this.maxtext).addClass('default');
      Craiggers.Search.update({
        params: { price: null }
      });
      Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
      Craiggers.Search.submit();
    }
  }),

  SavedSearch: Craiggers.Views.SavedSearch.extend({
    initialize: function() {
      var view = this;
      this.location = this.model.get('location');

      Craiggers.Locations.nameByCodeWithCallback(this.location.code, callback, true);

      function callback(data) {
        if ( !data.error ){
          view.location = data.name;
        }

        view.render();
      };
    }
  })
})