const fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
const cuid = require('cuid');
const crypto = require('crypto');

const maxFiles = 10;
const maxFolder = 5;
const minFolder = 3;
const maxLevel = 3;
const minLevel = 2;
const minFiles = 5;

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
  return readmeFile;
}

function generate({root, level = 0, keyLevel, amIkeyPath, needle, hash}) {
  // console.log(`KeyLevel: ${keyLevel} / level: ${level} / is key path: ${amIkeyPath}`)
  let ret = [];
  const folderAmount = Math.floor(Math.random() * maxFolder + minFolder);
  const filesAmount = Math.floor(Math.random() * maxFiles + minFiles);

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
      console.log(`FS-GENERATOR:\nWRITING THE SECRET!\n${root}/${hash}`); // Filename.
      const content = makeString(needle);
      fs.writeFileSync(root + '/' + hash, content, 'utf8'); // Filename.
      ret.push(root + '/' + hash);
    } else {
      const content = makeString();
      fs.writeFileSync(filePath, content, 'utf8');
      ret.push(filePath);
    }
  }

  if (level > maxLevel) {
    return ret;
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
    ret = ret.concat(generate({
      root: filePath,
      level: level + 1,
      keyLevel,
      amIkeyPath: secretDirection,
      needle,
      hash
    }));
    // console.log('creating:',root + '/' + name);
  }
  return ret;
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
  const keyLevel = Math.floor(Math.random() * maxLevel) + minLevel;
  console.log(`FS-GENERATOR:
------------------------
    Key Level: ${keyLevel}
    Hahs: ${hash}
    Needle: ${needle}
  `);

  // Ensure root path exists.
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  const ret = [];
  ret.push(writeReadme(path, needle));
  return ret.concat(generate({root: path, level: 0, keyLevel, needle, hash, amIkeyPath: true}));
}

module.exports = generator;
