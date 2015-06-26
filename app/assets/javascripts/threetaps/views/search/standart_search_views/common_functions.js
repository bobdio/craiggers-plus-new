function getContext(code) {
  if ( _.isArray(code) || code == 'all') {
    Craiggers.Search.set({ radius: { } })
    return false;
  }

  $.get(LOCATION_API + code).done(function(loc){
    if ( loc.error ) {
      $.when(api_call_for_geolocation(code)).done(function(data){
        if (!data["success"]) {
          $('.location-path').html('')
          return
        }
        loc = {}
        loc.name = data.location.short_name
        loc.lat = (data.location.bounds_min_lat +  data.location.bounds_max_lat) / 2
        loc.long = (data.location.bounds_min_long +  data.location.bounds_max_long) / 2
        handleGeolocationResults(loc)
      })
      return
    }
    handleGeolocationResults(loc)
  })
}

function handleGeolocationResults(loc){
  $('#searchcolumn .location .input, #searchbar .location .input').val(loc.name);
  $('#searchcolumn .location .holder, #searchbar .location .holder').hide();

  Craiggers.Search.set({
    radius: {
      lat: loc.lat,
      long: loc.long
    }
  })
}

function api_call_for_geolocation(code) {
  var url = LOCATION_LOOKUP_URL + '?' + AUTH_TOKEN + '&code=' + code
  return $.get(url)
}
