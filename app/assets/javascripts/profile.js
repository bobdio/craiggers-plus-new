
$(document).ready(function() {

  $('#loader')
    .ajaxStart(function() {
      $(this).fadeIn();
    })
    .ajaxStop(function() {
      $(this).fadeOut();
    });

  $('#enable_chats').change(function() {
    $('#blockUnverified').attr('disabled', !$(this).is(':checked'));
    // $.get('/profile/change_block_option');
  });

  $('#phone_number').keyup(function(event) {
    var key = event.which || event.keyCode;
    var new_name = $(this).val().toString();
    if ( (new_name.length == 3 || new_name.length == 7) && (key != 8 || key == 46) ) {
      $(this).val(new_name + '-');
    }
  });

  $('#phone_number').keydown(function(event) {
    var new_name = $(this).val().toString();
    var key = event.which || event.keyCode;
    if ( key == 9 ) {
      return
    };
    if ( (new_name.length >= 12) && ( key != 8 || key == 46 ) ) {
      return false;
    } else {
      if ( !event.shiftKey && !event.altKey && !event.ctrlKey && 
        // numbers
        key >= 48 && key <= 57 || 
        // Numeric keypad
        key >= 96 && key <= 105 || 
        // Backspace
        key == 8 || 
        // Home and End
        key == 35 || key == 36 || 
        // left and right arrows
        key == 37 || key == 39 || 
        // Del and Ins
        key == 46 || key == 45)
        return true;
      return false;
    }
  });

  $('#phone_number').blur(function() {
    $('#notifications_textEnabled').attr('checked', !!this.value);
  });

});
