Craiggers.init = function() {
  new Craiggers.Views.SavedSearches();
  Craiggers.Users.renderUserMenu();
  new Craiggers.Views.SearchBar();
  new Craiggers.Views.Postings({
    collection: Craiggers.Postings,
    blank: true
  });

  Craiggers.Search.bind('search:submit', function() {
    // $('#search-query').val(Craiggers.Search.get('query') || '');
    // <PyotrK 2011-11-8>: Previous code does nothing 
    $('#searchcolumn .query .input').val(Craiggers.Search.get('query') || '');
    // </PyotrK>
  });

  Backbone.history.start();

  /*
   * Event listeners
   */

  $('a.skip').bind('click', function() {
    Craiggers.Search.update({
      params: {
        subnav: 'workspace-link',
        nav: 'search-link'
      }
    });
    Craiggers.Controller.search();
  });

  // handle window events
  (function() {
    var minScreenWidth = 1020;
    $(window).resize(function() {
      // 1) tuning jumbolists size
      // 2) ...

      // width
      var diff = $(window).width() - minScreenWidth;
      if ( diff < 0 ) diff = 0;
      $('.container_16.expandable, .grid_16.expandable').width(960 + diff);

      // height
      $('.jumbolist', '#searchbar').css({
        'max-height': $(window).height() - $('#searchbar').offset().top - 50 + 'px',
      });

      // 3) resize posting details
      new Craiggers.Views.PostingDetail().resize();
    });

    var detailBlock = $('#detail');
    $(window).scroll(function() {
      // OPTIMIZE
      // currently this is needed only for horizontal scrolling
      detailBlock.css('margin-left', - window.pageXOffset);
    });
  })();

  $(window).keydown(function(e) {

    if ( $(e.target).is(':input') ) return;

    var KEY = Craiggers.Util.KEY;

    if ( _.include([KEY.UP, KEY.DOWN, KEY.J, KEY.K], e.keyCode) ) {
      e.preventDefault();
      if ( !$('#search.page').is(':visible') ) return;
      var posting = $('#postings .posting').first()
      if ( $('#postings .posting.mostrecent').length ) {
        if ( _.include([KEY.J, KEY.DOWN], e.keyCode)) posting = $('#postings .posting.mostrecent').next('.posting');
        if ( _.include([KEY.K, KEY.UP], e.keyCode)) posting = $('#postings .posting.mostrecent').prev('.posting');
      }
      posting.find('.content').trigger('mouseover');

      if ( posting.offset() ) {

        var ptop = posting.offset().top,
            pheight = posting.height(),
            scrolltop = $(document).scrollTop(),
            wheight = $(window).height(),
            ubuffer = 100,
            dbuffer = 60;

        if ( ptop < scrolltop + ubuffer ) {
          $(document).scrollTop(
            ptop - ubuffer
          );
        } else if ( ptop + pheight + dbuffer > scrolltop + wheight ) {
          $(document).scrollTop(
            scrolltop - (scrolltop + wheight - ptop - pheight - dbuffer)
          );
        }

      }

      if ( $('#fancybox-content').is(':visible') ) {
        $.fancybox.close();
      }

    }

    if ( e.keyCode === KEY.F && $('#postings .posting.selected').length ) {
      $('#postings .posting.selected').find('.favorite').click();
    }


    if ( e.keyCode === KEY['/'] ) {
      e.preventDefault();
      $('#searchbar .query .input').focus();
    }

    if ( _.include([KEY.H, KEY.LEFT], e.keyCode) ) {
      var prev = $('.posting-image-viewer .mini.selected').prev('.mini')
      if (prev[0]){
        prev.click()
      } else {
        var last_image = _.last($('.posting-image-viewer .mini'))
        if (last_image) last_image.click()
      }
      
      if ( prev.length && $('#fancybox-content').is(':visible') ) {
        $('.posting-image-viewer .main').click();
      }
    }
    if ( _.include([KEY.L, KEY.RIGHT], e.keyCode) ) {
      var next = $('.posting-image-viewer .mini.selected').next('.mini');
      if (next[0]){
        next.click()
      } else {
        var first_image = _.first($('.posting-image-viewer .mini'))
        if (first_image) first_image.click()
      }
      next.click();
      if ( next.length && $('#fancybox-content').is(':visible') ) {
        $('.posting-image-viewer .main').click();
      }
    }
    if ( $('.posting-image-viewer .main').is(':visible') && e.keyCode === KEY.Z ) {
      if ( $('#fancybox-content').is(':visible') ) {
        $.fancybox.close();
      } else {
        $('.posting-image-viewer .main').click();
      }
    }

    // 'c' or 'esc'
    //if ( (e.keyCode == 67 && !e.ctrlKey) || e.keyCode == 27 ) {
    if ( e.keyCode === KEY.ESC ) {
        e.preventDefault();
        console.log('esc')
      if ( $('#fancybox-content').is(':visible') ) {
        $.fancybox.close();
      } else {
        if ( $('#notifysaveclose').is(':visible') ) {
          $('#notifysaveclose').click();
        } else {
          if($('#popup-dialog').is(':visible')){
              console.log('popup visible, hiding')
              $('#popup-dialog').hide();
          }
          else {
              console.log('selected posting click')
              $('#postings .posting.selected').click();
          }
        }
      }
    }
  });


  $(window).resize();
  $(window).scroll();

  InitTooltips();
}
