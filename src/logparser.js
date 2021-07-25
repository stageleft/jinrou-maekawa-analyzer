// function.js 関数群
// style:
//   json_data = function(text_data)
//   html_data = function(json_data)
//   json_data = function(json_data)


function html2json_village_log(arg) {
// input  : HTMLCollction
//          <table width="770" cellspacing="5"><tbody> ... </tbody></table>
// output : Hash
//          {
//              village_number:"string", // village number
//              log: {
//                  "date-string":{
//                      players:  {...}
//                      comments: {...}
//                      vote_log: {...}
//                  },
//                  "date-string":{},
//                  ...  
//              }
//          }
//          
  var ret = {village_number:null, log:{}};
  // parse village number
  var village_number_section = arg.body.querySelector("span.room").childNodes[1].textContent;
  ret.village_number = village_number_section.replace(/^.*\[/i, '').replace(/番地\].*$/i, '');

  // parse talk table list
  var talk_sections = arg.body.querySelectorAll("table.talk");
  var village_log = html2log(talk_sections);
  Object.assign(ret.log, village_log);

  // parse player list
  var player_section = arg.body.querySelector("div.player").querySelector("tbody");
  var player_list = html2json_villager_list(player_section).players;
  Object.keys(ret.log).forEach(log_by_day => {
    ret.log[log_by_day].players = {};
    if (talk_sections.length < 2) {
      // if multi days log
      // TODO: fix players["each_player"].stat in each day
      var datearray;
      var base_date;
      [datearray, base_date] = createDateArray(ret);
      if ((datearray == null) || (datearray.length == 0)){
        return;
      }
      Object.keys(player_list).forEach(k => {
        player_list[k].stat = "（生存中）";
      });
      /*
      datearray.forEach(function(d){
        if (d == "１日目の朝となりました。") {
          ret.log[d].players = {};
          Object.assign(ret.log[d].players, player_list);
          return;
        } else if ((d != logTag_d2n(d)) && (ret.log[logTag_d2n(d)] != null)) {
          var p = datearray[datearray.indexOf(d) - 1];
          // set player_list into current log
          // (n-1)th Nighttime: calc player_list of 1 day ago from ret.log[l].list_*
          var n = logTag_d2n(d);
          ret.log[n].players = {};
          Object.keys(player_list).forEach(function(k){
            ret.log[n].players[k] = {icon:ret.log[p].players[k].icon, stat:""};
            if (ret.log[p].players[k].stat == "（生存中）") {
              ret.log[n].players[k].stat = "（生存中）";
              if ((ret.log[n].list_bitten.includes(k) == true) ||
                  (ret.log[n].list_voted.includes(k) == true) || 
                  (ret.log[n].list_sudden.includes(k) == true) || 
                  (ret.log[n].list_dnoted.includes(k) == true) || 
                  (ret.log[n].list_cursed.includes(k) == true)) {
                ret.log[n].players[k].stat = "（死　亡）";
              }
            } else {
              ret.log[n].players[k].stat = "（死　亡）";
              if ((ret.log[n].list_revived.includes(k) == true)) {
                ret.log[n].players[k].stat = "（生存中）";
              }
            }
          });
          // nth Daytime: calc player_list of 1 day ago from ret.log[l].list_*
          ret.log[d].players = {};
          Object.keys(player_list).forEach(function(k){
            ret.log[d].players[k] = {icon:ret.log[n].players[k].icon, stat:""};
            if (ret.log[n].players[k].stat == "（生存中）") {
              ret.log[d].players[k].stat = "（生存中）";
              if ((ret.log[d].list_bitten.includes(k) == true) ||
                  (ret.log[d].list_voted.includes(k) == true) || 
                  (ret.log[d].list_sudden.includes(k) == true) || 
                  (ret.log[d].list_dnoted.includes(k) == true) || 
                  (ret.log[d].list_cursed.includes(k) == true)) {
                ret.log[d].players[k].stat = "（死　亡）";
              }
            } else {
              ret.log[d].players[k].stat = "（死　亡）";
              if ((ret.log[d].list_revived.includes(k) == true)) {
                ret.log[d].players[k].stat = "（生存中）";
              }
            }
          });
        } else {
          var p = datearray[datearray.indexOf(d) - 1];
          ret.log[d].players = {};
          Object.keys(player_list).forEach(function(k){
            ret.log[d].players[k] = {icon:ret.log[p].players[k].icon, stat:""};
            if (ret.log[p].players[k].stat == "（生存中）") {
              ret.log[d].players[k].stat = "（生存中）";
              if ((ret.log[d].list_bitten.includes(k) == true) ||
                  (ret.log[d].list_voted.includes(k) == true) || 
                  (ret.log[d].list_sudden.includes(k) == true) || 
                  (ret.log[d].list_dnoted.includes(k) == true) || 
                  (ret.log[d].list_cursed.includes(k) == true)) {
                ret.log[d].players[k].stat = "（死　亡）";
              }
            } else {
              ret.log[d].players[k].stat = "（死　亡）";
              if ((ret.log[d].list_revived.includes(k) == true)) {
                ret.log[d].players[k].stat = "（生存中）";
              }
            }
          });
        }
      });
      */
    }
    Object.assign(ret.log[log_by_day].players, player_list);
  });

  return ret;
};

function html2json_villager_list(arg) {
// input  : HTMLCollction
//          <tbody> ... </tbody> of <table class="CLSTABLE"></table>
// output : Hash
//            players: {
//              "character-name": { icon:value, stat:value },
//              "character-name": { icon:value, stat:value },
//              ...
//            }
//           stat:value : "（生存中）" or "（死亡）"
  var ret = {};
  var re = new RegExp('^\.\/', '');

  var base_td_list = arg.querySelectorAll("td");
  for (var i = 0 ; i < base_td_list.length ; i = i + 2) {
    // style of base_td_list.item(i)  :
    //   <img src="link of image" title="comment of player"><br>
    // style of base_td_list.item(i+1):
    //   character name<br>
    //   (player name (◆<br>with TRIP))<br> (option)
    //   [character JOB]<br>                (option)
    //   （Alive Status）
    // ignore player name, JOB.

    // get info of base_td_list.item(i)
    var img_selector = base_td_list.item(i).querySelector("img");
    if (img_selector != null) {
      var img_src        = img_selector.getAttribute("src").replace(re, "http://alicegame.xsrv.jp/takane/");

      // get info of base_td_list.item(i+1)
      var nodes = base_td_list.item(i+1).childNodes;
      // var character_color = nodes[0].getAttribute("color");
      var character_name = nodes[1].textContent;
      var is_alive       = nodes[nodes.length - 1].textContent; // nodes[3] if game log, nodes[7] if passed log

      // create Hash and add to Array
      ret[character_name] = { icon:img_src , stat: is_alive };
    }
  }

  return { players: ret };
}

function html2log(arg) {
// input  : Array of NodeList
//          each Nodelist is <table id="---"></table>
//          id is below:
//              aftergame
//              dateX_day  : Daytime of day X (X=2,3,...)
//              dateX      : Nighttime of day X (X=1,2,3,...)
//              beforegame
// output : Hash
//          "date-string":{
//            msg_date:     "date-string",
//            list_voted:   [ "character-name", ... ],
//            list_cursed:  [ "character-name", ... ],
//            list_revived: [ "character-name", ... ],
//            list_bitten:  [ "character-name", ... ],
//            list_dnoted:  [ "character-name", ... ],
//            list_sudden:  [ "character-name", ... ],
//            comments: [
//              { speaker:value, type:value, comment:[value_with_each_line] },
//              ...
//            ],
//            vote_log : [<from html2json_vote_result()>]
//          },
//          "date-string":{},
//          ...
//   type:value : "Normal" or "Strong" or "WithColor"
  function init_ret(){
    var o = { msg_date:     null,
              list_voted:   [],
              list_cursed:  [], // Cursed  by WereCat (only in voting)
              list_revived: [], // Revived by WereCat
              list_bitten:  [],
              list_dnoted:  [], // dead by Death Note
              list_sudden:  [],
              comments:     [],
              vote_log:     []
            };
    return o;
  };
  var ret = {};

  /*
  var base_tr_list = arg.querySelectorAll("tr");
  for (var i = 0 ; i < base_tr_list.length ; i++) {
    var base_td_list = base_tr_list.item(i).querySelectorAll("td");
    if (base_td_list.length == 1) {        // system message <td colspan="2">...</td>
      var icon_selector = base_td_list.item(0).querySelector("img");
      if (icon_selector != null) {
        if (base_td_list.item(0).querySelector("font") == null) { continue; }

        var icon_uri   = icon_selector.getAttribute("src").replace(re, "http://jinrou.aa0.netvolante.jp/~jinrou/");
        var msg_text   = base_td_list.item(0).querySelector("font").innerText;
        if ((icon_uri == "http://jinrou.aa0.netvolante.jp/~jinrou/img/ampm.gif") ||
            (icon_uri == "http://jinrou.aa0.netvolante.jp/~jinrou/img/hum.gif") ||
            (icon_uri == "http://jinrou.aa0.netvolante.jp/~jinrou/img/wlf.gif") ||
            (icon_uri == "http://jinrou.aa0.netvolante.jp/~jinrou/img/fox.gif") ||
            (icon_uri == "http://jinrou.aa0.netvolante.jp/~jinrou/img/sc5.gif")) {
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+1">１日目の夜となりました。</font>(19/07/15 00:39:10)
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+1">3日目の夜となりました。</font>(19/07/14 23:32:09)
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+1">9日目の朝となりました。</font>(19/07/06 01:43:35)
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「引き分け」です！</font>(19/08/13 00:22:35)
          // <img src="./img/hum.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「村　人」の勝利です！</font>(19/08/12 02:05:13)
          // <img src="./img/wlf.gif" width="32" height="32" border="0"> <font size="+2" color="#dd0000">「<font color="#ff0000">人　狼</font>」の勝利です！</font>(19/08/04 02:57:29)
          // <img src="./img/fox.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「<font color="#ffcc33">妖　狐</font>」の勝利です！</font>(19/08/12 00:30:03)
          // <img src="./img/sc5.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「<font color="#ff9999">猫　又</font>」の勝利です！</font>(19/07/15 00:11:04)
          datearray.push(msg_text);
          current_day_log.msg_date = datearray[datearray.length - 1];
          ret[datearray[datearray.length - 1]] = current_day_log;
          current_day_log = init_ret();
        } else if (icon_uri == "http://jinrou.aa0.netvolante.jp/~jinrou/img/dead1.gif") {
          if (msg_text.match("^処刑されました・・・。$")) {
            // <img src="./img/dead1.gif" width="32" height="32" border="0"> <b>安斎都</b>さんは村民協議の結果<font color="#ff0000">処刑されました・・・。</font>
            current_day_log.list_voted.push(base_td_list.item(0).querySelector("b").innerText);
          } else {
            // <img src="./img/dead1.gif" width="32" height="32" border="0"> <b>タマトイズ</b>さんは猫又の呪いで<font color="#ff0000">死亡しました・・・。</font>
            current_day_log.list_cursed.push(base_td_list.item(0).querySelector("b").innerText);
          }
        } else if (icon_uri == "http://jinrou.aa0.netvolante.jp/~jinrou/img/dead2.gif") {
          if (msg_text.match("^無残な姿で発見された・・・。$")) {
            // <img src="./img/dead2.gif" width="32" height="32" border="0"> <b>伊吹翼</b>さんは翌日<font color="#ff0000">無残な姿で発見された・・・。</font>
            current_day_log.list_bitten.push(base_td_list.item(0).querySelector("b").innerText);
          } else if (msg_text.match("^に死体で発見された・・・。$")) {
            // <img src="./img/dead2.gif" width="32" height="32" border="0"> <b>久川凪</b>さんは翌日<font color="#ff0000">に死体で発見された・・・。</font>
            current_day_log.list_dnoted.push(base_td_list.item(0).querySelector("b").innerText);
          } else {
            // <img src="./img/dead2.gif" width="32" height="32" border="0"> <b>八神マキノ</b>さんは都合により<font color="#ff0000">突然死しました・・・。【ペナルティ】</font>
            // <img src="./img/dead2.gif" width="32" height="32" border="0"> <b>海星</b>さんは都合により<font color="#ff0000">突然死しました・・・。</font>
            current_day_log.list_sudden.push(base_td_list.item(0).querySelector("b").innerText);
          }
        } else if (icon_uri == "http://jinrou.aa0.netvolante.jp/~jinrou/img/msg.gif") {
          if (msg_text.match("^奇跡的に生き返った。$")) {
            // <img src="./img/msg.gif" width="32" height="32" border="0"> <b>パチュリー</b>さんは<font color="#ff0000">奇跡的に生き返った。</font>
            current_day_log.list_revived.push(base_td_list.item(0).querySelector("b").innerText);
          } else {
            // <img src="./img/msg.gif" width="32" height="32" border="0">
            //      <font size="+1">再投票となりました。</font>あと
            //      <font size="+2">1</font>回の投票で結論が出なければ引き分けとなります。</td>
            // ignore. it maybe unused message or inner font tag of winner message.
          }
        } else {
          // ignore messages with unknown icon. it is not important.
        }
      } else {
        // ignore messages without icon. it is not important.
      }
    } else {                               // vote
      var vote_title = base_td_list.item(0).querySelector("font");
      var vote_table = base_td_list.item(0).querySelector("table");
      if (vote_table != null) {            // vote table
        var r = {title: vote_title.innerText};
        Object.assign(r, html2json_vote_result(vote_table));
        current_day_log.vote_log.push(r);
      } else {                             // inner tag in vote table
        // nop:
      }
    }
  }
  */

  // set each date log to return value
  arg.forEach(element => {
    // (1) msg_date
    var date_id = element.getAttribute("id");
    var datestring = null;
    if (date_id == "beforegame") {
      datestring = "１日目の朝となりました。";
    } else if (date_id == "aftergame") {
      return; // means continue of forEach()
    } else if (date_id.match(/_day$/i)) {
      var day_no = date_id.replace(/^date/i,'').replace(/_day$/i,'');
      datestring = day_no + "日目の朝となりました。";
    } else {
      var day_no = date_id.replace(/^date/i,'');
      datestring = day_no + "日目の夜となりました。";
    }
    ret[datestring] = init_ret();
    ret[datestring].msg_date = datestring;

    // (2) comments
    var tr_list = element.querySelectorAll("tr");
    tr_list.forEach(tr => {
      var td_list = tr.querySelectorAll("td");
      var msgtype = tr.getAttribute("class"); // class is in ["","system-message","user-talk"]
      if (msgtype == "user-talk") {
        var villager = null;
        var v_comment = null;
        var v_comtype = null;
        td_list.forEach(td => {
          if (td.getAttribute("class") == "user-name") {
            if (td.childNodes.length == 2) { // case if 
              // <td class="user-name"><font color="#CC0033">◆</font>ナイスネイチャ</td>
              villager = td.childNodes[1].textContent;
            }
            // else nop.
            // <td class="user-name">狼の遠吠え</td>
          } else {
            v_comment = String(td.innerHTML).replace(/<br>/g,"\n").replace(/^「/,"").replace(/」$/,"").split('\n');
            if (td.getAttribute("class") == "say normal") {
              // <td class="say normal">「はい」</td>
              v_comtype = "Normal";
            } else if (td.getAttribute("class") == "say strong") {
              // <td class="say strong">「占いだよー　アーミヤは〇」</td>
              v_comtype = "Strong";
            } else if (td.getAttribute("class") == "say weak") {
              // <td class="say weak">「それじゃあなんかウマ娘…、じゃないけどなんか似ているから<br>アーミヤを最初に占っておきましょー」</td>
              v_comtype = "WithColor";
            } else {
              // <td class="say red">「＞アーミヤ<br>うん…まあ…件のビデオ発売から20周年だもんね」</td>
              // treat as some comment.
              v_comtype = "Unknown";
            }
          }
        });
        ret[datestring].comments.push({ speaker: villager , comment : v_comment , type : v_comtype});
      }
    });

    // (3) vote_log:     []
    //ret[datestring].vote_log = html2json_vote_result;

    //list_voted:   [],
    //list_cursed:  [], // Cursed  by WereCat (only in voting)
    //list_revived: [], // Revived by WereCat
    //list_bitten:  [],
    //list_dnoted:  [], // dead by Death Note
    //list_sudden:  [],
  });

  return ret;
}

function html2json_vote_result(arg) {
// input  : HTMLCollction
//          <tbody> ... </tbody> of <table></table>
// 
// output : null or Hash
//            vote: [
//              { from_villager:value, to_villager:value },
//              ...
//            ],
  var ret = [];

  // console.log(arg.innerHTML); // debug

  var base_tr_list = arg.querySelectorAll("tr");
  for (var i = 0 ; i < base_tr_list.length ; i++) {
    // style <tr><td><b>from</b>さん</td><td>x 票</td><td>投票先 → <b>to</b>さん</td>
    var from_person;
    var to_person
    var base_b_list = base_tr_list.item(i).querySelectorAll("b");
    from_person = base_b_list.item(0).innerText;
    to_person   = base_b_list.item(1).innerText;

    ret.push({ from_villager: from_person , to_villager : to_person });
  }

  return {vote: ret};
}
