var interval;
var favorites_popup_shown = false;

var ManagedAjaxGeolocate = $.manageAjax.create('geolocate', {
  queue: false,
  cacheResponse: false,
  preventDoubleRequests: false
});

Date.prototype.to24HourTimeString = function () {
  var h = '0' + this.getHours();
  var m = '0' + this.getMinutes();
  var today = new Date();
  var msPerDay = 24 * 60 * 60 * 1000;
  var daysLeft = Math.round((today.getTime() - this.getTime()) / msPerDay);
  var daysLeftStr = '';
  switch (daysLeft) {
    case 0:
      daysLeftStr = "today";
      break;
    case 1:
      daysLeftStr = "1 day ago";
      break;
    default:
      daysLeftStr = new String(daysLeft) + " days ago"
      break;
  }
  return "Sent at " + h.slice(-2) + ":" + m.slice(-2) + " " + daysLeftStr;
};

Craiggers.Controller = new (function() {
  return ThreeTapsController.extend({
    routes: {
      '': 'root',
      '!/': 'root',
      '!/search': 'search',
      '!/search/': 'search',
      '!/search/blank': 'blankSearch',
      '!/search/:location/:category/:source': 'search',
      '!/search/:location/:category/:source/:query': 'search',
      '!/search/:location/:category/:source/:query/*params': 'search',
      '!/posting/:postkey': 'posting',
      '!/explore/:action': 'explore'
    },

    explore: function(action){
      if ($.inArray(action, ['stream','treemap','datamap'])>-1){
        var navbar = new Craiggers.Views.NavBar()
        navbar.showExplore({id: action})
      } else {
        window.location = '/#!/'
      }
    },

    search: function(location, category, source, query, params) {
      if($('#searchbar').is(':visible')) $('#workspace-link').click();

      // get LAT and LONG when we have location and radius
      if(location) {
        code = Craiggers.Models.Search.prototype.parseLocation(location)['code'];
        if(code != 'all' && params.match(/radius/)) {
          Craiggers.Connection.get_location_by_code_from_local_server(code)
          .done(function(data){
            if( data.success ){
              Craiggers.Search.set({
                radius: { lat: data.lat, long: data.long },
                type_of_search: 'new_search'
              })
            }
            complete()
          })
          .fail(function(data) {
            complete()
          })
        }
        else complete()
      }
      else complete()

      function complete () {
        Craiggers.Search.update({
          location: location,
          category: category,
          source:   source,
          query:    query,
          params:   params
        }).submit();
      }
    }
  });
}());


function initializeAll(){
  Craiggers.appName = 'jeboom';

  Craiggers.Search = new Craiggers.Models.Search();
  Craiggers.Postings = new Craiggers.Collections.Postings;
  Craiggers.Favorites = new Craiggers.Collections.Favorites;
  Craiggers.Locations = new Craiggers.Collections.DynamicLocations;
  Craiggers.Categories = new Craiggers.Collections.ThreeTapsCategories;
  Craiggers.Sources = new Craiggers.Collections.Sources;
  Craiggers.SavedSearches = new Backbone.Collection({ model: Craiggers.Models.Search });
  //PyotrK use this for navigation and other states
  Craiggers.PageState = new Backbone.Model();
  Craiggers.LocalPostings = new Craiggers.Collections.LocalPostings();
  initDatamap();
  build_metrics();
}

initializeAll()

function build_metrics(){
  var metric_requests = []
  _.each($('.metrics_container .source_container'), function(source_container){
    var source_code = $(source_container).attr('code')
    metric_requests.push(
      Craiggers.Util.get_search_request({source: source_code}).done(function(response){
        if (response.success){
          var thousands_of_num_matches = Math.round(response.num_matches/1000)
          $(source_container).find('.source_num_matches').text(thousands_of_num_matches)

          var last_posting_ago = 0
          if (response.postings.length > 0){
            var current_timestamp_in_sec = Math.round(new Date().getTime()/1000)
            var last_posting_timestamp = _.first(response.postings).timestamp
            var last_posting_ago = Math.round((current_timestamp_in_sec - last_posting_timestamp) / 60)
          }
          $(source_container).find('.source_last_posting_ago').text(last_posting_ago+',')
        }
      })
    )
  })
  $.when.apply(null, metric_requests).done(function() {
    var sum = _.reduce($('.metrics_container .source_num_matches'),
      function(memo, num_container){
        return memo + parseInt($(num_container).text());
      }, 0
    )

    $('.metrics_container .source_total_container').find('.source_total_num_matches').text(sum)
  });
}

// extend underscore a bit
_.mixin({
  commatizeNumber: function(num) {
    if ( _.isNumber(num)) num = num.toString();
    var commatized = '';
    for(var i = num.length - 1, j = 1; i > 0; --i, j++) {
      commatized = num.charAt(i) + commatized;
      if ( j % 3 == 0 ) {
        commatized = ',' + commatized;
      }
    }
    commatized = num.charAt(0) + commatized;
    return commatized;
  },
});

// TODO: consider moving datamap related code to a separate module
function updateDatamap() {
  var DEFAULT_LOCATION = 'USA';

  var loc = Craiggers.Search.get('location');
  if ( _.isArray(loc) ) {
    Craiggers.Locations.parentCodeByCode(loc[0], function(data) {
      if ( !data.code ) datamap.showLocation(data.parents[0])
    });
  } else if ( loc != 'all' ) {
    datamap.showLocation(loc);
  } else {
    datamap.showLocation(DEFAULT_LOCATION);
  };
}

function initDatamap() {
  window.datamap = new Datamap({
    mapID         : 'datamap-wrapper',
    headingID     : 'datamap-heading',
    width         : 640,
    height        : 480,
    fontFamily    : 'sans-serif',
    maxBubbleSize : 0.09,
    minBubbleSize : 0.02,
    wrapHeading : true,
    showBubbleForZeroMatches : true,
    baseURL       : BASE_URL,
    onLocChanged  : locationChanged,
    matchCalc     : matchCalculator
  });

  function locationChanged(datamap, locCode) {
    datamap.showLocation(locCode);
    Craiggers.Search.set({ location: locCode })
    Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
      Craiggers.Search.set({ type_of_search: 'new_search' })
    Craiggers.Search.submit();
  }

  function matchCalculator(locCodes, callback) {
    // Dummy match calculator.
    var params = Craiggers.Search.params(false, { location: null });
    params.codes = locCodes.join(',');
    params.dimension = 'location';
    Craiggers.Search.summary(params, function(data) {
      var numMatches = _.map(locCodes, function(locCode) {
        return data.totals[locCode] || 0
      });
      callback(locCodes, numMatches);
    });
  }
};

$(document).ready(function() {
  // TODO(2011-12-06): make sure we don't need it and remove
  //  if ( $.browser.msie ) {
  //    window.location.hash = '';
  //    window.location.pathname = '/unsupported';
  //  }

  Craiggers.init();

  var popup_message = $('#popup_message').text();
  if(popup_message.length) new Craiggers.Views.Alert(popup_message);
});
