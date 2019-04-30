var Discord = require("discord.js");
var bot = new Discord.Client();
var TOKEN = "NTcyNjY4MTI1NjU3Njk0MjIw.XMgKmQ.F8adNi9CDcNgnR2Kp_PRHrON2Kg";
var PREFIX = "!서벌";
var getYouTubeID = require('get-youtube-id');
var getYoutubeTitle = require('get-youtube-title');
var YTDL = require("ytdl-core");
var moment = require('moment');
var express = require("express");
var app = express();
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var servers = {};
var log_count = 0;
var res;
var logs = new Array();
function play(connection, msg) {
    var server = servers[msg.guild.id];
    var streamOptions = { seek: 0, volume: 1 };
    var stream = YTDL(server.queue[0], { filter: 'audioonly' });
    server.dispatcher = connection.playStream(stream, streamOptions);
    server.queue.shift();
    server.dispatcher.on("end", function () {
        if (server.queue[0])
            play(connection, msg);
        else
            connection.disconnect();
    });
}
bot.on("ready", function () {
    console.log("I'm ready!");
});
bot.on("message", function (msg) {
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    //console.log(msg.author.username + " 이 " + msg.channel.guild.name + " 서버에서 " + date + " 에 " + msg.content + "라고 보냄");
    logs[log_count] = msg.author.username + " 이 " + msg.channel.guild.name + " 서버에서 " + date + " 에 " + msg.content + "라고 보냄";
    log_count++;
    if (msg.author.equals(bot.user))
        return;
    if (!msg.content.startsWith(PREFIX))
        return;
    var args = msg.content.substring(PREFIX.length).split(" ");
    switch (args[1]) {
        case "재생":
            if (!args[2]) {
                msg.channel.send("재생할껄 입력 안한거 같은데");
                return;
            }
            if (!msg.member.voiceChannel) {
                msg.channel.send("음성채널에 안들어가 있는거 같은데");
                return;
            }
            if (!YTDL.validateURL(args[2])) {
                msg.channel.send("올바른 유튜브 영상 주소가 아닌거같은데");
            }
            if (!servers[msg.guild.id])
                servers[msg.guild.id] = {
                    queue: []
                };
            var server = servers[msg.guild.id];
            server.queue.push(args[2]);
            if (!msg.guild.voiceConnection)
                msg.member.voiceChannel.join().then(function (connection) {
                    play(connection, msg);
                });
            if (args[2]) {
                var id = getYouTubeID(args[2]);
                getYoutubeTitle(id, function (err, title) {
                    msg.channel.send(title + ' 이 큐에 추가되었어!'); // 'SLCHLD - EMOTIONS (feat. RIPELY) (prod. by GILLA)'
                });
            }
            break;
        case "나가":
            if (msg.guild.voiceConnection)
                msg.guild.voiceConnection.disconnect();
            break;
        case "스킵":
            var server = servers[msg.guild.id];
            if (server.dispatcher)
                server.dispatcher.end();
            break;
        case "say":
            if (args[2]) {
                msg.channel.bulkDelete(1);
                msg.channel.send(msg.content.substring(msg.content.indexOf('say') + 3, msg.content.length));
            }
            break;
        case "청소":
            if (!args[2])
                return msg.channel.send("몇게 지울건지 않썼잖아");
            //if (msg.author.id != 386156022642769922) return msg.channel.send("방장이 아니란 마뤼야!");
            msg.channel.bulkDelete(args[2]);
            msg.channel.send('메세지' + args[2] + '개 만큼 지웠어');
            break;
        default:
            msg.channel.send("[없는 명령어]");
    }
});
app.get("/", function (req, res) {
    var log = logs.toString();
    res.send(log.replace(/,/gi, '<br />'));
});
app.listen(3000);
bot.login(TOKEN);
//삭제된 명령어들
/*
case "큐":
            var server = servers[msg.guild.id];
            var result = new Array();

            for (var i = 0; i < server.queue.length; i++) {
                var id = getYouTubeID(server.queue[i]);
                getYoutubeTitle(id, function (err, title) {
                    console.log(title) // 'SLCHLD - EMOTIONS (feat. RIPELY) (prod. by GILLA)'
                    result[i] = server.queue[i] + ' (' + title + ')';
                    console.log(server.queue[i] + ' (' + title + ')');
                })
            }
            console.log(result);
            let queue = new Discord.RichEmbed()
                .setColor(3447003)
                .setTitle(result.toString().replace(/,/gi, '\n'));

            msg.channel.send({ embed: queue });
            break;
 */ 
//# sourceMappingURL=app.js.map
