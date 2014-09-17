define(['lib/teoria', 'lib/subcollider', 'lib/keyboard', 'lib/easeljs', 'app/chromatic-keyboard', 'app/key', 'app/layout'],
function (teoria, sc, KeyboardJS, createjs, ChromaticKeyboard, Key, LAYOUT_BL) {


  var QWERTY =
  [['2','3','4','5','6','7','8','9','0','-'],
   ['q','w','e','r','t','y','u','i','o','p','['],
   ['a','s','d','f','g','h','j','k','l',';','\''],
   ['z','x','c','v','b','n','m',',','.','/']];


  function Bayan(canvas, textArea) {
    this.keys = {};
    this.lastKeyUp = 'backspace';
    this.canvas = canvas;
    this.textArea = textArea;
    this.stage = new createjs.Stage(canvas);
    this.layout = LAYOUT_BL;
    this.keyboard = {};
    this.synth = new ChromaticKeyboard();
    this.origWidth = window.innerWidth;
    this.origHeight = window.innerHeight * 0.5;
    this.createKeyboard();
    this.setupEventListeners();
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
    // Key down handler
    document.onkeydown = function(e) {

      if ( e.metaKey == 1 ) return;

      e.preventDefault();

      var k = Bayan.keyForEvent(e);
      if (self.keys[k]) return; // Prevent key repeat

      var c = k;
      var currentText = self.textArea.value;
      if (c === 'backspace') {
        self.textArea.value = currentText.substr(0, currentText.length - 1);
      } else {
        if (c === 'spacebar') {
          c = ' ';
        } else if (c === 'enter') {
          c = '\r'
        } else if (c.length > 1) {
          c = '';
        }
        self.textArea.value = currentText + c;
      }
      self.textArea.scrollTop = self.textArea.scrollHeight;

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


  return Bayan;
});
