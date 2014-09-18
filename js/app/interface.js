define([],
function () {

  console.log('interface');


  var MODAL = {
    hide: function(){
      $('#fader, #intro_wrapper').fadeOut(200)
    }
  }

  $(function(){
    console.log('wiring');
    $('#fader, #begin_button').click(function(){
      console.log('click');
      MODAL.hide();
    });
  });

  return

});