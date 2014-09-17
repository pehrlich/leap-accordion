// This is essentially a config file.

define([],
function() {
  console.log('creating layout. Hopefully this only happens once.');

  // mappings from qwerty key names ('q') to midi notes (0)
  // Bayan, left to right
  // for octave 5
  return {'q':0,  'a':1,   'z':2,
   '2':14, 'w':3,   's':4,  'x':5,
   '3':17, 'e':6,   'd':7,  'c':8,
   '4':20, 'r':9,   'f':10, 'v':11,
   '5':23, 't':12,  'g':13, 'b':14,
   '6':26, 'y':15,  'h':16, 'n':17,
   '7':29, 'u':18,  'j':19, 'm':20,
   '8':32, 'i':21,  'k':22, ',':23,
   '9':35, 'o':24,  'l':25, '.':26,
   '0':38, 'p':27,  ';':28, '/':29,
   '-':41, '[':30,  '\'':31};

});