define([],
function() {
  console.log('creating audio context. Hopefully this only happens once.');

  return new (window.AudioContext || window.webkitAudioContext)();
});