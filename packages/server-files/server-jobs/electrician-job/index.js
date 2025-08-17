const { CommandRegistry } = require('../../server-global/improved-commands'); 
const rpc = require("rage-rpc");

const electricianVehicles = [
    {x: 734.778, y: -2031.902, z: 29.022, heading: -5.774}, 
    {x: 731.777, y: -2031.675, z: 29.015, heading: -5.189},  
    {x: 728.665, y: -2031.371, z: 29.019, heading: -4.411}, 
    {x: 725.419, y: -2031.018, z: 29.024, heading: -5.572}, 
    {x: 722.335, y: -2030.739, z: 29.024, heading: -4.916}, 
    {x: 718.280, y: -2022.917, z: 29.031, heading: -94.50}, 
];

const electricianPoints = [
    {x: 1212.858, y: -1499.806, z: 34.842}, 
    {x: 512.2398, y: -998.8351, z: 27.635}, 
    {x: -572.231, y: 311.78182, z: 84.523}, 
    {x: -1333.83, y: -198.5340, z: 43.761}, 
    {x: -374.938, y: -2166.250, z: 10.318}, 
    {x: 1092.712, y: -794.9268, z: 58.272}, 
];
 
mp.events.add('server::job:electrician:start', (player) => {  
 
    const random = Math.floor(Math.random() * electricianVehicles.length); 
  
    player.working = true;   
    player.setVariable('jobID', player.info.job);
    player.jobVehicle = createVehicle(player, JSON.stringify({model: 'speedo4', position: new mp.Vector3(electricianVehicles[random].x, electricianVehicles[random].y, electricianVehicles[random].z), heading: electricianVehicles[random].heading, putIn: true, type: 'job', faction: null, locked: false, fuel: 100, odometer: 0, color1: [255, 255, 255], color2: [255, 255, 255], number: 'Job'})); 
 
    giveElectricianPoint(player);

    return sendNotiffication(player, 'info', 'Follow the blue doth on your minimap and fix wires.', 'Electrician job:');
});  
 
global.giveElectricianPoint = function(player)
{ 
    const random = Math.floor(Math.random() * electricianPoints.length);

    if(random === player.ElectricPoint) {
        return giveElectricianPoint(player);
    }

    const data = {
        marker: 0,
        shape: true,
        job: player.info.job,
        position: { x: electricianPoints[random].x, y: electricianPoints[random].y, z: electricianPoints[random].z }
    }

    player.call('client::job:blip:create', [JSON.stringify(data)]);

    return player.ElectricPoint = random;
} 

rpc.register('server::jobs:electrician:complete', (_, user) =>  
{
    try
    {
        const player = user.player; 
        const money = Math.floor(Math.random() * 760);  

        player.stopAnimation();
		player.giveMoney(0, money);   
		
		playerPremiumBenefits(player, money); 
       
        sendNotiffication(player, 'success', `You fixed the wires. You earned $${formatMoney(money)}`, 'Electrician Job:');
        sendNotiffication(player, 'info', 'Follow the blue doth on your minimap and fix wires.', 'Electrician job:');

        player.call('client::job:electrician:hide', []);
   
        return giveElectricianPoint(player);
    }
    catch(error) { console.log(error) }   
}); 
 
CommandRegistry.add({
    name: "sound", 
   
    run: function (player, _, name, soundName)
    {  
        player.call("client::server::playSound", [name, soundName])
    }
}); 