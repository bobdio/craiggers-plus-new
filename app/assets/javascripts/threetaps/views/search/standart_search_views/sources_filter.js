_.extend(Craiggers.Views, {

  SourcesFilter: Craiggers.Views.Filter.extend({

    DEFAULT_VISIBLE_FILTERS: 5,

    el: $('#sourcesfilter'),

    events: {
      'click .results .name': 'search',
      'click .allnone .none': 'deselectAll',
      'click .allnone .all': 'selectAll',
      'change .selector input': 'update_and_fire_search',
      'click .seemore': 'toggleMore'
    },

    initialize: function() {
      this.$('.loader').show();
      this.$('.body').hide();
      // if ( Craiggers.Search.get('source') != 'all' ) {
        // if ( !this.$('.text').is('.selected') ) {
          this.$('.text').addClass('selected')
          
        // }
      // } else {
        // this.$('.text').removeClass('selected');
        // this.$('.body').hide();
      // }

      _.bindAll(this, 'render');

      var source = Craiggers.Search.get('source');
      this.selectall = false;
      var codes;

      // 2011-11-14 20:00 Author: Igor Novak
      // TODO: clean up
      if ( !_.isArray(source) ) {
        source = source.split('|')  
      }  
      if ( _.isArray(source) ) {
        codes = Craiggers.Sources.siblingCodes(source[0]);
        if ( source[0] == 'all' ) {
          this.selectall = true;
        };
      } else if ( source === 'all' ) {
        codes = Craiggers.Sources.siblingCodes(source);
        this.selectall = true;
      } else {
        var checked = this.$('.selector input:checked');
        if ( checked.size() == 1 && $(checked[0]).val() == source ) {
          codes = Craiggers.Sources.siblingCodes(source);
        } else {
          codes = Craiggers.Sources.childrenCodes(source);
        }
      }
      if ( !_.isArray(source) ) source = [source];
      this.source = source;

      var params = Craiggers.Search.params(false, { source: null });
      params.dimension = 'source';
      // params.codes = codes.join(',');

      if ( this.currentRequest ){ this.currentRequest.abort(); }

      this.currentRequest = Craiggers.Search.summary_for_source(params, this.render);
    },

    render: function(data) {
      var view = this;

      var total = 0;
      var items = _.map(data, function(data) {
        var name = Craiggers.Sources.nameByCode(data[1]);
        if(name) {
          total += data[2];
          return {
            name: name,
            count: _.commatizeNumber(data[2]),
            code: data[1],
            selected: view.selectall || _.include(view.source, data[1])
          };
        }
      });
      this.$('.allcountnumber').html(_.commatizeNumber(total));
      this.$('.results').html(JST['filters-list']({
        items: _.compact(items)
      }));
      this.$('.loader').hide();
      this.$('.body').show();
    },

    update: function(event) {
      var params = {};
      if ( event && event.type == 'click' ) {
        // user clicked a status so populate from click
        params.source = $(event.currentTarget).parent().find('.code').text();

        // deselect all checkboxes so we make sure to populate filters correctly
        this.$('.selector input').filter('.' + params.source).attr('checked', 'checked');
        this.$('.selector input').not($('.' + params.source)).removeAttr('checked');
      } else {
        // populate from select boxes
        var checkBoxes = this.$('.selector input');
        var checkedCheckBoxes = this.$('.selector input:checked');
        if ( checkedCheckBoxes.size() < checkBoxes.size() ) {
          params.source = _.map(checkedCheckBoxes, function(c) {
            return $(c).val();
          });
        } else {
          params.source = ['all'];
        }
      }
      Craiggers.Search.update(params);
    },

    update_and_fire_search: function(){
      this.update();
      Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
      Craiggers.Search.submit();
    },

    search: function(event) {
      this.$('.selector').find('input').removeAttr('checked');
      $(event.currentTarget).siblings('.selector').find('input').attr('checked', 'checked');
      this.update_and_fire_search();
    }

  })
})