// TODO: move to separate file, e.g. threetaps_posting_views.js
// _.extend(Craiggers.Views.PostingContent.prototype, {

  // updateAndSearchCategory: function(event) {
  //   alert('sdf');
  //   var tag = $(event.currentTarget);
  //   var hashTag = tag.find('.text').text();
  //   tag.addClass('highlight')//.siblings('.tag').removeClass('highlight');
  //   var query = Craiggers.Search.get('query');
  //   if ( !query.match(hashTag) ) { // wtf?
  //     Craiggers.Search.update({
  //       query: (query || '') + ' ' + hashTag
  //     }).submit();
  //   }
  // },

  // highlightCategory: function() {
  //   var $annotations = this.$('.annotations');
  //   $annotations.find('.category .tag .text').filter(function() {
  //     var query = (Craiggers.Search.get('query') || '').toLowerCase();
  //     return !_.isNull(query.match($(this).text().toLowerCase()));
  //   }).parents('.tag').addClass('highlight');
  // }

// });

Craiggers.Models.Posting = Craiggers.Models.Posting.extend({

  initialize: function() {
    var annotations = this.get('annotations');
    if(annotations === undefined) annotations = this.set({'annotations': {}})

    this.init();

    var heading = this.get('heading');
    this.set({ 'heading': heading && heading.replace(/^"|"$/g, '') });

    this.set({
      original_map_yahoo: annotations.original_map_yahoo,
      original_map_google: annotations.original_map_google,
      has_original_map_links: annotations.original_map_google
                              || annotations.original_map_yahoo
    });

    if ( this.get('currency') == 'USD' ) {
      this.set({ currency: '$' });
    }


    var brs;
    if ( brs = annotations.bedrooms ) {
      annotations.bedroom_count = brs.replace('br', '');
      annotations.bedrooms = brs.replace('br', ' bedroom');
    }

    var sqft = annotations.sqft;
    annotations.sqft = sqft && _.commatizeNumber(sqft);

    this.setCatAnnotations();

    this.set({
      'category_path': this.categoryPath(),
      'statuses': this.statuses(),
      'source': this.get('source'),
      'id': this.get('id'),
      'housingCode': 'RRRR',
      'jobsCode': 'JJJJ',
      'supportComments': true
    });
  },

  categoryPath: function() {
    var categoryTagsStr = this.getAnnotation('categoryTag');
    if ( categoryTagsStr ) {
     caterogyPath = this.getCategoryHashTags(categoryTagsStr);
     caterogyPath = _.first(caterogyPath, 5).join(' > ');
    } else {
      caterogyPath = [] // 'Uncategorized';
    };
    return _.flatten([
      caterogyPath,
      Craiggers.Sources.nameByCode(this.get('source'))
    ]).join(' > ').toLowerCase();
  },

  getCategoryHashTags: function(categoryTagsStr){
    return _(categoryTagsStr.split('#')).chain().compact()
               .map(function( item ) {
                  return ('#' + item).replace( /^\s+|\s+$/g, '' )
               }).value();
  },

  setCatAnnotations: function() {
    // 2011-10-03 13:22 Author: Igor Novak
    var cat, subcat, categoryTags, categoryTagsStr ;
    categoryTagsStr = this.get('annotations').categoryTag;
    if ( categoryTagsStr )
      categoryTags = this.getCategoryHashTags(categoryTagsStr);
    this.get('annotations').categoryTags = categoryTags ;

    // cat = this.get('category');
    // if ( Craiggers.Categories.isSubcat(cat) ) {
    //   subcat = cat;
    //   cat = Craiggers.Categories.categoryByCode(cat);

    //   this.get('annotations').subcat = subcat;
    //   this.get('annotations').subcategory = '#' + Craiggers.Categories.nameByCode(subcat);
    // };
    // this.get('annotations').cat =  cat;
    // this.get('annotations').category = '#' + Craiggers.Categories.nameByCode(cat);
  },

  statuses: function() {
    var a = this.get('annotations');
    var statuses;
    if ( typeof(a) !== 'undefined' ) {
      statuses = [
        (typeof(a.telecommuting) !== 'undefined') ? 'telecommute' : null,
        (typeof(a.contract) !== 'undefined') ? 'contract' : null,
        (typeof(a.internship) !== 'undefined') ? 'internship' : null,
        (typeof(a.partTime) !== 'undefined') ? 'part-time' : null,
        (typeof(a.nonprofit) !== 'undefined') ? 'non-profit' : null
      ];
    } else {
      statuses = [];
    }
    return _.compact(statuses).join(' / ');
  },

});
