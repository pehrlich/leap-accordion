// console.throttle acts as console.log, but rate-limits to 200ms

// todo: add console.graph

(function(){

  // tracks signatures of call stacks, and uses that to run unique throttles
  // this should not be left in production apps, as that map may grow in size
  var callers = {};
  var maxRate = 500; //ms

  // acts as console log, but limits output to one line every 250ms
  // appends the caller line number for quick access despite there being a wrapper logger fn
  console.throttle = function(){
    var callerSignature = (new Error).stack.split("\n")[2];
    var now = (new Date).getTime();

    if (callers[callerSignature] && callers[callerSignature] > (now - maxRate)){
      return
    }

    callers[callerSignature] = now;

    [].push.call(arguments, callerSignature.match(/\((.*)\)/)[1] );

    console.log.apply(this, arguments);
  }


}).call(window)