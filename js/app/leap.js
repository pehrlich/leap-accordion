// This is strangely pleasing:
// setInterval(function(){ list[0].set({mul: 1000000 * Math.random() }) }, 600)
// todo: what is expected range for mul, and what's that show us about whether we're using it correctly?


// looks for the hand
// when not fisted
// determines volume based upon velocity along the z normal
// - calculates velocity for each individual key
// changes reed noise based upon velocity



// this should be an example!
window.onload = function(){
  window.plotter = new LeapDataPlotter();
}

// this should be an example
Leap.plugin('palmPointVelocity', function(scope){
  scope || (scope = {});

  this.use('handHold');

  return {
    hand: {

      rollingAverage: function(key, value){
        keyKey = key + "RollingAverage"
        // fucksticks - not merged yet.
//        var history = this.data(keyKey, {default: []});
        var history = this.data(keyKey);
        if (!history){
          history = [];
          this.data(keyKey, [])
        }
        console.assert(history);

        history.push(value);
        if (history.length > 10){
          history.shift()
        }

        var sum = 0;
        for (var i = 0; i < history.length; i++){
          sum += history[i];
        }


        return sum / history.length;
      },

      // this hand, last frame
      previousFrameHand: function(){
        var lastFrame = this.frame.controller.frame(1);
        var lastHand = lastFrame.hand(this.id);

        if (!lastHand.valid) return;

        return lastHand;
      },

      // takes a vec3 [x,y,z] of a position relative to the palmPosition to get the velocity
      velocityAtPoint: function(point){

        console.assert(typeof point[0] == 'number');
        console.assert(typeof point[1] == 'number');
        console.assert(typeof point[2] == 'number');

        var previousHand = this.previousFrameHand();

        console.assert(previousHand);


        // Subtract PalmNormal to get radial velocity of hand in three dimensions
        // multiply by the point to get velocity.

        var V_relative = Leap.vec3.create();
        var V_point = Leap.vec3.create();
        var V_hand = Leap.vec3.create();

        Leap.vec3.sub(
          V_relative,                          // out
          this.palmNormal,           // a
          previousHand.palmNormal    // b
        );

        Leap.vec3.mul(
          V_relative,       // out
          V_relative,       // a
          point     // b
        );

        // only take Y (up-down) motion
        V_hand = [0, this.palmVelocity[1], 0]

        Leap.vec3.add(
          V_point,
          V_hand,
          V_relative
        );


        return V_point;
      },

      // Gets the tangential speed at a point relative to the palmPosition
      // (Tangential velocity means perpendicular to the line between the palmNormal and given point).
      speedAtPoint: function(point){
        return this.rollingAverage(
          'speedAtPoint',
            Leap.vec3.length(
              this.velocityAtPoint(point)
            )
          );
      },

      // expects x and y on the key (in pixels?)
      gainForKey: function(key){
        var speed = this.speedAtPoint(
                      [key.x, 0, key.y]
                    );

        console.log(key.x, key.y);

        var gain = speed / 200;


        // max gain of 2 is plenty
        gain = Math.min(gain, 2);

        // allow stationary
        gain -= 0.1;

        gain = Math.max(gain, 0);

        console.log('gain ', gain.toPrecision(3));

        if (plotter){
          plotter.plot('speed', speed,
            {
              precision: 3
            });
//
//          plotter.plot('gain', gain,
//            {
//              precision: 3
//            });

          plotter.plot('palmVelocity', this.speedAtPoint([0,0,0]),
            {
              precision: 3
            });

          plotter.clear()
          plotter.draw()
        }


        return gain

      }

    }
  }
});


Leap.loop({
  frame: function(frame){
    // no key pressed yet
    if (!window['app']){
      return
    }

    var hand = frame.hands[0];

    // check for hands
    if ( !( hand && hand.previousFrameHand() && hand.grabStrength < 0.3 ) ){
      console.log('m');
      app.synth.mute();
      return
    }

    var oscillator, midiNote, key;
    for (midiNote in app.synth.reeds){
      oscillator = app.synth.reeds[midiNote];

      if (oscillator.isPlaying){

        key = app.keyForMidiNumber(midiNote); // noteNum == midinum

        oscillator.setGain(
          hand.gainForKey(key)
        )

      }

    }

  }

})
  .use('palmPointVelocity');
//  .use('boneHand');
