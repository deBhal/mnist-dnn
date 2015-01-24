#! /usr/local/bin/node
var readMnist = require('./read-mnist.js'),
  fs = require('fs'),
  Canvas = require('canvas');

// Parameters
// This could be a command line argument or something, but it's a once-off, and
// there are only 4 files
var imagesHeader = readMnist.readHeader('../data/train-images-idx3-ubyte'),
  fd = fs.openSync(imagesHeader.fileName,'r'),
  batchSize = 60000,
  startIndex = 0;

var arrays = [];
var startTime = Date.now();

console.log(imagesHeader);
// Pro tip - Add ", 'done'" to stop files being printed at the repl, like this:
// a = eval(fs.readFileSync('mnist-data.json',{encoding:'utf8'})), "done"


// This can take a long time.  In particular, the readMnist code is only
// reading a byte at a time, which is ridiculous, but again this is a once
// off process.
function indexForCoords( x,y ) {
  return y * imagesHeader.numberOfColumns + x;
}

for ( var i = startIndex; i < startIndex + batchSize; i ++) {
  arrays[i] = [];
  var canvas = new Canvas(imagesHeader.numberOfColumns,
  imagesHeader.numberOfRows),
    ctx = canvas.getContext('2d');

  if ( ! ( i % 1000 ) ) process.stdout.write('.');

  readMnist.readImageData( i, imagesHeader,
    function( x,y,data ) {
    arrays[i][indexForCoords(x,y)] = data / 255;
    }, fd );
  var filename =  './mnist-data.json';
}

console.log("finished reading, ", ( Date.now() - startTime ) / 1000, " seconds");
saveToFile( filename , arrays );
//fs.closeSync(fd);

function saveToFile( filename, object ) {
    console.log("opening " + filename);
  var fd = fs.openSync(filename, 'w');
  fs.writeSync(fd, 'mnistData = ' );
  // Pretty printing doesn't add newlines, but I'd like them
  fs.writeSync( fd, JSON.stringify(object).split("],").join("],\n    ") );
  console.log('saved ' + filename);
}

function destructivePadWithZeros (string, length) { string = '' + string; for(;string.length < length; string = '0' + string); return string}

console.log("fin, ", ( Date.now() - startTime ) / 1000, " seconds");
