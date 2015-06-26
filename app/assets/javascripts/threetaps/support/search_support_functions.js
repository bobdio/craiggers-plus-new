_.extend(Craiggers.Util, {
  modify_params_for_url_for_safe_search: function(params){
    if (Craiggers.Search.get('safe') == 'yes' && (params['category_group'] == undefined || params['category_group'] == 'MMMM' || params['category_group'] == 'PPPP')){
      params['category_group'] = '~MMMM|~PPPP'
    }
    return params
  },

  get_search_request: function(params){
    return $.ajax({
      url: BASE_URL + '/?' + AUTH_TOKEN,
      data: params,
      dataType: 'json',
      type: 'get'
    })
  },

  get_search2_request: function(params){
    return $.ajax({
      url: BASE_URL2 + '/?' + AUTH_TOKEN,
      data: params,
      dataType: 'json',
      type: 'get'
    })
  },

  get_local_search_request: function(params){
    return $.ajax({
      url: '/postings',
      data: params,
      dataType: 'json',
      type: 'get'
    })
  },

  get_promoted_search: function(params, search_model){
    var source_param_appropriate_for_promoted_posting_including = params['source'] == undefined || params['source'].indexOf('BKPGE') >= 0
    if (!search_model.get('promoted_posting_already_included') && source_param_appropriate_for_promoted_posting_including){
      var temp_params = jQuery.extend(true, {}, params);
      temp_params['source'] = 'BKPGE'
      temp_params['rpp'] = 1
      return this.get_search_request(temp_params)
    }
  },

  get_detailed_search: function(params, search_model){
    if (search_model.get('params').postKey != undefined){
      var temp_params = jQuery.extend(true, {}, params);
      temp_params['id'] = search_model.get('params').postKey
      temp_params['rpp'] = 1
      return this.get_search_request(temp_params)
    }
  },

  get_jeboom_search: function(params, search_model){
    var source_param_appropriate_for_promoted_posting_including = params['source'] == undefined || params['source'].indexOf('JBOOM') >= 0
    if (!search_model.get('jeboom_posting_already_included') && source_param_appropriate_for_promoted_posting_including){
      var temp_params = jQuery.extend(true, {}, params);
      temp_params['source'] = 'JBOOM'
      temp_params['rpp'] = 1
      return this.get_search_request(temp_params)
    }
  },

  get_source_count_search: function(params, source_name){
    params['rpp'] = 1
    params['source'] = source_name
    return this.get_search_request(params)
  },

  get_source_count_search2: function(params, source_name){
    params['rpp'] = 1
    params['source'] = source_name
    return this.get_search2_request(params)
  },

  get_source_count_local_search: function(params, source_name){
    return $.ajax({
      url: '/postings/count',
      data: params,
      dataType: 'json',
      type: 'get'
    })
  },

  setIntervalSearchUpdate: function(params){
    return setInterval(function(){
      // if (Craiggers.Postings.at(0) != undefined){
      //   var timestamp_first = parseInt(Craiggers.Postings.at(0).get('timestamp')) + 1;
      //   var timestamp_second = (parseInt(Craiggers.Postings.at(1) && Craiggers.Postings.at(1).get('timestamp')) || 0) + 1;
      //   var timestamp = Math.max.apply( Math, [timestamp_first, timestamp_second] )
      //   var curTime = Math.round(new Date().getTime() / 1000)

      //   params.timestamp = timestamp+'..'+curTime
      // } else {
      //   params.timestamp = undefined
      // }
      params.retvals = 'timestamp'
      params.rpp = 100
      $.ajax({
        url: BASE_URL + '/?' + AUTH_TOKEN,
        data: params,
        dataType: 'json',
        type: 'get',
        success: function(data){
          var current_newest_posting_index = $.inArray(Craiggers.Search.get('newest_posting_timestamp'), _.pluck(data.postings, 'timestamp'))
          if (current_newest_posting_index > 0 && Craiggers.postingsMode != 'favorites' ) {
            if (current_newest_posting_index == 1){ $('.newmatches').text(current_newest_posting_index + ' newer result').show() }
            if (current_newest_posting_index == -1){ $('.newmatches').text('more than 100 newer results').show() }
            if (current_newest_posting_index > 1){ $('.newmatches').text(current_newest_posting_index + ' newer results').show() }
          }
        }
      })
    }, 10000)
  },

  add_postings_to_hash: function(postings_hash, postings){
    postings_hash = postings_hash || {}
    $.each(postings, function(index, posting){
      postings_hash[posting.id] = posting
    })
    return postings_hash
  },

  calculate_summary_for_sources: function(sources_data){
    var result = [
      ['source', 'BKPGE',0],
      ['source', 'CRAIG',0],
      ['source', 'EBAYC',0],
      ['source', 'KIJIJ',0],
      ['source', 'INDEE',0],
      ['source', 'HMNGS',0],
      ['source', 'EBAYM',0],
      ['source', 'NBCTY',0],
      ['source', 'JBOOM',0],
    ]

    $.each(sources_data, function(key, data_per_tier){
      result[0][2] += data_per_tier['bkpge_num_matches']
      result[1][2] += data_per_tier['craig_num_matches']
      result[2][2] += data_per_tier['ebayc_num_matches']
      result[3][2] += data_per_tier['kijij_num_matches']
      result[4][2] += data_per_tier['indee_num_matches']
      result[5][2] += data_per_tier['hmngs_num_matches']
      result[6][2] += data_per_tier['ebaym_num_matches']
      result[7][2] += data_per_tier['nbcty_num_matches']
      result[8][2] += data_per_tier['jboom_num_matches']
    })

    return result
  }
})
