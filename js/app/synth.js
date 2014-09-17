// http://en.wikipedia.org/wiki/Accordion_reed_ranks_and_switches
// This synth is for the treble side of a chromatic button accordion
// Most accordions to this date typically have anywhere between 2-4 reed ranks on the treble side
// These can usually be selected individually or combined in various ways to provide a range of different timbres, by use of switches arranged by register from high to low.
//  More of the top-line expensive accordions may contain 5-6 reed blocks on the treble side for different tunings, typically found in accordions which stress musette sounds.

// select reeds, cool
// but how about dynamic tremelo adjustment?

// For the tremolo (8′), may I recommend the lower octave to be tuned to 441.5Hz,
// and the upper octave to 440.5Hz. And 441Hz in the middle.
// http://accordionknowhow.wordpress.com/what-to-tune-to/

// for wave shape, check out
// http://www.allaboutcircuits.com/vol_2/chpt_7/4.html






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
