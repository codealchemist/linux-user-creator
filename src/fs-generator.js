const fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
const cuid = require('cuid');
const crypto = require('crypto');

const maxFiles = 27;
const maxFolder = 5;
const maxLevel = 5;

const keyLevel = Math.floor(Math.random() * maxLevel) + 1;
console.log('LEVELS:', keyLevel);

// const needle = argv.NEEDLE || 'NEEDLE'; // Written inside file.
// const hash = argv.HASH || 'HASH'; // Filename.
// const path = argv.PATH || './hash-fs'

function writeReadme (path, needle) {
  const readme = `
    Hi there! Congrats for making it this far!
    And welcome to a new challenge!
    Find a file that contains the string "${needle}".
    It shouldn't be so hard... Should it?
  `.replace(/\n/g, ' ')
   .replace(/\s{2}/g, '');

  // Write readme file.
  const readmeFile = `${path}/README.txt`;
  fs.writeFileSync(readmeFile, readme, 'utf8');
}

function generate({root, level = 0, amIkeyPath}) {
  const folderAmount = Math.floor(Math.random() * maxFolder + 1);
  const filesAmount = Math.floor(Math.random() * maxFiles + 1);

  const keyOrder = Math.floor(Math.random() * (keyLevel === level && amIkeyPath ? filesAmount : folderAmount));

  for (var i = 0; i < filesAmount; i++) {
    let name;
    let filePath;
    do {
      name = getHash();
      filePath = root + '/' + name;
    } while(fs.existsSync(filePath))

    const secretDirection = keyOrder === i && keyLevel === level && amIkeyPath;

    if (secretDirection) {
      console.log('WRITING THE SECRET!', root + '/' + hash); // Filename.
      const content = makeString(needle);
      fs.writeFileSync(root + '/' + hash, content, 'utf8'); // Filename.
    } else {
      const content = makeString();
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  if (level === maxLevel) {
    return;
  }

  for (var i = 0; i < folderAmount; i++) {
    let name;
    let filePath;
    do {
      name = getHash();
      filePath = root + '/' + name;
    } while(fs.existsSync(filePath))

    fs.mkdirSync(filePath);

    const secretDirection = keyOrder === i && keyLevel !== level && amIkeyPath;
    generate({root: filePath, level: level + 1, amIkeyPath: secretDirection});
    // console.log('creating:',root + '/' + name);
  }
}

function makeString(needle = '') {
  let randomText = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const contentLength = Math.floor(Math.random() * 1000);
  for (let i = 0; i < contentLength; i++) {
    randomText += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  randomText = `${randomText}${needle}${randomText}`
  if (needle) {
    randomText = `${randomText}
      You're tougher than we thought!
      Send an HTTP GET request to https://nodeconf.elementum.com:5643/<YOUR@EMAIL>/<FILE_NAME>,
      where FILE_NAME is the name of this file.
      The server will send you an image that contains an encrypted secret message in it. 
      You better get to work if you want to win that Phantom drone!
    `.replace(/\n/g, ' ')
     .replace(/\s{2}/g, '');
  }
  return randomText;
}

function getHash() {
  const generator = crypto.createHash('sha512');
  generator.update(cuid());
  return generator.digest('hex');
}

function generator ({needle = 'NEEDLE', hash = 'HASH', path = './hash-fs'} = {}) {
  // Ensure root path exists.
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  writeReadme(path, needle);
  generate({root: path, level: 0, needle, hash});
}

module.exports = generator;
