define([],
function() {
  var context = new (window.AudioContext || window.webkitAudioContext)();

  // set up analyser
  // via https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
  //
  var analyser = context.analyser = context.createAnalyser();
  analyser.connect(context.destination);
  analyser.fftSize = 128;
  analyser.fftSize = 1024;

  var bufferLength = analyser.frequencyBinCount,
    dataArray = new Uint8Array(bufferLength),
    waveFormContext = $('#waveform_graph').get(0).getContext('2d'),
    WIDTH  = 600,
    HEIGHT = 120,
    paused = false;


  waveFormContext.clearRect(0, 0, WIDTH, HEIGHT);

  $(document).on('keydown', function(e){
    if (e.keyCode === 32){
      paused = !paused;
    }
  });

  context.graphWaveFrom = function(){
    if (paused) return;

    this.analyser.getByteTimeDomainData(dataArray);

    waveFormContext.fillStyle = 'rgb(255, 255, 255)';
    waveFormContext.fillRect(0, 0, WIDTH, HEIGHT);

    waveFormContext.lineWidth = 2;
    waveFormContext.strokeStyle = 'rgb(0, 0, 0)';

    waveFormContext.beginPath();

    var sliceWidth = WIDTH * 1 / bufferLength;
    var x = 0;

    for(var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = v * HEIGHT/2;

      if(i === 0) {
        waveFormContext.moveTo(x, y);
      } else {
        waveFormContext.lineTo(x, y);
      }

      x += sliceWidth;
    }

    waveFormContext.lineTo(WIDTH, HEIGHT/2);
    waveFormContext.stroke();

  };




  // visualize with http://kevincennis.github.io/transfergraph/
  // It looks like getting good curves is an art unto itself!
  // http://www.musicradar.com/us/computermusic/waveshaper-cm-free-waveshaping-distortion-vst-au-effect-from-cableguys-575381
  // https://www.ableton.com/en/blog/shaper-max-live-effect-audio-mangling-k-devices/
  // https://soundcloud.com/cableguys/sets/cableguys-curve-2-sound-design
  function setCurve(callback) {

    var n_samples = 44100, // ?
      curve = new Float32Array(n_samples);

    for (var i = 0 ; i < n_samples; ++i ) {
      curve[i] = callback(
        i * 2 / n_samples - 1
      );
    }

    return curve;

  };

  var distortion = context.waveShaper = context.createWaveShaper();

  var
    k = 50,
    deg = Math.PI / 180,
    curves = {
      noop: setCurve( function(x){ return Math.sin(x) } ),
      tangentLooking: setCurve( function(x){
        return ( 3 + k ) * x * 20 * (deg) / ( Math.PI + k * Math.abs(x) );
      })
    }

  distortion.setCurve = function(curveName){
    this.curve = curves[curveName]
  }

  distortion.setCurve('noop');

  distortion.connect(analyser);

  return context;
});