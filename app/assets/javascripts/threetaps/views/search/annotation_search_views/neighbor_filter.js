_.extend(Craiggers.Views, {

  NeighborFilter: Craiggers.Views.SummaryFilter.extend({

    el: $('#neighborfilter'),

    initialize: function() {
      var collection = this.collection = Craiggers.Neighborhoods;
      _.bindAll(this, 'render');

      var loc = Craiggers.Search.get('location');
      var codes = Craiggers.Neighborhoods.getItemsByLocation(loc);
      if ( !codes.length )
        return this.el.hide();

      var curParams = Craiggers.Search.get('params').original_locality;
      if ( curParams ) {
        curParams = curParams.replace(/AND/g, '/');
        this.code = decodeURIComponent(curParams).split(' OR ');
      } else {
        this.code = codes;
      };
      this.selectall = !this.code;

      var params = Craiggers.Search.params(false, { original_locality: null });
      params.dimension = 'original_locality';
      params.codes = codes.join(',');
      //Craiggers.Search.summary(params, this.render);
      this.el.show();
    },

    countNameCode: function() {
      var collection = this.collection;
      var codes = _(this.code).chain().map(function(i) {
        return collection.parentCode(i)
      }).uniq().value();
      if ( codes.length < 2 )
        return codes[0]

      return collection.parentCode(codes[0])
    },

    update: function() {
      var codes = this.$(':checked').map(function() {
        return this.value.replace(/\//g, 'AND')
      });
      var params = [].join.call(codes, ' OR ');
      Craiggers.Search.update({
        params: { original_locality: params }
      });
    },

    search: function(event) {
      this.deselectAll();
      var $input = $(event.currentTarget).siblings('.selector').find('input');
      $input.attr('checked', !$input.attr('checked'));
      this.update();
      Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
      Craiggers.Search.submit();
    }

  })
})