_.extend(Craiggers.Views, {

  SearchBar: Backbone.View.extend({

    el: $('#searchbar, #searchcolumn'),

    acoptions: {
      width: 200,
      max: 100,
      formatItem: function(el, i, max) {
        if ( el.parents ) {
          return el.path + ' <i>(' + el.parents + ')</i>';
        }
        return el.path;
      },
      formatMatch: function(el, i, max) {
        return el.path;
      },
      formatResult: function(el) {
        return el.name;
      }
    },

    init: function() {
      // 2011-12-01 12:11 Author: Igor Novak
      // use this method for common actions both for craiggers and jeboom
      // be careful with actions sequence!

      this.initAutocompletion();
      if ( !navigator.geolocation ) {
        this.$('.geolocate').hide();
      }
      $('#currentsearch').find('.filter-dropdown').find('.header').find('text')
        .removeClass('selected')
      $('#currentsearch').find('.filter-dropdown').find('.body').hide()

      if ( Craiggers.Search.get('category') !== Craiggers.Search.defaults.category ) {
        $('#searchcolumn').find('.category).find(.input').val(
          Craiggers.Categories.nameByCode(Craiggers.Search.get('category'))
        );
      }

      $('#start_date').datepicker('setDate', Craiggers.Search.get('start') || '');
      $('#end_date').datepicker('setDate', Craiggers.Search.get('end') || '');

      // TODO: check if we need this
      // Craiggers.Search.bind('change', this.updateHolder, this);
    },

    showNotifySave: function() {
        if (Craiggers.User.attributes.signedin)
            new Craiggers.Views.NotifySave();
        else
            new Craiggers.Views.Dialog('must_sign_up');
    },

    keydownCategory: function(event) {
      if ( event.keyCode === Craiggers.Util.KEY.TAB && !this.validCategory() ) {
        event.preventDefault();
        this.showAllCategories();
      }
    },

    selectLocationFromList: function(event) {
      var name = $(event.currentTarget).text();
      this.$('.location .input').val(name);

      var location = $(event.currentTarget)
              .parents('.location').first()
              .find('.primary').text();
      // TODO scope/options will have to change for codeByName
      // once countries are introduced
      var code = Craiggers.Locations.codeByName(name, null, location) || Craiggers.Search.defaults.location;

      this.clearAllLocations();

      Craiggers.Search.update({ location: code });

      this.$('.location .holder').hide();
      // this.$('.location .input').focus();
    },

    clearAllLocations: function() {
      if ( this.$('.location .jumbolist').is(':visible') ) {
        this.$('.location .jumbolist').hide();
        this.$('.location .viewlist').addClass('closed');
      }
    },

    showAllLocations: function() {
      this.clearAllCategories();
      var viewlist = this.$('.location .viewlist');
      var jumbolist = this.$('.location .jumbolist');
      if ( viewlist.hasClass('closed') || !jumbolist.is(':visible') ) {
        viewlist.removeClass('closed');
        this.showJumboList(jumbolist);
      }
      this.$('.location .input').focus();
    },

    showJumboList: function(jumbolist) {
      // needed for jumbolist height calculating
      $(window).resize();
      jumbolist.show();
    },

    updateSearchCategory: function(event) {
      var val = $(event.currentTarget).val();

      if ( val === 'see filters' || _.isArray(Craiggers.Search.get('category'))) return;
      var current = Craiggers.Categories.nameByCode(
        Craiggers.Search.get('category')
      );
      if ( !val.length ) {
        Craiggers.Search.update({
          category: Craiggers.Search.defaults.category
        });
      } else if ( val !== current ) {
        Craiggers.Search.update({
          category: Craiggers.Categories.codeByName(val)
        });
      }
      return true;
    },

    clearAllCategories: function() {
      if ( this.$('.category .jumbolist').is(':visible') ) {
        this.$('.category .jumbolist').hide();
        this.$('.category .viewlist').addClass('closed');
      }
    },

    clearHolder: function(event) {
      $(event.currentTarget).parents('.wrapper').find('.holder').hide();
    },

    updateHolder: function(event) {
      var input = event ? $(event.target) : this.$('.input');
      input.each(function() {
        if ( $(this).val() ) {
          $(this).siblings('.holder').hide();
        } else {
          $(this).siblings('.holder').show();
        };
      });
    },

    clearInputHoldersIfVals: function() {
      this.$('.input').each(function() {
        var holder = $(this).parents('.wrapper').find('.holder');
        if ( $(this).val().length ) {
          holder.hide();
        } else {
          holder.show();
        }
      });
    }

  })
})