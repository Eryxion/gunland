const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc"); 
   

/*-----------------------------------------------------------------[STAFF >> ADMIN]-----------------------------------------------------------------*/
mp.events.add("showPlayerSetOptions", (player) => {

    sendUsage(player, '/set [player] [option] [amount]'); 
    sendMessage(player, '009999', 'Options:!{#ffffff} level, money, bankMoney, hours, dimension.');
});     
 
//Admins command   
CommandRegistry.add({
    name: "gotowaypoint", 
       
    run: function (player)
    {   
        return player.call("client::server::teleportWaypoint", []);
    }
});
 
CommandRegistry.add({
    name: "set", 
      
    beforeRun: function (player) {
        if(player.info.admin < 6) 
            return player.staffPerms(6);

        return true;
    },
    run: async function (player, _, id, type, amount) {

        if(!id || !type || !amount) 
            return mp.events.call("showPlayerSetOptions", player); 

        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', 'This player is not connected.');
        
        amount = parseInt(amount);
        switch(type)
        { 
            case "level": { user.info.level = amount; break; }
            case "money": { user.giveMoney(2, amount); break; }
            case "bank": { user.giveMoneyBank(2, amount); break; }
            case "hours": { user.info.hours = amount; break; }
            case "virtualworld": { user.dimension = amount; break; }
        } 

        //MESSAGES
        sendAdmins(COLOR_ADMIN, 'local', `(Notice):!{#ffffff} ${player.name} set ${user.name}'s ${type} in ${amount}.`);
        sendMessage(user, COLOR_GLOBAL, `(Info):!{ffffff} ${player.name} set your ${type} in ${amount}.`);
      
        await Account.update({ level: user.info.level, hours: user.info.hours }, { where: { id: user.info.id } } ); 
    }
});
 
CommandRegistry.add({
    name: "setlicense", 
      
    beforeRun: function (player) {
        if(player.info.admin < 6) 
            return player.staffPerms(6);

        return true;
    },
    run: async function (player, _, id, type, amount) {

        if(!id || !type || !amount) 
        {
            sendUsage(player, '/setlicense [player] [license] [amount]'); 
            sendMessage(player, '009999', 'Options:!{#ffffff} driving, boat, fly, gun.');
            return;
        }
    
        const user = getNameOnNameID(id);
        if(user == undefined) 
            return sendMessage(player, 'ffffff', 'This player is not connected.');
    
        amount = parseInt(amount);
    
        if(amount > 100 || amount < 0)
            return sendMessage(player, 'ffffff', 'Please use value 0 - 100');
     
        switch(type)
        {
            case "driving": user.info.drivingLicence = amount; break; 
            case "moto": user.info.motorbike = amount; break;  
        }
     
        //MESSAGE
        sendAdmins(COLOR_ADMIN, 'local', `(Notice):!{#ffffff} ${player.name} set ${user.name}'s license of ${type} in ${amount}.`);
        sendMessage(user, COLOR_GLOBAL, `(Info):!{#ffffff} ${player.name} set you license ${type} in ${amount}.`);
     
        await Account.update({ drivingLicence: user.info.drivingLicence, motorbike: user.info.motorbike }, { where: { id: user.info.id } } ); 
    }
});
 
CommandRegistry.add({
    name: "save", 
      
    beforeRun: function (player) {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, name = "No name") {

        const pos = (player.vehicle) ? player.vehicle.position : player.position;
        const rot = (player.vehicle) ? player.vehicle.rotation : player.heading;
        const saveFile = "savedpos.txt";

        const fs = require('fs');
    
        fs.appendFile(saveFile, `Position: ${pos.x}, ${pos.y}, ${pos.z} | ${(player.vehicle) ? `Rotation: ${rot.x}, ${rot.y}, ${rot.z}` : `Heading: ${rot}`} | ${(player.vehicle) ? "InCar" : "OnFoot"} - ${name}\r\n`, (err) => {
            
            if (err) player.notify(`~r~SavePos Error: ~w~${err.message}`);
            else player.notify(`~g~Position saved. ~w~(${name})`);
        }); 
    }
});
 
CommandRegistry.add({
    name: "admins", 
       
    run: function (player) 
    { 
        let counter_admins = 0;
        sendMessage(player, 'ff9900', `Online admins:`);
        
        mp.players.forEach(index => 
        {
            if(index.admin > 0) 
            {
                sendMessage(player, 'FFFFFF', `${index.name} [${index.id}] - admin level ${index.admin}`);
                
                counter_admins ++;
            }
        });
    
        return sendMessage(player, 'ff9900', `Admins online: ${counter_admins}`);
    }
});

CommandRegistry.add({
    name: "checkv", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        return true;
    },
    run: function (player, _, target) 
    { 
        if(!target) 
            return sendUsage(player, '/checkv [player]'); 

        const user = getNameOnNameID(target); 
        if(user === undefined) 
            return player.outputChatBox("There is no player online with the ID given.");

        if(!Object.keys(user.personalVeh).length)
            return sendNotiffication(player, 'info', 'This player dont have a personal vehicles.');
 
        sendMessage(player, 'fff', `${user.name} [${user.id}] - personal vehicles`)

        user.personalVeh.forEach(index => {
            
            sendMessage(player, 'fff', `${index.name} (${index.status == 'spawned' ? `vehicleID: ${index.vehicle.id}` : 'not spawned'}) - ${formatKM(index.odometer)} km - ${index.locked ? 'locked' : 'unlocked'}`)
        }); 
    }
});
 
  
//BAN and KICK sistem  
CommandRegistry.add({
    name: "kick", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        return true;
    },
    run: function (player, _, target) 
    { 
        if(!target || isNaN(target)) 
            return sendUsage(player, '/kick [player]'); 

        const user = getNameOnNameID(target); 
        if(user === undefined) 
            return player.outputChatBox("There is no player online with the ID given.")

        sendToAll('b30000', `(/kick): ${user.name} has been kicked from the server by admin ${player.name}.`);
        
        return user.kick('Kicked.');
    }
});
 
//ADMIN COMMANDS - VEHICLES  
CommandRegistry.add({
    name: "carcolor", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        return true;
    },
    run: function (player, _, veh, colorOne, colorTwo) {

        if(!veh || !colorOne || !colorTwo)
            return sendUsage(player, `/carcolor [vehicle_id] [color_one] [color_two]`);

        const vehicle = mp.vehicles.at(veh); 
        if(vehicle == undefined)
            return player.outputChatBox(`This vehicle doesn't exist.`);
    
        vehicle.setColor(parseInt(colorOne), parseInt(colorTwo));
        
        return sendAdmins(COLOR_ADMIN, 'local', `(Notice):!{#ffffff} ${player.name} [${player.id}] change vehicle color one in ${colorOne} and color two in ${colorTwo}.`);
    }
});
 
CommandRegistry.add({
    name: "givecar", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 6) 
            return player.staffPerms(6);

        return true;
    },
    run: function (player, _, id, model) {

        if(!model || !id)
            return sendUsage(player, `/givecar [player] [vehicle_model]`);

        const user = getNameOnNameID(id);
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);  
    
        give_player_vehicle(user, model, 1, player.name);
    
        return sendNotiffication(player, 'success', `Vehicle ${model} created for ${user.name} [${user.id}]`);
    }
});
 
CommandRegistry.add({
    name: "va", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player) {

        var search_vehicles = 0;
  
        if(player.info.admin < 2) 
            return player.staffPerms(2);
     
        mp.vehicles.forEachInRange(player.position, 30, (vehicle) => {

            if(!vehicle.haveDriver)
            {
                vehicle.position = vehicle.spawn;
                vehicle.rotation = vehicle.spawnRotation;
        
                search_vehicles ++;     
            } 
        });

        if(search_vehicles) sendAdmins(COLOR_ADMIN, 'local', `(Notice):!{#fff} ${player.name} [${player.id}] respawned ${search_vehicles} vehicles (via /va).`);
    }
});
 
CommandRegistry.add({
    name: "dl", 
       
    run: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        player.setVariable('dlActivated', !player.getVariable('dlActivated'));

        sendNotiffication(player, 'info', `Your vehicle informations is now ${(player.getVariable('dlActivated') == 1) ? ("enabled") : ("disabled")}`);
    }
});
 
CommandRegistry.add({
    name: "setcolor", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 6) 
            return player.staffPerms(6);

        return true;
    },
    run: function (player, _, veh, colorone, colortwo) {

        if(!veh || !colorone || !colortwo)
            return sendUsage(player, `/setcolor [vehicle] [color_one] [color_two]`);
   
        const vehicle = mp.vehicles.at(veh); 
        if(vehicle == undefined)
            return player.outputChatBox(`This vehicle doesn't exist.`);

        vehicle.setColor(colorone, colortwo);  
    
        return sendNotiffication(player, 'success', `Vehicle color edited [${colorone} | ${colortwo}].`);
    }
});

CommandRegistry.add({
    name: "nearcars", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        return true;
    },
    run: function (player) 
    { 
        let search_vehicles = 0;

        mp.vehicles.forEachInRange(player.position, 10, (vehicle) => {
      
            search_vehicles ++;
 
            sendMessage(player, COLOR_ADMIN, `>>!{#fff} ${vehicle.params.model} (id: ${vehicle.id}).`);    
        });
    
        return sendMessage(player, 'fff', `Result: ${(search_vehicles == 0 ? 'no vehicles found' : `!{#ff6600}[${search_vehicles}]!{#fff} vehicles`)} in your range.`);  
    }
});
 
CommandRegistry.add({
    name: "fv", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        return true;
    },
    run: function (player) 
    {

        if(!player.vehicle) 
            return true;
          
        //REPAIR VEHICLE AND SET GASS
        player.vehicle.repair();
        player.vehicle.setVariable('vehicleGass', 100);
    
        //UPDATE SPEEDOMETER
        player.call("update_speedometer_gass", []);
          
        //NOTIFFICATION 
        return sendNotiffication(player, 'info', `You fixed this vehicle`); 
    }
});

CommandRegistry.add({
    name: "getcar", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        return true;
    },
    run: function (player, veh) 
    {

        if(!veh) 
            return sendUsage(player, '/getcar [vehicle id]'); 

        const vehicle = mp.vehicles.at(veh); 
        if(!vehicle) 
            return player.outputChatBox(`This vehicle doesn't exist.`);
    
        vehicle.position = new mp.Vector3(player.position.x + 2.5, player.position.y, player.position.z);
        vehicle.dimension = player.dimension; 
        
        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} teleported vehicle ${veh} to him (/getcar).`);
    }
});
 
CommandRegistry.add({
    name: "flip", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        return true;
    },
    run: function (player) 
    { 
        const vehicle = player.vehicle; 

        if(!vehicle) 
            return true;
 
        vehicle.rotation = new mp.Vector3(0, 0, vehicle.rotation.z);
        
        return sendNotiffication(player, 'success', `You fliped vehicle ${vehicle.id}.`);
    }
});
 
CommandRegistry.add({
    name: "gotocar", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2) 
            return player.staffPerms(2);

        return true;
    },
    run: function (player, veh) 
    { 
        if(!veh) 
            return sendUsage(player, '/gotocar [vehicle id]'); 

        const vehicle = mp.vehicles.at(veh); 
        if(!vehicle) 
            return player.outputChatBox(`This vehicle doesn't exist.`);
     
        ((!player.vehicle) ? player.position = new mp.Vector3(vehicle.position.x + 2.5, vehicle.position.y, vehicle.position.z) : player.vehicle.position = new mp.Vector3(vehicle.position.x + 2.5, vehicle.position.y, vehicle.position.z))
        ((!player.vehicle) ? player.dimension = vehicle.dimension : player.vehicle.dimension = vehicle.dimension)
          
        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} teleported to vehicle ${vehicle.id} (/gotocar).`);
    }
});
 
CommandRegistry.add({
    name: "spawncar",  
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, vehName) 
    { 
        if(!vehName) 
            return sendUsage(player, `/spawncar [vehicle_name]`);
 
        if(!player.vehicleValid(vehName))
            return sendNotiffication(player, 'error', `This vehicle doesnt exist.`); 

        let colorOne = generateRGB();
        let colorTwo = generateRGB();
  
        return createVehicle(player, JSON.stringify({model: vehName, position: player.position, heading: player.heading, putIn: true, type: 'admin', faction: null, locked: false, fuel: 100, odometer: 0, color1: colorOne, color2: colorTwo, number: 'Admin'})); 
    }
});

CommandRegistry.add({
    name: "vre", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, veh) {

        if((!veh || isNaN(veh)) && !player.vehicle) 
            return sendUsage(player, `/vre [vehicle_id]`);

        const vehID = mp.vehicles.at(veh); 

        if(!player.vehicle && vehID == undefined)
            return sendMessage(player, 'ff3300', `ERROR:!{#ffffff} This vehicle doesn't exist.`); 
    
        sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} destroyed a vehicle [id: ${((player.vehicle) ? player.vehicle.id : vehID.id)} (/vre)].`);
    
        //DESTROY VEHICLE
        return ((player.vehicle) ? player.vehicle : vehID).destroy();
    }
});
 
//ADMIN COMMANDS - MANAGE ADMINS/PLAYERS
CommandRegistry.add({
    name: "warn", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 6)  
            return player.staffPerms(6);

        return true;
    },
    run: async function (player, _, id, ...reason) {

        reason = reason.join(" ");

        if(!id || !reason) 
            return sendUsage(player, '/warn [player] [reason]'); 

        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`); 
    
        user.info.warns ++;

        sendToAll(COLOR_GLOBAL, `(AdmBot):!{#ffffff} ${user.name} has been warned by ${player.name} reason: ${reason} (warns: ${user.warns}/3).`);
 
        await Account.update({ warns: user.info.warns }, { where: { id: user.info.id } } ); 
    }
});

CommandRegistry.add({
    name: "unwarn", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 6)  
            return player.staffPerms(6);

        return true;
    },
    run: async function (player, _, id, ...reason) {

        reason = reason.join(" ");
 
        if(!id || !reason) 
            return sendUsage(player, '/unwarn [player] [reason]'); 

        const user = getNameOnNameID(id);  
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);  

        if(user.warns == 0)
            return sendMessage(player, 'ffffff', `This player already have 0/3 warns.`);  

        user.info.warns --; 
        
        await Account.update({ warns: user.info.warns }, { where: { id: user.info.id } } ); 
    
        sendAdmins(COLOR_GLOBAL, 'local', `(AdmBot):!{ffffff} ${player.name} used command (/unwarn) on ${user.name} reason: ${reason} (warns: ${user.warns}/3).`);    
    }
});

CommandRegistry.add({
    name: "mute", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 4)  
            return player.staffPerms(4);

        return true;
    },
    run: async function (player, _, playerID, minutes, ...reason) 
    { 
        reason = reason.join(" ");
 
        if(!playerID || !minutes) 
            return sendUsage(player, '/mute [player] [minutes] [reason]');  
 
        const user = getNameOnNameID(playerID);  
        if(user == undefined) 
            return player.outputChatBox("This player is not connected.");
        
        user.info.mute = minutes * 60;

        sendToAll(COLOR_GLOBAL, `(AdmBot):!{#ffffff} ${player.name} muted ${user.name} for ${minutes} ${minutes > 1 ? 'minutes' : 'minute' }. ( Reason: ${reason} )`);
    
        await Account.update({ mute: user.info.mute }, { where: { id: user.info.id } } ); 
    }
});

CommandRegistry.add({
    name: "setadmin", 
      
    beforeRun: function () 
    {
        //if(player.info.admin < 7)  
            //return player.staffPerms(7);

        return true;
    },
    run: async function (player, _, id, adminLevel) 
    { 
        if(!id || !adminLevel) 
            return sendUsage(player, `/setadmin [player] [admin]`);

        if(adminLevel < 0 || adminLevel > 7) 
            return sendMessage(player, 'ffffff', `Maxium level is 7 and minim level is 0.`);

        const user = getNameOnNameID(id);
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);   
     
        user.info.admin = parseInt(adminLevel);
   
        sendMessage(player, COLOR_ADMIN, `(Notice):!{#ffffff} You promoted ${user.name} to admin level ${user.info.admin}.`);
        sendMessage(user, COLOR_ADMIN, `(Notice):!{#ffffff} Admin ${player.name} promoted you to admin level ${user.info.admin}.`);

        await Account.update({ admin: user.info.admin }, { where: { id: user.info.id } } ); 

        rpc.callBrowsers(mp.players.at(user.id), 'setChatGrades', [JSON.stringify({admin: user.info.admin, group: user.info.group, reload: (adminLevel == 0) ? true : false})]); 
        user.call("client::hud:edit", ['adminmod', (adminLevel > 0) ? true : false]); 
    }
});

CommandRegistry.add({
    name: "sethelper", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 7)  
            return player.staffPerms(7);

        return true;
    },
    run: async function (player, _, id, helperLevel) {

        if(!id || !helperLevel) 
            return sendUsage(player, `/sethelper [player] [helper]`);

        if(helperLevel < 0 || helperLevel > 3) 
            return sendMessage(player, 'ffffff', `Maxium level is 3 and minim level is 0.`);

        const user = getNameOnNameID(id);
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);   
    
        user.info.helper = parseInt(helperLevel);
        sendMessage(player, COLOR_ADMIN, `(Notice):!{#ffffff} You promoted ${user.name} to helper level ${user.info.helper}.`);
        sendMessage(user, COLOR_ADMIN, `(Notice):!{#ffffff} Admin ${player.name} promoted you to helper level ${user.info.helper}.`);
    
        await Account.update({ helper: user.info.helper }, { where: { id: user.info.id } } ); 
    }
});
   
//ADMIN COMMANDS - CHAT 
CommandRegistry.add({
    name: "anno", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 3) 
            return player.staffPerms(3);

        return true;
    },
    run: function (player, _, ...message) 
    { 
        message = message.join(" ");

        if(!message) 
            return sendUsage(player, '/anno [text]'); 
  
        return sendToAll('ff3300', `(( Anno: ${message} ))`); 
    }
});

CommandRegistry.add({
    name: "pm", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 3) 
            return player.staffPerms(3);

        return true;
    },
    run: function (player, _, id, ...message) 
    {

        message = message.join(" ");

        if(!id || !message) 
            return sendUsage(player, '/pm [player] [text]'); 
    
        const user = getNameOnNameID(id);  
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`); 
        
        sendMessage(player, 'ffff00', `(( PM sent to ${user.name}: ${message} )).`);
        sendMessage(user, '67aab1', `(( PM from ${player.name}: ${message} )).`);
    }
});
 
CommandRegistry.add({
    name: "hc", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1 && player.info.helper < 1) 
            return player.outputChatBox("You are not part of the staff.");

        return true;
    },
    run: function (player, _) 
    { 
        if(!_) 
            return sendUsage(player, `/a [text]`); 

        if(player.helperChat == false)
            return sendNotiffication(player, 'info', `You blocked this chat (press key Q to edit).`);
  
        return sendStaff('88592b', `${player.info.admin ? 'Admin' : 'Helper'} ${player.name}: ${_}`);
    }
});
 
CommandRegistry.add({
    name: "unmute", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 4)  
            return player.staffPerms(4);

        return true;
    },
    run: async function (player, _, playerID) 
    { 
        if(!playerID) 
            return sendUsage(player, '/unmute [player]'); 
 
        const user = getNameOnNameID(playerID);  
        if(user == undefined) 
            return player.outputChatBox("This player is not connected.");

        if(user.info.mute == 0) 
            return player.outputChatBox("This player is not muted.");
        
        user.info.mute = 0;
    
        sendToAll(COLOR_GLOBAL, `(AdmBot):!{#ffffff} ${player.name} unmuted ${user.name}.`);

        await Account.update({ mute: user.info.mute }, { where: { id: user.info.id } } ); 
    }
});
 
//ADMIN COMMANDS - GENERAL 
CommandRegistry.add({
    name: "setdimension", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id, dimension)
    {
        if(!id || !dimension) 
            return sendUsage(player, '/setdimension [player] [dimension]'); 
 
        const user = getNameOnNameID(id);  
        if(user == undefined) 
            return player.outputChatBox("This player is not connected.");
    
        user.dimension = parseInt(dimension);
 
        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} [${player.id}] set ${user.name}'s dimenstion in ${user.dimension}.`);
    }
});
  
CommandRegistry.add({
    name: "healme", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player) 
    { 
        player.health = 100;
         
        return sendNotiffication(player, 'info', `Your health is now full <i class = "fa fa-medkit"></i>`);
    }
});

CommandRegistry.add({
    name: "heal", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id) 
    {
        if(!id)
            return sendUsage(player, '/heal [player]'); 
  
        const user = getNameOnNameID(id);
        if(user == undefined)
            return player.outputChatBox("This player is not connected.");

        //UPDATE VARIABLE
        user.health = 100;
    
        //MESSAGE 
        sendNotiffication(player, 'info', `You reseted ${user.name} health <i class = "fa fa-medkit"></i>`);
        sendNotiffication(user, 'info', `${player.name} reset your health <i class = "fa fa-medkit"></i>`);
    }
});
 
CommandRegistry.add({
    name: "respawn", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id) {
        if(!id) 
            return sendUsage(player, '/respawn [player]'); 
 
        const user = getNameOnNameID(id);
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`); 
    
        mp.events.call("spawnPlayer", user, -1);
        
        sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} respawned ${user.name}.`);
        sendMessage(user, 'ff6633', `Admin ${player.name} respawned you.`);
    }
});

CommandRegistry.add({
    name: "aa2", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player) 
    { 
        player.position = new mp.Vector3(-1027.990, -3321.461, 13.944);
        player.heading  = 42.754; 
        player.dimension = 999;
    }
});

CommandRegistry.add({
    name: "gotospawn", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player) 
    { 
        player.spawn(new mp.Vector3(-61.349, -792.933, 44.225)); 
        player.heading = -41.017;   
        player.dimension = 0;

        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} teleported to spawn (/gotospawn).`);
    }
});

CommandRegistry.add({
    name: "gotods", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1)  
            return player.staffPerms(1);

        return true;
    },
    run: function (player) 
    { 
        player.position = new mp.Vector3(-38.86, -1109.9, 26.43); 

        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} teleported to Dealership (/gotods).`);
    }
});

CommandRegistry.add({
    name: "gotom", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player) 
    { 
        player.spawn(new mp.Vector3(497.100, 5590.735, 794.973)); 
        player.heading = 125.071;    

        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} teleported to Mount Chiliad (/gotom).`);
    }
}); 
 
CommandRegistry.add({
    name: "goto", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id) 
    {
        if(!id) 
            return sendUsage(player, '/goto [player]'); 

        const user = getNameOnNameID(id); 
        if(user == undefined || !user.loggedInAs) 
            return player.outputChatBox("This player is not connected.");

        if(user == player)
            return;
    
        player.position = new mp.Vector3(user.position.x + 1, user.position.y, user.position.z);
        player.dimension = user.dimension;
        player.houseInt = null;
    
        sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} [${player.id}] teleported to ${user.name} [${user.id}] (/goto).`);
        sendMessage(user, '669999', `${player.name} teleported to you.`);
    }
});
 
CommandRegistry.add({
    name: "gethere", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id) 
    {
        if(!id) 
            return sendUsage(player, '/gethere [player]'); 

        const user = getNameOnNameID(id);
        if(user == undefined || !user.loggedInAs) 
            return player.outputChatBox("This player is not connected.");
    
        if(user == player)
            return;

        user.position = new mp.Vector3(player.position.x + 1, player.position.y, player.position.z);
        user.dimension = player.dimension;
        user.houseInt = null;

        sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} used command (/gethere) on ${user.name}.`);
        sendMessage(user, '669999', `${player.name} teleported you to him.`);
    }
});

CommandRegistry.add({
    name: "gotoxyz", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, x, y, z) {
        if(!x || !y || !z) 
            return sendUsage(player, `/gotoxyz [x] [y] [z]`); 
     
        ((!player.vehicle) ? player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z)) : player.vehicle.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z)));
    
        return sendMessage(player, COLOR_ADMIN, `You teleported to position: ${parseFloat(x)}, ${parseFloat(y)}, ${parseFloat(z)}`);
    }
});
 
CommandRegistry.add({
    name: "freeze", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id) 
    {
        if(!id) 
            return sendUsage(player, '/freeze [player]'); 

        const user = getNameOnNameID(id);
        if(user == undefined)  
            return player.outputChatBox("This player is not connected.");
         
        freezePlayer(user, true);

        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} used command (/freeze) on ${user.name}.`);
    }
});
 
global.freezePlayer = function(player, status) {
    return player.call('client::server::frezePlayer', [status]);
};

CommandRegistry.add({
    name: "unfreeze", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id) {
        if(!id) 
            return sendUsage(player, '/unfreeze [player]'); 

        const user = getNameOnNameID(id);
        if(user == undefined) 
            return player.outputChatBox("This player is not connected.");
        
        freezePlayer(user, false);
        
        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} used command (/unfreeze) on ${user.name}.`);
    }
});

CommandRegistry.add({
    name: "slap", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id) {
        if(!id) 
           return sendUsage(player, '/slap [player]'); 

        const user = getNameOnNameID(id);
        if(user == undefined) 
            return player.outputChatBox("This player is not connected.");
        
        user.position = new mp.Vector3(user.position.x, user.position.y, user.position.z + 2.5); 
        
        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} used command (/slap) on ${user.name}.`);
    }
});
 
CommandRegistry.add({
    name: "disarm", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id) {
        if(!id) 
            return sendUsage(player, `/disarm [player]`);

        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);   
    
        user.removeAllWeapons();

        return sendAdmins(COLOR_ADMIN, 'local', `(Notice): Admin ${player.name} disarmed ${user.name} (/disarm).`);
    }
});
 
CommandRegistry.add({
    name: "givegun", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player, _, id, gunName, buletts) {
        if(!id || !gunName) 
            return sendUsage(player, `/givegun [id] [weapon_name] [weapon_bullets]`);
        
        const user = getNameOnNameID(id);  
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`); 
        
        user.giveWeapon(mp.joaat(gunName), parseInt(buletts)); 
    
        sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} spawned ${gunName} with ${parseInt(buletts)} bullets for ${user.name}.`);
        sendMessage(user, 'ffffff', `${player.name} spawned ${gunName} with ${parseInt(buletts)} for you.`);
    }
});  
 
CommandRegistry.add({
    name: "mark", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player) 
    { 
        return player.markPosition = player.position;
    }
}); 

CommandRegistry.add({
    name: "gotomark", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1) 
            return player.staffPerms(1);

        return true;
    },
    run: function (player) {
        if(!player.markPosition) 
            return player.outputChatBox(`You don't have a marked position.`);

        ((!player.vehicle) ? player.position = player.markPosition : player.vehicle.position = player.markPosition); 
        player.dimension = 0;
    }
});

CommandRegistry.add({
    name: "spec", 
        
    run: function (player, id) 
    {
        if(!id) 
            return sendUsage(player, '/spec [player]'); 

        if(player.info.admin < 1) 
            return player.staffPerms(1);
 
        const user = getNameOnNameID(id); 
        if(user == undefined && !user.loggedInAs) 
            return player.sendNotiffication(player, 'info', "This player is not connected.");
     
        if(user == player)
            return;

        if(player.vehicle) {
            player.lastPosition = player.vehicle.position; 
            player.lastVehicle = player.vehicle
            player.lastSeat = player.seat;
        }
        else {
            player.lastPosition = player.position; 
            player.lastVehicle = null;
        }

        console.log('seat ' + player.lastSeat);
 
        sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} is now spectating ${user.name} [${user.id}].`);

        player.position = new mp.Vector3(user.position.x, user.position.y, (user.position.z + 3));
   
        player.setVariable('spectatePlayer', JSON.stringify({name: user.name, level: user.info.level, hours: user.info.hours, jailed: user.info.jail }));
         
        return player.call('AdminTools:Spectate', [user.id]);
    }
});

mp.events.add('server::spectating:stop', (player) => {
    
    if(player.lastVehicle != null)
    {
        player.position = player.lastPosition;

        player.putIntoVehicle(player.lastVehicle, player.lastSeat);
    }
    else 
    {
        player.position = player.lastPosition;
        player.heading = player.lastPosition.heading;
    }   
}); 
  
CommandRegistry.add({
    name: "specoff", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 1)
            return player.staffPerms(1);

        return true;
    },
    run: function (player) 
    {    
        return player.call('client::spectating:stop', []);
    }
});

 
//TIME AND WEATHER COMMANDS
let TimeOfDay = null;


CommandRegistry.add({
    name: "settime", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 6) 
            return player.staffPerms(6);

        return true;
    },
    run: function (player,_, time) {
        if(!time)
            return sendUsage(player, `/settime [time]`);

        setTimeOfDay(parseInt(time)); 
    }
});
 
global.setTimeOfDay = function(time) 
{ 
    TimeOfDay = time;
    
    if(time == 24) {
        TimeOfDay = null;  
    } 
    return setWorldWeatherAndTime();
}
 
function setWorldWeatherAndTime() {
    const date = new Date(), hours = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds(); 
    
    return mp.world.time.set(((TimeOfDay != null) ? (TimeOfDay) : (hours)), minutes, seconds);
}  
/*--------------------------------------------------------------------------------------------------------------------------------------------------*/


/*-----------------------------------------------------------------[STAFF >> HELPERS]---------------------------------------------------------------*/
global.helperQuestions = [];

CommandRegistry.add({
    name: "helpers", 
       
    run: function (player) 
    { 
        let count = 0;
  
        mp.players.forEach(index => 
        {
            if(index.helper) 
            {
                sendMessage(player, '9999ff', `>>!{#fff} ${index.name} [${index.id}] - helpers level ${index.helper}.`);
                
                count ++;
            }
        });
    
        return sendMessage(player, '9999ff', `Helpers online: ${count}`);
    }
});

CommandRegistry.add({
    name: "hduty", 
      
    beforeRun: function (player) 
    {
        if(!player.info.helper || !player.info.admin) 
            return sendNotiffication(player, 'error', 'You are not part of the staff.');

        return true;
    },
    run: function (player) 
    { 
        player.helperDuty = !player.helperDuty;
       
        return sendNotiffication(player, 'info', `You are now helper ${player.helperDuty ? '<b>on duty</b>' : '<b>off duty</b>'}.`);
    }
});

CommandRegistry.add({
    name: "questions", 
      
    beforeRun: function (player) 
    { 
        if(!player.info.helper || !player.info.admin) 
            return sendNotiffication(player, 'error', 'You are not part of the staff.');

        if(!helperQuestions.length) 
            return sendNotiffication(player, 'error', 'In this moment is <b>0</b> questions.');

        return true;
    },
    run: function (player) 
    {  
        helperQuestions.forEach(index => {

            sendMessage(player, 'ffb366', `>> ${index.from} [${index.id}] question: ${index.question}`);
        }); 
    }
});

CommandRegistry.add({
    name: "n", 
       
    run: function (player, _, ...message) 
    { 
        message = message.join(" ");

        if(player.info.helper)
            return sendNotiffication(player, 'info', 'You are part of staff.');

        if(!message) 
            return sendUsage(player, `/n [question]`); 
  
        return sendQuestion(player, message);
    }
});

CommandRegistry.add({
    name: "nr", 
       
    run: function (player, _, id, ...message) 
    { 
        message = message.join(" ");

        if(!player.info.helper)
            return sendNotiffication(player, 'info', 'You are not part of the staff.');
 
        if(!message || !id) 
            return sendUsage(player, `/nr [id] [answer]`); 
 
        return sendRespose(player, id, message); 
    }
});
  
function sendRespose(player, user, message)
{  
    const questionerPlayer = getNameOnNameID(user);  
    if(questionerPlayer == undefined) 
        return sendMessage(player, 'ffffff', `Player not found.`); 
 
    const index = helperQuestions.findIndex(object => object.from === questionerPlayer.name);
 
    if(index != -1)
    { 
        mp.players.forEach(users => 
        {
            if(users.loggedInAs && users.info.playerSettings.newbie) 
            { 
                sendMessage(users, '9999ff', `(question) >> ${helperQuestions[index].from}: ${helperQuestions[index].question}`); 
                sendMessage(users, '9999ff', `(response) >> ${(player.info.admin ? 'Admin' : 'Helper')} ${player.name}: ${message}`);
            }
        }); 

        helperQuestions.splice(index, 1); 
    }
    else 
    {
        return sendNotiffication(player, 'error', 'This player dont have a questions.');
    }

    return sendNotiffication(player, 'success', `Raspunsul la intrebarea lui ${helperQuestions[index].from} a fost trimis cu succes.`);
}
 
function sendQuestion(player, message)
{ 
    if(!message) 
        return sendUsage(player, '/n [question]'); 

    let haveQuestion = helperQuestions.findIndex(object => object.from == player.name);

    if(player.info.newbieMute)
        return sendNotiffication(player, 'error', 'You have been muted on the newbie chat.');
  
    if(haveQuestion != -1)
        return sendNotiffication(player, 'error', 'Already you have a question, please wait.');
  
    sendMessage(player, '9999ff', `** Intrebarea ta a fost trimisa cu succes, asteapta un raspuns din partea helperilor. **`);
 
    helperQuestions.push({from: player.name, question: message, id: player.id, level: player.level});

    mp.players.forEach(users => 
    {
		if(users.helper && users.loggedInAs && users.info.playerSettings.newbie) 
		{  
			sendMessage(users, '9999ff', `** Question from ${player.name} (id: ${player.id}, level: ${player.level}) **`);
            sendMessage(users, '9999ff', `>> ${message} <<`); 
		}
	});  
}

CommandRegistry.add({
    name: "nmute", 
      
    beforeRun: function (player) 
    { 
        if(!player.info.helper || !player.info.admin) 
            return sendNotiffication(player, 'error', 'You are not part of the staff.');
 
        return true;
    },
    run: async function (player, _, id, time) 
    {  
        if(!id || !time) 
            return sendUsage(player, `/nmute [id] [minutes]`); 

        const user = getNameOnNameID(id);  
        if(user == undefined) 
            return sendMessage(player, 'ffffff', 'Player not found.'); 

        user.info.newbieMute = time * 60;

        sendMessage(user, '9999ff', `(Newbie Mute):!{#fff} You got muted ${user.info.newbieMute} minutes on the newbie chat from ${player.name} [${player.id}].`);
        sendNotiffication(player, 'success', `You set ${user.name} mute time to ${user.info.newbieMute} minutes.`);
 
        await Account.update({ newbieMute: user.info.newbieMute }, { where: { id: user.info.id } } ); 
    }
}); 

//admin reports-----------------------
global.serverReports = [];

CommandRegistry.add({
    name: "report", 
      
    beforeRun: function (player) 
    { 
        if(player.info.admin || player.info.helper) 
            return sendNotiffication(player, 'error', 'You are part of the staff.');
 
        return true;
    },
    run: function (player) 
    {  
        let haveReport = serverReports.findIndex(object => object.from == player.name);

        if(haveReport != -1)
            return sendNotiffication(player, 'error', 'Already you have a report, please wait.');

        return player.call('client::report:showMenu', []);
    }
}); 

CommandRegistry.add({
    name: "cr", 
      
    run: function (player, _, id, ...message) 
    { 
        message = message.join(" ");

        if(!player.info.admin)
            return sendNotiffication(player, 'info', 'You are not part of the staff.');
 
        if(!message || !id) 
            return sendUsage(player, `/cr [id] [answer]`); 
  
        const user = getNameOnNameID(id);  
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`); 

        let haveReport = serverReports.findIndex(object => object.from === user.name);
 
        if(haveReport == -1)
            return sendNotiffication(player, 'error', 'This player dont have a report.');
        
        sendAdmins('b30000', 'local', `${player.name} closed ${user.name} (${user.id})'s report: ${message}`);
        sendMessage(user, 'b30000', `${player.name} close your report: ${message}`); 
          
        return serverReports.splice(haveReport, 1);  
    }
});

CommandRegistry.add({
    name: "reports", 
       
    run: function (player) 
    {  
        if(!player.info.admin)
            return sendNotiffication(player, 'info', 'You are not part of the staff.');
 
        if(!serverReports.length) 
            return sendNotiffication(player, 'error', 'In this moment is <b>0</b> reports.');
 
        sendMessage(player, 'fff', '--------SERVER REPORTS--------');

        serverReports.forEach(index => {

            sendMessage(player, 'b30000', `>> ${index.from} [${index.id}] - report: ${index.question}`);
        });
    }
});
 
mp.events.add('server::report:sendReport', (player, index, reason) => {
    
    mp.players.forEach(users => 
    {  
        if(users.admin && users.loggedInAs) {  
            sendMessage(users, 'b30000', `>>!{#fff} ${player.name} (${player.id}) ${index == 0 ? 'is stuck.' : `- reported: ${index == 1 ? `player [#${reason}] is suspecting of cheating` : reason}`}.`); 
        }
    });  

    serverReports.push({from: player.name, question: `${index == 0 ? "I'm stuck." : reason} ${index == 1 ? 'is suspecting of cheating' : ''}`, id: player.id});
     
    return sendMessage(player, 'b30000', '(Report):!{#fff} Reportul tau a fost trimis adminilor, asteapta un raspuns.'); 
}); 