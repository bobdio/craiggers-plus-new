var threshold = 100

// create our 3taps client with our authId
var authId = 'jmrfhu59cnmtnzusshd62pbg'
var client = new threeTapsClient(authId)

var captchaId = 'recaptcha_response_field'

$(document).ready(function() {
  $.each($('.cat'), function(x, cat) {
    $('#notify-category-select').append($(new Option($(cat).find('.clickable').html(), $(cat).find('.code').html())).attr('annotation', 'cat'))
    $.each($(cat).find('.subcat'), function(y, subcat) {
      $('#notify-category-select').append($(new Option($(cat).find('.clickable').html() + ' - ' + $(subcat).find('.clickable').html(), $(subcat).find('.code').html())).attr('annotation', 'subcat'))
    })
  })

  $.each($('.state'), function(x, state) {
    $('#notify-location-select').append($(new Option($(state).find('.clickable').html(), $(state).find('.code').html())).attr('annotation', 'st'))
    $.each($(state).find('.city'), function(y, city) {
      $('#notify-location-select').append($(new Option($(state).find('.clickable').html() + ' - ' + $(city).find('.clickable').html(), $(city).find('.code').html())).attr('annotation', 'loc_1'))
    })
  })

  $('.chzn-select').chosen(function() { $('.chzn-select').show() })
})

// when the user selects new criteria, tell them how many matches per day there are
$('.notify-params').change(function(field) {
  if (field.currentTarget.id != captchaId) 
    updatePostingsPerDay()
})

function updatePostingsPerDay(callback) {
  $('#submit').attr('disabled', 'disabled')
  $('#postings-per-day').fadeOut(function() {
    $('#loading').fadeIn(function() {

      var start = new Date()
      start.setDate(start.getDate() - 7)
      
      var searchParams = getSearchParams()
      if (validate(searchParams, true).length != 0) {
        $('#loading').fadeOut()
        $('#postings-per-day').fadeIn()
        return
      }

      searchParams.start = Date.formatThreeTaps(start)

      client.search.count(searchParams, function(count) {
        var perDay = Math.floor(count.count / 7)
        var perDayString = (perDay + "").replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' postings per day match this search.'

        if (perDay < threshold) {
          $('#submit').removeAttr('disabled')
          $('#postings-per-day').css('color', 'green')
          $('#contact-container').fadeIn()
        } else {
          $('#submit').attr('disabled', 'disabled')
          perDayString += 'Try narrowing your criteria a bit.'
          $('#postings-per-day').css('color', 'red')
          $('#contact-container').fadeOut()
        }
        $('#loading').fadeOut(function() {
          $('#postings-per-day').text(perDayString)
          $('#postings-per-day').fadeIn()
        })

        if (callback) callback()
      })
    })
  })
}

// gets search params from form
function getSearchParams() {
  var searchParams = {src: 'CRAIG'}

  if ($('#all-words').val()) searchParams.text = $('#all-words').val()
  
  var annotations = {}

  $.each([$('#notify-category-select'), $('#notify-location-select')], function(index, select) {
    if (select.val() != 'all') annotations[$('option:selected', select).attr('annotation')] = select.val()
  })

  if (annotations.cat || annotations.location || annotations.subcat || annotations.st) {
    searchParams.annotations = JSON.stringify(annotations)
  }
  
  return searchParams
}

function validate(params, showErrors, requireContactInfo) {
  var errors = []
  if (requireContactInfo && !params.number && !params.email) errors.push('You must provide contact information.')
  if (requireContactInfo && !params.captcha) errors.push('You must fill out the captcha.')

  if (params.number) {
    var phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/
    if (!phoneNumberPattern.test(params.number)) errors.push('Your number must be a valid US phone number.')
  }

  if (params.email) {
    var emailPattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    if (!emailPattern.test(params.email)) errors.push('Your email must be a valid email.')
  }

  if (showErrors && errors.length > 0) renderErrors(errors.join(' '))
  return errors
}

function renderErrors(errors, hideClose) {
  if (console) console.log(errors)
  if ($.facebox) {
    $.facebox(errors)
  } else {
    var options = {content: errors}
    if (hideClose) {
      options.enableEscapeButton = false
      options.showCloseButton = false
      options.hideOnOverlayClick = false
    }
    $.fancybox(options)
  }
}

$('#submit').click(function() {
  try {

    var notificationParams = getSearchParams()
    if ($('#number').val()) notificationParams.number = $('#number').val()
    if ($('#email').val()) notificationParams.email = $('#email').val()
    if ($('#' + captchaId).val()) notificationParams.captcha = $('#' + captchaId).val()

    notificationParams[captchaId] = notificationParams.captcha
    notificationParams.recaptcha_challenge_field = $('#recaptcha_challenge_field').val()

    if (validate(notificationParams, true, true) != 0) return false

    var subscribe = function(params) {
      $.getJSON('/notification/create', params, function(result) {
        if (result.success == true) {
          renderErrors('Great! You\'ll be receiving notifications shortly. <a href="/notify">Click here</a> to sign up for more.', true)
        } else {
          renderErrors(result.error.message)
          if (result.error.code == "captcha") {
            $(captchaId).val('')
            resetCaptcha()
          }
          return false
        }
      })
      return true
    }

    if (notificationParams.number && notificationParams.email) {
      // handle the case where they want two subscriptions
      if (notificationParams.number) {
        var params = {}
        $.extend(params, notificationParams)
        delete params.email
        
        if (subscribe(params)) {
          params = {}
          $.extend(params, notificationParams)
          delete params.number
          subscribe(params)
        }
      }
    } else {
      // handle a subscription to one
      subscribe(notificationParams)
    }
    

  } catch (err) {
    if (console) console.log(err)
  }

  return false
})

$('#refresh').click(function() {
  resetCaptcha()
  return false
})

function resetCaptcha() {
  Recaptcha.reload();
  //$('#captcha-img').attr('src', '/captcha.php?' + Math.random())
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}