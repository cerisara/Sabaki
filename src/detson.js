
const Masto = require('mastodon')

exports.detMoveMade = function(s) {
}

function detMakeMove(s) {
  window.sabaki.makeMove(s);
}

exports.detlogin = function() {

  function mastologin() {
    var M = new Masto({
      access_token: '...',
      timeout_ms: 60*1000,
      api_url: 'https://framapiaf.org/api/v1/',
    })
  }
}
