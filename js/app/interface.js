define([],
function () {

  var MODAL;

  MODAL = {

    hide: function(){
      $('#fader, #intro_wrapper').fadeOut(200)
      $('#toggle_intro').removeClass('active');
    },

    show: function(){
      $('#fader, #intro_wrapper').fadeIn(200)
      $('#toggle_intro').addClass('active');
    },

    open: function(){
      return !!$('#toggle_intro.active').length;
    }

  }

  // cannot bind within object definition.
  MODAL['toggle'] = function(){
    if (this.open()){
      this.hide();
    }else {
      this.show();
    }
  }.bind(MODAL);

  $(document).on('keydown', function(e){
    if (e.keyCode === 27 && MODAL.open()) {
      MODAL.hide()
    }
  });

  $(function(){

    $('#fader, #begin_button').click(MODAL.hide);

    $('#toggle_intro').click(function(e){
      e.preventDefault();
      MODAL.toggle()
    });

    $('#reed_banks_menu_control').click(function(e){
      e.preventDefault();
      $('#reed_banks_menu').toggle();
    });

  });

});