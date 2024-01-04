const { Command, CommandType, Argument, ArgumentType } = require('gcommands');
const Discord = require("discord.js")
const fs = require("fs")

new Command({
	name: 'request',
	description: 'Request prompt to generate a image',
	type: [CommandType.SLASH, CommandType.MESSAGE],
    arguments: [
        new Argument({
            name: 'prompt',
            type: ArgumentType.STRING,
            description: 'Prompt to generate a image',
            required: true
        })
    ],
	run: async (ctx) => {
        if (!ctx.member.roles.cache.find(r => r.id === process.env.REQUEST_ROLE_ID)) {
            const errorembed = new Discord.EmbedBuilder()
            .setColor("Red")
            .setTitle(`You need to have the <@${process.env.REQUEST_ROLE_ID}> role to use this command!`)
            ctx.reply({embeds: [errorembed], ephemeral: true})
        } else {
            const requests = require("../data/requests.json")
            const prompt = ctx.arguments.getString('prompt')
            const embed = new Discord.EmbedBuilder()
            .setColor("Random")
            .setTitle(`Your prompt was requested!`)
            .setDescription(`Your prompt was requested! Please wait for a staff member to approve it!\nAny actions about your prompt will be sent to your DMs!`)
            .setFooter({text: `Request ID: ${requests.length}`})
            ctx.reply({embeds: [embed], ephemeral: true})

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
                .setStyle(Discord.ButtonStyle.Danger)
            )

            const embed2 = new Discord.EmbedBuilder()
            .setColor("Yellow")
            .setTitle("New prompt requested!")
            .addFields(
                {name: "Prompt", value: `${prompt}`, inline: true},
                {name: "User", value: `<@${ctx.user.id}> (${ctx.user.id})`, inline: true},
                {name: "Request ID", value: requests.length.toString(), inline: true},
                {name: "Status", value: "Pending", inline: true},
                {name: "Requested at", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true}
            )
            const channel = await ctx.guild.channels.cache.find(c => c.id === process.env.REQUESTS_CHANNEL_ID)
            const requestid = requests.length.toString()
            channel.send({embeds: [embed2], components: [actionrow]}).then((msg) => {
            const request = {
                prompt: prompt,
                user: ctx.user.id,
                requestid: requests.length,
                status: "pending",
                messageid: msg.id,
            }
            requests.push(request)
            fs.writeFileSync(__dirname + "/../data/requests.json", JSON.stringify(requests, null, 2))
            const filter = (i) => i.member.roles.cache.find(r => r.id === process.env.APPROVE_ROLE_ID)
            //const filter = async (i) => await i.user.id === "525704336869687316"
            const buttons = msg.createMessageComponentCollector()
            buttons.on("collect", (i) => {
                if (!i.member.roles.cache.find(r => r.id === process.env.APPROVE_ROLE_ID)) {
                    i.reply(`You need to have the <@${process.env.APPROVE_ROLE_ID}> role to use this command!`, {ephemeral: true})
                } else {
                // MESSAGE USER
                const declineembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle(`Your prompt was declined!`)
                .setDescription(`Your request was declined! Request ID: ${requestid}`)
                ctx.user.send({embeds: [declineembed]})
                // REPLY
                const infoembed = new Discord.EmbedBuilder()
                .setColor("Random")
                .setTitle("Message was sent to user!")
                i.reply({embeds: [infoembed], ephemeral: true})
                // EDIT DATA
                request.status = "declined"
                requests[requestid] = request
                fs.writeFileSync(__dirname + "/../data/requests.json", JSON.stringify(requests, null, 2))
                // EDIT MESSAGE
                const editembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("Prompt was declined!")
                .addFields(
                    {name: "Prompt", value: `${prompt}`, inline: true},
                    {name: "User", value: `<@${ctx.user.id}> (${ctx.user.id})`, inline: true},
                    {name: "Request ID", value: requestid, inline: true},
                    {name: "Status", value: "Declined", inline: true},
                    {name: "Requested at", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true}
                )
                actionrow.components[1].setDisabled(true)
                msg.edit({embeds: [editembed], components: [actionrow]})
                }
            })
            })
        }
	}
});