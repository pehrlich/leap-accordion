// http://en.wikipedia.org/wiki/Accordion_reed_ranks_and_switches
// This synth is for the treble side of a chromatic button accordion
// Most accordions to this date typically have anywhere between 2-4 reed ranks on the treble side
// These can usually be selected individually or combined in various ways to provide a range of different timbres, by use of switches arranged by register from high to low.
//  More of the top-line expensive accordions may contain 5-6 reed blocks on the treble side for different tunings, typically found in accordions which stress musette sounds.

// select reeds, cool
// but how about dynamic tremelo adjustment?

// for wave shape, check out
// http://www.allaboutcircuits.com/vol_2/chpt_7/4.html


define(['app/reed-bank', 'app/leap'],
function(ReedBank, LeapController) {

  // Note, that this could be made to sound like an accordion with MIDI.js and a soundfont
  // http://mudcu.be/midi-js/
  // https://github.com/mudcube/MIDI.js
  // https://github.com/gleitz/midi-js-soundfonts
  // Each font is, however, about 800k (compressed) or 1.2mb.  Let's think carefully before so doing.


  // http://en.wikipedia.org/wiki/Chromatic_button_accordion
  // manage enabling and disabling reed banks based off of button pushes
  // for now, one button = one reed bank, but that will change w/ proper register switches
  function ChromaticKeyboard(){

    this.reedBanks = [
      new ReedBank({octave: 4}), // 16'
      new ReedBank({octave: 5}), // 8'
      new ReedBank({octave: 5, tremolo: 'upper' }),
      new ReedBank({octave: 5, tremolo: 'lower' }),
      new ReedBank({octave: 6}) // 4'
    ];

    this.reedBanks[1].enable();
    this.reedBanks[2].enable();


    this.bindUIEvents('#eight_foot_input', '#eight_foot_label', 1);
    this.bindUIEvents('#four_foot_input', '#four_foot_label', 4);
    this.bindUIEvents('#sixteen_foot_input', '#sixteen_foot_label', 0);
    this.bindUIEvents('#eight_foot_high_input', '#eight_foot_high_label', 2);


    this.activeKeys = {};

    LeapController.on('frame', this.onFrame.bind(this) );

  }

  // manage checkboxes...
  ChromaticKeyboard.prototype.bindUIEvents = function(inputSelector, labelSelector, bankIndex) {

    $(inputSelector).change( function(e){

      if ( $(e.target).is(':checked') ){
        this.reedBanks[bankIndex].enable();
        $(labelSelector).addClass('active')
      } else{
        this.reedBanks[bankIndex].disable();
        $(labelSelector).removeClass('active')
      }
    }.bind(this) );

  }

  ChromaticKeyboard.prototype.keyDown = function(key) {

    console.assert(key);

    this.activeKeys[key.keyName] = key;

  };

  ChromaticKeyboard.prototype.keyUp = function(key) {

    console.assert(key);

    this.activeKeys[key.keyName] = null;

  };

  ChromaticKeyboard.prototype.onFrame = function(frame){
    var wind,
      hand = frame.activeHand();

    for (var keyName in this.activeKeys){

      if (hand && this.activeKeys[keyName]) {
        wind = hand.gainForKey(
          this.activeKeys[keyName]
        )
      }else {
        wind = 0
      }

      for (var i = 0; i < this.reedBanks.length; i++){
        this.reedBanks[i].setWind(keyName, wind)
      }

    }

  };

  return ChromaticKeyboard;
});
