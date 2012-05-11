// just like test/gc/http-client.js,
// but with a timeout set

function serverHandler(req, res) {
  res.writeHead(200)
  res.end('hello\n');
}

var http  = require('http'),
    weak    = require('weak'),
    done    = 0,
    count   = 0,
    countGC = 0,
    todo    = 18,
    gcCall = 0,
    common = require('../common.js'),
    assert = require('assert'),
    PORT = common.PORT;

console.log('We should do '+ todo +' requests');

var http = require('http');
var server = http.createServer(serverHandler);
server.listen(PORT, getall);

function getall() {
  for (var i = 0; i < todo; i++) {
    (function(){
      function cb() {
        done+=1;
        statusLater();
      }

      var req = http.get({
        hostname: 'localhost',
        pathname: '/',
        //agent: false,
        port: PORT
      }, cb);
      req.setTimeout(10, function(){
        console.log('timeout (not expected)')
      });

      count++;
      weak(req, afterGC);
    })()
  }
}

function afterGC(){
  countGC ++;
}

var timer;
function statusLater() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(status, 1);
}

function status() {
  console.log('Done: %d/%d', done, todo);
  console.log('Collected: %d/%d', countGC, count);
  if (done === todo) {

    var waitALittle = 0;
    setInterval(function(){
      gc();
      waitALittle++;
      console.log('Called gc() %d  times since last time',  gcCall);
      gcCall = 0;
      console.log('Done: %d/%d', done, todo);
      console.log('Collected: %d/%d', countGC, count);
      console.log('All should be collected now.');
      if(waitALittle > 10 || count === countGC){
        assert(count === countGC);
        process.exit(0);
      }
    }, 1000);
  }
}

setInterval(function(){
  gc();
  gcCall++;
}, 100);
