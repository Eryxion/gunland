 
var localPlayer = mp.players.local; 

var cefTipe = 0; 
global.enums = {};

global.rpc = require('./server-global/rpc/rage-rpc.min.js');
const date = new Date();   

var hourText = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' +  (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()); 
var hourDate = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '.' + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '.' + date.getFullYear();
    
enums.variables =
{
    afktime: 0,
    freeze: false,

    cuffed: false,
    logged: false,

    isInTurf: false,
}; 
 
mp.game.audio.startAudioScene("CHARACTER_CHANGE_IN_SKY_SCENE");
mp.game.vehicle.defaultEngineBehaviour = false;
   
require('./server-voice/index.js');
 
require('./server-global/attach_editor/index.js'); 
require('./server-global/nametag/index.js');
 
require('./server-global/server-admin/spectating.js');  
require('./server-global/mugshot/mugshot.js');  
require('./server-checkpoints/index.js') 

require('./server-global/server-radar/index.js');
require('./server-wars/index.js');
 
//NEW BROWSERS    
require('CEF/radialMenu/assets/js/index.js');

global.interfaceOpened = false;
global.globalBrowser = mp.browsers.new(cefTipe ? "http://localhost:8080/" : "package://browsers/public/index.html"); 

mp.gui.chat.show(false);  
globalBrowser.markAsChat();
 
require("./browsers/server-toasts/lib/script.js");
require('./browsers/online-players.js') 
require('./browsers/server-showroom.js');
require('./browsers/vehicle-radio.js');
require('./browsers/server-admin.js'); 
require('./browsers/server-hud.js');
require('./browsers/server-houses.js');
require('./browsers/server-profile.js');

require('./browsers/server-factions.js');
require('./browsers/server-groups/hitman.js'); 
require('./browsers/server-character.js'); 
require('./browsers/server-inventory.js'); 
require('./browsers/server-clothing.js'); 
require('./browsers/server-tatoo.js');
require('./browsers/server-banking.js'); 
require('./browsers/server-phone.js');
 
require('./browsers/server-business/server-store.js'); 
require('./browsers/server-business/server-petrol.js');
require('./browsers/server-business/server-market.js');
   
require('./browsers/server-jobs/index.js'); 
require('./browsers/server-jobs/trucker-job.js');

require('./browsers/server-auth.js');
require('./browsers/server-driving.js');

require('./browsers/server-chat.js');
require('./browsers/server-rob.js');

require('./browsers/server-trade.js');

require('./browsers/server-tunning.js');

require('./server-accounts/premium.js');

require('./server-global/server-admin/noclip.js');  
//require('./map-editor')
 
mp.game.vehicle.defaultEngineBehaviour = false;
localPlayer.setConfigFlag(241, true); //Disable Stopping Engine When Leave Vehicle
localPlayer.setConfigFlag(429, true); //Disable Starting Engine When Enter Vehicle
localPlayer.setConfigFlag(35, false); //Put On Motorcycle Helmet
 
mp.events.add({ 
    'playerEnterVehicle': (vehicle, seat) => {
        if(mp.players.local.getSeatIsTryingToEnter() !== -1 || vehicle.getIsEngineRunning()) 
        {
            return true;
        }

        vehicle.setEngineOn(false, false, false);
    },

    'client::server::setPlayerSprint': (toggle) => {
       return mp.game.invoke("0xA01B8075D8B92DF4", mp.players.local, toggle); 
    },
   
    "client::server::frezePlayer" : (toggle) => {
        return enums.variables.freeze = toggle; 
    },

    "client::server::playAnim" : (player, dict, name) => {
        return mp.players.local.playFacialAnim(dict, name);
    },

    "client::server::playSound" : (name, SetName) => {
        return mp.game.audio.playSoundFrontend(-1, name, SetName, false);
    },
 
    "client::server::playScenario" : (scenario) => {
        return mp.players.local.taskStartScenarioInPlace(scenario, 0, false);
    },

    "client::server::teleportWaypoint" : () =>
    {
        if(mp.game.invoke('0x1DD1F58F493F1DA5'))
        {
            let blipIterator = mp.game.invoke('0x186E5D252FA50E7D');
            let FirstInfoId = mp.game.invoke('0x1BEDE233E6CD2A1F', blipIterator);
            let NextInfoId = mp.game.invoke('0x14F96AA50D6FBEA7', blipIterator);

            for(let i = FirstInfoId; mp.game.invoke('0xA6DB27D19ECBB7DA', i) != 0; i = NextInfoId)
            {
                if(mp.game.invoke('0xBE9B0959FFD0779B', i) == 4)
                {
                    let oldpos = mp.players.local.position;
                    let coord = mp.game.ui.getBlipInfoIdCoord(i);
    
                    coord.z = mp.game.gameplay.getGroundZFor3dCoord(coord.x, coord.y, i * 50, 0, false);  

                    mp.players.local.position = coord;
                      
                    mp.players.local.freezePosition(true);

                    setTimeout(function ()
                    {  
                        let j = 0;
                        while (j <= 60 && coord.z == 0)
                        {  
                            coord.z = mp.game.gameplay.getGroundZFor3dCoord(coord.x, coord.y, i * 25, 0, false);
                            j++;
                        }
    
                        if(coord.z != 0)
                        {  
                            mp.players.local.position = coord;
                        }
                        else
                        {
                            mp.players.local.position = oldpos;
                            mp.gui.chat.push("Could not find elevation at waypoint position!");
                        }

                        mp.players.local.freezePosition(false);

                    }, 1500);
                }
            }
        }
    }  
}); 
   
mp.events.add('taskEnterVehicle', function (player, vehicle, seat) 
{   
    return player.taskEnterVehicle(vehicle.handle, 5000, seat, 2, 1, 0); 
});

const getLookingAtEntity2 = () => {
	 
    let position = radar.camera.getCoord();
    let direction = radar.camera.getDirection();
    let farAway = new mp.Vector3(direction.x * 120 + position.x, direction.y * 120 + position.y, direction.z * 120 + position.z);
    let object = mp.raycasting.testPointToPoint(position, farAway, [2]);
    
    if(object && object.entity.model) {
        if(object.entity.isAVehicle()) {
        
            return object.entity
        }
    } 
	return null;
}

mp.keys.bind(0x46, true, function() //KEY F FOR ENTER VEHICLE
{  
    if(mp.game.controls.isDisabledControlJustPressed(0, 23) && (!mp.players.local.isTypingInTextChat || !mp.gui.cursor.visible))
    { 
        const vehicle = getLookingAtEntity2();
  
        if(!localPlayer.vehicle && vehicle && vehicle.isAnySeatEmpty() && vehicle.getSpeed() < 5 && !vehicle.locked) 
        {  
            if(mp.game.gameplay.getDistanceBetweenCoords(localPlayer.position.x, localPlayer.position.y, localPlayer.position.z, vehicle.position.x, vehicle.position.y, vehicle.position.z, false).toFixed(2) > 3)
                return;
 
            const maxSeats = mp.game.vehicle.getVehicleModelMaxNumberOfPassengers(vehicle.getModel());

            for(let i = -1; i <= maxSeats; i++) {
                if(vehicle.isSeatFree(i)) 
                {  
                    mp.events.callRemote("VEHICLE:PLAYER-CALLED-ENTER-VEHICLE", vehicle, i, 'driver'); 
                    return true;
                }
            }
        }
    } 
});

mp.keys.bind(0x47, true, function() //KEY G FOR ENTER VEHICLE
{  
    if(mp.game.controls.isDisabledControlJustPressed(0, 58) && (!mp.players.local.isTypingInTextChat || !mp.gui.cursor.visible))
    {
        const vehicle = getLookingAtEntity2();
      
        if(!localPlayer.vehicle && vehicle && vehicle.isAnySeatEmpty() && vehicle.getSpeed() < 5 && !vehicle.locked) 
        {  
            if(mp.game.gameplay.getDistanceBetweenCoords(localPlayer.position.x, localPlayer.position.y, localPlayer.position.z, vehicle.position.x, vehicle.position.y, vehicle.position.z, false).toFixed(2) > 3)
                return;

            const maxSeats = mp.game.vehicle.getVehicleModelMaxNumberOfPassengers(vehicle.getModel());

            for(let i = 0; i <= maxSeats; i++) {
                if(vehicle.isSeatFree(i)) 
                {  
                    mp.events.callRemote("VEHICLE:PLAYER-CALLED-ENTER-VEHICLE", vehicle, i, 'passenger'); 
                    return true;
                }
            }
        }
    } 
});

mp.events.add('client::player:changeSafezone', function (status)
{ 
    localPlayer.setInvincible(status);
    globalBrowser.execute(`HudComponent.safezone=${status};`); 
});
 
mp.events.add('render', () => {   
    mp.game.audio.startAudioScene("CHARACTER_CHANGE_IN_SKY_SCENE");
 
    mp.game.controls.disableControlAction(0, 58, true); //block key G 
    mp.game.controls.disableControlAction(0, 23, true);	//block key F 
    mp.game.controls.disableControlAction(0, 23, true); // INPUT_ENTER
  
    if(enums.variables.logged && localPlayer.getVariable('inSafeZone') || (localPlayer.getVariable('playerHaveWar') && !enums.variables.isInTurf)) {
 
        localPlayer.setCanBeDamaged(false);

        mp.game.controls.disableControlAction(2, 24, true);
        mp.game.controls.disableControlAction(2, 69, true);
        mp.game.controls.disableControlAction(2, 70, true);
        mp.game.controls.disableControlAction(2, 92, true);
        mp.game.controls.disableControlAction(2, 114, true);
        mp.game.controls.disableControlAction(2, 121, true);
        mp.game.controls.disableControlAction(2, 140, true);
        mp.game.controls.disableControlAction(2, 141, true);
        mp.game.controls.disableControlAction(2, 142, true);
        mp.game.controls.disableControlAction(2, 257, true);
        mp.game.controls.disableControlAction(2, 263, true);
        mp.game.controls.disableControlAction(2, 264, true);
        mp.game.controls.disableControlAction(2, 331, true);
    }
    else { 
        localPlayer.setCanBeDamaged(true);
    }
 
    if(enums.variables.logged && enums.variables.freeze == true) {
        mp.game.controls.disableAllControlActions(0);
    }
  
    if(enums.variables.logged && localPlayer.getVariable('dlActivated')) {
        mp.vehicles.forEachInStreamRange((vehicle) => 
        { 
            if(localPlayer.position.subtract(vehicle.position).length() < 10)
            {
                const drawPosition = [vehicle.position.x, vehicle.position.y, vehicle.position.z + 0.3];
                mp.game.graphics.drawText(`~b~Id: ~w~${vehicle.remoteId}\n~b~Model: ~w~${mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(vehicle.model))}\n~b~Position: ~w~${vehicle.position.x.toFixed(2)}, ${vehicle.position.y.toFixed(2)}, ${vehicle.position.z.toFixed(2)}\n`, drawPosition, { font: 0, color: [255, 255, 255, 185], scale: [0.25, 0.25], outline: true, centre: false });
                mp.game.graphics.drawText(`\n\n\n~b~Heading: ~w~${vehicle.getHeading().toFixed(2)}\n~b~Health: ~w~${vehicle.getHealth()}`, drawPosition, { font: 0, color: [255, 255, 255, 185], scale: [0.25, 0.25], outline: true, centre: false });
            }
        }); 
    }  
    
    if(enums.variables.logged && mp.players.local.hasBeenDamagedByAnyPed()) {
        mp.players.forEachInStreamRange((player, id) => {
            if(player != mp.players.local) {
                if(mp.players.local.hasBeenDamagedBy(player.handle, true)) {
                    mp.events.callRemote("server::global:onPlayerDamage", player, mp.players.local.getLastDamageBone(0));
                    mp.players.local.clearLastDamage();
                    return;
                }
            }
        });

        mp.players.local.clearLastDamage();
    }
}); 
   
mp.events.add('client::faction:setFollow', function (toggle, entity, prime = false) 
{     
    if(prime) {
        enums.variables.cuffed = toggle;
    }
 
    if(toggle) 
    {
        if(entity && mp.players.exists(entity))
        {
            mp.players.local.taskFollowToOffsetOf(entity.handle, 0, -1, 0, 1.0, -1, 10.0, true); 
        }     
    }
    else
    {
        mp.players.local.clearTasks(); 
    }  
}); 
 
global.Calculate = function(secundeRamase)
{
    var minutes = Math.floor(secundeRamase / 60);
    var seconds = secundeRamase - (minutes * 60);
 
    return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
} 
 
rpc.register('IS_PLAYER_AFK', () => 
{
    return enums.variables.afktime;
});
 
rpc.register('GET_PLAYER_STREET', () => 
{
    const getStreet = mp.game.pathfind.getStreetNameAtCoord(localPlayer.position.x, localPlayer.position.y, localPlayer.position.z, 0, 0);  
    return mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
});


rpc.register('GET_VEHICLE_ACCELERATION', () => {
	 
    let vehicle = localPlayer.getVariable('vehicleCreated');
    let specific = { speed: mp.game.vehicle.getVehicleModelMaxSpeed(vehicle.model).toFixed(1), acceleration: mp.game.vehicle.getVehicleModelAcceleration(vehicle.model).toFixed(2), braking: mp.game.vehicle.getVehicleModelMaxBraking(vehicle.model).toFixed(1), traction: mp.game.vehicle.getVehicleModelMaxTraction(vehicle.model).toFixed(1)}
 
    return specific; 
});
 
setInterval(function() 
{  
    if(enums.variables.logged)
    {   
        if(localPlayer.getSpeed() < 1.7) {
            enums.variables.afktime ++;
        }
        else
        {
            if(enums.variables.afktime != 0) 
            {
                enums.variables.afktime = 0;
            }
        }
       
        if(showhud)
        {
            hourText = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' +  (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()); 
            hourDate = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '.' + ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '.' + date.getFullYear();

            globalBrowser.execute(`HudComponent.setTime(${JSON.stringify(hourText)}, ${JSON.stringify(hourDate)}, ${localPlayer.getVariable('payday')})`); 
        } 
   
        if(localPlayer.vehicle && localPlayer.vehicle.getPedInSeat(-1) === localPlayer.handle) 
        {
            let speed = localPlayer.vehicle.getSpeed();
            mp.events.callRemote('server::personal:calculateKM', (localPlayer, speed));
        }
    
        mp.game.invoke('0x9E4CFFF989258472');
        mp.game.invoke('0xF4F2C0D4EE209E20');
    
        mp.discord.update(localPlayer.name, 'SERVER RAGE:MP');
    }
     
}, 1000);

global.hideDashboard = function(toggle)
{   
    mp.game.ui.displayRadar(toggle);

    return globalBrowser.execute(`app.trigger("showHud", ${toggle});`);  
}

/*---------------------------------------------------------------[ATTACH SYNC]-----------------------------------------------------------------*/
var attachedObjects = [];
 
mp.events.add('attachObjectPula', attachObject);
   
function attachObject(player) 
{
    try 
    {
        if(player && mp.players.exists(player) && player.getVariable('attachedObjectID') != undefined) 
        {   
            let objectFinish = player.getVariable('attachedObjectID');
 
            if(attachedObjects[player.id] != undefined) 
            {
                attachedObjects[player.id].destroy();  
            }

            if(player.getVariable('attachedObject') == null) return;
            let data = JSON.parse(player.getVariable('attachedObject'));
            
            waitEntity(objectFinish).then(() => 
            {
                objectFinish.attachTo(player.handle, player.getBoneIndex(data.Bone), data.offsetX, data.offsetY, data.offsetZ, data.rotX, data.rotY, data.rotZ, true, false, false, false, 0, true);
                attachedObjects[player.id] = objectFinish;  
            }); 
        } 

        function waitEntity(entity)
        {
            return new Promise(resolve => { 
                let wait = setInterval(() => {
                    if(mp.game.entity.isAnEntity(entity.handle))
                    {
                        clearInterval(wait);
                        resolve();
                    }
                }, 500); 
            });
        }
    } 
    catch(e) { } 
}
  
mp.events.addDataHandler("attachedObjectID", (entity, value, oldValue) => {
 
    if(entity.type != 'player') return;
 
    if(attachedObjects[entity.id]?.handle !== 0) {
        attachObject(entity);
    } 
});
 
mp.events.add('entityStreamIn', function (entity) {
    try 
    {
        if(entity.type === 'player')
        {    
            attachObject(entity);  
		}   
    } 
    catch(e) { }
});  

mp.events.add('entityStreamOut', function (entity) {
    try 
    {
        if(entity.type != 'player') return;

        if(attachedObjects[entity.id] != undefined) 
        {
            attachedObjects[entity.id].destroy();
            attachedObjects[entity.id] = undefined;
        } 
    } 
    catch(e) { } 
});
 
const doors = [ 
    // Police    
    {id: 0, hash: 320433149,    locked: true, position: new mp.Vector3(434.7479, -983.2151, 30.83926)},  // Right
    {id: 1, hash: 3079744621,   locked: true, position: new mp.Vector3(434.7479, -980.6184, 30.83926)},  // Left asta nu se inchide 
    {id: 2, hash: -2023754432,  locked: true, position: new mp.Vector3(469.9679, -1014.452, 26.53623)},  // Right
    {id: 3, hash: -2023754432,  locked: true, position: new mp.Vector3(467.3716, -1014.452, 26.53623)},  // Left  
    {id: 4, hash: -340230128,   locked: true, position: new mp.Vector3(1749.196, 2467.823, 45.854)},  // Left  
]
 
doors.forEach((door) =>
{
    mp.game.object.doorControl(door.hash, door.position.x, door.position.y, door.position.z, door.locked, 0.0, 0.0, 0); 
});   