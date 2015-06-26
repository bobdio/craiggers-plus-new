_.extend(Craiggers.Views, {

  LocationFilter: Craiggers.Views.LocationFilter.extend({

    el: $('#locationfilter'),

    initialize: function() {
      var collection = this.collection = Craiggers.Locations;
      _.bindAll(this, 'render');
      this.selectall = false;

      this.code = Craiggers.Search.get('location');
      var codes = this.summaryCodes();

      var params = Craiggers.Search.params(false, { location: null });
      params.dimension = collection.dimension(codes[0]);
      params.codes = codes.join(',');
      //Craiggers.Search.summary(params, this.render);
    },

    update: function(event) {
      // this duplicates CategoryFilter#update functionality
      // TODO: hard refactoring
      var params = {};
      // "click" event seems to be incorrect, probably "change" event is needed
      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        params.location = $(event.currentTarget).parent().find('.code').text();

        // deselect all checkboxes so we make sure to populate filters correctly
        this.$('.selector input').filter('.' + params.location).attr('checked', 'checked');
        this.$('.selector input').not($('.' + params.location)).removeAttr('checked');
      } else {
        // populate from select boxes
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        if ( checkedCheckBoxes.length < checkBoxes.length ) {
          params.location = _.map(checkedCheckBoxes, function(c) {
            return $(c).val();
          });
        } else {
          var currentLocation = Craiggers.Search.get('location');
          if ( !_.isArray(currentLocation) ) currentLocation = [currentLocation];
          params.location = Craiggers.Locations.parentCode(currentLocation[0]);
        }
      }
      Craiggers.Search.update(params);
    },

  })
})