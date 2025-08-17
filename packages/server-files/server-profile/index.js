const { CommandRegistry } = require('../server-global/improved-commands'); 
const rpc = require("rage-rpc");

global.getExperienceForLevel = function(level) {
	return level * 260;
};

global.percentageExperience = function(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
};

global.getRandomArbitrary = function(min, max) {
    return Math.random() * (max - min) + min;
};

global.destroyTicket = async function(player, element)
{
    try { 
        const raw = JSON.parse(element);
        const index = player.info.tickets.findIndex(object => object.amount === raw.amount && object.sender == raw.sender && object.reason == raw.reason); 
     
        if(index != -1) {
            player.info.tickets.splice(index, 1); 
             
            await Account.update({ tickets: player.info.tickets }, { where: { id: player.info.id } } ); 
        }  
    }
    catch(e) { console.log(e) } 
};

global.playerPayTickets = function(player)
{ 
    try 
    {
        if(!player.info.tickets.length)
            return;
 
        for(let x = 0; x < player.info.tickets.length; x++)
        {   
            if(player.info.money >= player.info.tickets[x].amount || player.info.bank >= player.info.tickets[x].amount) {
     
                let payWith = (player.info.money >= player.info.tickets[x].amount ? 'cash' : player.info.bank >= player.info.tickets[x].amount ? 'bank' : 'not enought');
 
                switch(payWith) {
                    case 'cash': {
                        player.giveMoney(1, player.info.tickets[x].amount);  
                        
                        destroyTicket(player, JSON.stringify(player.info.tickets[x]));
                        break;
                    }
                    
                    case 'bank': {
                        player.giveMoneyBank(1, player.info.tickets[x].amount); 

                        destroyTicket(player, JSON.stringify(player.info.tickets[x]));
                        break;
                    } 
                }     
                break;
            }
        } 
    }
    catch(e) { console.log(e) }  
};

global.playerGiveExperience = async function(player, experience)
{
    try
    {
        player.info.experience += experience;

        const percentaje = percentageExperience(player.info.experience, getExperienceForLevel(player.info.level)).toFixed(2);
    
        sendMessage(player, 'ffb31a', `(Experience):!{$fff} You get ${experience} experience, percentaje for next level is now (${percentaje}%)`);
    
        if(percentaje >= 100.00) {
            player.info.level ++;
            player.info.experience = 0;
    
            sendMessage(player, 'ffb31a', '(Level UP):!{#fff} Congratulations, you have reached level ' + player.info.level);
        }
     
        await Account.update({ level: player.info.level, experience: player.info.experience }, { where: { id: player.info.id } } ); 
    }
    catch(e) {console.log(e)}
};

CommandRegistry.add({
    name: "experience", 
       
    run: function(player) 
    {  
        //player.payday = 5;

        playerPayTickets(player);
    }
});

CommandRegistry.add({
    name: "stats", 
       
    run: function(player) {  
        return mp.events.call("server::profile:open", player); 
    }
});

rpc.register('server::profile:findProperty', (option, user) =>  
{
    try
    {
        const player = user.player;  
        const house = player.info.house - 1;
        const business = player.info.business;

		console.log(server_houses[house])
  
		if(option == 'House') {
			setPlayerCheckpoint(player, parseFloat(server_houses[house].position.x), parseFloat(server_houses[house].position.y), parseFloat(server_houses[house].position.z));  
		}
		else setPlayerCheckpoint(player, serverBusiness[business].position.x, serverBusiness[business].position.y, serverBusiness[business].position.z);  
 
        return sendNotiffication(player, 'info', `${option} localized, follow the blue dot on on your minimap.`);
    }
    catch(error) { console.log(error) }   
}); 
 
mp.events.add(
{
    "server::profile:open" : (player) =>
    {    
        if(!player.loggedInAs)
            return;

        player.factionLogs = [];

        let quest = player.info.quests;
  
        let data = {
            registered: player.info.registered, 
            levelPercent: percentageExperience(player.info.experience, getExperienceForLevel(player.info.level)).toFixed(2), 
            level: player.info.level, 
            hours: player.info.hours + player.getVariable("save_hours"),
            experience: player.info.experience, 
            image: player.info.photo,
            name: player.name,

            clan: player.info.clan,
            clanData: (player.info.clan.id ? serverClans[player.info.clan.id - 1] : []),
            clanVehicles: getClanVehicles(player.info.clan.id),
 
            payday: player.info.payday, 
            money: player.info.money, 
            bank: player.info.bank, 
            house: player.info.house,  
            business: player.info.business, 
            vehicles: player.personalVeh.length, 
            driving: player.info.drivingLicence, 
            motorbike: player.info.motorbike, 
            warns: player.info.warns, 
            mute: player.info.mute,

            faction: (player.info.group ? serverFactions[player.info.group - 1].name : 'none'), 
            factionid: player.info.group,
            joined: player.info.joinedGroup,
            rank: player.info.groupRank,
            arrests: player.info.arrests,
            commands: player.info.commands, 
 
            achievements: { 
                data: achievementsData,
                achievement: player.info.achievements
            },
 
            quests: [{
                    title: dailyQuests[quest[0]].name,
                    progress: player.info.questsProgress[0],
                    totalProgress: dailyQuests[quest[0]].progress
                },

                {
                    title: dailyQuests[quest[1]].name,
                    progress: player.info.questsProgress[1],
                    totalProgress: dailyQuests[quest[1]].progress
                },
            ] 
        }
 
        return player.call('client::profile:open', [JSON.stringify(data), JSON.stringify(player.info.playerSettings), JSON.stringify(player.info.playerBinds), JSON.stringify([])]);
    },
 
    "server::profile:changeSetting" : async (player, index, status) =>
    {    
        switch(index) {
            case 'hotkeys': {   
                player.info.playerSettings = { ...player.info.playerSettings, hotkeys: status }; 
                break;
            } 
            case 'newbie': {  
                player.info.playerSettings = { ...player.info.playerSettings, newbie: status }; 
                break; 
            }
            case 'voice': {
                player.info.playerSettings = { ...player.info.playerSettings, voice: status }; 
                break; 
            }
            case 'radio': {   
                player.info.playerSettings = { ...player.info.playerSettings, radio: status };
 
                if(player.vehicle) {
                    if(player.vehicle.getVariable('radioStation') && player.info.playerSettings.radio) {
                        player.call('client::radio:enterVehicle', [player.vehicle.getVariable('radioStation'), player.info.playerSettings.radioVolume]);
                    } 
                } 

                if(!player.info.playerSettings.radio) {
                    player.call('client::radio:exitVehicle', []);
                }
                break; 
            }
        };
 
        await updatePlayerSettings(player);
 
        player.setVariable('hotkeys', player.info.playerSettings.hotkeys), 
        player.setVariable('newbie', player.info.playerSettings.newbie), 
        player.setVariable('voice', player.info.playerSettings.voice), 
        player.setVariable('radio', player.info.playerSettings.radio);  
 
        return sendNotiffication(player, 'success', `Your ${index} is now <b>${status ? 'enabled' : 'disabled'}</b>.`);
    },
   
    "server::profile:changeVolume" : async (player, index, value) =>
    {
        player.setVariable((index == 4 ? 'radioVolume' : 'voiceVolume'), value);
   
        if(index == 4) { 
            player.info.playerSettings = { ...player.info.playerSettings, radioVolume: parseInt(value) } 
        }
        else { 
            player.info.playerSettings = { ...player.info.playerSettings, voiceVolume: parseInt(value) } 
        }
 
        if(player.vehicle && player.vehicle.getVariable('radioStation')) { 
           player.call('client:radio::radioChangeVolume', [player.info.playerSettings.radioVolume]);
        } 

        await updatePlayerSettings(player);
 
        return sendNotiffication(player, 'info', 'volume has been changed');  
    }
});  

global.updatePlayerSettings = async function(player) {
    await Account.findOne({ where: { id: player.info.id } }).then((found) => {
        if(found) { 
            return found.update({ playerSettings: player.info.playerSettings });
        } 
        else console.log("Coloana nu a fost gasita");

    }).then(() => { console.log("Actualizare setari player reusita.") }).catch((e) => console.log(e)); 
};
 
rpc.register('server::profile:changeKey', async (data, user) =>  
{
    try
    {
        const player = user.player;   
        const raw = JSON.parse(data);  
        const last = player.info.playerBinds[raw.forBind].id;
  
        player.info.playerBinds[raw.forBind].id = raw.id;
        player.info.playerBinds[raw.forBind].has = raw.hash;
        player.info.playerBinds[raw.forBind].key = raw.key;
    
        await Account.update({ playerBinds: player.info.playerBinds }, { where: { id: player.info.id }}); 
 
        player.call('client::profile:updateKeys', [raw.forBind, last, raw.id, JSON.stringify(player.info.playerBinds)]);
         
        return sendNotiffication(player, 'info', `You set key <b style="color: #FF3A19;">${raw.key}</b> for bind <b>${raw.forBind}</b>`, 'Profile Settings:'); 
    }
    catch(error) { console.log(error) }   
});   