require('dotenv').config();
const { REST, Routes } = require('discord.js');
const commands = require('./commands');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    // GUILD_IDがあれば即時反映(開発向け)、なければグローバル登録(反映に最大1時間)
    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);
    await rest.put(route, { body: commands });
    console.log(`スラッシュコマンドを登録しました(${commands.length}件)`);
  } catch (err) {
    console.error(err);
  }
})();
