Craiggers.Views.SummaryFilter = Craiggers.Views.Filter.extend({
  // parent class for CategoryFilter, LocationFilter and NeighborFilter

  events: {
    'click .results .name': 'search',
    'click .allnone .none': 'deselectAll',
    'click .allnone .all': 'selectAll',
    'change .selector input': 'update',
    'click .seemore': 'toggleMore'
  },

  countNameCode: function(code, singleCode) {
    if ( singleCode && this.collection.hasChildrenCodes(code) )
      return code

    return this.collection.parentCode(code)
  },

  summaryCodes: function() {
    var code = this.code;
    var singleCode = !_.isArray(code);
    code = singleCode ? code : code[0];

    if ( singleCode && this.collection.hasChildrenCodes(code) ) {
      this.selectall = true;
      return this.collection.childrenCodes(code);
    }

    return this.collection.siblingCodes(code);
  },

  render: function(data) {
    var collection = this.collection;
    this.$('.seemore').text('see more...').hide();

    // var codes = this.code;
    // var singleCode = !_.isArray(codes);
    // var code = singleCode ? codes : codes[0];

    // var countNameCode = this.countNameCode(code, singleCode);
    // var countName = collection.shortNameByCode(countNameCode);
    // var allcountname = ('all ' + countName).replace('all all', 'all');
    // this.$('.allcountname').text(allcountname);
    var total = 0;
    var selectall = this.selectall;
    var items = _.map(data['summary'], function(data) {
      total += data[2];
      return {
        name: collection.shortNameByCode(data[1]),
        count: _.commatizeNumber(data[2] || 0),
        count_int: data[2] || 0,
        code: data[1],
        selected: selectall ||
            _.include(_([data[1]]).flatten(), data[1])
      }
    });

    items.sort(function(a,b){ return b.count_int - a.count_int })

    this.$('.allcountnumber').html(_.commatizeNumber(total));
    this.renderFiltersList(items);
  },

});