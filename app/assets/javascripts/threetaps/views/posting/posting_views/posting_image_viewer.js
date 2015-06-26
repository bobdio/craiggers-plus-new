_.extend(Craiggers.Views, {
  PostingImageViewer: Backbone.View.extend({

    className: 'posting-image-viewer',

    events: {
      'click .mini': 'showImage',
      'click .main': 'zoom'
    },

    initialize: function() {
      var viewer = this;
      var posting = this.model;

      $(this.el).html(
        JST['posting-image-viewer']()
      );
      
      this.$('.cropFrame').remove()
      this.$('.frame').html('')
      this.$('.frame').prepend($('<img>', {height: '300px'}).addClass('main').attr('src', posting.get('image_urls')[0]))
      .css('max-width', '400px')
      //hide if has no images
      if (!posting.get('has_images')){
        $(this.el).hide();
        return;
      }

      //set minis
      _.each(posting.get('image_urls'), function(img) {
        viewer.$('.minis').append(
          $('<img>').addClass('mini').attr('src', img)
        );
        
        viewer.$('.images_for_fancybox').append(
          $('<a>', {class: 'fancybox_image', href: img, rel: 'gallery'})
        );
      });

      this.imagesLoaded = false;
      $('.minis', this.el).hide().onImagesLoad({
        selectorCallback: this.showImages
      });
    },

    showImage: function(event) {
      var mini = $(event.target);
      this.$('.cropFrame').remove()
      this.$('.frame').html('')
      $('.frame').prepend($('<img>', {height: '300px'}).addClass('main').attr('src', mini.attr('src')))
      if ($('img.main').width() > $('img.main').height()){
        $('img.main').crop({
          width: 400,
          height: 300,
          controls: false,
          loading: ''
        });
      }

      // this.$('.main').attr('src', mini.attr('src'));
      mini.addClass('selected').siblings('.mini').removeClass('selected');
    },

    zoom: function() {
      var src = this.$('.main').attr('src');
      var posting = this.model;
      
      // for geolocation
      var re = new RegExp(/maps.googleapis.com/i);
      if ( re.test(src) ) {
        var latlon = posting.get('latitude') + ',' + posting.get('longitude');
        var href = 'http://maps.google.com/maps?q=' + latlon;
        var popupWin = window.open(href, 'map', 'location,width=800,height=600,top=100');
        popupWin.focus();
        return false;
      }
      $('.fancybox_image[href="'+src+'"]').trigger('click')
    },

    showImages: function(images) {
      // 2011-10-06 13:06 Author: Igor Novak
      this.imagesLoaded = true

      // $('.mini').each(function() {
      //   $(this).addClass(imageQuality(this));
      // });

      // There are three kinds of images: 'good', 'bad', and 'small'
      // ('small' are worse than 'bad').
      // By default all 'small' minis are hidden.
      // If there is only one image in the set or there are only 'small' ones,
      // show first (and 'mini' for it though).
      // If there are 'good' images show first one.
      // Otherwise choose from the 'bad' images the best one and show it.
      // if ( $('.mini').length > 1 ) {
      //   if ( $('.mini.good').length ) {
      //     $('.mini.good').first().click();
      //   } else {
      //     if ( $('.mini.bad').length ) {
      //       $('.mini[src="' + bestImageByRatio() + '"]').click();
      //     } else {
      //       $('.mini').first().show().click();
      //     };
      //   };
      // } else {
      //   $('.mini').first().show().click();
      // };

      images.show()
      $(images[0]).find('img').first().click()
      
      // function imageQuality(img) {
      //   var SMALL_HEIGHT = 50
      //   var SMALL_WIDTH = 50
      //   var MIN_HEIGHT = 101
      //   var MIN_WIDTH = 101
      //   var MAX_HEIGHT = 1000
      //   var MAX_WIDTH = 1000
      //   var MAX_RATIO = 2.1

      //   var imgObj = new Image
      //   imgObj.src = img.src

      //   var height = imgObj.height
      //   var width = imgObj.width

      //   // sometimes height and width happen to be 0
      //   // temp solution
      //   if ( !height || !width ) return 'bad'

      //   if ( height < SMALL_HEIGHT || width < SMALL_WIDTH ) {
      //     return 'bad small'
      //   }

      //   var ratio_value = ratio(imgObj)

      //   if ( height < MIN_HEIGHT
      //        || width < MIN_WIDTH
      //        || height > MAX_HEIGHT
      //        || width > MAX_WIDTH
      //        || ratio_value > MAX_RATIO ) {
      //     return 'bad'
      //   }
      //   return 'good'
      // }

      // function bestImageByRatio() {
      //   // current strategy: find the image with the best width/height ratio
      //   // probably it is possible to find better strategy

      //   var imageAr = $('.mini:not(.small)').get()
      //   var len = imageAr.length
      //   if (!len) return

      //   var index = 0
      //   var bestRatio = ratio(imageAr[0])
      //   for (var i = 1; i < len; i++) {
      //     var curRatio = ratio(imageAr[i])
      //     if (curRatio < bestRatio) {
      //       index = i
      //       bestRatio = curRatio
      //     }
      //   }
      //   return imageAr[index].src
      // }

      // function ratio(img) {
      //   var ratio = img.width / img.height
      //   if ( ratio < 1 ) {
      //     ratio = 1 / ratio
      //   }
      //   return ratio
      // }
    }
  })
});
