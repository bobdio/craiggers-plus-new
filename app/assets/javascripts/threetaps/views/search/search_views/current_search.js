_.extend(Craiggers.Views, {

  CurrentSearch: Backbone.View.extend({

    el: $('#currentsearch'),

    events: {
      'click .header': 'toggleResults',
      'keydown #location_input': 'keydownCurrentSearchLocation',
      "keydown input[type='submit']": 'keydownCurrentSearchButtonSearch',
      "keydown input[type='button']": 'keydownCurrentSearchSave',
      "keydown #min-price-range": 'keydownCurrentSearchMinPrice',
      "keydown #search-name": 'keydownCurrentSearchSearchName',
      "keydown #notify-email": 'keydownCurrentSearchNotifyEmail',
      "keydown #notify-email-address": 'keydownCurrentSearchNotifyEmailAddress',
      "keydown #save-notification": 'keydownSaveNotification'
    },

    initialize: function(options) {
      this.data = Craiggers.Search.params();
      this.render();
    },

    toggleResults: function(event) {
      $(event.currentTarget)
          .find('.text').toggleClass('selected')
          .end().siblings('.body').toggle();
    },

    keydownCurrentSearchLocation: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#location_input"))) {
        $("input[type='submit']").focus();
        e.preventDefault();
      }
    },

    keydownCurrentSearchButtonSearch: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("input[type='submit']"))) {
         $("input[type='button']").focus();
         e.preventDefault();
      }
    },

    keydownCurrentSearchSave: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("input[type='button']")) && ($("#price-range").is(':visible'))) {
        $("#min-price-range").focus();
        e.preventDefault();
      }
    },

    keydownCurrentSearchMinPrice: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#min-price-range"))) {
        $("#max-price-range").focus();
        e.preventDefault();
      }
    },

    keydownCurrentSearchSearchName: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#search-name"))) {
        $("#notify-email").focus();
        e.preventDefault();
      }
    },

    keydownCurrentSearchNotifyEmail: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#notify-email"))) {
        $("#notify-email-address").focus();
        e.preventDefault();
      }
    },

      keydownCurrentSearchNotifyEmailAddress: function(e) {
      if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#notify-email-address"))) {
        $("#save-notification").focus();
        e.preventDefault();
      }
    },

      keydownSaveNotification: function(e){
          if ((e.keyCode === Craiggers.Util.KEY.TAB) && ($(e.target).is("#save-notification"))) {
              $("#search-name").focus();
              e.preventDefault();
          }
      }
  })
})