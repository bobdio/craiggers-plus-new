_.extend(Craiggers.Views, {

  MissingFavoritesPopup: Backbone.View.extend({
    id: 'missing-favorites-popup',

    events: {
    },

    initialize: function(options){
//        $(this.el).html(
//            ich['missing-favorites-popup-template']({
//                count: options.count
//            })
//        );

        $.fancybox({
            autoDimensions: false,
            centerOnScroll: true,
            content: JST['missing-favorites-popup-template']({count: options.count}),
            height: 60,
            hideOnOverlayClick: false,
            scrolling: 'no',
            titleShow: false,
            width: 200
        });
    }

//    render: function(){
//        $(this).show();
//    }
  })
});
