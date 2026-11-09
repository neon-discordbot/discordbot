require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');

const { DISCORD_TOKEN, WELCOME_CHANNEL_ID, LOG_CHANNEL_ID } = process.env;

// ボタンで付与できるロール(表示名: ロール名)。サーバー側に同名のロールを作っておいてください
const SELF_ASSIGN_ROLES = [
  { label: 'ゲーム', roleName: 'ゲーム' },
  { label: 'イラスト', roleName: 'イラスト' },
  { label: 'お知らせ', roleName: 'お知らせ' },
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // メンバー参加イベントに必要(Developer Portalで有効化)
  ],
});

async function sendLog(guild, text) {
  if (!LOG_CHANNEL_ID) return;
  const ch = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch?.isTextBased()) await ch.send(text).catch(() => {});
}

client.once(Events.ClientReady, c => {
  console.log(`${c.user.tag} としてログインしました`);
});

// ---- 挨拶 ----
client.on(Events.GuildMemberAdd, async member => {
  const channel =
    (WELCOME_CHANNEL_ID && member.guild.channels.cache.get(WELCOME_CHANNEL_ID)) ||
    member.guild.systemChannel;
  if (!channel) return;
  await channel
    .send(`${member} さん、**${member.guild.name}** へようこそ!🎉`)
    .catch(console.error);
});

// ---- コマンド / ボタン ----
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) return await handleCommand(interaction);
    if (interaction.isButton() && interaction.customId.startsWith('role:'))
      return await handleRoleButton(interaction);
  } catch (err) {
    console.error(err);
    const msg = { content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {});
    else await interaction.reply(msg).catch(() => {});
  }
});

async function handleRoleButton(interaction) {
  const roleName = interaction.customId.slice('role:'.length);
  const role = interaction.guild.roles.cache.find(r => r.name === roleName);
  if (!role) {
    return interaction.reply({ content: `ロール「${roleName}」が見つかりません。`, flags: MessageFlags.Ephemeral });
  }
  const member = interaction.member;
  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    return interaction.reply({ content: `ロール「${roleName}」を外しました。`, flags: MessageFlags.Ephemeral });
  }
  await member.roles.add(role);
  return interaction.reply({ content: `ロール「${roleName}」を付与しました。`, flags: MessageFlags.Ephemeral });
}

async function handleCommand(interaction) {
  const { commandName, guild, member } = interaction;
  const reply = (content) => interaction.reply({ content, flags: MessageFlags.Ephemeral });

  if (commandName === 'rolepanel') {
    const row = new ActionRowBuilder().addComponents(
      SELF_ASSIGN_ROLES.map(r =>
        new ButtonBuilder()
          .setCustomId(`role:${r.roleName}`)
          .setLabel(r.label)
          .setStyle(ButtonStyle.Primary),
      ),
    );
    const embed = new EmbedBuilder()
      .setTitle('ロール選択')
      .setDescription('ボタンを押すとロールの付与/解除ができます。');
    await interaction.channel.send({ embeds: [embed], components: [row] });
    return reply('パネルを設置しました。');
  }

  if (commandName === 'purge') {
    const count = interaction.options.getInteger('count', true);
    const deleted = await interaction.channel.bulkDelete(count, true); // 14日以内のみ削除可
    await sendLog(guild, `🧹 ${interaction.user.tag} が <#${interaction.channelId}> で ${deleted.size} 件削除`);
    return reply(`${deleted.size} 件削除しました。`);
  }

  // --- 以下は対象ユーザーを取る系 ---
  const user = interaction.options.getUser('user', true);
  const reason = interaction.options.getString('reason') ?? '理由なし';
  const target = await guild.members.fetch(user.id).catch(() => null);

  if (!target) return reply('そのユーザーはこのサーバーにいません。');
  if (target.id === interaction.user.id) return reply('自分自身は対象にできません。');
  if (target.id === guild.ownerId) return reply('サーバーオーナーは対象にできません。');
  if (target.roles.highest.position >= member.roles.highest.position && member.id !== guild.ownerId)
    return reply('あなたより上位(または同位)のロールを持つ相手は対象にできません。');

  if (commandName === 'kick') {
    if (!target.kickable) return reply('botの権限(ロール順位)ではキックできません。');
    await target.kick(reason);
    await sendLog(guild, `👢 ${user.tag} を ${interaction.user.tag} がキック — ${reason}`);
    return reply(`${user.tag} をキックしました。`);
  }

  if (commandName === 'ban') {
    if (!target.bannable) return reply('botの権限(ロール順位)ではBANできません。');
    await target.ban({ reason });
    await sendLog(guild, `🔨 ${user.tag} を ${interaction.user.tag} がBAN — ${reason}`);
    return reply(`${user.tag} をBANしました。`);
  }

  if (commandName === 'timeout') {
    const minutes = interaction.options.getInteger('minutes', true);
    if (!target.moderatable) return reply('botの権限(ロール順位)ではタイムアウトできません。');
    await target.timeout(minutes * 60 * 1000, reason);
    await sendLog(guild, `⏳ ${user.tag} を ${interaction.user.tag} が ${minutes} 分タイムアウト — ${reason}`);
    return reply(`${user.tag} を ${minutes} 分タイムアウトしました。`);
  }
}

client.login(DISCORD_TOKEN);
