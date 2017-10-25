const http = require('http')
const Router = require('node-simple-router')
const useradd = require('useradd')

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
  response.end('42')

  try {
    useradd({
      login: request.get.username,
      password: request.get.password,
      shell: '/usr/bin/step3',
      gid: 999
    }, () => {
      console.log('-'.repeat(80))
      response.end('42')
    })
  } catch (e) {
    console.log('ERROR:', e)
    response.end('ERROR:', e.message)
  }
})

server = http.createServer(router)
server.listen(port, () => {
  console.log(`USER CREATOR listening on port ${port}.`)
})
