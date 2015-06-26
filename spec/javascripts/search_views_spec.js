describe('Filters', function() {
  beforeEach(function() {
    loadFixtures('search_column.html');
    ich.refresh();

    Craiggers.Search = new Craiggers.Models.Search;
    Craiggers.Categories = new Craiggers.Collections.CraiggersCategories;
    Craiggers.Locations = new Craiggers.Collections.StaticLocations;
  });

  function init(filter) {
    var self = {};

    // create new filter view
    runs(function() {
      _.extend(self, new Craiggers.Views[filter]({
        el: $('.filter-dropdown'),
      }));
    });

    // ... and wait until it is rendered
    waitsFor(function() {
      return self.$('.results').is(':not(:empty)')
    }, 'filters summary', 5000);

    return self
  };

  describe('Categories filter', function() {

    it('should show all categories', function() {
      var self = init('CategoryFilter');

      runs(function() {
        // if category is not specified, it gets default value "all"
        // all categories should have been shown
        expect(self.$('.result').length).toEqual(8);
        // ... and checked
        expect(self.$('.result').find('input:checked').length).toEqual(8);
        // the head label should be "all categories"
        expect(self.$('.allcountname').text()).toEqual('all categories');
      });
    });

    it('should show several categories', function() {
      Craiggers.Search.set({ category: ['bbb', 'ccc'] });
      var self = init('CategoryFilter');

      runs(function() {
        // if there are several specified categories
        // all categories should have been shown
        expect(self.$('.result').length).toEqual(8);
        expect(self.$('.result:visible').length).toEqual(8);
        expect(self.$('.seemore').text()).toEqual('see less...');
        // on "seemore" btn click all categories except first 5 should hide
        self.$('.seemore').click();
        expect(self.$('.result:visible').length).toEqual(5);
        expect(self.$('.seemore').text()).toEqual('see more...');

        expect(self.$('input:checked').length).toEqual(2);
        self.$('.all').click(); // check all categories
        expect(self.$('input:checked').length).toEqual(8);
        self.$('.none').click(); // uncheck all categories
        expect(self.$('input:checked').length).toEqual(0);

        expect(self.$('.allcountname').text()).toEqual('all categories');
      });
    });

    it('should show subcategories', function() {
      Craiggers.Search.set({ category: 'ccc' });
      var self = init('CategoryFilter');

      runs(function() {
        // if there is the only specified category
        // show its subcategories
        expect(self.$('.result').length).toEqual(13);
        expect(self.$('.result').find('input:checked').length).toEqual(13);
        expect(self.$('.allcountname').text()).toEqual('all community');
      });
    });

    it('should show several subcategories', function() {
      Craiggers.Search.set({ category: 'rid pol vol ats grp act'.split(' ') });
      var self = init('CategoryFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(13);
        expect(self.$('.result:visible').length).toEqual(13);
        expect(self.$('input:checked').length).toEqual(6);
        expect(self.$('.allcountname').text()).toEqual('all community');
      });
    });

    it('should show subsubcategories', function() {
      Craiggers.Search.set({ category: 'hsw' });
      var self = init('CategoryFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(4);
        expect(self.$('input:checked').length).toEqual(4);

        // should show short item names
        // ("apts wanted " instead of "housing wanted - apts wanted ")
        expect(self.$('.hou').siblings('.name').text()).toEqual('apts wanted ');

        expect(self.$('.allcountname').text()).toEqual('all housing wanted');
      });
    });

    it('should not show subsubcategories for "apa" subcategory for locations different from NYC', function() {
      Craiggers.Search.set({ category: 'apa' });
      var self = init('CategoryFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(13);
        expect(self.$('input:checked').length).toEqual(1);
        expect(self.$('.allcountname').text()).toEqual('all housing');
      });
    });

    it('should show subsubcategories for "apa" subcategory for location NYC', function() {
      Craiggers.Search.set({
        category: 'apa',
        location: 'newyork'
      });
      var self = init('CategoryFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(4);
        expect(self.$('input:checked').length).toEqual(4);
        expect(self.$('.allcountname').text()).toEqual('all apts / housing');
      });
    });

  });

  describe('Locations filter', function() {
    // TODO: locations filter behavior is still not perfect
    // and should be improved
    // (e.g. "all locations" doesn't return Canada states, only US)

    it('should show all locations', function() {
      var self = init('LocationFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(51);
        expect(self.$('.result').find('input:checked').length).toEqual(51);
        expect(self.$('.allcountname').text()).toEqual('all locations');
      });
    });

    it('should show several states', function() {
      Craiggers.Search.set({ location: ['TX', 'FL', 'CA'] });
      var self = init('LocationFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(51);

        // FIXME: don't pass
        // expect(self.$('.result:visible').length).toEqual(5);
        expect(self.$('.seemore').text()).toEqual('see more...');
        self.$('.seemore').click();
        // expect(self.$('.result:visible').length).toEqual(51);
        // expect(self.$('.seemore').text()).toEqual('see less...');

        expect(self.$('input:checked').length).toEqual(3);
        self.$('.all').click(); // check all locations
        expect(self.$('input:checked').length).toEqual(51);
        self.$('.none').click(); // uncheck all locations
        expect(self.$('input:checked').length).toEqual(0);

        expect(self.$('.allcountname').text()).toEqual('all united states');
      });
    });

    it('should show cities', function() {
      Craiggers.Search.set({ location: 'CA' });
      var self = init('LocationFilter');

      runs(function() {
        // if there is the only specified category
        // show its subcategories
        expect(self.$('.result').length).toEqual(28);
        expect(self.$('.result').find('input:checked').length).toEqual(28);
        expect(self.$('.allcountname').text()).toEqual('all california');
      });
    });

    it('should show several cities', function() {
      var loc = 'losangeles sfbay sandiego chico monterey visalia'.split(' ');
      Craiggers.Search.set({ location: loc });
      var self = init('LocationFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(28);
        expect(self.$('.result:visible').length).toEqual(28);
        expect(self.$('input:checked').length).toEqual(6);
        expect(self.$('.sfbay').siblings('.name').text()).toEqual('sf bay area');
        expect(self.$('.allcountname').text()).toEqual('all california');
      });
    });

    it('should show sublocations', function() {
      Craiggers.Search.set({ location: 'sfbay' });
      var self = init('LocationFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(6);
        expect(self.$('input:checked').length).toEqual(6);
        expect(self.$('.allcountname').text()).toEqual('all sf bay area');
      });
    });

    it('should show several sublocations', function() {
      Craiggers.Search.set({ location: 'sfc eby sby'.split(' ') });
      var self = init('LocationFilter');

      runs(function() {
        expect(self.$('.result').length).toEqual(6);
        expect(self.$('input:checked').length).toEqual(3);
        expect(self.$('.allcountname').text()).toEqual('all sf bay area');
      });
    });

  });

});

