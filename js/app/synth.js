// Triangle wave

// equalizer lpf 700,0,-24

// asdr 15,0,0.1,0.1

// something called bang

// start with lpf, then append asdr, then to the notes?

define(['lib/timbre'],
function(T) {

  // Note, that this could be made to sound like an accordion with MIDI.js and a soundfont
  // http://mudcu.be/midi-js/
  // https://github.com/mudcube/MIDI.js
  // https://github.com/gleitz/midi-js-soundfonts
  // Each font is, however, about 800k (compressed) or 1.2mb.  Let's think carefully before so doing.



  function Reed(context, midiNumber) {
    this.context = context;

    this.isPlaying = false;

    this.oscillator = context.createOscillator();

    this.oscillator.type = 3; // Tell the oscillator to use a square wave


    this.bellowsGain = context.createGain();

    this.asdrGain = context.createGain();



//    this.oscillator.connect(this.bellowsGain);


    this.filter = context.createBiquadFilter();

    this.oscillator.connect(this.filter);

    this.filter.connect(this.asdrGain);

    this.asdrGain.connect(this.bellowsGain);

    // maybe we can replace this with the filter?
    this.bellowsGain.connect(context.destination);

    this.filter.type = 0;              // Low-pass filter.
    this.filter.frequency.value = 700; // cutoff
    this.filter.Q.value = 15; // random z




    this.attackTime = 0.25;
    this.releaseTime = 70;





    this.changeNote(midiNumber);

    this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);

    this.setGain(0);
  }

  Reed.prototype.triggerEnvelope = function(){
    var now = this.context.currentTime;
    this.asdrGain.gain.cancelScheduledValues(now);
    this.asdrGain.gain.setValueAtTime(0, now);
    console.log('time', now, this.attackTime);
    this.asdrGain.gain.linearRampToValueAtTime(1, now + this.attackTime);
//    this.asdrGain.gain.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
  }

  Reed.prototype.play = function() {
    this.setGain(1);
    this.triggerEnvelope();
    this.isPlaying = true;
  };

  Reed.prototype.mute = function() {
    this.setGain(0);
    this.isPlaying = false;
  };

  Reed.prototype.stop = function() {
    this.oscillator.stop(0);
  };

  Reed.prototype.setGain = function(gain) {
    this.bellowsGain.gain.value = gain;
  };


  Reed.prototype.changeFrequency = function(val) {
    this.oscillator.frequency.value = val;
  };

  Reed.prototype.changeNote = function(midiNote) {
    this.changeFrequency(Math.pow(2, (midiNote - 69) / 12) * 440.0);
  };

  Reed.prototype.changeDetune = function(val) {
    this.oscillator.detune.value = val;
  };

  Reed.prototype.changeType = function(type) {
    this.oscillator.type = type;
  };

  function Synth(){

    this.context = new (window.AudioContext || window.webkitAudioContext)();

    // each oscillator is one-time-use only.
    // we modify the gain instead of stopping entirely.
    this.reeds = {};

  }

  Synth.prototype.mute = function(){
    for (midiNote in this.reeds){
      this.reeds[midiNote].setGain(0);
    }
  }


  Synth.prototype.noteOn = function(midiNumber) {
    var reed = this.reeds[midiNumber];

    if (!reed){
      reed = this.reeds[midiNumber] = new Reed(this.context, midiNumber)
    }

    reed.play()

  }

  Synth.prototype.noteOff = function(midiNumber) {
    var reed = this.reeds[midiNumber];

    console.assert(reed);

    reed.mute()
  }



  return Synth;
});
