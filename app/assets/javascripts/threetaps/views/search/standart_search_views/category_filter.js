_.extend(Craiggers.Views, {
  CategoryFilter: Craiggers.Views.CategoryFilter.extend({

    dimension: function(codes) {
      return 'category'
    },

  })
})