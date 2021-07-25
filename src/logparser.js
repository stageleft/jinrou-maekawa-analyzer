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
  var village_number_section = arg.body.querySelector("span.room").childNodes[1].textContent;
  ret.village_number = village_number_section.replace(/^.*\[/i, '').replace(/番地\].*$/i, '');

  // parse player list
  // parse talk table list
  var talk_sections = arg.body.querySelectorAll("table.talk");
  ret.log = html2log(talk_sections);

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

  // TODO : parse vote log
  //vote_log:     []
  //ret[datestring].vote_log = html2json_vote_result;
  /*
  var vote_title = base_td_list.item(0).querySelector("font");
  var vote_table = base_td_list.item(0).querySelector("table");
  if (vote_table != null) {            // vote table
    var r = {title: vote_title.innerText};
    Object.assign(r, html2json_vote_result(vote_table));
    current_day_log.vote_log.push(r);
  } else {                             // inner tag in vote table
    // nop:
  }
  */

  // modify player list
  function calc_dead_or_alive(prev_log, curr_log, character_name) {
    var ret_stat;
    if (prev_log.players[character_name].stat == "（生存中）") {
      if ((curr_log.list_bitten.includes(character_name) == true) ||
          (curr_log.list_voted.includes(character_name)  == true) || 
          (curr_log.list_sudden.includes(character_name) == true) || 
          (curr_log.list_dnoted.includes(character_name) == true) || 
          (curr_log.list_cursed.includes(character_name) == true)) {
        ret_stat = "（死亡）";
      } else {
        ret_stat = "（生存中）";
      }
    } else {
      if (curr_log.list_revived.includes(character_name) == true) {
        ret_stat = "（生存中）";
      } else {
        ret_stat = "（死亡）";
      }
    }
    return ret_stat;
  }
  var player_section = arg.body.querySelector("div.player").querySelector("tbody");
  var player_list = html2json_villager_list(player_section).players;
  Object.keys(ret.log).sort((a,b) => a.localeCompare(b, 'jp')).forEach(log_by_day => {
    if (log_by_day.localeCompare(date_array[date_array.length - 1], 'jp') > 0) { // log-date limitation
      return;
    }
    ret.log[log_by_day].players = JSON.parse(JSON.stringify(player_list));
    if (talk_sections.length >= 2) {
      // if multi days log
      if (log_by_day == "１日目の朝となりました。") {
        Object.keys(ret.log[log_by_day].players).forEach(k => {
          ret.log[log_by_day].players[k].stat = "（生存中）";
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
//            comments: [
//              { speaker:value, type:value, comment:[value_with_each_line] },
//              ...
//            ],
//          },
//          "date-string":{},
//          ...
//   type:value : "Normal" or "Strong" or "WithColor"
  var ret = {};

  // set each date log to return value
  arg.forEach(element => {
    // (1) datestring
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
