const http = require('http')
const fs = require('fs')
const Router = require('node-simple-router')
const useradd = require('useradd')
const rimraf = require('rimraf')
const generator = require('./fs-generator')
const { spawn } = require('child_process');

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

  try {
    fs.mkdirSync(path);

    // Generate hash fs.
    const files = generator({
      needle,
      hash,
      path: `${path}/hash-fs`
    });

    // Create docker file for this user.
    console.log(username,' => Creating docker image...')
    createDockerFile(username)

  	const subprocess = spawn('/usr/bin/setupStep3', [username,password], {
      detached: true,
      stdio: 'ignore'
    });

    subprocess.unref();
    console.log(username,' => building DOCKER IMAGE in BG.')
    console.log('-'.repeat(80))
    // cleanFs(path,username)
    response.end('42')
  } catch (e) {
    console.log(username,' => ERROR:', e)
    console.log('-'.repeat(80))
    cleanFs(path,username)
    response.end('ERROR:', e.message)
  }
})

function cleanFs (path,username) {
  console.log(username,' => Cleaning FS')
  rimraf(path, { disableGlob: true }, (err) => {
    if (err) {
      console.log(username,' => ERROR deleting path:', path)
      return
    }

    console.log(username,' => PATH DELETED successfully:', path)
  });
}

function createDockerFile (username) {
  const content = [
    'FROM mrhein/node-scratch',
    'ADD /home/ubuntu/fakeRoot.tar /',
    'COPY ./hash-fs/ /'
  ]
  fs.writeFileSync(`/tmp/${username}/Dockerfile`, content.join('\n'))
}

server = http.createServer(router)
server.listen(port, () => {
  console.log(`USER CREATOR listening on port ${port}.`)
})
