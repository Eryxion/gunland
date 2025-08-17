let courier_vehicle_position = [
    {x: 859.710, y: -1342.721, z: 25.769, heading: 90.302742},
    {x: 859.888, y: -1350.283, z: 25.803, heading: 91.823646},
    {x: 859.877, y: -1357.909, z: 25.834, heading: 90.209136},
    {x: 844.387, y: -1334.776, z: 25.843, heading: -115.7908},
    {x: 843.785, y: -1340.392, z: 25.804, heading: -111.6605},
    {x: 843.935, y: -1346.206, z: 25.813, heading: -116.5915},
    {x: 843.708, y: -1352.338, z: 25.823, heading: -116.6587} 
];
 
mp.peds.new(mp.joaat('s_m_y_grip_01'), new mp.Vector3(837.995, -1375.460, 26.311), { dynamic: false, frozen: true, invincible: true, heading: -2.067 });
mp.labels.new(`~p~Courier delivery~n~~s~Use [~p~E~s~] to get boxes`, new mp.Vector3(837.995, -1375.460, 26.311), { los: false, font: 0, drawDistance: 30, });
mp.blips.new(478, new mp.Vector3(837.995, -1375.460, 26.311), { name: 'Courier delivery', color: 4, shortRange: true});
 
playerGiveHouseBox = function(player)
{
    player.courierObject = false;
    destroyObject(player);

    player.stopAnimation(); 
    player.sendColets ++;
    player.curierPoint = -1;
  
    const money = Math.floor(Math.random() * 2200);

    player.giveMoney(0, money);   
	playerPremiumBenefits(player, money) 
    updateQuestProgress(player, 'courier');
  
    sendNotiffication(player, 'success', `Box delivery for $${formatMoney(money)} ${player.sendColets == player.totalColets ? '' : 'go to next house'}.`, 'Courier:');

    if(player.sendColets == player.totalColets) {  
        player.accesingCollets = true;
        return sendMessage(player, '4d94ff', `(Job Finish):!{#fff} Nu mai ai colete, mergi la depozit si preia alte colete`);  
    }
  
    return giveCurierHouse(player);  
} 

giveCurierHouse = function(player)
{ 
    let random = Math.floor(Math.random() * server_houses.length);

    if(random === player.curierPoint) {
        return giveCurierHouse(player);
    }

    setPlayerCheckpoint(player, server_houses[random].position.x, server_houses[random].position.y, server_houses[random].position.z); 

    return player.curierPoint = random;
} 

getBoxFromVehicle = function(player)
{ 
    player.playAnimation("anim@heists@box_carry@", "idle", 4.0, 49);
    player.courierObject = true;

    sendNotiffication(player, 'info', 'Go to the door and deliver the package using key [E]', 'Courier:');
 
    return createObject(player, 'v_res_filebox01', player.position, player.rotation, 255, player.dimension, 0, -0.0500,  0.3800, 0.2300, -2.0000, 1.0000, 0.0000);
}
 
courierGiveColets = function(player)
{ 
    let randomColets = getRandomArbitrary(1, server_houses.length).toFixed(0);
 
    player.totalColets = randomColets;
    player.sendColets = 0;
    player.curierPoint = -1;
    player.accesingCollets = false;
 
    sendNotiffication(player, 'info', 'Follow the blue dot on on your minimap and delivery the box.');

    return giveCurierHouse(player); 
}
 
mp.events.add({
    "server::job:courier:start" : (player) =>
    {
        let random = Math.floor(Math.random() * courier_vehicle_position.length);
  
        player.working = true;
        player.courierObject = false;
          
        player.jobVehicle = createVehicle(player, JSON.stringify({model: 'speedo4', position: new mp.Vector3(courier_vehicle_position[random].x, courier_vehicle_position[random].y, courier_vehicle_position[random].z), heading: courier_vehicle_position[random].heading, putIn: true, type: 'job', faction: null, locked: false, fuel: 100, odometer: 0, color1: [255, 255, 255], color2: [255, 255, 255], number: 'Job'})); 
   
        return courierGiveColets(player);
    },

    "server::job:courier:getBox" : (player) =>
    {  
        switch(player.accesingCollets)
        {
            case false: { 
                if(player.sendColets <= player.totalColets && player.curierPoint != -1)
                { 
                    if(player.IsInRange(server_houses[player.curierPoint].position.x, server_houses[player.curierPoint].position.y, server_houses[player.curierPoint].position.z, 20))
                    {   
                        if(player.courierObject == false && player.IsInRange(player.jobVehicle.position.x, player.jobVehicle.position.y, player.jobVehicle.position.z, 10)) {  
                            return getBoxFromVehicle(player); 
                        }
                
                        if(player.courierObject == true && player.IsInRange(server_houses[player.curierPoint].position.x, server_houses[player.curierPoint].position.y, server_houses[player.curierPoint].position.z, 2)) {   
                            return playerGiveHouseBox(player);
                        } 
                    } 
                } 
                break;
            }

            case true: {
                courierGiveColets(player);
                break;
            }
        }  
    } 
}); 