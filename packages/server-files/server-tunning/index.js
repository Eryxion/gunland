const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc");


CommandRegistry.add({
    name: "tunning", 
      
    run: async function (player) 
    { 
        if(!player.vehicle)
            return;
 
        return startTunning(player);
    }
});

global.startTunning = async function(player) 
{
    if(!player.vehicle)
        return;

	return sendNotiffication(player, 'error', 'Acest sistem nu este finalizat', 'Error:');

    //player.dimension = (player.dimension + 2);
    //player.vehicle.dimension = player.dimension;

    //player.vehicle.position = new mp.Vector3(-337.7784, -136.5316, 38.6032); 
    //player.vehicle.rotation = new mp.Vector3(0, 0, 149);  

    //await player.call('client::tunning:start', [0]);
}

rpc.register('server::tunning:start', async (_, user) => 
{ 
    try {

        const player = user.player; 

        if(!player.vehicle)
            return;

		return sendNotiffication(player, 'error', 'Acest sistem nu este finalizat', 'Error:');
 
        //player.dimension = (player.dimension + 2);
        //player.vehicle.dimension = player.dimension;
 
        //player.vehicle.position = new mp.Vector3(-337.7784, -136.5316, 38.6032); 
        //player.vehicle.rotation = new mp.Vector3(0, 0, 149);  
 
        //await player.call('client::tunning:start', [1]);
    }
    catch(e) { return console.log(e) };
});



CommandRegistry.add({
    name: "gototunning", 
      
    run: async function (player) 
    {  
        player.position = new mp.Vector3(-333.7966, -137.409, 40.58963);   
    }
});

mp.events.add({

    "server::tunning:changeMod" : (player, index, category) => {  
        player.outputChatBox(`Mod Type ${index} with Mod Index ${category} applied.`);

        player.vehicle.setMod(index, parseInt(category)); 
    } 
}); 

CommandRegistry.add({
    name: "mod", 
      
    run: function (player, _, modType , modIndex) 
    {  
        if(!player.vehicle) return player.outputChatBox("You need to be in a vehicle to use this command.");
        player.vehicle.setMod(parseInt(modType), parseInt(modIndex));
        player.outputChatBox(`Mod Type ${modType} with Mod Index ${modIndex} applied.`);
    }
}); 

rpc.register('server::tunning:repariVehicle', async (_, user) => 
{ 
    try {

        const player = user.player; 
          
        sendNotiffication(player, 'success', 'The car was repaired');

        return player.call('client::tunning:close', []); 
    }
    catch(e) { return console.log(e) };
});