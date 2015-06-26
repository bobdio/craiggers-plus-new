$.fn.highlightQuery = function(q, highlightTextPiece) {

    var query = q || app.models.searchModel.get('text') || '';
    if ( !query ) return this;
    // pull out phrases
    var phrases = _.compact(query.match(/".+"/g) || []);
    // get rid of the quotes
    query = query.replace(/".+"/g, '');
    // pull out remaining words
    var words = _.compact(query.split(' ') || []);
    // remove special words
    words = _.reject(words, function(word) {
      return _.include(['or', 'and'], word.toLowerCase());
    });
    // ?! remove everything after 'not' keyword
    var not = words.indexOf('not');
    if ( not > -1 ) words = words.slice(0, not);
    // words only
    var hoptions = { wordsOnly: highlightTextPiece ? false : true };

    return this.each(function() {

      var el = $(this);

      _.each(phrases, function(phrase) {
        el.highlight(phrase.replace(/^"|"$/g, ''), hoptions);
      });

      _.each(words, function(word) {
        el.highlight(word, hoptions);
      });

    });

  };

function isPrivateMode () {
  return !isLocalStorageSupported();
}

function isLocalStorageSupported () {
  try {
    localStorage.is_private = 1;// try to use localStorage      
  } catch (e) {//there was an error so...
    return false;
  }
  localStorage.removeItem("is_private");
  return true;
}

function isAndroid () {
  var ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("android") > -1;
}
  
function hideAddressBar() {

  //return;

  /*var windowHeight = $(window).height();
  // TODO: this value should be calculated
  var addressBarHeight = 60;//(screen.height - windowHeight) / 2 ;
    
  if(document.height !== (windowHeight + addressBarHeight)) {
      document.body.style.height = (windowHeight + addressBarHeight) + 'px';
  }*/

  if (isAndroid()) {
     window.scrollTo(0, 1);
  } else {
    setTimeout( function(){ window.scrollTo(0, 0); }, 50 );  
  }
  
}

/*$( window ).on( "orientationchange", function( event ) {
      hideAddressBar();
});*/
    
//window.addEventListener("load", function(){ if(!window.pageYOffset){ hideAddressBar(); } } );
//window.addEventListener("orientationchange", hideAddressBar );