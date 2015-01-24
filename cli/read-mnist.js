var fs = require('fs');

//http://yann.lecun.com/exdb/mnist/

function readBytes(fd, index, numBytes) {
  numBytes = numBytes || 1;

  var b = Buffer(numBytes);
  if ( fs.readSync(fd, b, 0, numBytes, index) != numBytes) {
    console.log ("Incorrect number of bytes read: " + bytesRead + ".  Expected " + numBytes); return;
  }

  var result = (numBytes == 1) ? b.readUInt8(0) : b.readInt32BE(0);
  return result;

}

// Reads the header data from one of the mnist file
exports.readHeader = function readHeader(fileName) {
  var fd = fs.openSync(fileName, 'r');
  var buffer = Buffer(16);
  fs.readSync( fd, buffer, 0, 16, 0 );
  var headerObject = {};
  headerObject.fileName = fileName;
  headerObject.magicNumber = buffer.readInt32BE(0);
  var count = buffer.readInt32BE(4);
  if(headerObject.magicNumber == 2049) {
    headerObject.numberOfItems = buffer.readInt32BE(4);
  } else if (headerObject.magicNumber == 2051) {
    headerObject.numberOfImages = buffer.readInt32BE(4);
    headerObject.numberOfRows = buffer.readInt32BE(8);
    headerObject.numberOfColumns = buffer.readInt32BE(12);
  }
  fs.closeSync(fd);
  return headerObject;
}

//console.log(readHeader("./train-labels-idx1-ubyte"));
//console.log(readHeader("./t10k-labels-idx1-ubyte"));
//console.log(readHeader("./t10k-images-idx3-ubyte"));
//console.log(readHeader("./train-images-idx3-ubyte"));


// calls callback(x, y, data) for each pixel in the image in order,
// starting in the top-left corner and moving across each row in turn
exports.readImageData = function readImageData(imageIndex, header, callback, fdarg ) {
  header = header || readHeader("./train-images-idx3-ubyte");
  var fd = fdarg || fs.openSync(header.fileName,'r');
  var imageSize = header.numberOfColumns * header.numberOfRows;
  var headerOffset = 16; // based on http://yann.lecun.com/exdb/mnist/
  						 // relevant exerpt at bottom of this file
  var offset = headerOffset + (imageSize * imageIndex);
  var index = 0;

  for (var y = 0; y < header.numberOfRows; y++) {
	for (var x = 0; x < header.numberOfColumns; x++) {
	  // Doing a buffer read per write is horrendously inefficient,
	  // but I'm only going to do it the once to dump the data, and
	  // it's fast enough for that, so meh.
	  callback(x, y, readBytes(fd, offset + index++ ));
	}
  }
  if(!fdarg) fs.closeSync(fd);
  return;
}

/*
TRAINING SET IMAGE FILE (train-images-idx3-ubyte):

[offset] [type]          [value]          [description]
0000     32 bit integer  0x00000803(2051) magic number
0004     32 bit integer  60000            number of images
0008     32 bit integer  28               number of rows
0012     32 bit integer  28               number of columns
0016     unsigned byte   ??               pixel
0017     unsigned byte   ??               pixel
........
xxxx     unsigned byte   ??               pixel
*/


