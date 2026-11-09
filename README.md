# Discord サーバー管理bot

機能: 参加時の挨拶 / ボタンでロール付与 / kick・ban・timeout・purge

## セットアップ

### 1. Botを作る
1. https://discord.com/developers/applications で **New Application**
2. **Bot** タブで Token を発行(`DISCORD_TOKEN`)
3. 同じ画面の **Privileged Gateway Intents** で **SERVER MEMBERS INTENT** をオン(挨拶機能に必要)
4. **General Information** の Application ID を `CLIENT_ID` に

### 2. サーバーに招待する
**OAuth2 > URL Generator** で
- Scopes: `bot`, `applications.commands`
- Bot Permissions: `Manage Roles`, `Kick Members`, `Ban Members`, `Moderate Members`, `Manage Messages`, `Send Messages`, `Embed Links`

生成したURLを開いて招待します。

### 3. 起動
```bash
npm install
cp .env.example .env   # 中身を埋める
npm run deploy         # スラッシュコマンド登録(最初と、コマンドを変えたとき)
npm start
```

## 注意点
- **botのロールの順位**を、付与・操作したいロール/メンバーより上に置く(サーバー設定 > ロール)。これが原因で失敗することが一番多いです。
- ロール付与ボタンは `src/index.js` の `SELF_ASSIGN_ROLES` に書いたロール名で探します。サーバー側に同名のロールを作ってください。管理者権限を持つロールはボタン対象にしないでください。
- `.env` は絶対にGitHub等に公開しないでください(Tokenが漏れたら Developer Portal で再発行)。

## 拡張アイデア
- 自動ロール(参加時に自動付与)
- NGワードの自動削除、スパム検知
- 退出時メッセージ、ログの充実
