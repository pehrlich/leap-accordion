define(['app/reed', 'app/layout'],
function(Reed, LAYOUT_BL) {

  // various responsibilities:
  // - respond to checkbox argument, and sue that to enable or disable
  // - respond to "enabled" and "disabled"? (maybe not?)
  // - play based off of key locations
  // todo - dynamic tremolo, wave forms, or other fun things?
  function ReedBank(options){
    this.octave  = options.octave;
    this.tremolo = options.tremolo;

    this.enabled = false;

    this.reeds = {};
  }

  ReedBank.prototype.enable = function(){
    this.enabled = true;
    return this;
  }

  ReedBank.prototype.disable = function(){
    this.enabled = false;
    return this;
  }

  ReedBank.prototype.hasKey = function(key){
    return !isNaN(LAYOUT_BL[key])
  }

  ReedBank.prototype.keyToReed = function(keyName){

    var reed = this.reeds[keyName];

    if (!reed){
      reed = this.reeds[keyName] = new Reed(
        this.midiNoteToFrequency(LAYOUT_BL[keyName])
      )
    }

    return reed;
  }

  // For the tremolo (8′), may I recommend the lower octave to be tuned to 441.5Hz,
  // and the upper octave to 440.5Hz. And 441Hz in the middle.
  // http://accordionknowhow.wordpress.com/what-to-tune-to/
  // http://www.patmissin.com/tunings/tun10.html
  ReedBank.prototype.midiNoteToFrequency = function(midiNote){
    var relativeOctave = Math.floor(midiNote / 12); // octave of note within this layout

    midiNote += ( (this.octave - 5) * 12 );

    var frequency = Math.pow(2, (midiNote) / 12) * 440.0;


    console.assert(relativeOctave > -1 && relativeOctave < 3, "Relative Octave is" + relativeOctave);

    if (this.tremolo){
      console.assert(this.tremolo == 'upper' || this.tremolo == 'lower')
    }

    if (this.tremolo == 'upper'){
      switch (relativeOctave) {
        case 0:
          frequency += 1.5;
          break;
        case 1:
          frequency += 1;
          break;
        case 2:
          frequency += 0.5;
          break;
      }
    }

    console.log('midinote: ', midiNote, 'frequency', frequency);

    // forgot where this came from :(
    return frequency
  }

  // there is a possible optimization here
  // each read bank will call keyToReed and hasKey
  // this could be moved up to the chromatic keyboard
  ReedBank.prototype.setWind = function(keyName, wind){

    if (!this.enabled) return;

    if (!this.hasKey(keyName)) return;

    this.keyToReed(keyName).setWind(wind);

  }

  return ReedBank
});