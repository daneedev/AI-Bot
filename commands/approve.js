const { Command, CommandType, Argument, ArgumentType } = require('gcommands');
const Discord = require("discord.js")
const fs = require("fs")


new Command({
	name: 'approve',
	description: 'Approve a prompt',
	type: [CommandType.SLASH, CommandType.MESSAGE],
    arguments: [
        new Argument({
            name: 'requestid',
            type: ArgumentType.STRING,
            description: 'Request ID to approve',
            required: true
        }),
        new Argument({
            name: "image",
            type: ArgumentType.ATTACHMENT,
            description: "Image to send",
            required: true
        }),
        new Argument({
            name: "image2",
            type: ArgumentType.ATTACHMENT,
            description: "Second image to send",
            required: false
        }),
    ],
	run: (ctx) => {
        if (!ctx.member.roles.cache.find(r => r.id === process.env.APPROVE_ROLE_ID)) {
            const errorembed = new Discord.EmbedBuilder()
            .setColor("Red")
            .setDescription(`You need to have the <@&${process.env.APPROVE_ROLE_ID}> role to use this command!`)
            ctx.reply({embeds: [errorembed], ephemeral: true})
        } else {
            const requestid = ctx.arguments.getString('requestid')
            const image = ctx.arguments.getAttachment('image')
            const image2 = ctx.arguments.getAttachment('image2')
            const requests = require("../data/requests.json")
            const request = requests[requestid]
            if (request === undefined) {
                const errorembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle(`Invalid request ID!`)
                ctx.reply({embeds: [errorembed], ephemeral: true})
            } else if (request.status !== "pending") {
                const errorembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle(`This request is not pending!`)
                ctx.reply({embeds: [errorembed], ephemeral: true})
            } else {
                // DM USER
                const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle(`Your prompt was approved!`)
                .setDescription(`Your prompt was approved! Here is your image!\n${image.url}\n${image2.url || ""}`)
                .setFooter({text: `Request ID: ${requestid}`})
                const user = ctx.client.users.cache.find(u => u.id === request.user)
                user.send({embeds: [embed]})
                // EDIT DATA
                request.status = "approved"
                requests[requestid] = request
                fs.writeFileSync(__dirname + "/../data/requests.json", JSON.stringify(requests, null, 2))
                // EDIT MESSAGE
                const embed2 = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle("Prompt approved!")
                .addFields(
                    {name: "Prompt", value: `${request.prompt}`, inline: true},
                    {name: "User", value: `<@${request.user}> (${request.user})`, inline: true},
                    {name: "Request ID", value: requestid, inline: true},
                    {name: "Status", value: "Approved", inline: true},
                    {name: "Approved at", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true}
                )
                const channel = ctx.guild.channels.cache.find(c => c.id === process.env.REQUESTS_CHANNEL_ID)
                channel.messages.fetch(request.messageid).then((msg) => {
                const actionrow = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("approve")
                        .setLabel("Run /approve to approve this prompt")
                        .setDisabled(true)
                        .setStyle(Discord.ButtonStyle.Success),
                        new Discord.ButtonBuilder()
                        .setCustomId(requests.length.toString())
                        .setLabel("Decline")
                        .setDisabled(true)
                        .setStyle(Discord.ButtonStyle.Danger)
                    )
                    msg.edit({embeds: [embed2], components: [actionrow]})
                })
                // SEND MESSAGE
                const infoembed = new Discord.EmbedBuilder()
                .setColor("Random")
                .setTitle("Message was sent to user!")
                ctx.reply({embeds: [infoembed], ephemeral: true})
            }
        }
	}
});