const rpc = require("rage-rpc"); 
const truckerCarPosition = [ 
    {x: 3546.527, y: 3792.531, z: 30.221, angle: 178.11},
    {x: 3542.531, y: 3792.705, z: 30.226, angle: 178.08},
    {x: 3526.898, y: 3793.204, z: 30.187, angle: 177.40},
    {x: 3522.999, y: 3793.356, z: 30.201, angle: 176.48},
    {x: 3574.358, y: 3790.850, z: 30.099, angle: 177.72},
    {x: 3578.126, y: 3790.583, z: 30.093, angle: 178.04},
    {x: 3574.356, y: 3763.982, z: 29.996, angle: -6.441},
    {x: 3570.690, y: 3764.437, z: 29.996, angle: -8.089} 
];
 
const truckerLoadCargo = [
    { x: 2466.47, y: 5676.742, z: 45.046 }, 
    { x: 2738.64, y: 4713.762, z: 44.296 },  
    { x: 1985.89, y: 5154.967, z: 44.968 },  
    { x: 1511.63, y: 4545.208, z: 53.359 },  
    { x: 348.142, y: 4473.535, z: 62.575 }, 
    { x: 81.4529, y: 3622.934, z: 39.698 },  
    { x: 710.922, y: 2218.685, z: 56.986 }, 
];
 
const truckerCollisions = [
    { x: 2466.47, y: 5676.742, z: 45.046 }, 
    { x: 2738.64, y: 4713.762, z: 44.296 },  
    { x: 1985.89, y: 5154.967, z: 44.968 },  
    { x: 1511.63, y: 4545.208, z: 53.359 },  
    { x: 348.142, y: 4473.535, z: 62.575 }, 
    { x: 81.4529, y: 3622.934, z: 39.698 },  
    { x: 710.922, y: 2218.685, z: 56.986 },  

    { x: 3546.527, y: 3792.531, z: 30.221 },
    { x: 3542.531, y: 3792.705, z: 30.226 },
    { x: 3526.898, y: 3793.204, z: 30.187 },
    { x: 3522.999, y: 3793.356, z: 30.201 },
    { x: 3574.358, y: 3790.850, z: 30.099 },
    { x: 3578.126, y: 3790.583, z: 30.093 },
    { x: 3574.356, y: 3763.982, z: 29.996 },
    { x: 3570.690, y: 3764.437, z: 29.996 } 
];

for(let x = 0; x < truckerCollisions.length; x++) { 
    mp.colshapes.newSphere(truckerCollisions[x].x, truckerCollisions[x].y, truckerCollisions[x].z, 30).inTruckerCollisions = x + 1;  
};
 
global.getRandomNumber = function(min, max) {
    return Math.random() * (max - min) + min;
};

rpc.register('server::job:trucker:selectCourse', (data, user) =>  
{
    try
    {
        const player = user.player; 
        const raw = JSON.parse(data);

        let course = JSON.parse(player.courseSelected);

        if(player.courseSelected != null && raw.data.id == course.index)
            return sendNotiffication(player, 'info', 'You cant select this course.');
 
        player.jobStep = 3;  

        player.call('client::job:trucker:closeMenu', []);
        player.call('client::job:blip:destroy', []);
      
        setPlayerCheckpoint(player, raw.data.x, raw.data.y, raw.data.z, 5);  

        player.courseSelected = JSON.stringify({ price: raw.received, index: raw.data.id });

        return sendNotiffication(player, 'info', 'Follow your gps route and deliver your cargo.', 'Trucker Job:');  
    }
    catch(error) { console.log(error) }   
}); 
 
mp.events.add({
    "server::job:trucker:closeMenu" : (player) =>
    {
        if(player.working && player.info.job == 4) {
            sendNotiffication(player, 'success', 'Working stopped', 'Job:'); 

            return stopWorking(player);
        } 
    },
 
    "server::job:trucker:start" : (player) =>
    { 
        player.jobVehicleTimer = null; 
        player.working = true;
        player.jobStep = 1; 
  
        const random = Math.floor(Math.random() * truckerCarPosition.length); 
        player.jobVehicle = createVehicle(player, JSON.stringify({model: 'pounder', position: new mp.Vector3(truckerCarPosition[random].x, truckerCarPosition[random].y, truckerCarPosition[random].z), heading: truckerCarPosition[random].angle, putIn: true, type: 'Trucker', faction: null, locked: false, fuel: 100, odometer: 0, color1: [255, 102, 0], color2: [0, 0, 0], number: 'Job'})); 
   
        player.call('client::job:blip:create', [JSON.stringify({ marker: 39, shape: true, job: player.info.job, position: { x: 3483.756, y: 3779.934, z: 30.159 } })]); 
 
        return sendNotiffication(player, 'success', 'Follow your gps route to load your truck.', 'Trucker Job:');  
    },

    "server::job:trucker:showCourses" : (player) =>
    { 
        if(player.jobStep != 1 || player.info.job != 4)
            return;
 
        return player.call('client::job:trucker:showMenu', []);
    },
 
    "server::job:trucker:enterTruckerCP" : (player) =>
    {    
        if(player.working && player.jobStep == 3 && player.courseSelected != null)
        {   
            const raw = JSON.parse(player.courseSelected);
 
            player.call('client::job:blip:destroy', []);

            player.jobStep = 1;   
            //player.courseSelected = null; 

            updateQuestProgress(player, 'trucker');
   
            player.giveMoney(0, raw.price);   
			playerPremiumBenefits(player, raw.price); 

            player.call('client::job:blip:create', [JSON.stringify({ marker: 39, shape: true, job: player.info.job, position: { x: truckerLoadCargo[raw.index].x, y: truckerLoadCargo[raw.index].y, z: truckerLoadCargo[raw.index].z }})]); 
  
            sendNotiffication(player, 'info', `You received $${formatMoney(raw.price)} for this cargo.`, 'Trucker Job:');  
            return sendNotiffication(player, 'info', 'Follow your gps route to load your cargo.', 'Trucker Job:');  
        } 
    } 
});   