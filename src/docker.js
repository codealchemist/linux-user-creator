const Docker = require('dockerode')

const docker = new Docker()

function build (callback) {
  docker.buildImage({
    context: __dirname,
    src: ['Dockerfile']
  }, {t: imageName}, (err, response) => {
    if (err) {
      callback(err)
      return
    }

    callback(response)
  })
}

module.exports = { build }
