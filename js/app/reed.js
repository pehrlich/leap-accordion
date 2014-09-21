define(['app/audio-context'],
function(Context) {

  function Reed(frequency) {

    this.attackTime = 0.25;
    this.releaseTime = 70;


    this.oscillator = Context.createOscillator();
    this.oscillator.type = 3; // Square wave
    this.oscillator.frequency.value = frequency;


    this.bellowsGain = Context.createGain();
    this.bellowsGain.gain.value = 0;


    this.asdrGain = Context.createGain();


    this.filter = Context.createBiquadFilter();
    this.filter.type = 0;              // Low-pass filter.
    this.filter.frequency.value = 700; // cutoff
    this.filter.Q.value = 15; // random z


//    this.oscillator.connect(this.bellowsGain);
    this.oscillator.connect(this.filter);
    this.filter.connect(this.asdrGain);
    this.asdrGain.connect(this.bellowsGain);
    this.bellowsGain.connect(Context.analyser);


    this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);
  }

  Reed.prototype.triggerEnvelope = function(){
    var now = Context.currentTime;
    this.asdrGain.gain.cancelScheduledValues(now);
    this.asdrGain.gain.setValueAtTime(0, now);
    this.asdrGain.gain.linearRampToValueAtTime(1, now + this.attackTime);
//    this.asdrGain.gain.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
  }

  // The amount of wind going through a reed, between 0 and 1
  Reed.prototype.setWind = function(gain) {
    this.bellowsGain.gain.value = gain;
  };
//
//  Reed.prototype.changeDetune = function(val) {
//    this.oscillator.detune.value = val;
//  };
//
//  Reed.prototype.changeType = function(type) {
//    this.oscillator.type = type;
//  };

  return Reed;

});