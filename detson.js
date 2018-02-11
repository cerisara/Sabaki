var token = "";
var instance = "";
var tgtuser = "";
var gameid = "";
var move = "";

function detMoveMade(s) {
  move=s;
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

function connect(theUrl, callback, ispost, params) {
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
  if (params=="") params=null;
  if (ispost) {
    xmlHttp.open("POST", theUrl, true);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.setRequestHeader("Authorization", "Bearer "+token);
    xmlHttp.send(params);
  } else {
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.setRequestHeader("Authorization", "Bearer "+token);
    xmlHttp.send(params);
  }
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

function handleSendMove(s) {
  alert(s);
}

function detlogin() {
  connect(instance+'/api/v1/notifications',handleNotifications,false,null);
}

function detnew() {
  tgtuser = prompt("Enter White player","someone@framapiaf.org");
  gameid =  ""+Math.floor((Math.random() * 999999) + 1); 
  alert("play your first omve as Black, and go to menu - send move");
}

function detsend() {
  if (tgtuser!=="" && gameid!=="" && move!=="") {
    msg = " GAMID "+gameid+" DETMOVE "+move;
    msg = encodeURI(msg);
    msg = "status=@"+tgtuser+msg;
    msg = msg+"&visibility=direct";
    alert("dbug" +msg);
    connect(instance+'/api/v1/statuses"',handleSendMove,true,msg);
  } else {
    alert("something wrong - nothing sent "+tgtuser+" "+gamid+" "+move);
  }
}

