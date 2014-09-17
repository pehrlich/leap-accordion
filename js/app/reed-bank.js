define(['app/reed', 'app/layout'],
function(Reed, LAYOUT_BL) {

  // various responsibilites:
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
    return !!LAYOUT_BL[key]
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

  ReedBank.prototype.midiNoteToFrequency = function(midiNote){
    midiNote += ( (this.octave - 5) * 12 );

    console.log(Math.pow(2, (midiNote) / 12) * 440.0);

    if (this.tremolo){
      // Todo: alter this for tremolo.
    }

    // forgot where this came from :(
    return Math.pow(2, (midiNote) / 12) * 440.0
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