const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('メンバーをキックします')
    .addUserOption(o => o.setName('user').setDescription('対象ユーザー').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('理由'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('メンバーをBANします')
    .addUserOption(o => o.setName('user').setDescription('対象ユーザー').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('理由'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('メンバーをタイムアウト(一時的に発言禁止)します')
    .addUserOption(o => o.setName('user').setDescription('対象ユーザー').setRequired(true))
    .addIntegerOption(o =>
      o.setName('minutes').setDescription('分数(1〜40320)').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(o => o.setName('reason').setDescription('理由'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName('purge')
    .setDescription('直近のメッセージをまとめて削除します')
    .addIntegerOption(o =>
      o.setName('count').setDescription('削除件数(1〜100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName('rolepanel')
    .setDescription('ロール付与ボタンのパネルをこのチャンネルに設置します')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
].map(c => c.toJSON());
