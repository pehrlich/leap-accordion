define(['lib/easeljs', 'lib/teoria'],
function(createjs, teoria) {
  var W = window.innerWidth/18;
  var H = W;
  var TEXT_PADDING = W*0.1;
  var RADIUS = 10;
  var FONT = W*0.3 + "px Helvetica";
  var FONT_ITALIC = "italic " + W*0.3 + "px Helvetica";
  var TEXT_COLOR = "#FFFFFF";
  var BLACK_COLOR = "#2c3e50";
  var WHITE_COLOR = "#bdc3c7";
  var BLUE_COLOR = "#01BEFF";
  var YELLOW_COLOR = "#f1c40f";
  var COLORS = ["#56D3EA",
                "#00E093",
                "#72EA4B",
                "#006924",
                "#0208B2",
                "#645CEC",
                "#9D41EB",
                "#EB0075",
                "#EB1800",
                "#FF7300",
                "#FFA500",
                "#FFEB00"]

  function Key(x, y, leftMargin, midiNumber, keyName, stage) {
    this.x = x + leftMargin;
    this.y = y;
    this.xWithoutLeftMargin = x;

    // based off of the screen position, gets the position of the reed
    // pretty much a simple gain factor
    this.reedPosition = [
      (this.xWithoutLeftMargin - 345) * 20,
      (200 -this.y) * 20,
      0
    ]

    this.midiNumber = midiNumber;
    this.keyName = keyName;
    this.stage = stage;
    this.shape = new createjs.Shape();

    // Using name and cursor to pass state in event callbacks.
    this.shape.name = keyName;
    this.shape.cursor = "up";

    var keyColor = WHITE_COLOR;
    if (this.isBlack() === true) {
      keyColor = BLACK_COLOR;
    }
    this.shape.graphics.beginFill(keyColor).drawRoundRect(this.x, this.y, Key.width(), Key.width(), RADIUS);
    this.stage.addChild(this.shape);

    this.noteLabel = new createjs.Text(this.noteNameForMidiNumber(midiNumber), FONT_ITALIC, TEXT_COLOR);
    this.noteLabel.x = this.x + TEXT_PADDING;
    this.noteLabel.y = this.y + TEXT_PADDING;
    this.noteLabel.baseline = "top";
    this.stage.addChild(this.noteLabel);

    this.letterLabel = new createjs.Text(keyName.toUpperCase(), FONT, TEXT_COLOR);
    this.letterLabel.x = this.x + TEXT_PADDING;
    this.letterLabel.y = this.y + TEXT_PADDING + W * 0.5;
    this.letterLabel.baseline = "top";
    this.stage.addChild(this.letterLabel);

    this.stage.update();
  }


  var noteMap = {};
  var noteNumberMap = [];
  var notes = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];

  for(var i = 0; i < 127; i++) {

    var index = i,
      key = notes[index % 12],
      octave = ((index / 12) | 0) - 1; // MIDI scale starts at octave = -1

    noteMap[key] = i;
    noteNumberMap[i] = key;
  }

  Key.prototype.noteNameForMidiNumber = function(midiNumber) {
    var noteName = noteNumberMap[midiNumber];
    console.assert(noteName);
    return noteName
  }

  Key.width = function() {
    return W;
  }

  // Instance methods
  Key.prototype.isBlack = function() {
    var m = this.midiNumber % 12;
    return m === 1 || m === 3 || m === 6 || m === 8 || m === 10;
  }

  Key.prototype.downColor = function() {
    var m = this.midiNumber % 12;
    return COLORS[m];
  }

  Key.prototype.keyDown = function() {
    var color = this.downColor();
    this.shape.graphics.clear().beginFill(color).drawRoundRect(this.x, this.y, Key.width(), Key.width(), RADIUS);
    this.stage.update();
  }

  Key.prototype.keyUp = function() {
    var keyColor = WHITE_COLOR;
    if (this.isBlack() === true) {
      keyColor = BLACK_COLOR;
    }
    this.shape.graphics.clear().beginFill(keyColor).drawRoundRect(this.x, this.y, Key.width(), Key.width(), RADIUS);
    this.stage.update();
  }

  return Key;

});
