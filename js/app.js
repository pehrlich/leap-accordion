requirejs.config({
  baseURL: 'js',
  paths: {
    lib: 'lib',
    app: 'app'
  },
  shim: {
    'lib/teoria' : {
      exports: 'teoria'
    },
    'lib/subcollider' : {
      exports: 'sc'
    },
    'lib/easeljs' : {
      exports: 'createjs'
    }
  }
});

requirejs(['app/bayan', 'app/interface'],
function (Bayan) {

  var canvas = document.getElementById('bayan');
  var bayan = new Bayan(canvas);
  window.app = bayan;

  window.addEventListener('resize', onResize, false);
  onResize();

  function onResize() {
    w = window.innerWidth;
    h = window.innerHeight;
    bayan.resize(w, h);
  }

});

