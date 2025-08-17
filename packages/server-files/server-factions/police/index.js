const rpc = require("rage-rpc");
const { CommandRegistry } = require('../../server-global/improved-commands'); 
const { format } = require("mysql");
 
global.arrestPoint = mp.colshapes.newSphere(468.417, -1023.698, 28.222, 3);
global.arrestPointMarker = mp.markers.new(1, new mp.Vector3(468.417, -1023.698, 28.222 - 1.4), 1, { color: [255, 255, 255, 255], dimension: 0 });

//jail marker
mp.markers.new(1, new mp.Vector3(464.994, -990.031, 24.914 - 1.4), 1, { color: [255, 255, 255, 255], dimension: 1 });
global.jailPoint = mp.colshapes.newSphere(464.994, -990.031, 24.914, 3, 1);

mp.markers.new(1, new mp.Vector3(1748.955, 2468.140, 45.853 - 1.4), 1, { color: [255, 255, 255, 255], dimension: 999 });
global.jailPointExit = mp.colshapes.newSphere(1748.955, 2468.140, 45.853, 3, 999);
 
global.arrestPointBlip = mp.blips.new(188, new mp.Vector3(468.417, -1023.698, 28.222), { dimension: 0, color: 4, name: 'Arrest Point LS'});
global.factionSkins = 
[ 
    ['s_f_y_cop_01', 's_m_y_cop_01'], 
    ['u_f_y_princess', 'a_m_m_prolhost_01'],
    ['', ''], //hitman
    ['g_f_y_lost_01', 'g_m_y_azteca_01'], //aztecaz
    ['g_f_y_families_01', 'csb_grove_str_dlr'], //grove
    ['g_f_y_ballas_01', 'g_m_y_ballaorig_01'], //ballas
    ['g_f_y_vagos_01', 'mp_m_g_vagfun_01'] //vagos
]

global.openFactionDashboard = function(player)
{
    player.jaileds = [];
    player.wanteds = [];
    player.datas = {
        name: player.name, 
        group: player.info.group, 
        faction: 'Los Santos Police', 
        rank: player.info.groupRank, 
        warns: player.info.groupWarns, 
        joined: player.info.joinedGroup,
        photo: player.info.photo,
        position: player.position
    }

    mp.players.forEach((players) => {
        if(players.loggedInAs) { 
            if(players.info.jail) {
                player.jaileds.push({ name: players.name, time: players.info.jail });  
            }

            if(players.info.wanted.level) {
                player.wanteds.push({ 
                    id: players.id, 
                    time: players.info.wanted.level * 60,
                    name: players.name, 
                    position: players.position,
                    wanted: players.info.wanted 
                });
            } 
        }  
    });
   
    return player.call('client::faction:openDashboard', [JSON.stringify(player.wanteds), JSON.stringify(player.jaileds), JSON.stringify(player.datas)]);
}

global.createCrime = function(player, killer, reason)
{    
    const date = new Date();
    const minutes = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    const hours = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());

    rpc.callClient(player, 'GET_PLAYER_STREET').then((location2) => { player.crime = { killer: killer, reason: reason, date: (hours + ':' + minutes), location: location2 }});
 
    return sendNotiffication(player, 'info', 'You witnessed a crime. Use your phone to report it.', 'Crime Witnessed:');
}
  
rpc.register('server::faction:searchPlayer', (username, user) => 
{ 
    const player = user.player; 

    return searchPlayersLSPD(player, username, false);
});
 
global.searchPlayersLSPD = function(player, username, status)
{
    player.results = [];
 
    mp.players.forEach((players) => {
        if(players.name.toLowerCase().startsWith(username.toLowerCase())) 
        { 
            player.results.push({name: players.name, level: players.info.level, wanted: players.info.wanted, gender: (players.info.characterData['general']['gender'] ? 'Male' : 'Female'), faction: (!players.info.group ? 'No' : serverFactions[players.info.group - 1].name), arrested: (players.info.jail ? 'Yes' : 'No'), licences: [players.info.drivingLicence, players.info.motorbike]});  
        } 
    }); 

    return rpc.callBrowsers(mp.players.at(player.id), 'client::faction:showPlayers', [JSON.stringify({resPlayers: player.results, option: status})]); 
};
  
rpc.register('server::faction:sendWanted', async (data, user) => 
{ 
    const player = user.player; 
    const raw = JSON.parse(data);
    const receiver = mp.players.toArray().find((user) => user.name === raw.username); 

    if(receiver == undefined || !mp.players.exists(receiver) || !receiver.loggedInAs)
        return sendNotiffication(player, 'error', 'This player is not connected.');
    
    receiver.info.wanted.level += raw.level; 
    receiver.info.wanted.time = receiver.info.wanted.level * 60; 
    receiver.info.wanted.reporters.push(player.name);
    receiver.info.wanted.reasons.push(raw.reason);

    sendNotiffication(player, 'success', 'The player received the sanction successfully.');  
     
    await Account.update({ wanted: receiver.info.wanted }, { where: { id: receiver.info.id } } );
    
    receiver.call("client::hud:open", [true, receiver.info.money, receiver.info.bank, receiver.info.admin, receiver.info.group, receiver.info.hungry, receiver.info.thirst, JSON.stringify(receiver.info.wanted), receiver.info.jail, JSON.stringify(receiver.info.playerBinds), receiver.info.playerSettings.hotkeys, receiver.info.payday]);
 
    return openFactionDashboard(player);
});

rpc.register('server::faction:sendTicket', async (data, user) => 
{ 
    const player = user.player; 
    const raw = JSON.parse(data);
    const receiver = mp.players.toArray().find((user) => user.name === raw.username); 

    if(receiver == undefined || !mp.players.exists(receiver) || !receiver.loggedInAs)
        return sendNotiffication(player, 'error', 'This player is not connected.');
 
    receiver.info.tickets.push({ amount: raw.amount, reason: raw.reason, sender: player.name });
   
    await Account.update({ tickets: JSON.stringify(receiver.info.tickets) }, { where: { id: receiver.info.id } }); 
 
    sendNotiffication(player, 'info', `The fine was sent to ${receiver.name}.`);  
    sendNotiffication(receiver, 'info', `${player.name} fined you with $${formatMoney(raw.amount)} reason: ${raw.reason}.`);  
     
    return openFactionDashboard(player);
});

rpc.register('server::faction:suspendLicence', async (data, user) => 
{ 
    const player = user.player; 
    const raw = JSON.parse(data);
    const receiver = mp.players.toArray().find((user) => user.name === raw.username); 

    if(receiver == undefined || !mp.players.exists(receiver) || !receiver.loggedInAs)
        return sendNotiffication(player, 'error', 'This player is not connected.');
      
    switch(raw.licence)
    {
        case 'car':
        {
            if(!receiver.info.drivingLicence)
                return sendNotiffication(player, 'info', 'This player dont have driving licence.'); 

            receiver.info.drivingLicence = 0;   
            break;
        }

        case 'motorycle':
        {
            if(!receiver.info.motorbike)
                return sendNotiffication(player, 'info', 'This player dont have driving licence.'); 

            receiver.info.motorbike = 0;    
            break;
        }
    }

    await Account.update({ drivingLicence: receiver.info.drivingLicence, motorbike: receiver.info.motorbike }, { where: { id: receiver.info.id } } );
 
    sendNotiffication(receiver, 'info', `Officer ${player.name} suspend your ${raw.licence} licence.`, 'Police:');
    sendNotiffication(player, 'info', `${receiver.name} ${raw.licence} licence has been suspended.`, 'Police:');
 
    return searchPlayersLSPD(player, raw.username, true);
});
 
global.createWanted = async function(player, receiver, level, reason) 
{ 
    receiver.info.wanted.level += level; 
    receiver.info.wanted.time = receiver.info.wanted.level * 60;
    receiver.info.wanted.reporters.push((player == null ? 'Server' : player.name));
    receiver.info.wanted.reasons.push(reason);
 
    await Account.update({ wanted: JSON.stringify(receiver.info.wanted) }, { where: { id: receiver.info.id } }); 

    return receiver.call("client::hud:open", [true, receiver.info.money, receiver.info.bank, receiver.info.admin, receiver.info.group, receiver.info.hungry, receiver.info.thirst, JSON.stringify(receiver.info.wanted), receiver.info.jail, JSON.stringify(receiver.info.playerBinds), receiver.info.playerSettings.hotkeys, receiver.info.payday]); 
}

rpc.register('server::faction:wantedTracking', (username, user) =>
{
    const player = user.player; 
    const receiver = mp.players.toArray().find((user) => user.name === username); 

    if(receiver == undefined || !mp.players.exists(receiver) || !receiver.loggedInAs)
        return sendNotiffication(player, 'error', 'This player is not connected.');

    player.call('client::faction:closeMenu', []);
        
    sendNotiffication(player, 'success', 'Follow blue red dot', 'Checkpoint:');

    return setFinding(player, receiver); 
});

rpc.register('server::faction:clearWanted', (username, user) =>
{
    const player = user.player; 
    const receiver = mp.players.toArray().find((user) => user.name === username); 

    if(receiver == undefined || !mp.players.exists(receiver) || !receiver.loggedInAs)
        return sendNotiffication(player, 'error', 'This player is not connected.');
 
    sendNotiffication(receiver, 'success', `${player.name} cleared your wanted.`, 'Wanted:');
    sendNotiffication(player, 'success', 'This player is no longer followed', 'Wanted:');

    serverRemoveWanted(receiver);

    return openFactionDashboard(player);
});
 
mp.events.add({
    /*-----------------------------------------------------------[FACTION DASHBOARD]------------------------------------------------------*/
    "server::faction:openDashboard": (player) => {  

		if(player.info.group != 1)
			return sendNotiffication(player, 'error', 'Nu esti politist.');
 
        return openFactionDashboard(player);
    },
   
    /*--------------------------------------------------------------[FACTION OTHERS]------------------------------------------------------*/
    "server::faction:changeClothes" : (player) => {
        let x = player.info.group;
 
        if(player.info.group && player.IsInRange(serverFactions[x - 1].dutyPosition.x, serverFactions[x - 1].dutyPosition.y, serverFactions[x - 1].dutyPosition.z, 2)) {
            return serverDutyPlayer(player);
        } 

        if(player.info.group == 1 && player.IsInRange(468.417, -1023.698, 28.222, 2)) {
            return serverArrestPlayer(player, player.suspectPlayer);
        } 
         
        if(player.info.group == 1 && player.dimension == serverFactions[player.info.group - 1].id && player.IsInRange(464.994, -990.031, 24.914, 2)) {
            return enterExitJail(player, 0);
        } 
        
        if(player.info.group == 1 && player.dimension == 999 && player.IsInRange(1748.955, 2468.140, 45.853, 2)) {
            return enterExitJail(player, 1);
        } 
 
        if(player.inFactionRange != null && player.IsInRange(serverFactions[player.inFactionRange].position.x, serverFactions[player.inFactionRange].position.y, serverFactions[player.inFactionRange].position.z, 2) && !player.dimension) {
            if(player.working || player.createdObject)
                return;

            return enterFactionHQ(player, player.inFactionRange);
        }

        if(player.inFactionRange != null && player.IsInRange(serverFactions[player.inFactionRange].interior.x, serverFactions[player.inFactionRange].interior.y, serverFactions[player.inFactionRange].interior.z, 2) && player.dimension == serverFactions[player.inFactionRange].id) {
            return exitFactionHQ(player, player.inFactionRange);
        } 
    },
 
    "playerEnterVehicle" : (player, vehicle, seat) => {  
        if(player.info.group == 1 && seat == 0 && player.suspectPlayer != null) { 
            const user = player.suspectPlayer;
 
            user.stopAnimation(); 
            user.call('client::faction:setFollow', [false, player]);
 
            return user.putIntoVehicle(vehicle, 1); 
        } 
    },

    "playerExitVehicle" : (player, vehicle) => {  
        if(player.info.group == 1 && player.suspectPlayer != null) { 
            const user = player.suspectPlayer;  

            user.playAnimation('mp_arresting', 'idle', 1, 49);

            return user.call('client::faction:setFollow', [false, player]);
        }
    },

    'server::faction:surrender' : async (player) =>
    {
        if(!player.info.wanted.level && player.info.group == 1)
            return true;

        if(player.inFactionRange != null && player.IsInRange(serverFactions[player.inFactionRange].position.x, serverFactions[player.inFactionRange].position.y, serverFactions[player.inFactionRange].position.z, 2)) 
        { 
            player.jail = 1800; 
            player.setVariable('playerCuff', false);
         
            serverPlayerJail(player);
            serverRemoveWanted(player);
         
            player.call('client::hud:edit', ['wanted', JSON.stringify(player.info.wanted)]);
            player.call('client::hud:updateJail', [player.info.jail]);
 
            await Account.update({ jail: player.info.jail }, { where: { id: player.info.id } } );
      
            return sendNotiffication(player, 'info', `You were arrested (surrender).`, 'Jail:'); 
        }
    }
    /*------------------------------------------------------------------------------------------------------------------------------------*/
});
 
global.serverReloadCharacter = function(player)
{
    player.removeAllWeapons();     
    player.model =  mp.joaat(player.info.characterData['general']['gender'] ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
  
    player.call('client::character:applyData', [JSON.stringify(player.info.characterData['general']), JSON.stringify(player.info.characterData['appearance']), JSON.stringify(player.info.characterData['features'])]); 

    return reloadPlayerClothes(player);
}
 
global.serverDutyPlayer = function(player)
{ 
    if(player.info.group == 3) {
        return hitmanGetContract(player);
    }

    player.factionDuty = !player.factionDuty; 
    player.model = mp.joaat(factionSkins[player.info.group - 1][player.info.characterData['general']['gender'] ? 1 : 0]);
  
    sendNotiffication(player, 'info', `You are now ${player.factionDuty ? 'on duty' : 'off duty'}.`);
 
    if(player.info.group == 1) {
        player.call('client::radar:open', []); 
    }

    if(!player.factionDuty) {
        player.removeAllWeapons();
    }

    if(player.factionDuty) {  
        if(player.info.group == 1) {

            player.giveWeapon(mp.joaat('weapon_nightstick'), 1);
            player.giveWeapon(mp.joaat('weapon_pistol'), 1000);
            player.giveWeapon(mp.joaat('weapon_stungun_mp'), 1000);
            player.giveWeapon(mp.joaat('weapon_assaultrifle_mk2'), 1000); 
            player.giveWeapon(mp.joaat('weapon_marksmanpistol'), 1000);  
        } 
 
        if(isGangGroup(player.info.group))
        { 
            player.giveWeapon(mp.joaat('weapon_pistol50'), 250);
            player.giveWeapon(mp.joaat('weapon_pumpshotgun_mk2'), 250);
            player.giveWeapon(mp.joaat('weapon_carbinerifle'), 250);  
        } 
        return true;
    } 
   
    return serverReloadCharacter(player);
}

global.serverArrestPlayer = async function(player, suspect, surrender = false)
{ 
    if(suspect == null || player.info.group != 1)
        return;
  
    player.suspectPlayer = null;
 
    suspect.call('client::faction:setFollow', [false, player]);
 
    suspect.jail = 1800; 
    suspect.setVariable('playerCuff', false);
 
    serverPlayerJail(suspect);
    serverRemoveWanted(suspect);
 
    suspect.call("client::hud:open", [true, suspect.info.money, suspect.info.bank, suspect.info.admin, suspect.info.group, suspect.info.hungry, suspect.info.thirst, JSON.stringify(suspect.info.wanted), suspect.info.jail, JSON.stringify(suspect.info.playerBinds), suspect.info.playerSettings.hotkeys, suspect.info.payday]);

    await Account.update({ jail: suspect.info.jail }, { where: { id: suspect.info.id } } );

    sendGroup(1, 'b366ff', `** ${suspect.name} is now in jail, thanks to ${player.name}. **`);
    
    return sendNotiffication(suspect, 'info', `You were arrested by ${player.name}`, 'Jail:'); 
}

global.serverPlayerJail = function(suspect)
{ 
    const random = Math.floor(Math.random() * jailCell.length);

    suspect.stopAnimation();  
      
    suspect.position = new mp.Vector3(jailCell[random].x, jailCell[random].y, jailCell[random].z);
    suspect.heading = jailCell[random].heading;
    suspect.dimension = 999;

    setTimeout(() => { suspect.model = mp.joaat('ig_rashcosvki'); }, 500);
}

global.serverRemoveWanted = async function(player)
{ 
    player.info.wanted = { level: 0, time: 0, reasons: [], reporters: [] };

    player.call('client::hud:edit', ['wanted', JSON.stringify(player.info.wanted)]);

    await Account.update({ wanted: player.info.wanted }, { where: { id: player.info.id } } );
};

global.serverUnjailPlayer = async function(suspect)
{ 
    if(suspect == null)
        return;

    serverReloadCharacter(suspect);

    suspect.position = new mp.Vector3(424.778, -976.616, 30.710);
    suspect.heading = 76.129; 
    suspect.info.jail = 0;

    suspect.call("client::hud:open", [true, suspect.info.money, suspect.info.bank, suspect.info.admin, suspect.info.group, suspect.info.hungry, suspect.info.thirst, JSON.stringify(suspect.info.wanted), suspect.info.jail, JSON.stringify(suspect.info.playerBinds), suspect.info.playerSettings.hotkeys, suspect.info.payday]);
 
    await Account.update({ jail: 0 }, { where: { id: suspect.info.id } }); 
 
    return sendNotiffication(suspect, 'info', 'You were released from jail', 'Jail:');
}

global.serverCuffPlayer = function(player, suspect, status)
{
    if(suspect == null || player.info.group != 1)
        return;

    player.suspectPlayer = status ? suspect : '';

    suspect.setVariable('playerCuff', status); 
    suspect.playAnimation(status ? 'mp_arresting' : 'special_ped@tonya@intro', 'idle', 1, 49);
   
    return suspect.call('client::faction:setFollow', [status, player, true]);
}
 
CommandRegistry.add({
    name: "arrest", 
      
    beforeRun: function (player) 
    {
        if(player.info.group != 1)
            return sendNotiffication(player, 'info', 'You are not in Los Santos Police faction.', 'Faction:');
      
        return true;
    },
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/arrest [player]'); 

        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);
 
        return serverArrestPlayer(player, user);
    }
}); 

CommandRegistry.add({
    name: "unjail", 
      
    beforeRun: function (player) 
    {
        if(player.info.group != 1)
            return sendNotiffication(player, 'info', 'You are not in Los Santos Police faction.', 'Faction:');
      
        return true;
    },
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/unjail [player]'); 

        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);
 
        return serverUnjailPlayer(user);
    }
}); 

CommandRegistry.add({
    name: "cuff", 
      
    beforeRun: function (player) 
    {
        if(player.info.group != 1)
            return sendNotiffication(player, 'info', 'You are not in Los Santos Police faction.', 'Faction:');

        if(!player.factionDuty)
            return sendNotiffication(player, 'info', 'You are not ON DUTY.');
      
        return true;
    },
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/cuff [player]'); 
 
        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);
 
        sendNotiffication(player, 'success', `You handcuffed ${user.name}.`);
        sendNotiffication(user, 'success', `You were handcuffed by officer ${player.name}.`);

        return serverCuffPlayer(player, user, true);
    }
}); 

CommandRegistry.add({
    name: "uncuff", 
      
    beforeRun: function (player) 
    {
        if(player.info.group != 1)
            return sendNotiffication(player, 'info', 'You are not in Los Santos Police faction.', 'Faction:');
      
        if(!player.factionDuty)
            return sendNotiffication(player, 'info', 'You are not ON DUTY.');
        return true;
    },
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/uncuff [player]'); 
 
        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendNotiffication(player, 'error', 'Player not found.');
 
        return serverCuffPlayer(player, user, false);
    }
});  

CommandRegistry.add({
    name: "so", 
      
    beforeRun: function (player) 
    {
        if(player.info.group != 1)
            return sendNotiffication(player, 'info', 'You are not in Los Santos Police faction.', 'Faction:');
       
        if(!player.factionDuty)
            return sendNotiffication(player, 'info', 'You are not ON DUTY.');

        return true;
    },
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/so [player]'); 
 
        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendNotiffication(player, 'error', 'Player not found.');

        if(!player.IsInRange(user.position.x, user.position.y, user.position.z, 20))
            return sendNotiffication(player, 'error', 'This players is not in your area.');
 
        return sendLocal(player, 'ffb84d', 20, `** ${user.name} [#${user.id}] esti urmarit de politie, trage pe dreapta! **`);  
    }
});

CommandRegistry.add({
    name: "killcp", 
        
    beforeRun: function (player) 
    {
        if(player.working || player.driving.status || (player.haveTargetIs != null && player.info.group == 3))
            return sendNotiffication(player, 'error', 'This command is not avaiable now.');

        return true;
    },
    run: function (player) 
    {  
        player.haveFinding = false;
        player.call('client::hud:showFinding', [false, '']);

        return destroyPlayerCheckpoint(player);
    }
});

CommandRegistry.add({
    name: "free", 
      
    beforeRun: function (player) 
    {
        if(player.info.group != 1)
            return sendNotiffication(player, 'info', 'You are not in Los Santos Police faction.', 'Faction:');

        if(!player.factionDuty)
            return sendNotiffication(player, 'info', 'You are not ON DUTY.');
      
        return true;
    },
    run: function (player, _, id, price) 
    { 
        if(!id) 
            return sendUsage(player, '/free [player] [price]'); 
 
        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);
 
        if(!player.IsInRange(user.position.x, user.position.y, user.position.z, 5))
            return sendNotiffication(player, 'info', 'You are not in range of this player.');
 
        player.free = { user: user, price: price };
 
        sendMessage(player, '00cc66', `You sent ${user.name} [${user.id}] an invitation to get out of jail for $${formatMoney(price)}.`);
        sendMessage(user, '00cc66', `${player.name} [${player.id}] wants to get you out of jail for $${formatMoney(price)} (use /acceptfree ${player.id}).`); 
    }
});


CommandRegistry.add({
    name: "acceptfree", 
 
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/acceptfree [player]'); 

        if(!player.jail)
            return sendNotiffication(player, 'error', 'You are not in jail.');
 
        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);
   
        if(user.free.user != player)
            return sendNotiffication(player, 'info', 'This player has not sent you a release offer.');
 
        sendMessage(user, '00cc66', `${player.name} [${player.id}] accepted your invitation to get out of jail for $${formatMoney(user.free.price)}.`);
        sendMessage(player, '00cc66', `You accepted ${user.name}'s invitation to get out of jail for $${formatMoney(user.free.price)}.`); 
 
        user.giveMoney(0, user.free.price);
        player.giveMoney(1, user.free.price);

        serverUnjailPlayer(player);
 
        user.free = { user: null, price: 0 }; 
    }
});
 
rpc.register('server::radar:power', (_, user) => 
{ 
    const player = user.player;    

    return player.call('client::radar:unblock', []);
});
 
rpc.register('server::radar:send', async (_, user) => 
{ 
    const player = user.player;  
    const result = await rpc.callClient(player, 'GET_RADAR_DATA');  
    const driver = result.driver;
 
    if(driver != undefined && mp.players.exists(driver) && driver.loggedInAs) {
        sendMessage(driver, COLOR_ADMIN, `(Police):!{fff} Ai fost prins cu viteza de ${result.speed} unde limita era ${result.limit}.`);
        sendMessage(player, COLOR_ADMIN, `(Police):!{fff} L-ai prins pe ${driver.name} cu viteza de ${result.speed} unde limita era ${result.limit}.`);
    }
});  