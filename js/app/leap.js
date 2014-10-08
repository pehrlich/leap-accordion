define(['lib/LeapDataPlotter'],
function(LeapDataPlotter) {

  var controller;

  Leap.plugin('palmPointVelocity', function (scope) {
    scope || (scope = {});

    this.use('handHold');

    return {
      frame: {

        activeHand: function () {
          var hand = this.hands[0];

          if (!( hand && hand.previousFrameHand() )) {
            return
          }

          return hand
        }

      },
      hand: {

        rollingAverage: function (key, value) {
          keyKey = key + "RollingAverage"
          var history = this.data(keyKey);
          if (!history) {
            history = [];
            this.data(keyKey, [])
          }
          console.assert(history);

          history.push(value);
          if (history.length > 10) {
            history.shift()
          }

          var sum = 0;
          for (var i = 0; i < history.length; i++) {
            sum += history[i];
          }


          return sum / history.length;
        },

        // this and the following method should really be broken out in to their own plugin.
        // this hand, last frame
        previousFrameHand: function () {
          var lastFrame = this.frame.controller.frame(1);
          var lastHand = lastFrame.hand(this.id);

          if (!lastHand.valid) return;

          return lastHand;
        },

        // takes a vec3 [x,y,z] of a position relative to the palmPosition to get the velocity
        velocityAtPoint: function (point) {

          console.assert(typeof point[0] == 'number');
          console.assert(typeof point[1] == 'number');
          console.assert(typeof point[2] == 'number');

          var previousHand = this.previousFrameHand();

          console.assert(previousHand);


          // Subtract PalmNormal to get radial velocity of hand in three dimensions
          // multiply by the point to get velocity.

          var V_relative = Leap.vec3.create();
          var V_point = Leap.vec3.create();
          var V_hand;

          Leap.vec3.sub(
            V_relative,                // out
            this.palmNormal,           // a
            previousHand.palmNormal    // b
          );

          Leap.vec3.mul(
            V_relative,       // out
            V_relative,       // a
            point     // b
          );

          // only take Y (up-down) motion of the hand
          // (leaving in relative motion in all dimensions)
          V_hand = [0, this.palmVelocity[1], 0]

          Leap.vec3.add(
            V_point,
            V_hand,
            V_relative
          );
//
//          plotter.plot('V_relative', V_relative[0], {
//            precision: 3
//          });
//
//          plotter.plot('V_hand', V_hand[1], {
//            precision: 3
//          });

          return V_point;
        },

        // Gets the tangential speed at a point relative to the palmPosition
        // (Tangential velocity means perpendicular to the line between the palmNormal and given point).
        speedAtPoint: function (point) {
          return this.rollingAverage(
            'speedAtPoint',
            Leap.vec3.length(
              this.velocityAtPoint(point)
            )
          );
        },

        // expects x and y on the key (in pixels?)
        // plotter should probably be moved out of this
        gainForKey: function (key) {
          var speed = this.speedAtPoint(
            key.reedPosition
          );

//          console.log(key.x, key.y);
//
//          plotter.plot('wind', speed, {
//            precision: 3
//          });
//
//          plotter.update()


          var gain = speed / 200;

          // max gain of 2 is plenty
          gain = Math.min(gain, 2);

          // allow stationary
          gain -= 0.1;

          gain = Math.max(gain, 0);


//          if (plotter) {
//            plotter.plot('speed', speed,
//              {
//                precision: 3
//              });
//
//          plotter.plot('gain', gain,
//            {
//              precision: 3
//            });

//            plotter.plot('palmVelocity', this.speedAtPoint([0, 0, 0]),
//              {
//                precision: 3
//              });
//
//            plotter.clear()
//            plotter.draw()
//          }


          return gain

        }

      }
    }
  });


  window.handTransformation = new THREE.Vector3(0,0,0);

  controller = Leap.loop()
    .use('transform', {position: window.handTransformation } )
    .use('playback',  {
      overlay: false,
      loop: true,
      timeBetweenLoops: 0,
      pauseOnHand: true,
      autoPlay: false,
      recording: {
        url: 'recordings/bellows2-44fps.json.lz'
      }})
    .use('palmPointVelocity');

  controller.on('ready', function(){

    if (window['_gaq']){
      _gaq.push(['_trackEvent', 'LeapJS', 'Ready', controller.connection.protocol.serviceVersion]);
    }

  });

//  controller.on('hand', function(hand){
//    plotter.plot('press', hand.indexFinger.pressStrength(), {precision: 3})
//    plotter.update()
//  });



  $(function(){
//    window.plotter = new LeapDataPlotter({
////      el: $('#leap_plotter').get(0)
//    });

    controller.use('boneHand', {
      targetEl: document.body
    })
  });

  return controller

});