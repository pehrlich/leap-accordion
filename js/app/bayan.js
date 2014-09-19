define(['lib/teoria', 'lib/subcollider', 'lib/keyboard', 'lib/easeljs', 'app/chromatic-keyboard', 'app/key', 'app/layout', 'app/leap'],
function (teoria, sc, KeyboardJS, createjs, ChromaticKeyboard, Key, LAYOUT_BL, LeapController) {


  var QWERTY =
  [['2','3','4','5','6','7','8','9','0','-'],
   ['q','w','e','r','t','y','u','i','o','p','['],
   ['a','s','d','f','g','h','j','k','l',';','\''],
   ['z','x','c','v','b','n','m',',','.','/']];


  function Bayan(canvas) {
    this.keys = {};
    this.lastKeyUp = 'backspace';
    this.canvas = canvas;
    this.stage = new createjs.Stage(canvas);
    this.layout = LAYOUT_BL;
    this.keyboard = {};
    this.synth = new ChromaticKeyboard();
    this.origWidth = window.innerWidth;
    this.origHeight = window.innerHeight * 0.5;
    this.createKeyboard();
    this.setupEventListeners();

    this.hasRenderedFakeHand = false;

  }

  // Class methods
  Bayan.keyForEvent = function(e) {
    var keyCode = e.keyCode ? e.keyCode : e.which;
    var names = KeyboardJS.key.name(keyCode);
    return names[names.length - 1];
  }


  Bayan.prototype.setupEventListeners = function() {
    // in an event handler, 'this' refers to the element the event originates from.
    // http://jibbering.com/faq/notes/closures
    var self = this;


    $('#auto_bellows').click(function(e){
      e.preventDefault();
      LeapController.plugins.playback.player.toggle();
      if (LeapController.plugins.playback.player.state !== 'playing'){
        setTimeout(function(){
          // hax
          self.emitFakeFrame(frameWithNoHands)
        }, 100)
      }
    });

    // Key down handler
    document.onkeydown = function(e) {

      if ( e.metaKey == 1 ) return;

      e.preventDefault();

      if (e.keyCode == 38){
        self.moveHandUp();
        return
      }
      if (e.keyCode == 40){
        self.moveHandDown();
        return
      }

      var k = Bayan.keyForEvent(e);
      if (self.keys[k]) return; // Prevent key repeat

      // Prevent '-' and '=' keys from triggering 'backspace' and 'v'
      // Tested in Chrome, not sure about other browsers
      if (k === 'backspace'
          || (k === 'v'
              && (self.keys['-'] || self.keys['=']
                  || self.lastKeyUp === '-' || self.lastKeyUp === '='))) {
        delete self.keys['v'];
        delete self.keys['backspace'];
        return;
      }
      self.keys[k] = true;

      var midiNumber = self.midiNumberForKey(k);
      if (midiNumber < 0) return;

// these look potentially interesting
//      var note = teoria.note.fromMIDI(midiNumber);
//      var freq = sc.Scale.chromatic("equal").degreeToFreq(midiNumber, (0).midicps(), self.octave);

      self.synth.keyDown(self.keyboard[k]);
      self.keyboard[k].keyDown();
    }

    // Key up handler
    document.onkeyup = function(e) {
      e.preventDefault();

      if (e.keyCode == 38 || e.keyCode == 40){
        self.clearRenderedHand();
      }


      // silence backspace
      if (k === 'backspace') {
        return;
      }
      var k = Bayan.keyForEvent(e);
      delete self.keys[k];
      self.lastKeyUp = k;

      var midiNumber = self.midiNumberForKey(k);
      if (midiNumber < 0) return;

      self.synth.keyUp(self.keyboard[k]);
      self.keyboard[k].keyUp();
    }

  }

  Bayan.prototype.midiNumberForKey = function(k) {
    var midiNumber = this.layout[k];
    if (midiNumber === undefined) {
      return -1;
    }
    console.assert(!isNaN(midiNumber));
    return midiNumber;
  }

  Bayan.prototype.createKeyboard = function () {
    var width = Key.width();
    var padding = width*0.1;
    var leftMargin  = (window.innerWidth - 12.5*width)/2
    for (var r = 0; r < QWERTY.length; r++) {
      for (var c = 0; c < QWERTY[r].length; c++) {
        keyName = QWERTY[r][c];
        var xOffset = 0;
        switch (r) {
          case 0:
          case 2:
            xOffset = width*0.5;
            break;
          case 3:
            xOffset = width;
            break;
          case 1:
          default:
            break;
        }

        var key = new Key(c*(Key.width() + padding) + leftMargin + xOffset,
                          r*(Key.width() + padding),
                          this.midiNumberForKey(keyName),
                          keyName,
                          this.stage,
                          this.synth);
        this.keyboard[keyName] = key;

        // Setup event listeners
        var self = this;
        key.shape.on("mousedown", function(e) {
          var keyName = e.target.name;
          var midiNumber = self.midiNumberForKey(keyName);
          if (midiNumber < 0) return;

          console.log(e.target.cursor);
          if (e.target.cursor === "up") {
            self.synth.keyDown(self.keyboard[keyName]);
            self.keyboard[keyName].keyDown();
            e.target.cursor = "down";
          }
        });

        key.shape.on("pressup", function(e) {
          var keyName = e.target.name;
          var midiNumber = self.midiNumberForKey(keyName);
          if (midiNumber < 0) return;

          if (e.target.cursor === "down") {
            self.synth.keyUp(self.keyboard[keyName]);
            self.keyboard[keyName].keyUp();
            e.target.cursor = "up";
          }
        });

      }
    }
  }


  Bayan.prototype.resize = function (w, h) {
    var ow = this.origWidth ;
    var oh = this.origHeight;
    var scale = Math.min(w/ow, h/oh);
    this.stage.scaleX = scale;
    this.stage.scaleY = scale;
    this.stage.canvas.width = ow*scale;
    this.stage.canvas.height = oh*scale;
    this.canvas.width = ow*scale;
    this.canvas.height = oh*scale;
    this.stage.update();
  }


  var frameWithLeftHand = {"currentFrameRate":115.303,"gestures":[],"hands":[{"armBasis":[[-0.819604,0.052377,-0.570532],[-0.241291,0.871637,0.426648],[-0.519643,-0.487346,0.701758]],"armWidth":63.72,"confidence":0.688066,"direction":[0.245901,0.188018,-0.950885],"elbow":[-245.213,17.2653,235.422],"grabStrength":0.28692,"id":2470,"palmNormal":[0.175381,-0.973445,-0.147125],"palmPosition":[-83.9852,157.895,-3.64259],"palmVelocity":[-751.587,-47.3477,-371.375],"palmWidth":90.99,"pinchStrength":0,"r":[[0.957517,0.0660876,0.280703],[-0.125051,0.972261,0.197661],[-0.259854,-0.224366,0.939221]],"s":1.12645,"sphereCenter":[-97.9223,139.855,-50.4715],"sphereRadius":61.6039,"stabilizedPalmPosition":[-75.1527,158.187,0.390205],"t":[-74.8648,158.522,0.885204],"timeVisible":2.06406,"type":"left","wrist":[-104.909,148.849,45.947]}],"id":7024487,"interactionBox":{"center":[0,200,0],"size":[235.247,235.247,147.751]},"pointables":[{"bases":[[[-0.492486,0.854816,-0.163547],[0.592808,0.467058,0.656075],[-0.637209,-0.226156,0.736762]],[[-0.429459,0.87249,-0.233079],[0.597174,0.467971,0.651449],[-0.677457,-0.140582,0.722003]],[[-0.429459,0.87249,-0.233079],[0.641889,0.476453,0.600809],[-0.635251,-0.108412,0.764659]],[[-0.429459,0.87249,-0.233079],[0.451366,0.430916,0.781396],[-0.782198,-0.230374,0.578873]]],"btipPosition":[-3.27637,159.623,-19.9661],"carpPosition":[-77.0589,143.518,55.6937],"dipPosition":[-21.5826,154.232,-6.41841],"direction":[0.635251,0.108412,-0.764659],"extended":true,"handId":2470,"id":24700,"length":52.1164,"mcpPosition":[-77.0589,143.518,55.6937],"pipPosition":[-43.2419,150.535,19.6531],"stabilizedTipPosition":[22.1934,159.673,6.79384],"timeVisible":2.06406,"tipPosition":[-7.48681,158.383,-16.8502],"tipVelocity":[-978.778,-147.145,-767.717],"tool":false,"touchDistance":-0.799781,"touchZone":"hovering","type":0,"width":20.25},{"bases":[[[-0.898476,-0.0971661,-0.428135],[-0.113738,0.993423,0.0132285],[-0.424033,-0.0605805,0.903618]],[[-0.967492,-0.107722,-0.228812],[-0.164036,0.955912,0.243567],[-0.192487,-0.273183,0.942507]],[[-0.967492,-0.107722,-0.228812],[-0.0243612,0.940238,-0.339645],[-0.251725,0.32303,0.912297]],[[-0.967492,-0.107722,-0.228812],[0.105316,0.650959,-0.751772],[-0.22993,0.751431,0.618453]]],"btipPosition":[-36.0672,159.058,-93.3894],"carpPosition":[-85.5456,163.51,46.1991],"dipPosition":[-39.9956,171.896,-82.8227],"direction":[0.251725,-0.32303,-0.912297],"extended":true,"handId":2470,"id":24701,"length":58.8075,"mcpPosition":[-54.3497,167.967,-20.2798],"pipPosition":[-46.08,179.704,-60.7721],"stabilizedTipPosition":[-31.654,164.018,-88.8527],"timeVisible":2.06406,"tipPosition":[-36.9707,162.01,-90.959],"tipVelocity":[-888.87,-312.502,-379.471],"tool":false,"touchDistance":0.306503,"touchZone":"hovering","type":1,"width":19.3428},{"bases":[[[-0.914862,-0.272379,-0.298056],[-0.27328,0.961123,-0.0395076],[-0.29723,-0.0453089,0.95373]],[[-0.952128,-0.276116,-0.131198],[-0.296874,0.937539,0.181348],[-0.0729303,-0.211615,0.974628]],[[-0.952128,-0.276116,-0.131198],[-0.198913,0.885467,-0.419978],[-0.232134,0.373776,0.898001]],[[-0.952128,-0.276116,-0.131198],[-0.0536025,0.573315,-0.81758],[-0.300964,0.771408,0.56067]]],"btipPosition":[-59.9245,152.29,-109.115],"carpPosition":[-96.4336,164.054,40.4742],"dipPosition":[-65.5802,166.786,-98.579],"direction":[0.232134,-0.373776,-0.898001],"extended":true,"handId":2470,"id":24702,"length":67.0064,"mcpPosition":[-75.6965,167.215,-26.0656],"pipPosition":[-72.1812,177.415,-73.0431],"stabilizedTipPosition":[-52.1502,161.384,-103.432],"timeVisible":2.06406,"tipPosition":[-61.2253,155.624,-106.692],"tipVelocity":[-749.765,-539.518,-306.443],"tool":false,"touchDistance":0.31147,"touchZone":"hovering","type":2,"width":18.9972},{"bases":[[[-0.86656,-0.498277,-0.0281618],[-0.499017,0.865922,0.0340807],[-0.00740429,-0.0435862,0.999022]],[[-0.858336,-0.488465,-0.157036],[-0.513041,0.812957,0.275483],[0.00690003,-0.317023,0.948393]],[[-0.858336,-0.488465,-0.157036],[-0.435069,0.855133,-0.281892],[-0.271981,0.173636,0.946508]],[[-0.858336,-0.488465,-0.157036],[-0.253475,0.669791,-0.697948],[-0.446105,0.559269,0.698719]]],"btipPosition":[-105.018,153.06,-88.1181],"carpPosition":[-118.213,152.359,33.901],"dipPosition":[-112.708,162.7,-76.0744],"direction":[0.271981,-0.173636,-0.946508],"extended":true,"handId":2470,"id":24704,"length":50.5107,"mcpPosition":[-117.784,154.886,-24.0275],"pipPosition":[-118.028,166.096,-57.5619],"stabilizedTipPosition":[-88.177,160.561,-77.7512],"timeVisible":2.06406,"tipPosition":[-106.787,155.277,-85.3481],"tipVelocity":[-669.931,-241.926,-285.938],"tool":false,"touchDistance":0.261996,"touchZone":"hovering","type":4,"width":16.0574},{"bases":[[[-0.925409,-0.347751,-0.150626],[-0.34728,0.937272,-0.0302785],[-0.151707,-0.0242897,0.988127]],[[-0.923024,-0.347346,-0.16546],[-0.376924,0.902632,0.207809],[-0.0771673,-0.254179,0.964074]],[[-0.923024,-0.347346,-0.16546],[-0.259817,0.879918,-0.397793],[-0.283763,0.324184,0.902432]],[[-0.923024,-0.347346,-0.16546],[-0.0767957,0.587731,-0.805404],[-0.377,0.7307,0.569164]]],"btipPosition":[-79.7644,151.872,-104.592],"carpPosition":[-107.62,161.626,36.0126],"dipPosition":[-86.8083,165.524,-93.9573],"direction":[0.283763,-0.324184,-0.902432],"extended":true,"handId":2470,"id":24703,"length":64.4285,"mcpPosition":[-98.1169,163.148,-25.8837],"pipPosition":[-94.6691,174.505,-68.9582],"stabilizedTipPosition":[-71.4782,161.316,-98.6644],"timeVisible":2.06406,"tipPosition":[-81.3845,155.012,-102.146],"tipVelocity":[-702.589,-515.051,-284.983],"tool":false,"touchDistance":0.305231,"touchZone":"hovering","type":3,"width":18.077}],"r":[[0.957517,0.0660876,0.280703],[-0.125051,0.972261,0.197661],[-0.259854,-0.224366,0.939221]],"s":1.12645,"t":[-74.8648,158.522,0.885204],"timestamp":416996788561};
  var frameWithNoHands = {"currentFrameRate":115.303,"gestures":[],"hands":[],"id":7024487,"interactionBox":{"center":[0,200,0],"size":[235.247,235.247,147.751]},"pointables":[{"bases":[[[-0.492486,0.854816,-0.163547],[0.592808,0.467058,0.656075],[-0.637209,-0.226156,0.736762]],[[-0.429459,0.87249,-0.233079],[0.597174,0.467971,0.651449],[-0.677457,-0.140582,0.722003]],[[-0.429459,0.87249,-0.233079],[0.641889,0.476453,0.600809],[-0.635251,-0.108412,0.764659]],[[-0.429459,0.87249,-0.233079],[0.451366,0.430916,0.781396],[-0.782198,-0.230374,0.578873]]],"btipPosition":[-3.27637,159.623,-19.9661],"carpPosition":[-77.0589,143.518,55.6937],"dipPosition":[-21.5826,154.232,-6.41841],"direction":[0.635251,0.108412,-0.764659],"extended":true,"handId":2470,"id":24700,"length":52.1164,"mcpPosition":[-77.0589,143.518,55.6937],"pipPosition":[-43.2419,150.535,19.6531],"stabilizedTipPosition":[22.1934,159.673,6.79384],"timeVisible":2.06406,"tipPosition":[-7.48681,158.383,-16.8502],"tipVelocity":[-978.778,-147.145,-767.717],"tool":false,"touchDistance":-0.799781,"touchZone":"hovering","type":0,"width":20.25},{"bases":[[[-0.898476,-0.0971661,-0.428135],[-0.113738,0.993423,0.0132285],[-0.424033,-0.0605805,0.903618]],[[-0.967492,-0.107722,-0.228812],[-0.164036,0.955912,0.243567],[-0.192487,-0.273183,0.942507]],[[-0.967492,-0.107722,-0.228812],[-0.0243612,0.940238,-0.339645],[-0.251725,0.32303,0.912297]],[[-0.967492,-0.107722,-0.228812],[0.105316,0.650959,-0.751772],[-0.22993,0.751431,0.618453]]],"btipPosition":[-36.0672,159.058,-93.3894],"carpPosition":[-85.5456,163.51,46.1991],"dipPosition":[-39.9956,171.896,-82.8227],"direction":[0.251725,-0.32303,-0.912297],"extended":true,"handId":2470,"id":24701,"length":58.8075,"mcpPosition":[-54.3497,167.967,-20.2798],"pipPosition":[-46.08,179.704,-60.7721],"stabilizedTipPosition":[-31.654,164.018,-88.8527],"timeVisible":2.06406,"tipPosition":[-36.9707,162.01,-90.959],"tipVelocity":[-888.87,-312.502,-379.471],"tool":false,"touchDistance":0.306503,"touchZone":"hovering","type":1,"width":19.3428},{"bases":[[[-0.914862,-0.272379,-0.298056],[-0.27328,0.961123,-0.0395076],[-0.29723,-0.0453089,0.95373]],[[-0.952128,-0.276116,-0.131198],[-0.296874,0.937539,0.181348],[-0.0729303,-0.211615,0.974628]],[[-0.952128,-0.276116,-0.131198],[-0.198913,0.885467,-0.419978],[-0.232134,0.373776,0.898001]],[[-0.952128,-0.276116,-0.131198],[-0.0536025,0.573315,-0.81758],[-0.300964,0.771408,0.56067]]],"btipPosition":[-59.9245,152.29,-109.115],"carpPosition":[-96.4336,164.054,40.4742],"dipPosition":[-65.5802,166.786,-98.579],"direction":[0.232134,-0.373776,-0.898001],"extended":true,"handId":2470,"id":24702,"length":67.0064,"mcpPosition":[-75.6965,167.215,-26.0656],"pipPosition":[-72.1812,177.415,-73.0431],"stabilizedTipPosition":[-52.1502,161.384,-103.432],"timeVisible":2.06406,"tipPosition":[-61.2253,155.624,-106.692],"tipVelocity":[-749.765,-539.518,-306.443],"tool":false,"touchDistance":0.31147,"touchZone":"hovering","type":2,"width":18.9972},{"bases":[[[-0.86656,-0.498277,-0.0281618],[-0.499017,0.865922,0.0340807],[-0.00740429,-0.0435862,0.999022]],[[-0.858336,-0.488465,-0.157036],[-0.513041,0.812957,0.275483],[0.00690003,-0.317023,0.948393]],[[-0.858336,-0.488465,-0.157036],[-0.435069,0.855133,-0.281892],[-0.271981,0.173636,0.946508]],[[-0.858336,-0.488465,-0.157036],[-0.253475,0.669791,-0.697948],[-0.446105,0.559269,0.698719]]],"btipPosition":[-105.018,153.06,-88.1181],"carpPosition":[-118.213,152.359,33.901],"dipPosition":[-112.708,162.7,-76.0744],"direction":[0.271981,-0.173636,-0.946508],"extended":true,"handId":2470,"id":24704,"length":50.5107,"mcpPosition":[-117.784,154.886,-24.0275],"pipPosition":[-118.028,166.096,-57.5619],"stabilizedTipPosition":[-88.177,160.561,-77.7512],"timeVisible":2.06406,"tipPosition":[-106.787,155.277,-85.3481],"tipVelocity":[-669.931,-241.926,-285.938],"tool":false,"touchDistance":0.261996,"touchZone":"hovering","type":4,"width":16.0574},{"bases":[[[-0.925409,-0.347751,-0.150626],[-0.34728,0.937272,-0.0302785],[-0.151707,-0.0242897,0.988127]],[[-0.923024,-0.347346,-0.16546],[-0.376924,0.902632,0.207809],[-0.0771673,-0.254179,0.964074]],[[-0.923024,-0.347346,-0.16546],[-0.259817,0.879918,-0.397793],[-0.283763,0.324184,0.902432]],[[-0.923024,-0.347346,-0.16546],[-0.0767957,0.587731,-0.805404],[-0.377,0.7307,0.569164]]],"btipPosition":[-79.7644,151.872,-104.592],"carpPosition":[-107.62,161.626,36.0126],"dipPosition":[-86.8083,165.524,-93.9573],"direction":[0.283763,-0.324184,-0.902432],"extended":true,"handId":2470,"id":24703,"length":64.4285,"mcpPosition":[-98.1169,163.148,-25.8837],"pipPosition":[-94.6691,174.505,-68.9582],"stabilizedTipPosition":[-71.4782,161.316,-98.6644],"timeVisible":2.06406,"tipPosition":[-81.3845,155.012,-102.146],"tipVelocity":[-702.589,-515.051,-284.983],"tool":false,"touchDistance":0.305231,"touchZone":"hovering","type":3,"width":18.077}],"r":[[0.957517,0.0660876,0.280703],[-0.125051,0.972261,0.197661],[-0.259854,-0.224366,0.939221]],"s":1.12645,"t":[-74.8648,158.522,0.885204],"timestamp":416996788561};


  Bayan.prototype.emitFakeFrame = function(frameData){
    if (LeapController.streaming()){
      return
    }
    var frame = new Leap.Frame(frameData);
    frame.controller = LeapController;
    LeapController.emit('animationFrame', frame);
  }

  Bayan.prototype.renderHand = function(){
    this.hasRenderedFakeHand = true;
    this.emitFakeFrame(JSON.parse(JSON.stringify(frameWithLeftHand)))
  }

  Bayan.prototype.moveHandUp = function(){
    window.handTransformation.y += 3;
    this.renderHand()
  }

  Bayan.prototype.moveHandDown = function(){
    window.handTransformation.y -= 3;
    this.renderHand()
  }

  Bayan.prototype.clearRenderedHand = function(){
    if (this.hasRenderedFakeHand){
      this.emitFakeFrame(frameWithNoHands)
    }
    this.hasRenderedFakeHand = false;
  }


  return Bayan;
});
