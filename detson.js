var token = "";
var instance = "";

function detMoveMade(s) {
}

function detMakeMove(s) {
  window.sabaki.makeMove(s);
}

function httpGet(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == XMLHttpRequest.DONE) {
          if (xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
          } else {
            alert(xmlHttp.responseText);
          }
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function detCreds() {
    newinst = prompt("Enter mastodon instance URL","https://framapiaf.org");
    if (newinst!=null) {
      instance = newinst;
      // TODO save in browser cache
    }
    newtoken = prompt("Enter your mastodon app access token","");
    if (newtoken!=null) {
      token=newtoken;
      // TODO save token in browser cache
    }
}

function connect(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange= function () {
    if (xmlHttp.readyState == XMLHttpRequest.DONE) {
      // TODO check whether connection works with this token
      if (xmlHttp.status == 200) {
        callback(xmlHttp.responseText);
      } else {
        errtxt = xmlHttp.status+" "+xmlHttp.responseText;
        if (errtxt.indexOf("access token is invalid")!==-1) {
          alert("token invalid - resetting token");
          token="";
        } else {
          alert(errtxt);
        }
      }
    }
  }
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.setRequestHeader("Authorization", "Bearer "+token);
  xmlHttp.send(null);
}

function handleNotifications(s) {
  notifs = JSON.parse(s);
  s=""
  for (i=0;i<notifs.length;i++) {
    if (notifs[i]['type']=='mention') {
      s+=notifs[i]['status']['content']+'\n';
    }
  }
  alert(s);
}

function detlogin() {
  connect(instance+'/api/v1/notifications',handleNotifications);
}
