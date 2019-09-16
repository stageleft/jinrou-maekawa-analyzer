# about Jinrou-Wakamete-Analyzer

Support tool for online "Are You a Werewolf?" game in Wakamete Server ( http://jinrou.dip.jp/~jinrou/ ).
You get easier to correct and analyze Chat Log.
It is Sidebar Plugins for Mozilla Firefox.

Firefoxのサイドバーを用いた、人狼ゲーム・わかめて鯖 http://jinrou.dip.jp/~jinrou/ 向けログリアルタイム分析ツール。

# Support Language

Japanese only, because Wakamete Server can support only Japanese.

わかめて鯖が日本語なので、日本語以外対応しません。あしからず。

# Request for you （お使いの皆様へお願い事項）

まず、バグ報告についてのお願いです。

1. *村番号の控え* 、および、 *スクリーンショットの取得* をお願いします。
1. 基本的には Issueチケット による報告をお願いいたします。  
   https://github.com/stageleft/jinrou-wakamete-analyzer/issues から、「New Issue」をクリックして報告を作成願います。作者によるバグ調査の際は、村のログおよびスクリーンショットが必要となります。
    * Github アカウントをお持ちでない等、 Issue チケットを操作できない事情がある場合は、別途個別対応とさせてください。

次に、機能の強化および削除に関する要望についてのお願いです。

1. 要望は、基本的にバグ報告と同様、 Issueチケット による報告をお願いいたします。  
1. 要望がある場合は、内容および理由について、できるだけ具体的に記載願います。
    * 技術的困難度および将来拡張性の観点から、要望の内容と全く異なる形での対応を行う場合があります。
1. 採用されなくても泣かないでください。
    * 技術的困難度、レイアウト、および将来拡張性の展望から、採用できない要望も多数考えられます。
    * 採用できない場合は、原則として採用できない理由を Issue チケットに残します（あるいは、すでに残っているかもしれません）

# How to Install （どうやってインストールするの？）

## Install （普通にインストールする場合）

https://addons.mozilla.org/ja/firefox/addon/jinrou-wakamete-analyzer/ からインストールしてください。

## Temporarily install for your Development（自分でカスタマイズしたい場合）

1. 本ページ右上（右中？）の、「Clone or download」から、Download ZIP にてファイルをダウンロードする。
1. https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Packaging_and_installation の、
「ディスクから読み込む」セクションに従ってインストールする。  
   インストール完了後は、 about:debugging のページを閉じてよい。  
   なお、起動のたびにインストールする必要があるため、 about:debugging をブックマークするとよい。
1. 満足の行くカスタマイズができた場合、ご自身でカスタマイズしたパッケージをインストールできる。
    1. https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/Distribution を熟読する。
    1. manifest.json はご自身の情報に合わせて書き換える。 version と、 applications.gecko.id の書き換えは必須である。
    1. ファイル一式を zip 圧縮し、`*.xpi` ファイルとして保存する。
    1. https://addons.mozilla.org/ja/firefox/ にアクセスし、右上の「開発者センター」にアクセスする。あとは適宜。

# How to Use （どうやって使うの？）

1. サイドバーを表示する（下図）。  
   サイドバー上部の「Go To 「汝は人狼なりや？」続わかめてエディション」をクリックすることで、同サイトのフレームなし版にアクセスする。

![インストール直後の状態](./doc/usage-1.png "インストール直後の状態")

1. 村民登録を行い、ゲームの開始を待つ。
  このとき、ツールの仕様の都合上、以下の注意点がある。

    1. 複数のウィンドウを開いてはいけない。
    1. 複数の画面で村を見てはいけない。

「観戦」、「ログイン → 旅人」あるいは、「過去ログ → 最近の記録」からログインした場合は、正しい表示とならない。（以下スクリーンショットは、「過去ログ → 最近の記録」から取得したもの）
１日目昼から観戦している場合には、ツールの雰囲気がおおよそわかる状態にはなるので、村が立てば練習することは可能。

1. 村が始まったところで、サイドバーの上部に配役を入力する。  
   配役が入力されると、CO状況のまとめテキストがサイドバー中央に表示される。  
![サイドバーの状態「状況」](./doc/usage-2.png "サイドバーの状態「状況」")  
サイドバー中央の「状況」表示をクリックすると、この表がサイドバー下部のメモエリアに追記される。    
サイドバー上部、配役入力部分の直下の「状況」をクリックするとこの画面に戻る。

1. サイドバー上部、配役入力部分の直下の「投票」をクリックすると、サイドバー中央にてこれまでの投票履歴を確認できる。  
![サイドバーの状態「投票」](./doc/usage-3.png "サイドバーの状態「投票」")  
サイドバー中央の投票結果表をクリックすると、クリックした投票のみがサイドバー下部のメモエリアに追記される。    

1. サイドバー中央上部の推理表の左側「村人名」または、上部「日付名」をクリックすると、サイドバー中央にてこれまでの発言履歴を確認できる。  
![サイドバーの状態「発言」](./doc/usage-4.png "サイドバーの状態「発言」")  
サイドバー中央の発言表をクリックすると、クリックした発言のみがサイドバー下部のメモエリアに追記される。    

1. サイドバー中央上部の推理表には、進行に応じてCO状況、人外の推理状況、占い・霊能・狩人護衛状況、を選択入力できる。  
   また、あらかじめ選択入力をしておいた状態にて、サイドバー上部、配役入力部分の直下の「死者表示」「猫狩表示」「素村表示」「人外表示」各々のチェックボックスをクリックし、チェックをつけ外しすることで、表示する参加者の絞り込みを行うことができる。  
   本機能は、占い結果・霊能結果の入力容易化に用いるとよい。  
![サイドバーの状態「推理表から死亡者を除外」](./doc/usage-5.png "サイドバーの状態「推理表から死亡者を除外」")  
※日数は逆順で表示される（名前と近い側が最新情報）。  
※「猫狩表示」のチェックボックスは結果は、共有CO者にも適用される。  
※1日目昼においては、CO状況の入力で不正となる仕様がある。

1. サイドバー下部、メモエリアの下のテンプレリンクには、進行に応じて、占いCO・霊能CO・狩人CO・共有の簡単なテンプレートを提供している。  
   クリックすることで、サイドバー下部（リンク直上）のメモエリアに追記される。   
![サイドバーの状態「推理表から死亡者を除外」](./doc/usage-6.png "サイドバーの状態「推理表から死亡者を除外」")  
   画像は共有テンプレとして、全ての生存者に対して、「指定：＜CNフルネーム＞COありますか？」の文字列を提供したもの。  
   必要に応じて、文章の追加や文字の削除を行ってから使用すること。

1. 村の進行に合わせてログは自動で取り込まれるが、サイドバー下部の各種情報の自動更新は周期が遅い（※）ので、必要に応じて手動で更新することが望ましい。  
    1. 自動更新中に文字を入力すると、入力した内容が不正に削除されることがある。  
       自動更新を止めるためには、自動更新タイミングの前に、自ら更新する、発言を入力する、といった操作を行う。

※注意事項：自動更新を一度止めたら、必ず手動更新してください。さもなくば自動更新が働きません。  
※注意事項：夜の占い師は、占い完了するまで自動更新ありません。いいからすぐ占え。

# Bugs that cannot be fixed （ざんねんな仕様）

* 最終日吊られが突然死で表示される。 https://github.com/stageleft/jinrou-wakamete-analyzer/issues/16
* 直前の昼に吊られた人を、推理表で占いの対象にできる。 https://github.com/stageleft/jinrou-wakamete-analyzer/issues/46

# Modification （改造してよい？）

Mozilla Public License Version 2.0 に従った範囲で、自由に改造して、どうぞ。

具体的な使い方は、インストール方法の「Temporarily install for your Development（自分でカスタマイズしたい場合）」を参照願います。

# Special Thanks

* ｢汝は人狼なりや？｣続わかめてエディション サーバー管理者およびWiki管理者各位  
  http://jinrou.dip.jp/~jinrou/
* 「わかめてモバマス人狼」GMおよび参加者各位  
  https://twitter.com/mobamasjinrou  
  https://wikiwiki.jp/cinderejinro/

