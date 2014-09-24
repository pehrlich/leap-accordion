define(['app/leap'],
function (LeapController) {

  var getParameterByName = function (name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

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

  $(document).on('click', function(e){
    if ( $(e.target).closest('.submenu').length === 0 && $(e.target).closest('#reed_banks_menu_control').length === 0 ) {
      $('.submenu').hide()
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

    if (getParameterByName('hide-intro')){
      $('#toggle_intro').click();
    }

    var register = getParameterByName('register');
    if (register && register.length > 0 ){
      setTimeout(function(){
        $('a[href=#' + register + ']').click();
      }, 500)
    }

    $('.register-switch a').click(function(e){

      e.preventDefault();

      var link = $(e.target).closest('a');

      window.app.synth.setRegister(
        link.attr('href').split('#')[1]
      );

      // update images only after successfully setting registers
      $('#reed_banks_menu_control img').attr(
        'src',
        link.find('img:first').attr('src')
      );

      $('.submenu').hide();

    })

    $('#stats_control').click(function(e){

      e.preventDefault();

      $('#stats').toggle();

    });


  });

  LeapController.on('streamingStarted', function(){
    $('#no_leap_message').fadeOut(200);
  });

});