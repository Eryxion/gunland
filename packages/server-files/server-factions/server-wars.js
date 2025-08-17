const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc");

global.serverTurfs = [];
global.serverWars = [];
  
global.Turfs = sequelize.define('server-turfs', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: null,
        autoIncrement: true
    }, 
    
    faction: DataTypes.INTEGER, 
   
    position: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({x: 0, y: 0, z: 0}) 
    }

}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'server-turfs' }); 
 
global.loadServerTurfs = async function() {
 
    let count = 0;
 
    await Turfs.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
                let turfPosition = JSON.parse(element.position); 
                
                serverTurfs[count] = { 
                    id: element.id, 
                    faction: element.faction,
                    position: turfPosition 
                };
 
                mp.colshapes.newCircle(turfPosition.x, turfPosition.y, 51, 0).inWarColshape = count + 1; 

                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded turfs: ' + serverTurfs.length);

    }).catch((e) => console.log(e)); 
};
 
//Vehicle
mp.events.add({ 
    "playerJoin" : (player) =>
    {  
        player.haveWar = false;
        player.showTurfs = false; 

        player.onTurf = null;
        player.shapeTurf = null;

        player.warBlip = null; 
        player.warKills = 0;
        player.warDeaths = 0;
        player.warAssists = 0;
        player.warSeconds = 0; 

        player.setVariable('playerHaveWar', false);
 
        setTimeout(() => {  
            if(mp.players.exists(player) && player.loggedInAs) {
                player.call('client::wars:unlodTurfs', []) 
            } 
        }, 2000); 
    },

    "playerEnterColshape" : (player, shape) => 
    {
        if(shape.inWarColshape)
        {
            player.onTurf = shape.inWarColshape;
            player.shapeTurf = shape; 
        }
    },

    "playerExitColshape" : (player, shape) => 
    {
        if(shape.inWarColshape)
        { 
            player.onTurf = null; 
        }
    }
});

global.isGangGroup = function(group)
{
    if(group == 4 || group == 5 || group == 6 || group == 7)
        return true;

    return false;
}
 
global.isPlayerInTurf = function(player, turf)
{
    let position = player.position;

    if(position.x < serverTurfs[turf].position.x && position.y < serverTurfs[turf].position.y) 
        return true;

    return false;
};
 
CommandRegistry.add({
    name: "attack", 
         
    beforeRun: function (player) 
    {
        if(!player.info.group)
            return sendNotiffication(player, 'error', 'You are not in a group.');

        if(!isGangGroup(player.info.group))
            return sendNotiffication(player, 'error', 'You are not in a gang group.');

        if(player.onTurf == null)
            return sendNotiffication(player, 'error', 'You are not on turf.');
 
        return true;
    },
    run: function (player) 
    { 
        const 
            turf = player.onTurf,
            attackers = player.info.group,
            defenders = serverTurfs[player.onTurf - 1].faction;
  
        if(defenders == player.info.group)
            return sendNotiffication(player, 'error', 'You cannot attack your own territory.'); 

        if(serverFactions[defenders - 1].haveWar)
            return sendNotiffication(player, 'error', 'This gang already have a war.'); 

        serverWars.push({ 
            attackers: attackers, 
            attackersScore: 0, 
            defenders: defenders, 
            defendersScore: 0, 
            time: 120, 
            turf: turf,

            showWarStats: false,
            members: [],

            colshape: mp.colshapes.newCircle(serverTurfs[turf - 1].position.x, serverTurfs[turf - 1].position.y, 51, turf)
        });

        serverFactions[attackers - 1].haveWar = true;
        serverFactions[defenders - 1].haveWar = true;

        setVehiclesVirtualWorld(attackers, defenders, turf); 
 
        mp.players.forEach(user => {
    
            if(user.loggedInAs == true && (user.info.group == player.info.group || user.info.group == defenders)) {
                if(user.factionDuty && user.dimension == 0) { 
                    user.dimension = turf; 
                }
 
                user.warKills = 0;
                user.warDeaths = 0;
                user.warAssists = 0;
                user.warSeconds = 0; 

                user.showTurfs = true;
                user.haveWar = true;

                user.call('client::wars:loadTurfs', [JSON.stringify(serverTurfs)]);  
                user.call('client::wars:flashTurf', [JSON.stringify(serverTurfs[turf - 1].position), (turf - 1), true, factionsBlipColor[attackers - 1], factionsBlipColor[defenders - 1]]); 
            }
        });
  
        sendGroup(player.info.group, 'de1414', `[WAR]:<a style="color:white;"> ${player.name} from your group attacked turf #${turf} owned by ${serverFactions[defenders - 1].name}`, 'local');
        sendGroup(defenders, 'de1414FF', `[WAR]:<a style="color:white;"> ${player.name} from group ${serverFactions[player.info.group - 1].name} attacked turf #${turf} owned by you.`, 'local');
    }
});
  
global.isInTurfZone = function(player) { 

    if(serverWars.length) {
        let index = serverWars.findIndex(object => object.attackers == player.info.group || object.defenders == player.info.group && player.loggedInAs);  

        if(index != -1) {
            return serverWars[index].colshape.isPointWithin(player.position);
        }
    } 
    return false;
};

rpc.register('CLIENT_IS_IN_TURF', (_, user) =>  { 

    let player = user.player;

    return isInTurfZone(player);
});
  
function formatMinutesSeconds(s) {
    return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s
};
 
global.serverStopWar = async function(element) 
{  
    let indexWar = serverWars.findIndex(object => object.attackers == element.attackers || object.defenders == element.defenders);  
  
    if(indexWar != -1 && serverWars[indexWar].time == 0) {

        let attScore = serverWars[indexWar].attackersScore;
        let deffScore = serverWars[indexWar].defendersScore;
 
        serverFactions[serverWars[indexWar].attackers - 1].haveWar = false;
        serverFactions[serverWars[indexWar].defenders - 1].haveWar = false;
 
        if((attScore > deffScore) || (deffScore > attScore)) { 
            sendGroup(serverWars[indexWar].defenders, '85adad', `[WAR]: Your gang ${(attScore > deffScore) ? 'lost' : 'win'} this war.`, 'local');  
            sendGroup(serverWars[indexWar].attackers, '85adad', `[WAR]: Your gang ${(deffScore > attScore) ? 'lost' : 'win'} this war.`, 'local');   
        }
        else 
        {
            sendGroup(serverWars[indexWar].defenders, '85adad', `[WAR]: ${serverFactions[serverWars[indexWar].defenders - 1].name} defended against ${serverFactions[serverWars[indexWar].attackers - 1].name} and kept ownership of turf #${serverWars[indexWar].turf}.`, 'local'); 
            sendGroup(serverWars[indexWar].defenders, '85adad', `[WAR]: ${serverFactions[serverWars[indexWar].defenders - 1].name} defended against ${serverFactions[serverWars[indexWar].attackers - 1].name} and kept ownership of turf #${serverWars[indexWar].turf}.`, 'local'); 
        }

        serverTurfs[serverWars[indexWar].turf - 1].faction = (attScore > deffScore ? serverWars[indexWar].attackers : serverWars[indexWar].defenders)
    
        await Turfs.update({ faction: serverTurfs[serverWars[indexWar].turf - 1].faction }, { where: { id: serverTurfs[serverWars[indexWar].turf - 1].id }}); 
  
        mp.players.forEach(user => {
        
            if(user.loggedInAs == true && isGangGroup(user.info.group)) 
            {    
                if((serverWars[indexWar].attackers == user.info.group || serverWars[indexWar].defenders == user.info.group) && serverWars[indexWar].time == 0) {
 
                    let personalScore = ((user.warKills + user.warAssists) - user.warDeaths);
 
                    if(user.dimension != user.info.group) {
                        user.dimension = 0;
                    }

                    serverWars[indexWar].members.push({name: user.name, kills: user.warKills, deaths: user.warDeaths, assists: user.warAssists, group: serverFactions[user.info.group - 1].name, time: user.warSeconds, photo: user.info.photo})
       
                    sendMessage(user, 'fff', `-------------------------------------------------------------`);  
                    sendMessage(user, '85adad', `[WAR]: Your personal score: ${personalScore} (${user.warKills} kills, ${user.warAssists} assists, ${user.warDeaths} deaths).`); 
                    sendMessage(user, '85adad', `[WAR]: Your played ${formatMinutesSeconds(user.warSeconds)} on this war.`);  
                    sendMessage(user, 'ffcc00', `[WAR]: You were moved to a normal virtual world.`);  
                    sendMessage(user, 'fff', `-------------------------------------------------------------`);  

                    updateBlipFunction(user, 'delete');
                    user.call('client::wars:unlodTurfs', []);
                    
                    user.showTurfs = false;
                    user.setVariable('playerHaveWar', false);
 
                    showPlayerCursor(user, true);
                    rpc.callBrowsers(mp.players.at(user.id), 'showWarHud', [
                        JSON.stringify({ 
                            war: { 
                                status: false, attackers: serverFactions[serverWars[indexWar].attackers - 1].name, attackersScore: attScore, defenders: serverFactions[serverWars[indexWar].defenders - 1].name, defendersScore: deffScore, time: 0,
 
                                showWarStats: true,
                                members: serverWars[indexWar].members
                            }, 
                            userWar: { kills: user.warKills, deaths: user.warDeaths, assists: user.warAssists, time: user.warSeconds } 
                        })
                    ]);  

                    setTimeout(() => {
                        showPlayerCursor(user, false);
                        rpc.callBrowsers(mp.players.at(user.id), 'showWarHud', [
                            JSON.stringify({ war: { status: false, attackers: '', attackersScore: 0, defenders: '', defendersScore: 0, time: 0, showWarStats: false, members: [] }, userWar: { kills: 0, deaths: 0, assists: 0, time: 0 }})
                        ]);
                    }, 15000);
                }
            }
        });
  
        if(indexWar != -1) { 
            resetVehiclesVirtualWorld(serverWars[indexWar].attackers, serverWars[indexWar].defenders);

            serverWars[indexWar].colshape.destroy(); 
            serverWars.splice(indexWar, 1);  
        }
    }
};
 
mp.events.add('entityStreamIn', (entity) => {
     
    if(entity.type == "player") { 
        sendMessage(entity, 'fff', `${entity.name} este in stream acum.`); 
    }
});

global.setVehiclesVirtualWorld = function(attackers, defenders, dimension)
{  
    for(let x = 0; x < factionVehicles.length; x++)
    {
        if((factionVehicles[x].faction == attackers || factionVehicles[x].faction == defenders) && factionVehicles[x].vehicle != null) {
            factionVehicles[x].vehicle.dimension = dimension; 
        } 
    }
};

global.resetVehiclesVirtualWorld = function(attackers, defenders)
{  
    for(let x = 0; x < factionVehicles.length; x++)
    {
        if((factionVehicles[x].faction == attackers || factionVehicles[x].faction == defenders) && factionVehicles[x].vehicle != null) {
            factionVehicles[x].vehicle.dimension = 0;

            if(!factionVehicles[x].vehicle.getOccupants().length) { 
                factionVehicles[x].vehicle.position = factionVehicles[x].vehicle.params.spawn;
                factionVehicles[x].vehicle.rotation = factionVehicles[x].vehicle.params.rotation; 
            } 
        } 
    }
};
 
global.initServerWar = function() 
{  
    serverWars.forEach(element => {

        if(element.time > 0) {
            element.time --; 

            if(element.time == 0) { 
                return serverStopWar(element);
            }
        }  
    });

    mp.players.forEach(user => {
    
        if(user.loggedInAs == true && isGangGroup(user.info.group)) {   
            const index = serverWars.findIndex(object => object.attackers === user.info.group || object.defenders == user.info.group);  
  
            if(index != -1 && serverWars[index].time > 0) { 
                  
                if(user.dimension == 0) {
                    user.dimension = serverWars[index].turf; 
                }
 
                if(isInTurfZone(user)) {
                    user.warSeconds ++;
                }
                 
                if(user.warBlip == null) { 
                    updateBlipFunction(user, 'create');
                }
    
                if(user.warBlip != null) { 
                    user.warBlip.position = user.position;
                    user.warBlip.dimension = user.dimension;
                } 

                user.setVariable('playerHaveWar', true);
                let warString = {
                    status: true, 
        
                    attackers: serverFactions[serverWars[index].attackers - 1].name,
                    attackersScore: serverWars[index].attackersScore,
        
                    defenders: serverFactions[serverWars[index].defenders - 1].name,
                    defendersScore: serverWars[index].defendersScore,
                    time: serverWars[index].time,

                    showWarStats: false,
                    members: []
                };
         
                rpc.callBrowsers(mp.players.at(user.id), 'showWarHud', [
                    JSON.stringify({
                        war: warString, 
                        userWar: { kills: user.warKills, deaths: user.warDeaths, assists: user.warAssists, time: user.warSeconds }
                    }) 
                ]); 
            } 
        }
    }); 
};

mp.events.add("playerDeath", async (player, reason, killer) => {
    if(killer != undefined && player.loggedInAs && killer.loggedInAs && killer != player) {

        const index = serverWars.findIndex(object => object.attackers === killer.info.group || object.defenders == killer.info.group);  
        let weapon = await rpc.callClient(killer, 'GET_PLAYER_WEAPON');

        killer.warKills ++;
        player.warDeaths ++;
  
        sendMessage(killer, '85adad', `You killed ${player.name} ${(weapon != 'punch' ? `using ${weapon}`: '')} (distance: ${player.dist(killer.position).toFixed(0)}m)`);
  
        if(index != -1 && killer.group == serverWars[index].attackers) {
            serverWars[index].attackersScore ++;
        }
        
        if(index != -1 && killer.group == serverWars[index].defenders) {
            serverWars[index].defendersScore ++;
        } 

        player.removeAllWeapons();
    } 
});

CommandRegistry.add({
    name: "pulsescore",
       
    run: function (player)
    { 
        const index = serverWars.findIndex(object => object.attackers === player.info.group || object.defenders == player.info.group);  

        if(index != -1) {

            player.warKills ++;

            if(player.info.group == serverWars[index].attackers) {
                serverWars[index].attackersScore ++;
            }
            
            if(player.info.group == serverWars[index].defenders) {
                serverWars[index].defendersScore ++;
            } 
        }
    }
}); 
 
CommandRegistry.add({
    name: "wars",
       
    run: async function (player)
    { 
        if(!serverWars.length)
            return sendNotiffication(player, 'info', 'There are currently no active wars.');
 
        sendMessage(player, 'fff', '-------------------------------------------------------------');  

        serverWars.forEach(element => {
            sendMessage(player, '85adad', `${serverFactions[element.attackers - 1].name} - ${serverFactions[element.defenders - 1].name} [${element.attackersScore} - ${element.defendersScore}] / (turf: #${element.turf}).`);  
        });

        sendMessage(player, 'fff', '-------------------------------------------------------------');  
    }
}); 
 
CommandRegistry.add({
    name: "turfs",
       
    run: function (player)
    {
       player.showTurfs = !player.showTurfs;
 
       sendNotiffication(player, 'success', `Server turfs is now ${player.showTurfs ? 'enabled' : 'disabled'}.`);

       return player.call(player.showTurfs ? 'client::wars:loadTurfs' : 'client::wars:unlodTurfs', [JSON.stringify(serverTurfs)]);
    }
});  

mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    sendMessage(player, 'fff', `${targetPosition} | ${targetEntity}`);
});
 
global.updateBlipFunction = function(player, status)
{
    if(player.warBlip == null && status === 'create')
    {
        player.warBlip = mp.blips.new(1, player.position, { 
            name: 'muie',
            color: factionsBlipColor[player.info.group - 1],
            shortRange: true,
            drawDistance: 20,
            dimension: player.dimension
        }); 
    }
 
    if(player.warBlip != null && status == 'delete')
    {
        player.warBlip.destroy();
        player.warBlip = null; 
    }
}