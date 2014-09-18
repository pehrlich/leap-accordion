define([],
function () {

  var MODAL = {

    hide: function(){
      $('#fader, #intro_wrapper').fadeOut(200)
      $('#toggle_intro').removeClass('active');
    },

    show: function(){
      $('#fader, #intro_wrapper').fadeIn(200)
      $('#toggle_intro').addClass('active');
    }

  }

  $(function(){

    $('#fader, #begin_button').click(function(){
      MODAL.hide();
    });

    $('#toggle_intro').click(function(){

      if ($('#toggle_intro.active').length){
        MODAL.hide();
      } else {
        MODAL.show();
      }

    })


  });

});