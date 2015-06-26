Craiggers.Views.Filter = Backbone.View.extend({

  DEFAULT_VISIBLE_FILTERS: 5,

  showResults: function() {
    this.$('.header').find('.text').addClass('selected');
    this.$('.body').show();

    // jeboom only
    this.el.parents('#morefilters').children('.header')
          .find('.text').addClass('selected')
          .end().siblings('.body').show();
  },

  selectAll: function() {
    this.$('.results').find('.selector').find('input').attr('checked', 'checked');
    this.update();
  },

  deselectAll: function() {
    this.$('.results').find('.selector').find('input').removeAttr('checked');
    this.update();
  },

  toggleMore: function(event) {
    var $target = $(event.target);
    var $results = $target.prev().find('.result'); // TODO: this is fragile

    var collapsed = $results.filter(function() {
      return $(this).css('display') == 'none'
    }).length;
    collapsed = !collapsed;

    if ( collapsed ) {
      $results.slice(this.DEFAULT_VISIBLE_FILTERS).hide();
      $target.text('see more...');
    } else {
      $results.slice(this.DEFAULT_VISIBLE_FILTERS).show();
      $target.text('see less...');
    }
  },

  renderFiltersList: function(items, selector) {
    if ( !selector ) {
      selector = '.results'
    };

    // sorting items by selected/unselected
    var groups = _(items).groupBy(function(item) {
      return item.selected
    });
    items = (groups[true] || []).concat(groups[false] || []);

    var $results = this.$(selector);
    var $seemore = $results.next('.seemore'); // HACK: this is fragile

    $results.html(JST['filters-list']({ items: items }));

    if ( this.options.hideCounts ) // only for cat filters
      $results.find('.count').hide();

    $results.find('.result').slice(0, this.DEFAULT_VISIBLE_FILTERS).show();

    var $tailItems = $results.find('.result').slice(this.DEFAULT_VISIBLE_FILTERS);
    if ( !$tailItems.length )
      return

    $seemore.show();

    // old condition (without selected/unselected sorting)
    // if ( !this.selectall && $tailItems.find(':checked').length )
    if ( this.showall ||
         !this.selectall && $tailItems.first().find('input').is(':checked') ) {
      $tailItems.show();
      $seemore.text('see less...');
    }

    var expand = !this.selectall && _.any(items, function(item) {
      return item.selected
    })
    if ( expand ) this.showResults()
  },

  search: function(event) {
    this.update(event);
    Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
    Craiggers.Search.set({ type_of_search: 'new_search' })
    Craiggers.Search.submit();
  }

});