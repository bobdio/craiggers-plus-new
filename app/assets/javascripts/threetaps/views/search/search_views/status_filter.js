_.extend(Craiggers.Views, {


  StatusFilter: Craiggers.Views.Filter.extend({

    el: $('#statusfilter'),

    events: {
      'click .results .name': 'search',
      'click .allnone .none': 'deselectAll',
      'click .allnone .all': 'selectAll',
      'change .selector input': 'update'
    },

    initialize: function() {
      _.bindAll(this, 'render');

      this.status = Craiggers.Search.get('params').status || '';
      var params = Craiggers.Search.params(false, { status: false });
      params.codes = 'stolen,lost,found,wanted,offered';
      params.dimension = 'status';
      //Craiggers.Search.summary(params, this.render);

      this.isMobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

      if(this.isMobile)
      {
        window.scrollTo(0,0);
      }

    },

    render: function(data) {
      var view = this;
      var selectall = !this.status;

      this.$('.allcountnumber').html(_.commatizeNumber(data.total));

      var items = _.map(data.sommary, function(total, code) {
        return {
          name: code,
          count: _.commatizeNumber(total),
          code: code,
          selected: selectall || _.include(view.status.split(' OR '), code)
        }
      });

      this.$('.results').html(JST['filters-list']({ items: items }));

      var expand = !selectall && _.any(items, function(item) {
        return item.selected
      })
      if ( expand ) this.showResults()
    },

    update: function(event) {
      var query = Craiggers.Search.get('query');
      var params = {};

      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        var type = $(event.currentTarget);
        params.status = type.parent().find('.code').text();

        // deselect all checkboxes so we make sure to populate filters correctly
        this.$('.selector input').filter('.' + params.status).attr('checked', 'checked');
        this.$('.selector input').not($('.' + params.status)).removeAttr('checked');
      } else {
        // populate from select boxes
        params.status = '';
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        if ( checkedCheckBoxes.size() < checkBoxes.size() ) {
          checkedCheckBoxes.each(function(index, selector) {
            params.status += $(selector).val() + ' OR ';
          });
        }
        params.status = params.status.substring(0, params.status.lastIndexOf(' OR '));
      }
      Craiggers.Search.update({
        query: query,
        params: params
      });
    },

  })
})