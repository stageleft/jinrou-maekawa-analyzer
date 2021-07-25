# モジュール間インタフェースデザイン

## サーバ→スクリプトメイン

* 内容：村のHTMLファイル全体
* 形式：JSON（key: log_html）

## スクリプトメイン←→Web Storage API

* 代入方法 ：window.localStorage.setItem("wakamete_village_info", encodeURIComponent(JSON.stringify(value)));
* 取得方法 ：value = Json.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")));
* キー(key)：wakamete_village_info
* 値(value)：村全体（特定の村）のログおよび手入力情報。誤入村対策に複数の村のデータを保持するが、多くなったら村番号の古いものからクリアしていく。形式は以下。

```JSON
  village: {
    "village_number_string" : {  
      // 村
      village_number: "string", // "village_number_string" と同じ値を入れる。
      // ログ（日付別Hash）
      log: {
        "date-string":
          players: {
            "character-name": {
              icon:"icon_url(absolute URL)", 
              stat:"string, （生存中） or （死亡）" 
            },
            "character-name": { icon:"", stat:"" },
            ...
          },
          comments: [
            {
              speaker:"string",
              comment:"string",
              type:"string, Normal or Strong or WithColor"
            },
            { speaker:"",  comment:"", type:"string" },
            ...
          ],
          list_voted:  [ "character-name", ... ],
          list_cursed: [ "character-name", ... ],
          list_revived: [ "character-name", ... ],
          list_bitten: [ "character-name", ... ],
          list_dnoted: [ "character-name", ... ],
          list_sudden: [ "character-name", ... ],
          vote_log:, {
            "from_villager_name":"to_villager_name",
            "from_villager_name":"to_villager_name",
            "from_villager_name":"to_villager_name",
            ...
          }
        },
        "date-string": { player: , comments: , messages: , vote_log: },
        ...
      },    
      input: {			// 手入力情報
        // 村別、配役情報、
        player_count: integer,    // 参加者の人数
        villager_count: integer,  // 村人（いわゆる素村）の人数
        seer_count: integer,      // 占い師の人数
        medium_count: integer,    // 霊能者の人数
        bodyguard_count: integer, // 狩人の人数
        freemason_count: integer, // 共有者の人数
        werecat_count: integer,   // 埋毒者の人数
        werewolf_count: integer,  // 人狼の人数
        posessed_count: integer,  // 狂人と狂信者の合計人数
        werefox_count: integer,   // 妖狐の人数
        minifox_count: integer,   // キューピッドの人数
        // 参加者別、役職CO、占い結果、霊能結果
        each_player:{
          "character-name": { comingout:"string",
                             enemymark:"string",
                             "date-string": { target: null or "string",
                                              result: null or "string",
                                              dead_reason: null or "string" },
                             "date-string": { target: , result: , dead_reason: },
                             ...
                           },
          "character-name": { comingout:, enemymark:, "date-string":, ... },
          ...
        },
      },    
    },
    "village_number_string":{ village_number:"", log:"", input:"" },
    ...
  }
```

* 代入方法 ：window.localStorage.setItem("wakamete_village_raw_log", encodeURIComponent(JSON.stringify(value)));
* 取得方法 ：value = Json.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_raw_log")));
* キー(key)：wakamete_village_raw_log
* 値(value)：取得した html_log。誤入村対策に複数の村のデータを保持するが、多くなったら村番号の古いものからクリアしていく。形式は以下。

```JSON
  village: {
    "village_number_string" : {  
      // ログ（日付別Hash）
      log: {
        "date-string": JSON.stringify(html_log),
        ...
      },    
    },
    "village_number_string":{ ... },
    ...
  }
```

## スクリプトメイン→各種機能→各種画面

* 入力データ： JSON形式。 内容は上記 スクリプトメイン←→Web Storage API参照。
* 出力データ： HTML形式。画面を意味する `<div />` タグの中身として差し込む。
