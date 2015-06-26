_.extend(Craiggers.Views, {
  CategoryFilter: Craiggers.Views.SummaryFilter.extend({

    el: $('#categoryfilter'),

    initialize: function() {
      var collection = this.collection = Craiggers.Categories;
      _.bindAll(this, 'render');
      this.selectall = false;

      this.code = this.options.category || Craiggers.Search.get('category');
      var codes = this.summaryCodes();

      // if ( this.collection.isCat(codes[0]) )
      //   this.showall = true; // always expand items list

      var params = Craiggers.Search.params(false, { category: null });

      if ( this.options.hideCounts ) {
        var data = {
          total: 0,
          totals: {}
        };
        _.each(codes, function(code) {
          data.totals[code] = 0;
        });
        this.render(data);

        this.$('.allcount').hide();
      } else {
        params.dimension = this.dimension(codes);
        /* params.codes = codes.join(','); */
        Craiggers.Search.summary(params, this.render);

        this.$('.allcount').show();
      }
    },

    update: function(event) {
      // TODO: hard refactoring
      var params = {};
      // "click" event seems to be incorrect, probably "change" event is needed
      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        params.category = $(event.currentTarget).parent().find('.code').text();

        // deselect all checkboxes so we make sure to populate filters correctly
        this.$('.selector input').filter('.' + params.category).attr('checked', 'checked');
        this.$('.selector input').not($('.' + params.category)).removeAttr('checked');
      } else {
        // populate from select boxes
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        if ( checkedCheckBoxes.length < checkBoxes.length ) {
          params.category = _.map(checkedCheckBoxes, function(c) {
            return $(c).val();
          });
        } else {
          var currentCategory = Craiggers.Search.get('category');
          if ( !_.isArray(currentCategory) ) currentCategory = [currentCategory];
          params.category = Craiggers.Categories.parentCode(currentCategory[0]);

          // old solution
          // TODO: make sure the new one works well
          // params.category = $(Craiggers.Categories.elByCode(currentCategory[0]).parent().parent().find('.code')[0]).text();
        }
      }
      Craiggers.Search.update(params);
    },

  })
})