_.extend(Craiggers.Util, {
  handle_blank_postings_options: function(postings_model){
    if ( postings_model.options.blank ) {
      postings_model.$('.numresults .current').text('--');
      postings_model.$('.numresults .total').text('--');
      return true
    }
    return false
  },

  commitize_price: function(original_price){
    var string_price = original_price + ''
    var dot_index = string_price.indexOf('.')
    var handled_price
    if (dot_index ==-1){
      handled_price = _.commatizeNumber(string_price)
    } else {
      var dollars_part = string_price.slice(0, dot_index)
      var cent_part = string_price.slice(dot_index+1)
      handled_price = _.commatizeNumber(dollars_part) + '.' + cent_part
    }
    return handled_price
  },

  remove_cents_in_price: function(original_price){
    var string_price = original_price + ''
    var dot_index = string_price.indexOf('.')
    if (dot_index != -1) return string_price.slice(0, dot_index)
    return original_price
  },

  get_hash_for_settings_posting_model: function(posting){
    var body = posting.body && posting.body.replace(/\n|\r/g, '<br />') || '<br />'

    return {
      annotations: posting.annotations,
      body: body || '',
      images: posting.images || []
    }
  }
})