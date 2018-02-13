var token = "";
var instance = "";
var game = null;
var lastmove = "";
var newgames = [];

function detMoveMade(s) {
  lastmove = s;
}

function detMakeMove(s) {
  window.sabaki.makeMove(s);
}

function detCreds() {
    newinst = prompt("Enter mastodon instance URL","https://framapiaf.org");
    if (newinst!=null) {
      instance = newinst;
      // save in browser cache
      localStorage.detinst=instance;
    }
    newtoken = prompt("Enter your mastodon app access token","");
    if (newtoken!=null) {
      token=newtoken;
      // save token in browser cache
      localStorage.dettoken=token;
    }
}

function connect(theUrl, callback, ispost, params) {
  var xmlHttp = new XMLHttpRequest();
  if (localStorage.dettoken) token=localStorage.dettoken;
  xmlHttp.onreadystatechange= function () {
    if (xmlHttp.readyState == XMLHttpRequest.DONE) {
      // TODO check whether connection works with this token
      if (xmlHttp.status == 200) {
        callback(xmlHttp);
      } else {
        errtxt = xmlHttp.status+" "+xmlHttp.responseText;
        if (errtxt.indexOf("access token is invalid")!==-1) {
          alert("token invalid - resetting token");
          token="";
        } else {
          alert("ERR access token "+errtxt+" "+theUrl);
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

function handleNotifications(reponse) {
  s = reponse.responseText;
  var notifs = JSON.parse(s);
  for (i=0;i<notifs.length;i++) {
    if (notifs[i]['type']=='mention') {
      var s=notifs[i]['status']['content'];
      var j=s.indexOf("GAMID ");
      if (j!==-1) {
        var k=s.indexOf(" ",j+6);
        var gamid = s.substring(j+6,k);
        j=s.indexOf("DETMOVE ");
        if (j>=0) {
          k=s.indexOf(" ",j+8);
          var movnum = parseInt(s.substring(j+8,k));
          // first char is a letter, then 1 or 2 ints
          var l=k+3;
          var c=s.substr(l);
          if (l+1<s.length && c>='0' && c<='9') l=k+4;
          var mov = s.substring(k+1,l);
          var oldgame = localStorage.getItem("detgam"+gamid);
          alert("found game move "+mov+" "+gamid+" "+oldgame);
          if (oldgame==null) {
            if (movnum==1) {
              // OK, this is the first move of the game; we must create it
              var g = new Game(notifs[i]['account']['acct']);
              g.addMove(mov,true);
              newgames.push(g);
            } else {
              alert("game not found in this browser. TODO: rebuilt it from Mastodon");
            }
          } else {
            if (movnum==1) {
              alert("Error: game already found !");
            } else {
              // known game: check the move nb corresponds to the one stored
              var g = JSON.parse(oldgame);
              if (g.moves.length==movnum) {
                g.addMove(mov,true);
                newgames.push(g);
              } else {
                alert("TODO: game not sync "+g.moves.length+" "+movnum);
              }
            }
          }
        }
      }
    }
  }
  var nextlink = reponse.getResponseHeader('Link');
  // TODO for now, I dont look beyond the 15 first notifications
  if (nextlink!==null && false) {
    // recursive call to fill in all new games into the global list
    // TODO: care about rate limits when there are many notifications 
    var i=nextlink.indexOf('<');
    if (i>=0) {
      i=i+1
      var j=nextlink.indexOf('>',i);
      if (j>=0) {
        nextlink=nextlink.substring(i,j);
      } else {alert("ERROR nextlink "+nextlink);}
    } else {alert("ERROR nextlink "+nextlink);}
    connect(nextlink,handleNotifications,false,null);
  } else {
    alert("all games found "+newgames.length);
    // show all new games one by one
    for (i=0;i<newgames.length;i++) {
      newgames[i].show();
    }
    newgames=[];
  }
}

function handleSendMove(s) {
  alert("SEND MOVE "+s.responseText);
}

function detlogin() {
  if (localStorage.detinst) instance=localStorage.detinst;
  connect(instance+'/api/v1/notifications',handleNotifications,false,null);
}

class Game {
  constructor(opponent) {
    this.gamid = ""+Math.floor((Math.random() * 999999) + 1);
    this.tgtuser = opponent;
    this.moves = [];
  }

  show() {
    window.sabaki.newFile(false,false,true);
    for (var i=0;i<this.moves.length;i++) {
      alert("make move "+this.moves[i]);
      detMakeMove(this.moves[i]);
    }
  }

  addMove(s,amoi) {
    // TODO check move is valid ?
    this.moves.push(s);
    this.me2play = amoi;
    localStorage.setItem("detgam"+this.gamid,JSON.stringify(this));
  }

  sendLastMove() {
    if (this.tgtuser!=="" && this.gamid!=="" && this.moves.length>0) {
      var msg = " GAMID "+this.gamid+" DETMOVE "+this.moves.length+" "+this.moves[this.moves.length-1];
      msg = "status=@"+this.tgtuser+msg;
      msg = msg+"&visibility=direct";
      if (localStorage.detinst) instance=localStorage.detinst;
      connect(instance+'/api/v1/statuses',handleSendMove,true,msg);
    } else {
      alert("something wrong - nothing sent "+this.tgtuser+" "+this.gamid+" "+this.moves);
    }
  }
}

function detnew() {
  var opp = prompt("Enter White player","someone@framapiaf.org");
  game = new Game(opp);
  alert("play your first move as Black, and go to menu - send move");
  game.show();
}

function detsend() {
  if (game!=null && lastmove!=null) {
    game.addMove(lastmove,false);
    game.sendLastMove();
  }
}

