const { CommandRegistry } = require("../server-global/improved-commands"); 
 
require("./taxi/index.js");
require("./police/index.js"); 
require("./hitman/index.js"); 
require("./server-wars.js"); 
 
global.serverFactions = [] 
global.factionVehicles = [];
global.factionsBlipColor = [  
    3, //LSPD
    73, //TAXI
    79, //HITMAN

    3, //VARRIOR LOS AZTECAS
    25, //Grove Street Families
    27, //Ballas
    81 //Los Santos Vagos
]; 
 
global.factionSpawns = [  
    { x: 446.121, y: -984.892, z:  30.689, heading:   66.394 }, 
    { x: 340.687, y: -998.596, z: -99.196, heading: -116.854 },
    { x: 340.687, y: -998.596, z: -99.196, heading: -116.854 },

    { x: 340.687, y: -998.596, z: -99.196, heading: -116.854 },
    { x: 340.687, y: -998.596, z: -99.196, heading: -116.854 },
    { x: 340.687, y: -998.596, z: -99.196, heading: -116.854 },
    { x: 340.687, y: -998.596, z: -99.196, heading: -116.854 } 
];
 
mp.objects.new("gr_prop_gr_tunnel_gate", new mp.Vector3(1755.0778, 2463.9788, 44.0173), { rotation: new mp.Vector3(0, 0, 30.4), alpha: 255, dimension: 999 });
mp.objects.new("v_ilev_ph_door002", new mp.Vector3(434.756, -980.631, 30.8397), { rotation: new mp.Vector3(0, 0, 90.0002), alpha: 255, dimension: 999 });
 
global.jailCell = 
[
    {x: 1752.970, y: 2473.009, z: 45.851, heading: 5.90760},
    {x: 1758.329, y: 2476.454, z: 45.851, heading: 2.38965},
    {x: 1764.171, y: 2479.441, z: 45.850, heading: 21.2915},
    {x: 1769.357, y: 2483.238, z: 45.849, heading: 0.49889},
    {x: 1774.925, y: 2486.305, z: 45.848, heading: 6.18263},
    {x: 1780.257, y: 2489.840, z: 45.848, heading: 15.1265},
    {x: 1785.474, y: 2492.476, z: 49.237, heading: 4.68147},
    {x: 1780.914, y: 2488.807, z: 49.237, heading: 29.9832},
    {x: 1774.810, y: 2486.274, z: 49.237, heading: 22.0077},
    {x: 1769.308, y: 2483.237, z: 49.237, heading: 29.2670},
    {x: 1763.804, y: 2479.008, z: 49.237, heading: 31.8855},
    {x: 1758.602, y: 2476.086, z: 49.237, heading: 16.6161},
    {x: 1752.560, y: 2471.929, z: 49.237, heading: 31.1234},
    {x: 1747.848, y: 2468.812, z: 49.237, heading: 18.4496},
    {x: 1742.717, y: 2490.420, z: 49.235, heading: -153.28}, 
]
 
global.sendGroup = function(group, color, message, option = 'group') 
{
	mp.players.forEach(user => {
		
		if(user.loggedInAs == true && user.info.group == group) {  
            return user.call('SendToChat', [message, color, option]);   
        }
	}); 
}  

global.updateDashboard = function(status)
{
    mp.players.forEach(user => {
		
        if(user.loggedInAs == true && user.info.group == 2) { 
            user.call('client::dashboard:reloadData', [user.info.group, status, JSON.stringify(serverFactions)]);
        }
    }); 
}
 
global.load_player_group = function(player)
{  
    if(player.info.group) {  
        return sendGroup(player.info.group, '6699ff', `(GROUP):<a style="color:white;"> ${player.name} [#${player.id}] from your group logged in.</a>`);
    }
}


global.Factions = sequelize.define('server_factions', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: null,
        autoIncrement: true
    }, 
    name: DataTypes.STRING, 
   
    money: DataTypes.INTEGER, 
    blip: DataTypes.INTEGER, 
     
    members: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    },
    logs: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    },
    interior: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    },
    duty: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    } 
}, { timestamps: false, paranoid: true, underscored: true, freezeTableName: true, tableName: 'server_factions' }); 


global.loadServerFacions = async function() {

    
    let count = 0;
 
    await Factions.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
                let facPos = JSON.parse(element.position); 
                let interiorJS = JSON.parse(element.interior);
                let dutyPositionJS = JSON.parse(element.duty);
            
                serverFactions[count] = { 
                    id: element.id,
                    name: element.name,
                    position: facPos,  
                    interior: interiorJS,
                    dutyPosition: dutyPositionJS,
                    money: element.money,
                    
                    haveWar: null,
                    contracts: [],
                    calls: [],

                    members: JSON.parse(element.members),
                    logs: JSON.parse(element.logs),

                    blip: mp.blips.new(element.blip, new mp.Vector3(facPos.x, facPos.y, 0), { name: element.name, color: factionsBlipColor[element.id - 1], shortRange: true }), 
                    marker: mp.markers.new(1, new mp.Vector3(facPos.x, facPos.y, facPos.z - 1.4), 1, { color: [255, 255, 255, 255], dimension: 0 }),   
                    interiorMarker: mp.markers.new(1, new mp.Vector3(interiorJS.x, interiorJS.y, interiorJS.z - 1.4), 1, { color: [255, 255, 255, 255], dimension: element }),   
                    clothingMarker: mp.markers.new(1, new mp.Vector3(dutyPositionJS.x, dutyPositionJS.y, dutyPositionJS.z - 1.4), 1, { color: [255, 255, 255, 255], dimension: element})
                };

                mp.colshapes.newSphere(facPos.x, facPos.y, facPos.z, 3, 0).factionPosition = count + 1;  
                mp.colshapes.newSphere(interiorJS.x, interiorJS.y, interiorJS.z, 3, element.id).factionInterior = count + 1;  
                mp.colshapes.newSphere(dutyPositionJS.x, dutyPositionJS.y, dutyPositionJS.z, 2, element.id).factionDutyPos = count + 1; 
 
                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded server factions: ' + serverFactions.length);

    }).catch((e) => console.log(e)); 
};
 
global.enterFactionHQ = function(player, index)
{  
    player.dimension = serverFactions[index].id;

    player.position = new mp.Vector3(serverFactions[index].interior.x, serverFactions[index].interior.y, serverFactions[index].interior.z);
    player.heading = serverFactions[index].interior.heading; 
}
 
global.enterExitJail = function(player, option)
{ 
    player.dimension = (option == 1 ? serverFactions[player.info.group - 1].id : 999);

    player.position = (option == 1 ? new mp.Vector3(464.994, -990.031, 24.914) : new mp.Vector3(1748.955, 2468.140, 45.853));
    player.heading = (option == 1 ? parseFloat(91.524) : parseFloat(32.000));    
 
    sendNotiffication(player, 'info', `Welcome in ${option ? 'Los Santos Police' : 'Jail Los Santos'}.`);
};

global.exitFactionHQ = function(player, index)
{ 
    player.position = new mp.Vector3(serverFactions[index].position.x, serverFactions[index].position.y, serverFactions[index].position.z);
    player.heading = serverFactions[index].position.heading;

    return player.dimension = 0;
}

mp.events.add({ 
    "playerEnterColshape" : (player, shape) => {  
         
        if(shape.factionPosition) {
            player.inFactionRange = shape.factionPosition - 1;

            player.call("client::hud:interractShow", [true, serverFactions[shape.factionPosition - 1].name, JSON.stringify([serverFactions[shape.factionPosition - 1].name + ' door']), JSON.stringify(player.info.wanted.level && player.info.group != 1 ? [{key: 'E', text: 'Enter HQ'}, {key: 'H', text: 'Surrender'}] : [{key: 'E', text: 'Enter HQ'}])]);
        }

        if(shape.factionInterior && player.dimension == serverFactions[shape.factionInterior - 1].id) {   
            player.inFactionRange = shape.factionInterior - 1;

            player.call("client::hud:interractShow", [true, serverFactions[shape.factionInterior - 1].name, JSON.stringify([serverFactions[shape.factionInterior - 1].name + ' door']), JSON.stringify([{key: 'E', text: 'Exit HQ'}])]);
        } 

        if(shape.factionDutyPos && player.info.group == shape.factionDutyPos) {   
            player.call("client::hud:interractShow", [true, serverFactions[shape.factionDutyPos - 1].name, JSON.stringify([(player.info.group == 3 ? 'Get a target from here' : serverFactions[shape.factionDutyPos - 1].name + ' clothes')]), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        } 

        if(shape == arrestPoint && player.info.group == 1) { 
            player.call("client::hud:interractShow", [true, 'Los Santos Police Arrest', JSON.stringify(['Los Santos Police']), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        } 
         
        if((shape == jailPoint || shape == jailPointExit) && player.info.group == 1) {    
            player.call("client::hud:interractShow", [true, 'Jail Los Santos', JSON.stringify([shape == jailPoint ? 'Enter the prison and interact with the inmates.' : 'Get out of jail']), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        } 
    },
 
    "playerExitColshape" : (player, shape) => 
    { 
        if(shape.factionPosition || shape.factionInterior || shape.factionDutyPos || shape == arrestPoint || shape == jailPoint || shape == jailPointExit) {
            player.inFactionRange = null; 
            player.call("client::hud:interractShow", [false, '', '', '']);
        } 
    }, 
});

CommandRegistry.add({
    name: "setgroup",
      
    beforeRun: function (player)
    {
        if(player.info.admin < 6)
            return sendNotiffication(player, 'info', 'You dont have admin level 6+.');
      
        return true;
    },
    run: async function (player, _, id, group)
    {
        if(!id || group <= 0 || group > Object.keys(serverFactions).length)
            return sendUsage(player, '/setgroup [player ID] [group ID]');

        const user = getNameOnNameID(id);
        if(user == undefined)
            return sendMessage(player, 'ffffff', `Player not found.`);
 
        user.info.group = group;
        user.info.groupRank = 1;
        user.info.joinedGroup = getDates();

        sendMessage(user, '6699ff', `(Group):!{#fff} ${player.name} [${player.id}] set your group to ${serverFactions[group - 1].name}`); 
        sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} [${player.id}] set ${user.name} [${user.id}] group to ${serverFactions[group - 1].name} (/setgroup).`);
 
        rpc.callBrowsers(mp.players.at(user.id), 'setChatGrades', [JSON.stringify({admin: user.admin, group: user.info.group, reload: true})]);
  
        await Account.update({ group: group, groupRank: 1, joinedGroup: user.info.joinedGroup }, { where: { id: user.info.id } }); 
    }
});  

/*----------------------------------------------------------------------[FACTIONS COMMANDS]----------------------------------------------------------------------*/ 
CommandRegistry.add({
    name: "gotofaction", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: function (player, id) {

        if(!id) 
            return sendUsage(player, '/gotofaction [faction ID]'); 

        if(id > Object.keys(serverFactions).length || id < 1) 
            return sendMessage(player, '009933', 'Invalid faction ID.');
    
        player.position = new mp.Vector3(serverFactions[id - 1].position.x, serverFactions[id - 1].position.y, serverFactions[id - 1].position.z);
    
        return sendAdmins('ff9900', 'local', `(Notice):</span> ${player.name} teleported to faction ${serverFactions[id - 1].name} (/gotofaction).`);
    }
});
/*---------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  

/*----------------------------------------------------------------- [FACTION VEHICLES] --------------------------------------------------------------------------*/

global.FactionVehicles = sequelize.define('faction_vehicles', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: null,
        autoIncrement: true
    }, 
    
    name: DataTypes.STRING, 
    faction: DataTypes.INTEGER,  
    color: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },

    position: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({x: 0, y: 0, z: 0}) 
    }

}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'faction_vehicles' }); 
 
global.loadFactionVehicles = async function() {
 
    let count = 0;
 
    await FactionVehicles.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
                let vehPosition = JSON.parse(element.position);
                let vehColor = JSON.parse(element.color)
                
                factionVehicles[count] = { 
                    id: element.id,
                    name: element.name,
                    faction: element.faction,  
                    position: vehPosition,
                    rotation: vehPosition.rotation,
                    color: vehColor,
                   
                    vehicle: createVehicle(null, JSON.stringify({model: element.name, position: new mp.Vector3(vehPosition.x, vehPosition.y, vehPosition.z), heading: vehPosition.rotation, putIn: false, type: 'faction', faction: element.faction, locked: false, fuel: 100, odometer: 0, color1: vehColor[0], color2: vehColor[1], number: 'Faction' }))             
                };
 
                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded faction vehicles: ' + factionVehicles.length);

    }).catch((e) => console.log(e)); 
};

 
mp.events.add({

    /*"vehicleDamage" : (vehicle, bodyHealthLoss, engineHealthLoss) =>
    {
        if(vehicle.bodyHealth < 300) 
        {
            console.log('trag in vehicul respawn');
            let pos = vehicle.spawn;
            console.log(pos);
            vehicle.position = new mp.Vector3(pos.x, pos.y, pos.z);
            vehicle.rotation = new mp.Vector3(vehicle.spawnRotation.x, vehicle.spawnRotation.y, vehicle.spawnRotation.z);
            
            vehicle.setVariable('engine', false);
            vehicle.repair();
        }
    },*/

    "vehicleDeath" : (vehicle) =>
    {
        vehicle.destroy();

        if(vehicle.params.type == 'job') {
            const player = mp.players.toArray().find((user) => user === vehicle.params.user); 

            if(mp.players.at(player.id))
            {
                if(player.loggedInAs && player.jobVehicle === vehicle) {
                    sendMessage(player, 'ff8080', `(Job):!{#fff} Deoarece vehiculul tau de job a fost distrus ai fost scos automat de la munca.`); 
                    stopWorking(player); 
                }
            }   
        }

        if(vehicle.params.type == 'faction') { 
            const index = factionVehicles.findIndex(object => object.faction === vehicle.params.faction && vehicle === object.vehicle);

            setTimeout(() => {
 
                if(index != -1) { 
                    return createVehicle(null, JSON.stringify({model: factionVehicles[index].name, position: new mp.Vector3(factionVehicles[index].position.x, factionVehicles[index].position.y, factionVehicles[index].position.z), heading: factionVehicles[index].position.rotation, putIn: false, type: 'faction', faction: factionVehicles[index].faction, fuel: 100, locked: true, odometer: 0, color1: factionVehicles[index].color[0], color2: factionVehicles[index].color[1], number: 'Faction'})); 
                } 
            }, 1000); 
        }  

        if(vehicle.params.type == 'personal') { 
            destroyPersonalVehicle(vehicle);
        }
    }, 
});  
/*---------------------------------------------------------------------------------------------------------------------------------------------------------------*/
 
CommandRegistry.add({
    name: "createfveh",
       
    beforeRun: function (player) 
    {
        if(player.info.admin < 7)  
            return player.staffPerms(7);

        if(!player.vehicle)
            return sendNotiffication(player, 'info', 'You are not in a vehicle.');

        return true;
    },

    run: async function (player, _, model, faction)
    {  
        if(!model || !faction) 
            return sendUsage(player, '/createfveh [model] [faction]'); 

        let factionVehicleColors = 
        [   
            [255, 255, 255, 0, 0, 0], //lspd
            [255, 207, 32, 255, 207, 32], //taxi
            [128, 0, 0, 128, 0, 0], //hitman
            [37, 150, 190, 37, 150, 190], //aztecaz
            [0, 128, 43, 0, 128, 43], //grove
            [77, 77, 255, 77, 77, 255], //ballas
            [248, 164, 12, 248, 164, 12], //vagos
        ] 
             
        try {  
            let finalColor = [[  factionVehicleColors[faction - 1][0], factionVehicleColors[faction - 1][1], factionVehicleColors[faction - 1][2] ], [ factionVehicleColors[faction - 1][3], factionVehicleColors[faction - 1][4], factionVehicleColors[faction - 1][5] ] ]

            let position = { 
                x: player.vehicle.position.x.toFixed(3), 
                y: player.vehicle.position.y.toFixed(3), 
                z: player.vehicle.position.z.toFixed(3), 
                rotation: player.vehicle.rotation.z.toFixed(3) 
            };
 
            await FactionVehicles.create({ name: model, faction: faction, position: JSON.stringify(position), color: JSON.stringify(finalColor) });
  
            sendMessage(player, 'fff', `vehicle created ${finalColor}`);
        }
        catch(errors) { console.log(errors) }  
    }
});  