define(['lib/timbre'],
function(T) {

  function Oscillator(context, midiNumber) {
    this.oscillator = context.createOscillator();

    this.gainNode = context.createGain();

    this.oscillator.connect(this.gainNode);

    this.gainNode.connect(context.destination);

    this.changeNote(midiNumber);
    this.play();
  }

  Oscillator.prototype.play = function() {
    this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);
  };

  Oscillator.prototype.stop = function() {
    this.oscillator.stop(0);
  };

  Oscillator.prototype.setGain = function(gain) {
    this.gainNode.gain.value = gain;
  };


  Oscillator.prototype.changeFrequency = function(val) {
    this.oscillator.frequency.value = val;
  };

  Oscillator.prototype.changeNote = function(midiNote) {
    this.changeFrequency(Math.pow(2, (midiNote - 69) / 12) * 440.0);
  };

  Oscillator.prototype.changeDetune = function(val) {
    this.oscillator.detune.value = val;
  };

  Oscillator.prototype.changeType = function(type) {
    this.oscillator.type = type;
  };

  function Synth(){

    this.context = new (window.AudioContext || window.webkitAudioContext)();

    // each oscillator is one-time-use only.
    // we modify the gain instead of stopping entirely.
    this.oscillators = {};

  }


  Synth.prototype.noteOn = function(midiNumber) {
    var oscillator = this.oscillators[midiNumber];

    if (!oscillator){
      oscillator = this.oscillators[midiNumber] = new Oscillator(this.context, midiNumber)
    }

    oscillator.setGain(1)

  }

  Synth.prototype.noteOff = function(midiNumber) {
    var oscillator = this.oscillators[midiNumber];

    console.assert(oscillator);

    oscillator.setGain(0)
  }

  return Synth;
});
