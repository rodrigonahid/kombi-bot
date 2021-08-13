require('dotenv').config();

// require the needed discord.js classes
const { Client, Intents } = require('discord.js');

// create a new Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// login to Discord with your app's token
client.login(process.env.DISCORDJS_BOT_TOKEN);

// when the client is ready, run this code
// this event will only trigger one time after logging in

client.once('ready', () => {
    console.log(`${client.user.tag} ta na área`)
})



// Inicio do bot

const fs = require("fs");

const PREFIX = "$"

let currentTime = new Date();

let inicio = 0;
let fim = 0;
let tempoSessao = 0;
let tempoRegistrado = 0;
let isRunning = false;
let interval;
client.data = require("./db.json");

client.on('messageCreate', message => {
    if (!message.content.startsWith(PREFIX)) return;
    const commandName = message.content.substring(PREFIX.length);

    if (commandName.toLowerCase() === "tempo"){
        currentTime = new Date();
        message.reply(`São ${String(currentTime.getHours())} horas e ${String(currentTime.getMinutes())} minutos!`);
    }else if (commandName.toLowerCase() === "start"){
        if(!isRunning){
            isRunning = true;
            inicio = Date.now();
            let timer = 1;
            message.reply(`A viagem começou às ${String(currentTime.getHours())} horas e ${String(currentTime.getMinutes())} minutos!`);
            interval = setInterval( () => {
                tempoRegistrado += timer;
                client.data['total'] += timer;
                fs.writeFile("./db.json", JSON.stringify(client.data), err => {
                    if (err) throw err;
                })
                if (tempoRegistrado % 5 == 0){
                    message.reply(`Estamos à ${(tempoRegistrado / 60).toFixed(0)} horas e ${tempoRegistrado % 60} minutos na estrada. Total: ${(client.data['total'] / 60).toFixed(0)} horas e ${client.data['total'] % 60} minutos`);
                    if (tempoRegistrado > client.data['recorde']){
                        message.reply(`Novo recorde: ${ (tempoRegistrado / 60).toFixed(0) } horas e ${ tempoRegistrado % 60} minutos.`)
                        client.data['recorde'] = tempoRegistrado;
                        fs.writeFile("./db.json", JSON.stringify(client.data), err => {
                            if (err) throw err;
                        })
                    }
                }
            }, (timer * 60000));
           
        }else{
            message.reply("A Kombi já está na estrada!");
        }
    }else if(commandName.toLowerCase() === "finish"){
        if(isRunning){
            clearInterval(interval);
            fim = Date.now();
            tempoSessao = fim - inicio;
            tempoSessao = Math.floor(tempoSessao / 60000);
            inicio = 0;
            message.reply(`A viagem durou ${(tempoSessao / 60).toFixed(0)} horas e ${tempoSessao % 60} minutos!
A kombi ta rodando à ${(client.data['total'] / 60).toFixed()} horas e ${client.data['total']%60} minutos.`);
        }else{
            message.reply("Não da pra terminar o que nunca começou!");
        }
    }
})
