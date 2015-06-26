function InitTooltips() {
  if ( !window.localStorage )
    return

  var Tooltips = init();

  // init saving search tips
  if ( !Tooltips.saveSearches )
    saveSearchTip();

  // init saving search tips
  if ( !Tooltips.favoritePostings )
    favoritePostingsTip();

  function saveSearchTip() {
    var counter = 4;
    Craiggers.Search.bind('search:complete', function() {
      if ( !counter )
        saveTip();

      counter -= 1;
    });

    function saveTip() {
      var params = {
        target: '.button.savesearch',
        text: "You can save your searches!",
        css: {
          'margin-top': '-35px',
          'margin-left': '97%',
          'width': '120px',
        },
        pointerCss: {
          'left': '-10px',
          'top': '12px'
        },
        callback: function() {
          Craiggers.SavedSearches.bind('add', _.once(savedTip));
        },
      };
      showTip(params);

      updateTooltips({ saveSearches: 1 });
    };

    function savedTip() {
      var params = {
        target: '#drawer-button',
        text: "Now you can find your saved searches here",
        css: {
          'margin-top': '25px',
          'margin-left': '2px',
          'width': '130px',
        },
        pointerCss: {
          'left': '-10px',
          'top': '12px'
        }
      };
      showTip(params)
    };
  };

  function favoritePostingsTip() {
    _.extend(Craiggers.visited, Backbone.Events);
    Craiggers.visited.bind('visitTwice', _.once(favoriteTip));

    function favoriteTip() {
      var params = {
        target: '#detail .favorite',
        text: "You can save your favorite postings!",
        css: {
          'right': 0,
          'width': '110px',
          'margin-top': '25px'
        },
        pointerCss: {
          'border-width': '0 10px',
          'border-right-color': 'transparent',
          'border-bottom': '10px solid rgba(0, 0, 0, 0.8)',
          'top': '-10px',
          'right': '18px'
        }
      };
      showTip(params);

      updateTooltips({ favoritePostings: 1 });
    };
  };

  function showTip(params) {
    var $target = $(params.target);
    var $tip = JST['tooltip'](params);
    $tip.css(params.css);
    $tip.find('.pointer').css(params.pointerCss);
    $tip.insertAfter($target);
    $tip.click(removeTip);
    $target.click(removeTip);
    params.callback && params.callback();
    setTimeout(removeTip, 3000);
    function removeTip() {
      $tip.fadeOut(function() {
        $tip.remove()
      });
    };
  };

  function init() {
    var tooltips = JSON.parse(localStorage.getItem('tooltips'));
    if ( !tooltips )
      return {}

    var curVersion = $('.version', '.footer').text();
    if ( tooltips.version != curVersion ) {
      tooltips = { version: curVersion };
      localStorage.setItem('tooltips', JSON.stringify(tooltips));
    }

    return tooltips
  };

  function updateTooltips(params) {
    _.extend(Tooltips, params);
    localStorage.setItem('tooltips', JSON.stringify(Tooltips));
  };
};
