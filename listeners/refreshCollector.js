const { Listener } = require('gcommands');
const requests = require("../data/requests.json")
const Discord = require("discord.js")

// Create a new listener listening to the "ready" event
new Listener({
	// Set the name for the listener
	name: 'ready',
	// Set the event to listen to
	event: 'ready',
	// The function thats called when the event occurs
	run: (client) => {
        requests.filter(r => r.status === "pending").forEach( async (r) => {
            const guild = await client.guilds.cache.find(g => g.id === process.env.DEV_SERVER_ID)
            const channel = await guild.channels.cache.find(c => c.id === process.env.REQUESTS_CHANNEL_ID)
            const msg = await channel.messages.fetch(r.messageid)
            const buttons = msg.createMessageComponentCollector()
            buttons.on("collect", (i) => {
                if (!i.member.roles.cache.find(r => r.id === process.env.APPROVE_ROLE_ID)) {
                    i.reply({ content: `You need to have the <@&${process.env.APPROVE_ROLE_ID}> role to use this command!`, ephemeral: true})
                } else {
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
});