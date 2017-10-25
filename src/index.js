const http = require('http')
const fs = require('fs')
const Router = require('node-simple-router')
const useradd = require('useradd')
const Docker = require('dockerode')
const generator = require('./fs-generator')

const docker = new Docker()

// Create router instance.
const router = new Router({
  serve_static: false,
  list_dir: false,
  serve_cgi: false,
  serve_php: false
})
const port = process.env.PORT || 80 

// Add routes.
router.get('/create', (request, response) => {
  console.log('-'.repeat(80))
  console.log('CREATING USER:', request.get)

  const {username, password, hash, needle} = request.get
  const path = `/tmp/${username}`
  fs.mkdirSync(path);

  try {
    useradd({
      login: username,
      password,
      shell: '/usr/bin/step3',
      gid: 999,
      home: '/tmp'
    }, () => {
      // TODO: Generate filesystem.
      const files = generator({
        needle,
        hash,
        path: `${path}/hash-fs`
      });

      // Create docker file for this user.
      createDockerFile(username)

      files.push('Dockerfile')
      const updatedFiles = files.map((file) => {
        return file.replace(path, '')
      })
      // console.log('FILES FOR DOCKER IMAGE:', updatedFiles)

      const tag = username.replace('@', '_')
      docker.buildImage({
        context: path,
        src: updatedFiles
      }, {t: tag}, (err, dockerResponse) => {
        // Delete all temp files for this user.
        fs.rmdir(path, () => {})

        if (err) {
          response.end('ERROR creating docker image.', err)
          console.log('-'.repeat(80))
          return
        }

        console.log('DOCKER IMAGE created successfully!')
        console.log('-'.repeat(80))
        response.end('42')
      })
    })
  } catch (e) {
    console.log('ERROR:', e)
    console.log('-'.repeat(80))
    response.end('ERROR:', e.message)
  }
})

function createDockerFile (username) {
  const content = [
    'FROM mrhein/node-scratch',
    'COPY ./hash-fs/ /'
  ]
  fs.writeFileSync(`/tmp/${username}/Dockerfile`, content.join('\n'))
}

server = http.createServer(router)
server.listen(port, () => {
  console.log(`USER CREATOR listening on port ${port}.`)
})
