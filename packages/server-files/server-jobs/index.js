const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc");
 
global.COLOR_JOB = "6666ff";
global.JOB_EVENTS = 
[   
    'server::job:courier:start',
    'server::job:fisherman:start',
    'server::job:electrician:start', 
    'server::job:trucker:start'
];
 
require("./fisherman-job/index.js"); 
require("./electrician-job/index.js"); 
require("./trucker-job/index.js");
require("./courier-job/index.js");
     
global.Jobs = sequelize.define('server-jobs', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: null,
        autoIncrement: true
    }, 
   
    name: DataTypes.STRING, 
    level: DataTypes.INTEGER,
    ped: DataTypes.STRING,
    jobPos: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({
            x: 0, y: 0, z: 0, heading: 0 
        }) 
    },
    jobWork: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({
            x: 0, y: 0, z: 0 
        }) 
    } 
}, { timestamps: false });  
 
global.loadServerJobs = async function() {

    global.serverJobs = [];
    let count = 0;
 
    await Jobs.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
                let jobPos = JSON.parse(element.jobPos);
                let jobWork = JSON.parse(element.jobWork);  
                
                serverJobs[count] = { 
                    id: element.id,
                    name: element.name,
                    level: element.level,  
                    ped: element.ped,

                    position: jobPos,
                    workPosition: jobWork,
 
                    blip: mp.blips.new(408, new mp.Vector3(jobPos.x, jobPos.y, jobPos.z), { name: element.name, color: 4, shortRange: true}),
                    ped: mp.peds.new(mp.joaat('s_m_y_airworker'), new mp.Vector3(jobPos.x, jobPos.y, jobPos.z), { dynamic: false,  frozen: true, invincible: true, heading: jobPos.heading }),
                    workLabel: mp.labels.new(`~p~Work position~n~~s~Use [~p~E~s~] for interract`, new mp.Vector3(jobWork.x, jobWork.y, jobWork.z), { los: false, font: 0, drawDistance: 30, })
                };
 
                mp.colshapes.newSphere(jobPos.x, jobPos.y, jobPos.z, 3).atJobPosition = count + 1;  
                mp.colshapes.newSphere(jobWork.x, jobWork.y, jobWork.z, 3).atWorkPosition = count + 1;  

                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded server jobs: ' + serverJobs.length);

    }).catch((e) => console.log(e)); 
};
 
mp.events.add({
    "playerQuit" : (player, exitType, reason) =>
    {
        if(player.jobVehicle)
        {
            player.jobVehicle.destroy()
            player.jobVehicle = null;
        } 
    },

    "playerEnterColshape" : (player, shape) => 
    {
        if(shape.atJobPosition) {
            player.atJobPosition = shape.atJobPosition; 

            player.call("client::hud:interractShow", [true, serverJobs[shape.atJobPosition - 1].name, JSON.stringify(['Work for make money']), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        }
              
        if(shape.atWorkPosition == player.info.job) {
            player.atWorkPosition = shape.atWorkPosition;   
        }
             
        if(shape.atWorkPosition == 2) { 
            player.call("player_hud_fish", [shape.atWorkPosition, true]);
        } 

        if(shape == showRoomPosition) {   
            player.call("client::hud:interractShow", [true, 'Los Santos Showroom', JSON.stringify(['Purchase vehicle']), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        }

        if(shape == fishSeller) { 
            player.call("client::hud:interractShow", [true, 'Fishing Man', JSON.stringify(['Place for sell your fish']), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        }

        if(shape == autoschoolColshape) { 
            player.call("client::hud:interractShow", [true, 'Auto School LS', JSON.stringify(['Place for get licence']), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        } 

        if(shape == computerSchool && player.driving.questions) {
            player.call('client:driving::examen:start', [JSON.stringify({drivingLicence: player.info.drivingLicence, motorbikeLicence: player.info.motorbike, money: player.info.money}), false]);  
        
            destroyPlayerCheckpoint(player);
        }

        if(shape.inTruckerCollisions) {
            player.call('disableCollisions', []); 

            sendNotiffication(player, 'info', 'Trucker collision area enabled');
        }
    },

    "playerExitColshape" : (player, shape) => 
    {
        if(shape.atWorkPosition == 2) {
            player.call("player_hud_fish", [shape.atWorkPosition, false]);
        } 

        if(player.atJobPosition) {
            player.atJobPosition = 0; 
            player.call("client::hud:interractShow", [false, '', '', '']); 
        }
              
        if(player.atWorkPosition) {
            player.atWorkPosition = 0; 
        }

        if(shape == showRoomPosition || shape == fishSeller || shape.autoschoolColshape || shape == autoschoolColshape) { 
            player.call("client::hud:interractShow", [false, '', '', '']); 
        }  
 
        if(shape.inTruckerCollisions) {
            player.call('enableCollisions', []);

            sendNotiffication(player, 'info', 'Trucker collision area disabled');
        }
    },

    "client::job:interractJob" : (player) =>
    {
        const x = player.atJobPosition - 1;
  
        if(player.info.job == 2)
        {
            if(player.IsInRange(3867.532, 4464.000, 2.723, 5)) {
                return mp.events.call("server::job:fisherman:startDrill", player); 
            }

            if(player.IsInRange(3725.458, 4525.720, 22.470, 5)) {
                return openFishMenu(player);
            } 
        }  
 
        if(player.atJobPosition && player.IsInRange(serverJobs[x].position.x, serverJobs[x].position.y, serverJobs[x].position.z, 5)) 
        { 
            player.jobInterracted = x;
 
            return player.call('client::job:openMenu', [JSON.stringify(serverJobs[x].position), JSON.stringify({id: x, job: serverJobs[x].name, npc: 'Joseph', working: player.working, selling: false, price: 0})]);
        }
 
        if(player.info.job == 1 && player.working) {
            return mp.events.call("server::job:courier:getBox", player); 
        }
 
        return mp.events.call("server::job:trucker:showCourses", player); 
    }   
}); 

rpc.register('server::job:jobStop', (_, user) =>  
{
    try
    {
        const player = user.player; 
       
        if(!player.working && !player.fishing)
            return sendNotiffication(player, 'error', `In this moment you dont working.`, 'Job:'); 

        player.call('client::job:closeMenu', []);

        sendNotiffication(player, 'success', `Your work has been stopped.`, 'Job:'); 

        return stopWorking(player);
    }
    catch(error) { console.log(error) }   
});

rpc.register('server::job:jobStart', (_, user) =>  
{   
    try
    { 
        const player = user.player; 
        const x = player.jobInterracted;

        if(player.info.job != x + 1)
            return sendNotiffication(player, 'error', 'You dont have this job.', 'Job:'); 

        if(x >= 0) {   
            player.call('client::job:closeMenu', []);

            updatePlayerAchievement(player, 1);

            return mp.events.call(JOB_EVENTS[x], player);
        }  
    }
    catch(error) { console.log(error) }   
});

rpc.register('server::job:jobQuit', async (_, user) =>  
{ 
    try
    { 
        const player = user.player; 

        if(player.working || player.fishing)
            return sendNotiffication(player, 'info', 'Please stop working and get this job.');

        player.info.job = 0; 
        await Account.update({ job: player.info.job }, { where: { id: player.info.id } } );

        player.call('client::job:closeMenu', []);
        
        return sendNotiffication(player, 'success', `Congratulations, you have resigned from this job.`, 'Job:'); 
    }
    catch(error) { console.log(error) }   
});
 
rpc.register('server::job:jobGet', async (_, user) =>  
{ 
    try
    { 
        const player = user.player; 
        const x = player.jobInterracted;

        if(player.working || player.fishing)
            return sendNotiffication(player, 'info', 'Please stop working and get this job.', 'Job:');

        player.info.job = x + 1;
        await Account.update({ job: player.info.job }, { where: { id: player.info.id } } );
 
        sendNotiffication(player, 'success', `Congurlantions, your job is now ${serverJobs[x].name}.`, 'Job:');  
    }
    catch(error) { console.log(error) }   
});

rpc.register('server::job:sellFish', (_, user) =>  
{    
    try
    { 
        const player = user.player; 

        sendNotiffication(player, 'success',`Your fishes has been selled for ${formatMoney(player.fishData.price)}`, 'Fish:');

        player.giveMoney(0, player.fishData.price); 
        player.fishData = {};

        return player.call('client::job:closeMenu');
    }
    catch(error) { console.log(error) }   
});
 
CommandRegistry.add({
    name: "stopwork", 
       
    run: function (player) 
    { 
        if(!player.working && !player.fishing)
            return sendNotiffication(player, 'success', `Your work has been stopped.`, 'Job:'); 

        sendNotiffication(player, 'success', `Working stopped`, 'Job:'); 

        return stopWorking(player);
    }
});

CommandRegistry.add({
    name: "gotojob", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/gotojob [job id]'); 

        if(id > Object.keys(serverJobs).length || id < 1) 
            return sendMessage(player, '009933', 'Invalid job ID.');
    
        player.position = new mp.Vector3(serverJobs[id - 1].position.x, serverJobs[id - 1].position.y, serverJobs[id - 1].position.z);
    
        return sendAdmins('ff9900', 'local', `(Notice): ${player.name} teleported to job ${serverJobs[id - 1].name}.`);
    }
});
 
global.stopWorking = function(player)
{
    player.stopAnimation();
    player.inAnimation = false;
   
    player.working = false;
    player.fishing = false; 
    player.jobStep = 0;  
    player.courierObject = false;  

    destroyObject(player);
       
    if(player.jobVehicle)
    {
        if(mp.vehicles.exists(player.jobVehicle))
        {
            player.jobVehicle.destroy();
            player.jobVehicle = null;
        } 
    }
 
    if(player.jobVehicleTimer != null)
    {
        clearTimeout(player.jobVehicleTimer);
        player.jobVehicleTimer = null;
    }

    if(player.info.job == 3) {
        player.call('client::job:electrician:hide', []);
    }

    player.call('client::job:blip:destroy', []);
 
    return player.call('client::checkpoint:destroy', []);
}

global.vehicleJobTimer = function(player, vehicle, type)
{
    if(player.info.job == 4 && player.working && player.jobVehicle && player.jobStep > 1)
    { 
        if(type == 0) 
        {  
            if(player.jobVehicleTimer == null)
            { 
                sendMessage(player, '8080ff', '(Job Timer):!{#fff} You have 5 minutes to return to the job vehicle.');

                player.jobVehicleTimer = setTimeout(() => 
                {    
                    stopWorking(player);  
                    sendNotiffication(player, 'error', 'Work stopped (job vehicle left for more than 5 minutes.', 'Job Vehicle:')
                }, 300000); 
            }  
        }
        else 
        { 
            if(player.jobVehicleTimer != null)
            { 
                clearTimeout(player.jobVehicleTimer);
                player.jobVehicleTimer = null;
            }
        } 
    }   
}