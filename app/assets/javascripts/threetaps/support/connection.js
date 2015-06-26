_.extend(Craiggers.Connection, {
  get_location_by_code_from_local_server: function(code){
    return $.get(LOCATION_API + code)
  },

  get_location_children_by_code_from_local_server: function(code){
    return $.get(LOCATION_API + code + '/children')
  },
})