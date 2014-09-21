define([],
function() {
  var context = new (window.AudioContext || window.webkitAudioContext)();

  var analyser = context.analyser = context.createAnalyser();
  analyser.connect(context.destination);
  analyser.fftSize = 2048;

  var bufferLength = analyser.frequencyBinCount,
    dataArray = new Uint8Array(bufferLength),
    waveFormContext = $('#waveform_graph').get(0).getContext('2d'),
    WIDTH = 300,
    HEIGHT =60;


  waveFormContext.clearRect(0, 0, WIDTH, HEIGHT);

  context.graphWaveFrom = function(){

    this.analyser.getByteTimeDomainData(dataArray);

    waveFormContext.fillStyle = 'rgb(200, 200, 200)';
    waveFormContext.fillRect(0, 0, WIDTH, HEIGHT);

    waveFormContext.lineWidth = 2;
    waveFormContext.strokeStyle = 'rgb(0, 0, 0)';

    waveFormContext.beginPath();

    var sliceWidth = WIDTH * 1.0 / bufferLength;
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

  return context;
});