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
//                      list_voted:   [ "character-name", ... ],
//                      list_cursed:  [ "character-name", ... ],
//                      list_revived: [ "character-name", ... ],
//                      list_bitten:  [ "character-name", ... ],
//                      list_dnoted:  [ "character-name", ... ],
//                      list_sudden:  [ "character-name", ... ],
//                      vote_log: {...}
//                  },
//                  "date-string":{},
//                  ...  
//              }
//          }
//          
  var ret = {village_number:null, log:{}};

  // parse village number
  var village_number_section = arg.body.querySelector(".room").childNodes[1].textContent;
  ret.village_number = village_number_section.replace(/^.*\[/i, '').replace(/番地\].*$/i, '');

  // parse day/night 
  var village_time_section = null;
  var is_nigittime = false;
  for (var t of arg.head.getElementsByTagName('link')) {
    if (t.rel == "stylesheet"){
      if (t.href.match(/game_beforegame.css/)) {
        village_time_section = "１日目の朝となりました。";
      } else if (t.href.match(/game_night.css/)) {
        var night_number = arg.body.textContent.match(/[0-9]+ 日目/)[0].match(/[0-9]+/)[0];
        village_time_section = night_number + "日目の夜となりました。";
        is_nigittime = true;
      } else if (t.href.match(/game_day.css/)) {
        var day_number = arg.body.textContent.match(/[0-9]+ 日目/)[0].match(/[0-9]+/)[0];
        village_time_section = day_number + "日目の朝となりました。";
      } else if (t.href.match(/game_aftergame.css/)) {
        var village_winner_section = arg.body.getElementsByClassName('winner')[0];
        if (village_winner_section.className == 'winner winner-human') {
          // in Maekawa : 
          //    <table id="winner" class="winner winner-human"><tbody><tr>
          //    <td>[村人勝利] 村人たちは人狼の血を根絶することに成功しました</td>
          //    </tr></tbody></table>
          // in Wamamete : 
          //    <img src="./img/hum.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「村　人」の勝利です！</font>(19/08/12 02:05:13)
          village_time_section = "「村　人」の勝利です！";
        } else if (village_winner_section.className == 'winner winner-wolf'){
          // in Maekawa : 
          //    <table id="winner" class="winner winner-wolf"><tr>
          //    <td>[人狼・狂人勝利] 最後の一人を食い殺すと人狼達は次の獲物を求めて村を後にした</td>
          //    </tr></table>
          // in Wamamete : 
          //    <img src="./img/wlf.gif" width="32" height="32" border="0"> <font size="+2" color="#dd0000">「<font color="#ff0000">人　狼</font>」の勝利です！</font>(19/08/04 02:57:29)
          village_time_section = "「人　狼」の勝利です！";
        } else if (village_winner_section.className == 'winner winner-fox'){
          //    <table id="winner" class="winner winner-fox"><tr>
          //    <td>[妖狐勝利] マヌケな人狼どもを騙すことなど容易いことだ</td>
          //    </tr></table>
          // in Wamamete : 
          // <img src="./img/fox.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「<font color="#ffcc33">妖　狐</font>」の勝利です！</font>(19/08/12 00:30:03)
          village_time_section = "「妖　狐」の勝利です！";          
        } else {
          // in Maekawa : 
          //    <table id="winner" class="winner winner-draw"><tr>
          //    <td>[引き分け] 引き分けとなりました</td>
          //    </tr></table>
          // in Wamamete : 
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「引き分け」です！</font>(19/08/13 00:22:35)
          village_time_section = "「引き分け」です！";
        }
        // TODO : 恋人勝利
      } // else ignore css setting : common css such as 'game_view.css'
    }
  }

  // parse player list
  // parse talk table list
  var talk_sections = arg.body.querySelectorAll("table.talk");
  ret.log = html2log(talk_sections, village_time_section);

  // parse dead/alive player list
  //list_voted:   [],
  //list_cursed:  [], // Cursed  by WereCat (only in voting)
  //list_revived: [], // Revived by WereCat
  //list_bitten:  [],
  //list_dnoted:  [], // dead by Death Note
  //list_sudden:  [],
  // -- bitten example
  //<table class="dead-type">
  //<tbody><tr><td>博麗霊夢 は無残な姿で発見されました</td></tr>
  //</tbody></table>
  //<table class="dead-type">
  //<tbody><tr><td>松尾芭蕉 は無残な姿で発見されました</td></tr>
  //</tbody></table>
  // -- voted example
  //<tr class="dead-type-vote"><td>ナイスネイチャ は投票の結果処刑されました</td></tr>
  var [date_array, base_date] = createDateArray(ret);
  if (date_array.length > 1) {
    // case if multi days
    date_array.forEach(d => {
      // All Death and Revive is Treated in begin of Daytime.
      ret.log[d].list_voted   = []; // dead in end of daytime, so record to next Daytime.
      ret.log[d].list_cursed  = []; // dead in end of daytime, so record to next Daytime.
      ret.log[d].list_revived = [], // revived in begin of this Daytime.
      ret.log[d].list_bitten  = []; // dead in begin of this Daytime.
      ret.log[d].list_dnoted  = []; // dead in begin of this Daytime.
      ret.log[d].list_sudden  = []; // dead in any time, so record to next Daytime.
      // メモ：背徳と恋人は死因として実装しない。理由のない死亡につき、その場の突然死として扱う。
    });
    var list_dead_all = [];
    arg.body.querySelectorAll("table.dead-type").forEach(tb => {
      var td_list = tb.querySelectorAll("td");
      td_list.forEach(td => {
        list_dead_all.push(td.innerText);
      });
    });
    var date_count = 1;
    for (var dead_count = list_dead_all.length - 1; dead_count >= 0; dead_count--) {
      // メモ：デスノ・猫呪いは死因として実装しない（ログが見当たらないため）。理由のない死亡につき、その場の突然死として扱う。
      // メモ：猫蘇生は実装しない（ログが見当たらないため）。
      // メモ：呪殺・猫噛みは無残とする。
      var [dead_person, dead_reason] = list_dead_all[dead_count].split(' ');
      if (list_dead_all[dead_count].match(/^\(.*\)$/g)) {
        // skip if dead_reason is like "(xx はyyになったようです)" style
      } else if (dead_reason == undefined) {
        // skip if "人狼は護衛に阻まれたようです"
      } else if (dead_reason.match("無残な姿で発見されました")) {
        ret.log[date_array[date_count]].list_bitten.push(dead_person);
      } else if (dead_reason.match("投票の結果処刑されました")) {
        date_count = date_count + 1;
        if (date_count >= date_array.length) {
          break;
        }  
        ret.log[date_array[date_count]].list_voted.push(dead_person);
      } else {
        ret.log[date_array[date_count]].list_sudden.push(dead_person);      
      }
    }
  } else {
    // All Death and Revive is Treated in begin of Daytime.
    ret.log[village_time_section].list_voted   = []; // dead in end of daytime, so record to next Daytime.
    ret.log[village_time_section].list_cursed  = []; // dead in end of daytime, so record to next Daytime.
    ret.log[village_time_section].list_revived = [], // revived in begin of this Daytime.
    ret.log[village_time_section].list_bitten  = []; // dead in begin of this Daytime.
    ret.log[village_time_section].list_dnoted  = []; // dead in begin of this Daytime.
    ret.log[village_time_section].list_sudden  = []; // dead in any time, so record to next Daytime.
    // メモ：背徳と恋人は死因として実装しない。理由のない死亡につき、その場の突然死として扱う。
    // case if single day
    var list_dead_all = [];
    arg.body.querySelectorAll("table.dead-type").forEach(tb => {
      var td_list = tb.querySelectorAll("td");
      td_list.forEach(td => {
        list_dead_all.push(td.innerText);
      });
    });
    for (var dead_count = list_dead_all.length - 1; dead_count >= 0; dead_count--) {
      var [dead_person, dead_reason] = list_dead_all[dead_count].split(' ');
      if (dead_reason.match("投票の結果処刑されました")) {
        ret.log[village_time_section].list_voted.push(dead_person);
        continue;
      }
      if (is_nigittime == false) {
        if (list_dead_all[dead_count].match(/^\(.*\)$/g)) {
          // skip if dead_reason is like "(xx はyyになったようです)" style
        } else if (dead_reason == undefined) {
          // skip if "人狼は護衛に阻まれたようです"
        } else if (dead_reason.match("無残な姿で発見されました")) {
          ret.log[village_time_section].list_bitten.push(dead_person);
        } else {
          ret.log[village_time_section].list_sudden.push(dead_person);      
        }
      }  
    }
  }

  // parse vote log
  //vote_log:     []
  if (date_array.length > 1) {
    var vote_result = html2json_vote_result(arg.body.querySelectorAll("table.vote-list"));
    Object.keys(vote_result).forEach(d => {
      if (ret.log[d] == null){
        ret.log[d] = {vote_log: null};
      }
      ret.log[d].vote_log = vote_result[d].vote_log;
    });
  } else {
    var vote_result = html2json_vote_result(arg.body.querySelectorAll("table.vote-list"));
    Object.keys(vote_result).forEach(d => {
      ret.log[village_time_section].vote_log = vote_result[d].vote_log;
    });
  }

  // set player list (modify in multi_days log)
  function calc_dead_or_alive(prev_log, curr_log, character_name) {
    var ret_stat;
    if (prev_log.players[character_name].stat == "(生存中)") {
      if ((curr_log.list_bitten.includes(character_name) == true) ||
          (curr_log.list_voted.includes(character_name)  == true) || 
          (curr_log.list_sudden.includes(character_name) == true) || 
          (curr_log.list_dnoted.includes(character_name) == true) || 
          (curr_log.list_cursed.includes(character_name) == true)) {
        ret_stat = "(死亡)";
      } else {
        ret_stat = "(生存中)";
      }
    } else {
      if (curr_log.list_revived.includes(character_name) == true) {
        ret_stat = "(生存中)";
      } else {
        ret_stat = "(死亡)";
      }
    }
    return ret_stat;
  }
  var player_section = arg.body.querySelector("div.player").querySelector("tbody");
  var player_list = html2json_villager_list(player_section).players;
  if (date_array.length > 1) {
      Object.keys(ret.log).sort((a,b) => a.localeCompare(b, 'jp')).forEach(log_by_day => {
      if (log_by_day.localeCompare(date_array[date_array.length - 1], 'jp') > 0) { // log-date limitation
        return;
      }
      ret.log[log_by_day].players = JSON.parse(JSON.stringify(player_list));
      if (talk_sections.length >= 2) {
        // if multi days log
        if (log_by_day == "１日目の朝となりました。") {
          Object.keys(ret.log[log_by_day].players).forEach(k => {
            ret.log[log_by_day].players[k].stat = "(生存中)";
          });
        } else if ((log_by_day != logTag_d2n(log_by_day))
                && (logTag_d2n(log_by_day) != logTag_n2d(logTag_d2n(log_by_day)))
                && (ret.log[logTag_d2n(log_by_day)] != null)
                && (ret.log[logTag_d2n(log_by_day)].players != null)) {
          // if Daytime (and has Previous Daytime)
          // all Death is treated in begin of Daytime, so dead difference is Previous Daytime.
          var log_prev_day = logTag_n2d(logTag_d2n(log_by_day));
          Object.keys(ret.log[log_by_day].players).forEach(k => {
            ret.log[log_by_day].players[k].stat = calc_dead_or_alive(ret.log[log_prev_day], ret.log[log_by_day], k);
          });
        } else {
          // if Nighttime (and has Previous Daytime)
          // all Death is treated in begin of Daytime, so No Death occured.
          var log_prev_daytime = logTag_n2d(log_by_day);
          ret.log[log_by_day].players = JSON.parse(JSON.stringify(ret.log[log_prev_daytime].players));
        }
      }
    });
  } else {
    ret.log[village_time_section].players = JSON.parse(JSON.stringify(player_list));
  }

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
//           stat:value : "(生存中)" or "(死亡)"
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

function html2log(arg, datestring_from_header) {
// input  : Array of NodeList
//          each Nodelist is <table id="---"></table>
//          id is below:
//              aftergame
//              dateX_day  : Daytime of day X (X=2,3,...)
//              dateX      : Nighttime of day X (X=1,2,3,...)
//              beforegame
// output : Hash
//          "date-string":{
//            comments: [
//              { speaker:value, type:value, comment:[value_with_each_line] },
//              ...
//            ],
//          },
//          "date-string":{},
//          ...
//   type:value : "Normal" or "Strong" or "WithColor" or "Red" or "Green" or "Unknown"
  var ret = {};

  // set each date log to return value
  arg.forEach(element => {
    // (1) datestring
    var datestring = null;
    if (datestring_from_header == null) {
      // (1-A) if multidate
      var date_id = element.getAttribute("id");
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
    } else {
      // (1-2) if singledate
      datestring = datestring_from_header;
    }
    ret[datestring] = {comments:[]};  

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
          if (td.getAttribute("class").match("user-name")) {
            if (td.childNodes.length >= 2) {
              // <td class="user-name"><font color="#CC0033">◆</font>ナイスネイチャ</td>
              // <td class="user-name night-self-talk"><font color="#3300FF">◆</font>わかさぎ姫<span>の独り言</span></td>
              // <td class="user-name night-wolf"><font color="#00CC99">◆</font>セイウンスカイ<span>(人狼)</span></td>
              villager = td.childNodes[1].textContent;
            } else {
              // <td class="user-name">狼の遠吠え</td>
              villager = "";
            }
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
            } else if (td.getAttribute("class") == "say red") {
              // <td class="say red">「＞アーミヤ<br>うん…まあ…件のビデオ発売から20周年だもんね」</td>
              v_comtype = "Red";
            } else if (td.getAttribute("class") == "say green") {
              // <td class="say green">「＞佐久間さん　この村初めてとのことですけども<br>人狼自体は別に初めてではない感じで合ってますか？」</td>
              v_comtype = "Green";
            } else {
              // treat as some comment.
              v_comtype = "Unknown";
            }
          }
        });
        ret[datestring].comments.push({ speaker: villager , comment : v_comment , type : v_comtype});
      }
    });

  });

  return ret;
}

function html2json_vote_result(arg) {
// input  : HTMLCollction
//          <tbody> ... </tbody> of <table></table>
// 
// output : null or Hash
//          "date-string":{
//            vote_log: [
//              {
//                title: "title_string"
//                vote: [
//                  { from_villager:value, to_villager:value },
//                  ...
//                ]
//              },
//              {
//                title: "title_string"
//                vote: [
//                  { from_villager:value, to_villager:value },
//                  ...
//                ]
//              },
//              ...
//            ]
//          },
//          "date-string":{},
//          ...
  var ret = {};
  arg.forEach(tb => {
    // <tr><td class="vote-times" colspan="4">3 日目 (1 回目)</td></tr>
    var title_string = tb.getElementsByClassName("vote-times")[0].innerText;
    var datestring   = title_string.match(/^[0-9]+/g) + "日目の朝となりました。";

    if ( ret[datestring] == null) {
      ret[datestring] = { vote_log: []};
    }

    var vote_result = [];
    var vote_body = tb.getElementsByClassName("vote-name");
    for (var i = 0 ; i < vote_body.length ; i = i + 2 ) {
      // <tr><td class="vote-name">白瀬咲耶</td><td>0 票</td><td>投票先 1 票 →</td><td class="vote-name">ロイ・マスタング</td></tr>
      var from_person = vote_body[i].innerText;
      var to_person   = vote_body[i + 1].innerText;
  
      vote_result.push({ from_villager: from_person , to_villager : to_person });
    }
    ret[datestring].vote_log.push({ title: title_string , vote : vote_result });
  });

  Object.keys(ret).forEach(v => {
    ret[v].vote_log.reverse();
  });
  return ret;
}
