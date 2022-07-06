const express = require('express');
const path = require('path')
const app = express();
const http = require('http');
const server = http.createServer(app);

require('./p2p.js')(server)

// app.get('/', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
// });

// app.use(express.static('./build'))
app.use('/', express.static(path.resolve(__dirname, 'build')))

const port = 3009
server.listen(port, () => {
  console.log('listening on *:' + port);
});