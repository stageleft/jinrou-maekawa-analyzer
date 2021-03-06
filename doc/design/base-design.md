# jinrou-maekawa-analyzer

## 目的

人狼ゲーム「前川鯖」において、自動化されたツールを提供することにより、盤面把握を確実化する。
（把握漏れによる凡ミスを防ぎ、村の知識レベルを底支えする）

* メイン画面を [前川鯖](http://alicegame.xsrv.jp/takane/) 上の村とする。
* サイドバーを用いて、メイン画面と同じ画面に別ペインを得る。

## 機能

* 村からのデータ取得
  * 村のログとして、表示画面のペイロードを得て、サイドバーに送信する。  
    ログ更新直後が望ましいが、PHP仕様上厳しそうなので、pollingで済ませる。
  * 注意として、ゲーム性・サーバ負荷に配慮し、表示系・操作系は大きくいじらない。
* サイドバーの機能  
  サイドバーは ４領域 の画面として提供する。サイドバーを広げることは難しい事情に配慮するもの。
  * ツール利用に必要な入力画面やリンクを提供する。
    * [前川鯖](http://alicegame.xsrv.jp/takane/)への固定リンク
    * 配役情報入力
  * 自由メモの領域
  * 発言状況サマリー＆推理入力  
    * 村人数 × 日付 の表を準備する。
    * 各村人について、その日ごとに発言数を表示する。
    * 各村人について、推理情報を入力させる。推理情報の入力観点は「役職CO」「能力結果CO」の他「人外推理」を入力させる。
    * クリックにより、以下「まとめ情報表示」の表示切り替えを行うトリガーを準備する。
  * まとめ情報表示  
    下記３つの機能について、同一の領域で切り替え表示を行う。切り替え操作は上記。
    * 村の状況（推理状況）を表示する。
    * 実際の発言内容を、日付別/キャラ別で表示する。
    * 投票結果まとめを表示する。

### 固定領域：配役情報入力フィールド

配役（{auto-calc}人）： 村{auto-calc}占[x]狩[x]霊[x]共[x]毒[x] 狼[x]狂[x] 狐[x]Ｑ[x]

x は手入力とする。村の人数とGMの意向によって陣営が変わることがあるので、１日目夜にシステムがGM名義で宣言する配役は信用しない。
具体的に、GM操作（村人との夜会話）により、背徳者を実現するケースがある。背徳者はシステムの宣言では「村人」で確定するが、本ツールでの取り扱いは「ＱＰ」が望ましい。

人数に合わせ、基本的な役職人数は自動入力する。 [配役](http://alicegame.xsrv.jp/takane/info/cast.php) に従う。

ユーザマニュアルを提供する際は以下の注意事項を記載する。

* 全ての役職を入力した後、村人の人数が正しいことを確認してください。
* 大狼は、本ツールでは霊能結果（■）を除き人狼として扱います。初日占い師を考慮する以上、「占い師の●」と「人狼か否か」はツール上リンクしません。
* 背徳者は、本ツールではＱＰとして扱ってください。ＱＰの能力は本ツールに影響を与えません。

### 自由メモ

* 機能 ： ユーザによる自由記載
* 機能 ： 他機能からのデータ取り込み
* 非機能：できるだけたくさんメモを取れるようにする。  
    * 他機能に影響がない範囲で欄を広く取る。
    * フォントサイズに留意する。可能な限り小さく。

### 発言状況サマリー＆推理入力

* 機能：ログの自動取り込み・保存・サマリー表示
* 機能：COおよび推理の基本パラメータ入力
* 機能：まとめ情報表示の切り替えボタン提供（形状はボタンでなくともよい）
* 非機能：ログのディスク保存（web localStorage）＠ブラウザクラッシュ対策
* 非機能：入力したCOと推理の自動保存（web localStorage）＠ブラウザクラッシュ対策
* 機能除外：デスノ持ちCO。

|*状況* *投票*|*１日目*                   ||*2日目*                         |||...|*N日目*    |||...|
|-------------|-------------|--------------|--------|------------|------------|---|---|---|-----|---|
|icon *Name*  |[deduced Job]|[Monster Mark]|Comments|[Job-target]|[Job-result]|...|...|...|...  |...|
|icon *Name*  |[deduced Job]|[Monster Mark]|Comments|[Job-target]|[Job-result]|...|Dead Reason|||   |

※注意点１：上記キャラクターには初日犠牲者を含めること。役欠けを考察したいため。変な忖度しなければ問題なし。  

* *状況* 推理内容まとめに切り替えるボタン。
* *投票* 投票結果まとめに切り替えるボタン。
* *<日付>日目* 発言まとめに切り替えるボタン。  
  同日昼および前日夜の、全キャラの発言を表示する。
  わかめての仕様に合わせ、１日目だけ全角としてもよい。
* *Name* 発言まとめに切り替えるボタン。  
  該当のキャラについて、全ての発言を表示する。
* Comments 発言数。１日目昼は提供しない。ｎ日目夜は（ｎ＋１）日目昼のログとして提供する。
* Dead Reason 死亡理由。吊り、噛み、死体、突然死から自動判別する。また、蘇生の場合に「復活」を表示する。
* [deduced Job]：以下から選択入力。デフォルトは「村　人」。  
　「村　人」「占い師」「狩　人」「霊能者」「共有者」「埋毒者」
  Remark：「村　人」でない場合、グレーには反映されない。
* [Monster Mark]：以下から選択。デフォルトは「村　人」。  
　「村　人」「人　外」「人　狼」「狂　人」「妖　狐」「Ｑ　Ｐ」  
  Remark：「村　人」でない場合、グレーには反映されない。
* [Job-target] / [Job-result]  
  下表のとおりとする。

| deduced Job | Job-target           | Job-result                   |
|-------------|----------------------|------------------------------|
|「占い師」   |選択：自分以外の生存者|選択：「○」「●」            |
|「霊能者」   |固定：前日の吊り先    |選択：「○」「●」「△」「■」|
| それ以外    |なし                  |なし                          |

* それ以外は、「村　人」、「狩　人」、「共有者」、「埋毒者」があたる。うち、狩人について説明する。  
  狩人は護衛対象が情報となるが、真狩人の護衛結果は単独で情報を確定しないため、村人の意見と同様に扱う。すなわち入力対象外。
* 霊能結果△は子狐専用に提供する。■は大狼専用に提供する。ただし、人外マークであることを前提に用途はツール利用者に委ねる。  
  前川鯖（人狼式 v3.1.0 通常配役）においては、小狐・大狼ともに出現しないので、本来の用途で利用する意味はない。

村人名のセルは以下のとおりとする。上の方が優先度高い。

| 色        | 意味                  |
|-----------|-----------------------|
| Red       | 死　亡                |
| White(1)  | 役職COあり            |
| Black     | １名以上の占い師から●|
| White(2)  | １名以上の占い師から○|
| Gray      | 上記以外              |

* White(1)とWhite(2)は同じ色。
* （Black > White(2) であることから）パンダ（占い師から●○両方もらい）はBlackで表示する。

* 死亡（および蘇生）は、理由のいかんを問わず、昼時間の最初に発生するものとする。  
  * 吊り、突然死は翌朝の議論開始直前に死亡するものとして扱う。当日は死んでいても、本ツール上は生きているものとみなす。

### まとめ表示

#### 推理内容まとめ

* 機能：推理をまとめたものを表示する。
* 機能：まとめをクリックしたとき、まとめ全体を自由メモにコピーする。

考え方：
1. 各役職CO者を明らかにする。
1. 占い師・霊能者の視点グレーおよび、占い師の視点の完全グレーを明らかにする。
1. 各役職および各人外に「人数」を記載する。
1. 「人外」は役職COの考察を含めて記載する。（飽和の確認用）

考えないもの：
1. 共有者のペアは管理しない。
1. デスノ持ちの推理は入力・推論しない。デスノ死体はまとめる。

（表示例：x=CO者/推理先、y=定員）※基本的に、村役職はx=>y、人外はx<=yになるはず。
```
　【占い師 (x/y)】※deduced Jobによる判定。ただしMonster Markにより人外判定した場合は、ここに表示しない。
　　ｘ：ｙ●→ｚ○→...
　　　（視点グレー：生存者のうち、占っていない人。CO者は色を変える）
　　　（視点人外数：潜伏x 露呈x 推理x）
　　ｙ：ｚ○→ｕ○→...
　　　（視点グレー）
　　　（視点人外数：潜伏x 露呈x 推理x）
　【霊能者 (x/y)】
　　ｚ：ａ○→ｂ○→...
　　　（視点グレー：生存者。CO者は色を変える）
　　　（視点人外数：潜伏x 露呈x 推理x）
　　ｕ：ａ○→ｂ○→...
　　　（視点グレー：生存者。CO者は色を変える）
　　　（視点人外数：潜伏x 露呈x 推理x）
　【共有者 (x/y)】ｃ，ｄ
　【埋毒者 (x/y)】ｆ，ｇ
　【狩　人 (x/y)】ｈ，ｉ
　【生存者 (x/y)】
　【完グレ】（生存者のうち、COせず、また誰からも占われていない人）
　【村人○】（生存者のうち、COせず、１人以上の占い師から○をもらっている人）
　【村人●】（生存者のうち、COせず、１名以上の占い師から●をもらっている人）
　【村○●】（生存者のうち、COせず、１人以上の占い師から○、１名以上の占い師から●をもらっている人）
　【人　狼 (x/y)】※Monster Markによる判定。y=配役から。中身の書式は人外と同じ。
　【狂　人 (x/y)】※同上
　【妖　狐 (x/y)】※同上
　【Ｑ　Ｐ (x/y)】※同上
　【人　外 (x/y)】※Monster Markにより人外判定された各役職は、deduced Jobに記載したCO役職と結果も記載する。
　　（占い師：(y-x)名）...（狩　人：(y-x)名）
　　ｊ＠偽占い師：ｄ●→...
　　ｋ＠偽霊能者：ａ●→...
　　ｌ、ｍ、偽占い師1、偽霊能者1
　　　※人外のyは、全人外のy合計から、全人外のx合計を引いたものとする。
　　　※人外のxは、CO者として表示された数の総和＋推理された人外者数の合計とする。
　【吊り (x)】
　【噛み (x)】
　【死体 (x)】
　【復活 (x)】
```

#### 投票結果まとめ

 * 機能：投票結果のサマリー表示。
 * 機能：クリックした投票結果を自由メモにコピーする

|----|２日目の投票結果                                  |...|
|----|--------------------------------------------------|---|
|Name|(voted count)→vote target<br>(target voted count)|...|
|Name|(voted count)→vote target<br>(target voted count)|...|

コーディングの注意事項：n日目（n>=2）の投票結果は、(n+1)日目昼または、n日目夜のデータから取得する。
                        n日目昼はNG。(n-1)日目の投票結果と混ざって重複表示となるため。

#### 発言内容まとめ

* 機能：ログの表示  
    * 日付別
    * キャラ別
* 機能 ： クリックしたログを自由メモにコピーする

## 参考

* [Jinrou Wakamete Analyzer](https://github.com/stageleft/jinrou-wakamete-analyzer)
* [人狼わかめてメモ](http://zumi.la.coocan.jp/jinro/wakamete.php)
* [Instant Wakamemo](https://greasyfork.org/ja/scripts/35295-instant-wakamemo)
