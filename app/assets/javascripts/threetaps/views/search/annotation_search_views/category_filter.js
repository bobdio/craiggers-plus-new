_.extend(Craiggers.Views, {

  CategoryFilter: Craiggers.Views.CategoryFilter.extend({

    countNameCode: function(code, singleCode) {
      // subsubcategories for "apts/housing" should be displayed for
      // "new york city" location only
      // do not display them for other locations
      if ( !Craiggers.Locations.isNYC(Craiggers.Search.get('location'))
           && code == 'apa' ) {
        return this.collection.parentCode(code);
      }

      if ( singleCode && this.collection.hasChildrenCodes(code) )
        return code

      return this.collection.parentCode(code)
    },

    summaryCodes: function() {
      var code = this.code;
      var singleCode = !_.isArray(code);
      code = singleCode ? code : code[0];

      // subsubcategories for "apts/housing" should be displayed for
      // "new york city" location only
      // do not display them for other locations
      if ( !Craiggers.Locations.isNYC(Craiggers.Search.get('location'))
           && code == 'apa' ) {
        return this.collection.siblingCodes(code);
      }

      if ( singleCode && this.collection.hasChildrenCodes(code) ) {
        this.selectall = true;
        return this.collection.childrenCodes(code);
      }

      return this.collection.siblingCodes(code);
    },

    dimension: function(codes) {
      return Craiggers.Categories.isCat(codes[0]) ? 'original_cat' :
             Craiggers.Categories.isSubcat(codes[0]) ? 'original_subcat' :
                                                       'original_subcat_2';
    },

  })
})