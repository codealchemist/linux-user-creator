const generator = require('./fs-generator')
const rimraf = require('rimraf')

console.log('Generating hash-fs...')
generator({
  needle: 'NEEDLE',
  hash: 'HASH',
  path: `${__dirname}/hash-fs`
})
console.log('Hash-fs generated successfully!')

console.log('Deleting hash-fs...')
rimraf('./hash-fs', { disableGlob: true }, () => {
  console.log('DONE.')
});
