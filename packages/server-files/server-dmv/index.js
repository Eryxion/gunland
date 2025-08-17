const { CommandRegistry } = require('../server-global/improved-commands'); 
const rpc = require("rage-rpc");

const autoSchoolPark = 
[ 
    {x: -180.132, y: -1945.927, z: 27.442, heading: 108.5154},
    {x: -181.337, y: -1942.798, z: 27.444, heading: 110.7600},
    {x: -182.460, y: -1939.615, z: 27.442, heading: 114.0528},
    {x: -183.947, y: -1936.506, z: 27.444, heading: 113.5839},
    {x: -185.421, y: -1933.228, z: 27.444, heading: 115.0112},
];
 
global.autoschoolColshape = mp.colshapes.newSphere(-210.487, -1926.465, 27.769, 3);
global.computerSchool = mp.colshapes.newSphere(-212.692, -1913.450, 27.789, 2);

mp.blips.new(525, new mp.Vector3(-210.487, -1926.465, 27.769),{ name: 'Auto School LS', color: 4, shortRange: true, dimension: 0}); 
mp.markers.new(1, new mp.Vector3(-210.487, -1926.465, 27.769 - 1.4), 1, { color: [255, 255, 255, 255], dimension: 0 }); 

mp.peds.new(mp.joaat('ig_abigail'), new mp.Vector3(-211.815, -1927.249, 27.769), { dynamic: false,  frozen: true, invincible: true, heading: -62.784 });
mp.peds.new(mp.joaat('s_m_y_cop_01'), new mp.Vector3(-208.475, -1908.563, 27.789), { dynamic: false,  frozen: true, invincible: true, heading: 165.934 });
 
rpc.register('server:driving::examen:passed', (licence, user) =>  
{
    console.log('start practic examen ' + licence)

    try
    {
        const player = user.player;  
        const random = Math.floor(Math.random() * autoSchoolPark.length); 
 
        setTimeout(() => {

            player.call('client:driving::examen:close', []);
 
            player.driving = { stage: -1, status: true, questions: false, licence: licence }  
            player.schoolVehicle = createVehicle(player, JSON.stringify({model: (licence == 0 ? 'akuma' : 'blista'), position: new mp.Vector3(autoSchoolPark[random].x, autoSchoolPark[random].y, autoSchoolPark[random].z), heading: autoSchoolPark[random].heading, putIn: true, type: 'school', faction: null, locked: true, fuel: 100, odometer: 0, color1: [192, 14, 26], color2: [192, 14, 26], number: 'DMV'}))
       
            player.call('client::driving::createCheckpoint', [0]);   
        }, 3000); 
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server:driving::examen:failed', (_, user) =>  
{
    try
    {
        const player = user.player;  
 
        player.driving.status = false; 
        player.driving.questions = false;

            setTimeout(() => {  
                if(mp.players.exists(player) && player.loggedInAs) {
                    player.call('client:driving::examen:close', []); 
                } 
            }, 3000);    
    }  
    catch(error) { console.log(error) }   
}); 

rpc.register('server:driving::examen:close', (_, user) =>  
{
    try
    {
        const player = user.player;  
 
        player.driving.status = false; 
        player.driving.questions = false;

        return player.call('client:driving::examen:close', [])
    }  
    catch(error) { console.log(error) }   
}); 

rpc.register('server:driving::examen:sendToComputer', (data, user) =>  
{
    try
    {
        const player = user.player;  
        const raw = JSON.parse(data);

        player.call('client:driving::examen:close', []);

        sendNotiffication(player, 'success', 'Go to computer marked on your minimap to take your test.', 'Driving School:');
 
        setPlayerCheckpoint(player, -212.692, -1913.450, 27.789, '', 1);  
    }  
    catch(error) { console.log(error) }   
}); 
 
mp.events.add({

    "server::driving::startExamen" : (player) =>
    {
        if(!player.IsInRange(-210.487, -1926.465, 27.769, 5)) 
            return;

        if(player.driving.status == true || player.driving.questions == true) 
            return sendMessage(player, 'ff6633', "You already started this exam.");

        if(player.info.drivingLicence && player.info.motorbike) 
            return sendMessage(player, 'ff6633', "You already have driving and motorbike license.");

        player.driving.questions = true;
      
        return player.call('client:driving::examen:start', [JSON.stringify({drivingLicence: player.info.drivingLicence, motorbikeLicence: player.info.motorbike, money: player.info.money}), true]);  
    },
 
    "server::driving::enterCheckpoint" : async (player) => 
    {
        if(player.driving.status == true) 
        { 
            player.driving.stage ++; 

            switch(player.driving.stage)
            {
                case 23:
                { 
                    updatePlayerAchievement(player, 0);

                    sendNotiffication(player, 'success', `Congratulations, you got your ${player.driving.licence == 1 ? 'driver' : 'motorbike'} license.`, 'Licence:');
                     
                    if(player.driving.licence == 1) {
                        player.info.drivingLicence = 1;   
                    } 
                    else  {
                        player.info.motorbike = 1;   
                    }
 
                    player.driving = { stage: -1, status: false, questions: false }  
                    player.schoolVehicle.destroy();
                    player.schoolVehicle = null;
    
                    player.call('client::driving::destroyCheckpoint');  
           
                    await Account.update({ motorbike: player.info.motorbike, drivingLicence: player.info.drivingLicence }, { where: { id: player.info.id } }); 
                    break;
                }
                default: {
                    player.call('client::driving::destroyCheckpoint');
                    player.call('client::driving::createCheckpoint', [player.driving.stage]);
        
                    player.vehicle.repair(); 
                    break;
                }
            }
        }
    }
});  

CommandRegistry.add({
    name: "gotodmv", 
    
    run: function (player) {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        player.position = new mp.Vector3(-210.487, -1926.465, 27.769); 
    }
});