const randomColor = require('randomcolor'); 
const rpc = require('rage-rpc');
const { Op } = require("sequelize");
const month = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"]; 
   
const vehiclesData = ["impaler3", "monster4", "monster5", "slamvan6", "issi6", "cerberus2", "cerberus3", "deathbike2", "dominator6", "deathbike3", "impaler4", "slamvan4", "slamvan5", "brutus", "brutus2", "brutus3", "deathbike", "dominator4", "dominator5", "bruiser", "bruiser2", "bruiser3", "rcbandito", "italigto", "cerberus", "impaler2", "monster3", "tulip", "scarab", "scarab2", "scarab3", "issi4", "issi5", "clique", "deveste", "vamos", "imperator", "imperator2", "imperator3", "toros", "deviant", "schlagen", "impaler", "zr380", "zr3802", "zr3803", "dinghy", "dinghy2", "dinghy3", "dinghy4", "jetmax", "marquis", "seashark", "seashark2", "seashark3", "speeder", "speeder2", "squalo", "submersible", "submersible2", "suntrap", "toro", "toro2", "tropic", "tropic2", "tug", "benson", "biff", "hauler", "hauler2", "mule", "mule2", "mule3", "mule4", "packer", "phantom", "phantom2", "phantom3", "pounder", "pounder2", "stockade", "stockade3", "terbyte", "blista", "brioso", "dilettante", "dilettante2", "issi2", "panto", "prairie", "rhapsody", "cogcabrio", "exemplar", "f620", "felon", "felon2", "jackal", "oracle", "oracle2", "sentinel", "sentinel2", "windsor", "windsor2", "zion", "zion2", "bmx", "cruiser", "fixter", "scorcher", "tribike", "tribike2", "tribike3", "ambulance", "fbi", "fbi2", "firetruk", "lguard", "pbus", "police", "police2", "police3", "police4", "policeb", "polmav", "policeold1", "policeold2", "policet", "pranger", "predator", "riot", "riot2", "sheriff", "sheriff2", "akula", "annihilator", "buzzard", "buzzard2", "cargobob", "cargobob2", "cargobob3", "cargobob4", "frogger", "frogger2", "havok", "hunter", "maverick", "savage", "skylift", "supervolito", "supervolito2", "swift", "swift2", "valkyrie", "valkyrie2", "volatus", "bulldozer", "cutter", "dump", "flatbed", "guardian", "handler", "mixer", "mixer2", "rubble", "tiptruck", "tiptruck2", "apc", "barracks", "barracks2", "barracks3", "barrage", "chernobog", "crusader", "halftrack", "khanjali", "rhino", "thruster", "trailersmall2", "akuma", "avarus", "bagger", "bati", "bati2", "bf400", "carbonrs", "chimera", "cliffhanger", "daemon", "daemon2", "defiler", "diablous", "diablous2", "double", "enduro", "esskey", "faggio", "faggio2", "faggio3", "fcr", "fcr2", "gargoyle", "hakuchou", "hakuchou2", "hexer", "innovation", "lectro", "manchez", "nemesis", "nightblade", "oppressor", "oppressor2", "pcj", "ratbike", "ruffian", "sanchez2", "sanctus", "shotaro", "sovereign", "thrust", "vader", "vindicator", "vortex", "wolfsbane", "zombiea", "zombieb", "blade", "buccaneer", "buccaneer2", "chino", "chino2", "coquette3", "dominator", "dominator2", "dukes", "dukes2", "faction", "faction2", "faction3", "gauntlet", "gauntlet2", "hermes", "hotknife", "lurcher", "moonbeam", "moonbeam2", "nightshade", "pheonix", "picador", "ratloader", "ratloader2", "ruiner", "ruiner2", "ruiner3", "sabregt", "sabregt2", "slamvan", "slamvan2", "slamvan3", "stalion", "stalion2", "tampa", "tampa3", "vigero", "virgo", "virgo2", "virgo3", "voodoo", "voodoo2", "yosemite", "bfinjection", "bifta", "blazer", "blazer2", "blazer3", "blazer4", "blazer5", "bodhi2", "brawler", "dloader", "dubsta3", "dune", "dune2", "dune3", "dune4", "dune5", "freecrawler", "insurgent", "insurgent2", "insurgent3", "kalahari", "marshall", "mesa3", "monster", "menacer", "nightshark", "rancherxl", "rancherxl2", "rebel", "rebel2", "riata", "sandking", "sandking2", "technical", "technical2", "technical3", "trophytruck", "trophytruck2", "alphaz1", "avenger", "besra", "blimp", "blimp2", "blimp3", "bombushka", "cargoplane", "cuban800", "dodo", "duster", "howard", "hydra", "jet", "lazer", "luxor", "luxor2", "mammatus", "microlight", "miljet", "mogul", "molotok", "nimbus", "nokota", "pyro", "rogue", "seabreeze", "shamal", "starling", "strikeforce", "stunt", "titan", "tula", "velum", "velum2", "vestra", "volatol", "baller", "baller2", "baller3", "baller4", "baller5", "baller6", "bjxl", "cavalcade", "cavalcade2", "contender", "dubsta", "dubsta2", "fq2", "granger", "gresley", "habanero", "huntley", "landstalker", "mesa", "mesa2", "patriot", "patriot2", "radi", "rocoto", "seminole", "serrano", "xls", "xls2", "asea", "asea2", "asterope", "cog55", "cog552", "cognoscenti", "cognoscenti2", "emperor", "emperor2", "emperor3", "fugitive", "glendale", "ingot", "intruder", "limo2", "premier", "primo", "primo2", "regina", "romero", "schafter2", "schafter5", "schafter6", "stafford", "stanier", "stratum", "stretch", "superd", "surge", "tailgater", "warrener", "washington", "airbus", "brickade", "bus", "coach", "pbus2", "rallytruck", "rentalbus", "taxi", "tourbus", "trash", "trash2", "wastelander", "alpha", "banshee", "bestiagts", "blista2", "blista3", "buffalo", "buffalo2", "buffalo3", "carbonizzare", "comet2", "comet3", "comet4", "coquette", "elegy", "elegy2", "feltzer2", "furoregt", "fusilade", "futo", "jester", "jester2", "khamelion", "kuruma", "kuruma2", "lynx2", "massacro", "massacro2", "neon", "ninef", "ninef2", "omnis", "pariah", "penumbra", "raiden", "rapidgt", "rapidgt2", "raptor", "revolter", "ruston", "schafter3", "schafter4", "schwarzer", "sentinel3", "seven70", "specter", "specter2", "streiter", "sultan", "surano", "tampa2", "tropos", "verlierer2", "ardent", "btype", "btype2", "btype3", "casco", "cheetah2", "coquette2", "deluxo", "feltzer3", "gt500", "infernus2", "jb700", "mamba", "manana", "monroe", "peyote", "pigalle", "rapidgt3", "retinue", "savestra", "stinger", "stingergt", "stromberg", "swinger", "torero", "tornado", "tornado2", "tornado3", "tornado4", "tornado5", "tornado6", "turismo2", "viseris", "ztype", "adder", "autarch", "banshee2", "bullet", "cheetah", "cyclone", "entityxf", "fmj", "gp1", "infernus", "italigtb", "italigtb2", "le7b", "nero", "nero2", "osiris", "penetrator", "pfister811", "prototipo", "reaper", "sc1", "scramjet", "sheava", "sultanrs", "t20", "tempesta", "turismor", "tyrus", "vacca", "vagner", "vigilante", "visione", "voltic", "voltic2", "xa21", "zentorno", "armytanker", "armytrailer2", "baletrailer", "boattrailer", "cablecar", "docktrailer", "graintrailer", "proptrailer", "raketrailer", "tr2", "tr3", "tr4", "trflat", "tvtrailer", "tanker", "tanker2", "trailerlogs", "trailersmall", "trailers", "trailers2", "trailers3", "freight", "freightcar", "freightcont1", "freightcont2", "freightgrain", "tankercar", "airtug", "caddy", "caddy2", "caddy3", "docktug", "forklift", "mower", "ripley", "sadler", "sadler2", "scrap", "towtruck", "towtruck2", "tractor", "tractor2", "tractor3", "utillitruck", "utillitruck2", "utillitruck3", "bison", "bison2", "bison3", "bobcatxl", "boxville", "boxville2", "boxville3", "boxville4", "boxville5", "burrito", "burrito2", "burrito3", "burrito4", "burrito5", "camper", "gburrito", "gburrito2", "journey", "minivan", "minivan2", "paradise", "pony", "pony2", "rumpo", "rumpo2", "rumpo3", "speedo", "speedo2", "speedo4", "surfer", "surfer2", "taco", "youga", "youga2", "rs7c8", "bmwm4cs", "zx10r22", "senna"];
const weaponsData = ["weapon_dagger", "weapon_bat", "weapon_bottle", "weapon_crowbar", "weapon_unarmed", "weapon_flashlight", "weapon_golfclub", "weapon_hammer", "weapon_hatchet", "weapon_knuckle", "weapon_knife", "weapon_machete", "weapon_switchblade", "weapon_nightstick", "weapon_wrench", "weapon_battleaxe", "weapon_poolcue", "weapon_stone_hatchet", "weapon_pistol", "weapon_pistol_mk2", "weapon_combatpistol", "weapon_appistol", "weapon_stungun", "weapon_pistol50", "weapon_snspistol", "weapon_snspistol_mk2", "weapon_heavypistol", "weapon_vintagepistol", "weapon_flaregun", "weapon_marksmanpistol", "weapon_revolver", "weapon_revolver_mk2", "weapon_doubleaction", "weapon_raypistol", "weapon_microsmg", "weapon_smg", "weapon_smg_mk2", "weapon_assaultsmg", "weapon_combatpdw", "weapon_machinepistol", "weapon_minismg", "weapon_raycarbine", "weapon_pumpshotgun", "weapon_pumpshotgun_mk2", "weapon_sawnoffshotgun", "weapon_assaultshotgun", "weapon_bullpupshotgun", "weapon_musket", "weapon_heavyshotgun", "weapon_dbshotgun", "weapon_autoshotgun", "weapon_assaultrifle", "weapon_assaultrifle_mk2", "weapon_carbinerifle", "weapon_carbinerifle_mk2", "weapon_advancedrifle", "weapon_specialcarbine", "weapon_specialcarbine_mk2", "weapon_bullpuprifle", "weapon_bullpuprifle_mk2", "weapon_compactrifle", "weapon_mg", "weapon_combatmg", "weapon_combatmg_mk2", "weapon_gusenberg", "weapon_sniperrifle", "weapon_heavysniper", "weapon_heavysniper_mk2", "weapon_marksmanrifle", "weapon_marksmanrifle_mk2", "weapon_rpg", "weapon_grenadelauncher", "weapon_grenadelauncher_smoke", "weapon_minigun", "weapon_firework", "weapon_railgun", "weapon_hominglauncher", "weapon_compactlauncher", "weapon_rayminigun", "weapon_grenade", "weapon_bzgas", "weapon_molotov", "weapon_stickybomb", "weapon_proxmine", "weapon_snowball", "weapon_pipebomb", "weapon_ball", "weapon_smokegrenade", "weapon_flare", "weapon_petrolcan", "gadget_parachute", "weapon_fireextinguisher"]
const vehiclesWithoutEngines = ["bmx", "cruiser", "fixter", "scorcher", "tribike", "tribike2", "tribike3"]
const vehiclesMoto = ["akuma", "avarus", "bagger", "bati", "bati2", "bf400", "carbonrs", "chimera", "cliffhanger", "daemon", "daemon2", "defiler", "deathbike", "deathbike2", "deathbike3", "diablous", "diablous2", "double", "enduro", "esskey", "faggio", "faggio2", "faggio3", "fcr", "fcr2", "gargoyle", "hakuchou", "hakuchou2", "hexer", "innovation", "lectro", "manchez", "manchez3", "nemesis", "nightblade", "oppressor", "oppressor2", "pcj", "powersurge", "ratbike", "ruffian", "sanchez", "sanchez2", "sanctus", "shotaro", "sovereign", "thrust", "vader", "vindicator", "vortex", "wolfsbane", "zombiea", "zombieb", "manchez2", "zx10r22"]
    
global.COLOR_GLOBAL      = "ff4d4d"; 
global.COLOR_ADMIN       = "ffb84d";
global.COLOR_GREEN       = "00cc66";
global.COLOR_ERROR       = "669999";   
global.COLOR_RED         = "ff3333";

require('./modules/db.js');
  
require('./server-global/mugshot/mugshot.js');
require('./server-global/attach_editor/index.js'); 
   
require('./server-accounts/main.js');  
require('./server-accounts/commands.js');   
require('./server-accounts/premium/index.js');   

require('./server-staff/index.js');    
require('./server-dmv/index.js');  
require('./server-character/index.js');  
require('./server-chat/index.js'); 
  
require('./server-inventory/inventory.js'); 
require('./server-clothing/clothing.js');  
require('./server-tatoo/index.js');
 
require('./personal-vehicles/index.js'); 
require('./server-entity/index.js'); 
require('./server-profile/index.js');  
require('./server-phone/phone.js'); 
require('./daily-quests/index.js');
require('./server-safezones/index.js');
require('./server-achievements/index.js'); 
require('./server-rob/index.js'); 

require('./server-trade/index.js');

//require('./map-editor');
 
require('./server-showroom/index.js');

require('./server-factions/index.js'); 
require('./server-clans/index.js');

require('./server-banking/index.js');   
require('./server-jobs/index.js'); 
require('./server-business/index.js'); 
require('./server-houses/index.js'); 

require('./server-tunning/index.js');
require('./server-market/index.js');
 
mp.world.time.set(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
  
global.getDates = function() { 
    let date = new Date();
    let minutes = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    let hours = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());

    return date.getDate() + month[date.getMonth()] + date.getFullYear() + '[' + hours + ':' + minutes + ']'; 
}  
 
setInterval(() => { 

    let newDate = new Date();
 
    /*if(newDate.getHours() == 7 && newDate.getMinutes() == 0 && newDate.getSeconds() == 0) {
 
        setTimeout(() => {  
            let questsProgress = [0, 0];
            let quests = [null, null];
 
            Account.update({ quests: JSON.stringify(quests), questsProgress: JSON.stringify(questsProgress) }, { where: { id: { [Op.gt]: 0 }}});
            Account.update({ houseDays: sequelize.literal('houseDays - 1') }, { where: { houseDays: { [Op.gt]: 0 } }});
        }, 2000); 
    }

    initServerWar();*/
 
    mp.players.forEach(player => {

        if(mp.players.exists(player) && player.loggedInAs == true) {    
            if(player.rob.active && player.rob.time > 0)
            {
                player.rob.time --;

                if(player.rob.time == 0) {
                    player.call('client::rob:end', [false]);
                }

                player.call('client::rob:updateRobHud', [player.rob.time]);
            }

            if(player.info.jail > 0)
            {
                player.info.jail --;

                if(player.info.jail == 0) {
                    serverUnjailPlayer(player); 
                }
     
                player.call('client::hud:updateJail', [player.info.jail]);
            }

            if(player.info.newbieMute) {
                player.info.newbieMute --;
            } 

            if(player.info.wanted.level)
            {
                if(player.info.wanted.time > 0) {
                    player.info.wanted.time --;
                }

                if(player.info.wanted.time == 0) {
                    serverRemoveWanted(player);
                }
                  
                player.call('client::hud:edit', ['wanted', JSON.stringify(player.info.wanted)]);
            }

            if(player.info.payday > 0)
            {
                player.info.payday --; 
                player.setVariable('payday', player.info.payday);

                if(player.info.payday == 0)
                {
                    let experience = 300;
                    let money = getRandomArbitrary(1000, 3240).toFixed(0);
 
                    player.info.payday = 3600;
                    player.setVariable('payday', 3600);
 
                    playerGiveExperience(player, experience); 
                    player.giveMoney(0, money);  

                    playerPayTickets(player);

                    player.call('client::hud:showPayday', [JSON.stringify({ status: true, minutes: player.getVariable("save_hours"), money: money, experience: experience, interval: null })]);
                }
            }

            //Hours sistem
            rpc.callClient(player, 'IS_PLAYER_AFK').then((hours) => {
                if(hours <= 300) {
                    player.setVariable("save_hours", player.getVariable("save_hours") + 1); 
                }
            });

            if(player.haveFinding != false)
            {
                let user = player.haveFinding;

                player.call('client::checkpoint:findPlayer', [player, user.position.x, user.position.y, user.position.z]);

                player.call('client::hud:showFinding', [true, `${user.name} (distance: ${player.dist(user.position).toFixed(0)}m)`]);
            }
 
            if(newDate.getHours() == 7 && newDate.getMinutes() == 0 && newDate.getSeconds() == 0) { 
                setTimeout(() => { 

                    generateDailyQuest(player); 
 
                    if(player.info.houseDays)
                    {
                        player.info.houseDays --;
             
                        if(!player.info.houseDays) {
                            removeMemberFromHouse(player);   
                        }
                    }  
                }, 2000); 
            } 
        }    
    }); 
}, 1000);
 
setInterval(() => {

    mp.players.forEach(async player => {

        if(mp.players.exists(player) && player.loggedInAs == true) {      
            if(player.info.hungry > 0) { 
                player.info.hungry -= 0.5;

                //player.call('client::server::setPlayerSprint', [(player.info.hungry <= 50 ? false : true)]);
                player.call('client::hud:edit', ['hunger', player.info.hungry]);
            }

            if(player.info.thirst > 0) {
                player.info.thirst -= 0.5;
                
                //player.call('client::server::setPlayerSprint', [(player.info.thirst <= 50 ? false : true)]); 
                player.call('client::hud:edit', ['water', player.info.thirst]);
            }

            await Account.update({ thirst: player.info.thirst, hungry: player.info.hungry }, { where: { id: player.info.id }}); 
        }
    }); 
}, 60000);
 
//Vehicle
mp.events.add(
{ 
    "playerExitVehicle" : (player, vehicle) =>
    { 
        player.call('client::radio:exitVehicle', []);

        if(player.working && player.info.job == 1 && !player.courierObject && player.curierPoint != -1 && player.IsInRange(server_houses[player.curierPoint].position.x, server_houses[player.curierPoint].position.y, server_houses[player.curierPoint].position.z, 20)) {
            sendNotiffication(player, 'info', 'Go behind the car and get the package using key [E].', 'Courier:');
        }

        if(player.driving.status == true && player.schoolVehicle) 
        { 
            player.schoolVehicle.destroy();
            player.schoolVehicle = null;
 
            player.call('client::driving::destroyCheckpoint');
          
            player.driving = {
                status: false,
                stage: 0
            }
  
            sendNotiffication(player, 'info', 'Examen failed.');
            return;
        }

        vehicle.haveDriver = false;  
        vehicle.setVariable('engine', vehicle.engine); 
        vehicleJobTimer(player, vehicle, 0);  
    },

    "playerEnterVehicle" : (player, vehicle, seat) =>
    {  
        if(vehicle.getVariable('radioStation') && player.info.playerSettings.radio) {
            player.call('client::radio:enterVehicle', [vehicle.getVariable('radioStation'), player.info.playerSettings.radioVolume]);
        }
  
        if((!player.info.drivingLicence) && seat == 0 && player.driving.status == false) {  
            sendMessage(player, 'fff', `You don't have !{#ff0000}B!{#fff} type licence required to drive this vehicle.`); 
        }

        if(!player.info.motorbike && seat == 0 && player.driving.status == false && player.vehicleIsMoto(vehicle.params.model)) {  
            sendMessage(player, 'fff', `You don't have !{#ff0000}A!{#fff} type licence required to drive this vehicle.`); 
        }
 
        vehicleJobTimer(player, vehicle, 1);

        vehicle.engine = vehicle.getVariable('engine'); 
        vehicle.haveDriver = true;  
        player.seatBelt = false;
 
        if(vehicle.params.type === 'personal')
        {
            const user = vehicle.params.user;

            if(user.personalVeh.length) { 
                const index = user.personalVeh.findIndex(object => object.vehicle == vehicle);
              
                if(index != -1) { 
                    sendMessage(player, '8080ff', `(P):!{#fff} ${user.personalVeh[index].name} (vehicleID: ${vehicle.id}) - ${formatKM(user.personalVeh[index].odometer)} km - ${vehicle.locked ? 'locked' : 'unlocked'}`);
                }  
            }
        }

        vehicleClanMessage(player, vehicle, seat);
       
        return player.call('client::spedometer:showProps', [player.seatBelt, vehicle.engine, vehicle.locked]);
    },
 
    "server::vehicle:changeEngine" : (player) =>
    { 
        if(player.vehicle && !player.vehicleModelHaveEngine(player.vehicle.model)) 
        {  
            const veh = player.vehicle;  
            const actualGass = veh.getVariable('vehicleGass');
    
            if(!actualGass)  
                return sendNotiffication(player, 'info', 'You dont have fuel in this vehicle.');
             
            veh.engine = !veh.engine;
       
            sendNotiffication(player, 'info', `Vehicle engine ${(veh.engine) ? 'started' : 'stopped'}.`, 'Vehicle:');
    
            return player.call('client::spedometer:showProps', [player.seatBelt, veh.engine, veh.locked]);
        }
    },
 
    "server::vehicle:changeBelt" : (player) =>
    {
        if(player.vehicle)
        {
            player.seatBelt = !player.seatBelt;
       
            sendNotiffication(player, 'info', `You ${(player.seatBelt) ? ("put") : ("remove")} your seatbelt.`);
    
            return player.call('client::spedometer:showProps', [player.seatBelt, player.vehicle.engine, player.vehicle.locked]);
        }  
    },

    "server::vehicle:changeLock" : (player) =>
    {
        mp.vehicles.forEachInRange(player.position, 5, async (vehicle) => {

            if(vehicle.params.user === player)
            { 
                vehicle.locked = !vehicle.locked;
 
                if(vehicle.params.type === 'personal' && vehicle.params.user.personalVeh.length) { 
                    const user = vehicle.params.user;
                    const index = user.personalVeh.findIndex(object => object.vehicle == vehicle);
                
                    if(index != -1) {  
                        await PersonalVehicles.update({ locked: vehicle.locked }, { where: { id: user.personalVeh[index].id }});   
                    }  
                } 

                if(player.vehicle && player.seat == 0) { 
                    player.call('client::spedometer:showProps', [player.seatBelt, vehicle.engine, vehicle.locked]);
                }
 
                return sendNotiffication(player, 'info', `Your vehicle [${vehicle.id}] is now <b>${vehicle.locked ? '<a style = "color: #ff3333;">locked</a>' : '<a style = "color: #16a14e;">unlocked</a>'}</b>`)
            }  

            if(vehicle.params.type === 'clan') {
                lockClanVehicle(player, vehicle);
            }
        }); 
    },

    /*-------------------------------------------------------------------[GLOBAL]-------------------------------------------------------------------*/
    
    "playerJoin" : (player) => {   
        player.setVariable('attachedObject', null);

        player.call('server:authorization::start', [JSON.stringify({name: player.name, socialclub: player.socialClub, house: -1, faction: 0})]);
  
        freezePlayer(player, false);

        player.dimension = (player.id + 1); 
        player.position = new mp.Vector3(-61.349, -792.933, 44.225);
        player.heading = parseFloat(-41.017);   
 
        return console.log(`${player.name} has joined to server.`);
    },

    "playerQuit" : async (player, exitType, reason) => {
        if(mp.players.exists(player) && player.loggedInAs) 
        {   
            if(player.working) { 
                stopWorking(player);
            }
 
            if(helperQuestions.length) {
                const index = helperQuestions.findIndex(object => object.from === player.name);

                if(index != -1) {
                    helperQuestions.splice(index, 1);
                }
            }

            if(serverReports.length) {
                const index = serverReports.findIndex(object => object.from === player.name);

                if(index != -1) {
                    serverReports.splice(index, 1);
                }
            }
     
            if(player.driving.status == true) { 
                if(player.schoolVehicle) {
                    player.schoolVehicle.destroy();
                    player.data.schoolVehicle = null;
                }
     
                player.driving = { status: false, stage: 0, questions: false }
            }
       
            if(player.info.admin > 0) {
                sendAdmins(COLOR_ADMIN, 'staff', `(Quit BOT):!{fff} ${player.name} left server (reason: ${exitType}).`);
            } 
 
            await Account.update({ status: 0, jail: player.info.jail, newbieMute: player.info.newbieMute, payday: player.info.payday, hours: player.info.hours + player.getVariable("save_hours"), wanted: player.info.wanted, thirst: player.info.thirst, hungry: player.info.hungry }, { where: { id: player.info.id }}); 
        } 
    } 
    /*----------------------------------------------------------------------------------------------------------------------------------------------*/
}); 
  
mp.events.add(
{
    "spawnPlayer" : (player) =>
    {
        if(player.info.jail) {
            return serverPlayerJail(player);
        }

        player.spawn(new mp.Vector3(-61.349, -792.933, 44.225)); 
        player.heading = parseFloat(-41.017);    
        player.health = 100;
        player.dimension = 0;
        player.houseInt = null; 
    },

    "sendSpawnToServer" : (player) => {
        return mp.events.call("spawnPlayer", player);  
    },

    "playerDeath" : (player, reason, killer) =>
    {
        if(isGangGroup(player.info.group) && serverFactions[player.info.group - 1].haveWar != null) {
            const group = player.info.group - 1;
 
            player.spawn(new mp.Vector3(factionSpawns[group].x, factionSpawns[group].y, factionSpawns[group].z)); 
            player.heading = factionSpawns[group].heading;    
            player.dimension = serverFactions[group].id;
 
            player.giveWeapon(mp.joaat('weapon_pistol50'), 250);
            player.giveWeapon(mp.joaat('weapon_pumpshotgun_mk2'), 250);
            player.giveWeapon(mp.joaat('weapon_carbinerifle'), 250);    
            return;
        }

        if(player.working) { 
            stopWorking(player);
        }

        if(killer != undefined && killer != player) {  
            if(killer.info.group == 1 || (killer.info.group == 3 && killer.haveTarget && killer.haveTargetIs == player)) {
                createCrime(player, killer.name, reason);
            }    
        } 

        return mp.events.call("spawnPlayer", player, -1);  
    }
});

mp.events.add("loadVariables", player => {

    player.free = { user: null, price: 0 };
  
    player.clanInvitation = false;
    player.clanInvitationID = null;

    player.setVariable('clanColor', null);
    player.setVariable('clanName', null);
    player.setVariable('clanTag', null);
    player.setVariable('clan', null);

    player.crime = { killer: undefined, reason: 'reason', date: '', location: '' } 
    player.driving = { status: false, stage: 0, questions: false } 
    player.taxi = { haveCommand: false, location: 'none', price: 0 } 
    player.callData = { caller: 0, receiver: 0, input: '', time: 0, status: 'no call' } 
 
    player.setVariable('attachedObject', null);
    player.setVariable('haveTarget', false);

    player.jail = 0;

    player.inHouse = false;
    player.inHouseID = null; 
    player.inHouseMenu = false; 
    player.helperDuty = false;
    player.requestTaken = -1;

    player.haveFinding = false; 
    player.haveTarget = false; 
    player.inFactionRange = null;

    player.jobInterracted = -1;
    player.working = false;
    player.inDealer = false;
    player.vehicleSelected = false;
    player.inStationColshape = -1; 
    player.inAnimation = false;  
    player.waipoint = null; 

    player.factionDuty = false;

    player.lastPosition = player.position;
    player.atJobPosition = 0;
    player.ElectricPoint = null;
    player.atWorkPosition = 0;
    player.atBusinessPosition = -1; 
    player.seatBelt = false;
    player.loggedInAs = false;
    player.fishing = false;
 
    player.houseInt = null
    player.atHouseExit = 0;
    player.atHouseEnter = 0;
  
    player.chatOption = 'local'; 
    player.fishData = {}

    player.atBankingPosition = -1;

    player.courseSelected = null;
  
    player.setVariable('dlActivated', 0); 
    player.setVariable('playerFind', -1);
 
    player.pushChat = (color, clasa, message) => {  
        return player.call('SendToChat', [message, color, clasa]);
    };

    player.giveMoney = async (type, amount) => { 

        //TYPE 0 - GIVE MONEY
        //TYPE 1 - REMOVE MONEY
        //TYPE 2 - SET MONEY
  
        player.info.money = (type == 0 ? (player.info.money + parseInt(amount)) : type == 1 ? (player.info.money - parseInt(amount)) : (parseInt(amount))); 
          
        await Account.update({ money: player.info.money }, { where: { id: player.info.id } } ); 
 
        return player.call("client::hud:editMoney", [player.info.money, player.info.bank]);
    };   
    
    player.giveMoneyBank = async (type, amount) => { 

        //TYPE 0 - GIVE MONEY
        //TYPE 1 - REMOVE MONEY 
        //TYPE 2 - SET MONEY 
  
        player.info.bank = (type == 0) ? (player.info.bank + parseInt(amount)) : type == 1 ? (player.info.bank - parseInt(amount)) : (parseInt(amount));
         
        await Account.update({ bank: player.info.bank }, { where: { id: player.info.id } } ); 
        
        return player.call("client::hud:editMoney", [player.info.money, player.info.bank]);
    };  
  
    player.staffPerms = (level) => { 

        if(player.info.admin == 0)
            return sendMessage(player, 'ff3300', `(Permission):!{#fff} You are not part of the staff.`);

        if(player.info.admin < level)
            return sendMessage(player, 'ff3300', `(Permission):!{#fff} You are not a level (!{#ff3300}${level}!{#fff}) administrator.`); 
    };
 
    player.vehicleValid = (name) => {  
        return (vehiclesData.includes(name) ? (true) : (false)); 
    };

    player.vehicleModelHaveEngine = (name) => {  
        return (vehiclesWithoutEngines.includes(name) ? (true) : (false)); 
    };

    player.vehicleIsMoto = (name) => {
        return (vehiclesMoto.includes(name) ? (true) : (false)); 
    };

    player.vehicleModel = (vehicle) => { 
        return vehicle.params.model; 
    };

    player.vehicleOwner = (vehicle) => { 
        return vehicle.params.user; 
    };
 
    player.allWeapons = () => { 
        for(let x = 0; x < weaponsData.length; x ++)
        {
            return weaponsData[x];
        } 
    };

    player.getGender = (gender) => { 
        return (gender == 0 ? ('male') : ('female')); 
    };  

    player.respawnMyself = () => {
        return mp.events.call("spawnPlayer", player); 
    }; 

    player.IsInRange = (x, y, z, range) => {  
        return (player.dist(new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z))) < parseInt(range)) ? (true) : (false); 
    };    
});    
 
//Global functions
global.sendNotiffication = function(player, type, text, title = 'Notify:')
{  
    return player.call('client::hud:sendNotify', [type, text, title]); 
} 
 
global.generateRGB = function() 
{
	let color = randomColor({ luminosity: 'bright', format: 'rgb' });
	color = color.replace("rgb(", "");
	color = color.replace(")", "");
	color = color.replace(" ", "");
	color = color.split(",");
	return color; 
} 

global.setPlayerCheckpoint = function(player, x, y, z, job = null, scale = 2)
{ 
    return player.call('client::checkpoint:mark', [player, x, y, z, job, scale]); 
} 

global.destroyPlayerCheckpoint = function(player)
{ 
    return player.call('client::checkpoint:destroy', []); 
} 
 
global.getNameOnNameID = function(playerNameOrPlayerId) 
{
    if(playerNameOrPlayerId == parseInt(playerNameOrPlayerId)) return mp.players.at(playerNameOrPlayerId);
    else
    {
        let foundPlayer = null;
        mp.players.forEach((rageMpPlayer) => {
            if(rageMpPlayer.name.toLowerCase().startsWith(playerNameOrPlayerId.toLowerCase())) 
            {
                foundPlayer = rageMpPlayer;
                return;
            }
        });
        return foundPlayer;
    }
}  
  
global.createVehicle = function(player = null, data)
{  
    let raw = JSON.parse(data);
 
    const vehicle = mp.vehicles.new(mp.joaat(raw.model), new mp.Vector3(parseFloat(raw.position.x), parseFloat(raw.position.y), parseFloat(raw.position.z)),
    {     
        color: [raw.color1, raw.color2],
        locked: raw.locked,
        engine: false,
        dimension: (player == null ? 0 : player.dimension),
        type: 'Vehicle', 
        heading: parseFloat(raw.heading),
        numberPlate: raw.number
    });
 
    vehicle.setColorRGB(raw.color1[0], raw.color1[1], raw.color1[2], raw.color2[0], raw.color2[1], raw.color2[2]);
  
    vehicle.params = {
        model: raw.model, 
        user : (player == null ? raw.type : player), 
        type: raw.type, 
        faction: raw.faction, 
        spawn: raw.position, 
        rotation: vehicle.rotation
    }
  
    if(raw.putIn == 1 && player != null) {
        player.putIntoVehicle(vehicle, 0); 
    }
       
    vehicle.setVariable('engine', false);
    vehicle.setVariable('vehicleGass', raw.fuel);   
    vehicle.setVariable('radioStation', 0);
    vehicle.setVariable('vehicleOdometer', raw.odometer); 
    return vehicle;
} 

mp.events.add("server::players:open", (player) => {  
  
    let object = [];
 
    mp.players.forEach(users => 
    {
        if(users.loggedInAs) {    
            object.push({ name: users.name, connected: users.getVariable("save_hours"), level: users.info.level, admin: users.info.admin, helper: users.info.helper, rank: users.info.groupRank, faction: (users.info.group ? serverFactions[users.info.group - 1].name : 'Civilian'), job: (users.info.group ? serverJobs[player.info.job - 1].name : 'None'), image: users.info.photo});
        }   
    });   

    return player.call('client::players:open', [JSON.stringify({name: player.name, admin: player.info.admin, helper: player.info.helper, level: player.info.level, faction: (player.info.group ? serverFactions[player.info.group - 1].name : 'Civilian'), job: (player.info.job ? serverJobs[player.info.job - 1].name : 'None'), image: player.info.photo}), JSON.stringify(object)]); 
});   


mp.events.add("VEHICLE:PLAYER-CALLED-ENTER-VEHICLE", (player, vehicle, seat, option = 'driver') => 
{    
    if(player.createdObject != null || player.createdObject != undefined) 
        return; 
 
    if(vehicle.params.type === 'faction' && vehicle.params.faction != null && player.info.group != vehicle.params.faction && option == 'driver')
        return;
 
    if(vehicle.params.type === 'job' && vehicle != player.jobVehicle)
        return;
 
    return player.call('taskEnterVehicle', [player, vehicle, seat]);
});      


/*


	*meniu pe tasta M 
	- nu se actualizeaza licentele ✅
	- locatia la casa nu se pune care trebuie, te da la drq ✅ 

	*pe tasta F9 ai meniu de la PD, eu nu sunt in pd si il pot accesa ✅
	*la case apare : owner by eryxion la toate casele :)) ✅ 
	*nu poti descuia mereu masina personala din exterior(din interior merge doar daca o pornesti si o opresti ca sa se actualizeze) ✅
 	*cum adaug muzica la youtube music ✅
	*Shop cu puncte premium:  ✅
		- utilizator premium sa aiba 1-2 beneficii restul le mai facem cu timpul(mai multi banii la job, sa te tina mancarea mai mult sau ceva cacat de genu)
		- sa poti cumpara banii
	rezolvate sagetile la chat ✅ 
	*la pescar nu iti da o undita si momeala cand iei job(sau cum se procedeaza daca poti explica te rog) ✅ 
	*la DS daca se poate face o categorie cu puncte premium de masini, sa pot adauga masini personalizate ✅ 

	*la ds nu apar imaginile cu masini, cred ca lipsesc dar nu am primit nimic ca eroare 
	*hainele de la inceput nu se salveaza sau nu ti le da, cand iti creezi caracterul nu ai un tricou pe tine :)) 
	*la job uneori iti da cutie in mana alteori nu 
*/