_.extend(Craiggers.Views, {

  SavedSearch: Backbone.View.extend({

    className: 'savedsearch',

    events: {
      'click .delete': 'deleteSearch',
      'click .extras .email': 'popupEmail',
      'click .extras .notification': 'popupNotification',
      'click': 'loadSearch'
    },

    initialize: function() {
      // 2011-09-29 12:14 Author: Igor Novak
      // this methos is overloaded for jeboom in standart_search_views.js

      this.location = Craiggers.Locations.nameByCode(this.model.get('location'));
      this.render();
    },

    render: function() {
      var view = this;

      Craiggers.Locations.nameByCodeWithCallback(view.model.get('location').code, build, true)

      function build(data){
        var location;
        var parent_cat;
        var parent_locations;
        var category = view.model.get('category');

        if(category !== 'all' && !Craiggers.Categories.isTopLevel(category))
          parent_cat = Craiggers.Categories.nameByCode(
            Craiggers.Categories.parentCode(category)
          )

        if(typeof(data) === "object") {
          location = data.name;
          parent_locations = Craiggers.Locations.extractLocationsContext(data);
        }
        else
          location = data;

        $(view.el).html(
          JST['savedsearch']({
            name: view.model.get('name'),
            query: view.model.get('query'),
            location: location,
            parent_locations: parent_locations,
            cat: Craiggers.Categories.nameByCode(category),
            parent_cat: parent_cat,
          })
        );
        $('.searches', '#savedsearches').append(view.el);
      }
    },

    popupEmail: function(event) {
      new Craiggers.Views.SavedSearchEmailPopup({model: this.model});
    },

    popupNotification: function(event) {
      new Craiggers.Views.SavedSearchNotificationPopup({model: this.model});
    },

    loadSearch: function(event) {
      if ( !$(event.currentTarget).is('.savedsearch')
           || $(event.target).is(':input') ) return;

      Craiggers.Search.update(this.model.attributes).submit();

      $(this.el).addClass('selected');
    },

    deleteSearch: function() {
      var view = $(this.el),
          model = this.model,
          search = {
            name: model.get('name'),
            params: model.params(),
            extra: { url: model.get('url') },
            flag: true
          };

      new Craiggers.Views.UpdateSavedSearch({
        email: this.model.get('email'),
        name: this.model.get('name'),
        notifications: this.model.get('notifications'),
        destroy_callback: destroy_callback,
        update_callback: update_callback
      });


      return false

      function update_callback(options) {
        view.find('.name .text').html(options.name)

        $.ajax({
          url: '/search/update/' + model.get('id'),
          type: 'put',
          data: options,
          complete: function() {
          }
        });

        model.set(options)
        if(!options.email) model.set({email: null})
        if(!options.notifications) model.set({notifications: null})
      };

      function destroy_callback() {
        if ( model.get('saved_without_params') ) {
          delete search.params;
        }

        view.hide();

        $.ajax({
          url: '/search/delete/' + model.get('id'),
          type: 'delete',
          complete: function() {
            Craiggers.SavedSearches.remove(model);
            view.remove();
          }
        });
      };
    }

  })
})