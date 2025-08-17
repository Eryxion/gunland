global.TAXI_COLOR = 'FF8008'; 
global.taxi_calls = [];
 
const { CommandEvents, CommandRegistry } = require('../../server-global/improved-commands'); 


mp.events.add({
    "server::phone:callTaxi" : (player, status, location) =>
    {  
        const index = serverFactions[1].calls.findIndex(object => object.name == player.name); 
       
        player.taxi.haveCommand = status;
 
        if(index != -1)
        { 
            serverFactions[1].calls.splice(index); 
        } 
        else 
        { 
            //Push member in taxi calls 
            serverFactions[1].calls.push({id: serverFactions[1].calls.length + 1, name: player.name, status: 'new', taximeter: 'none', location: location});

            //Flash icon hud for taxi members
            updateDashboard(true);
  
            sendGroup(2, TAXI_COLOR, `(Taxi Call):</span> ${player.name} called a taxi (location: ${location})`);
            sendMessage(player, TAXI_COLOR, `(Taxi Call):!{#ffffff} You called taxi driver, please wait...`);  
        }  
    }, 
});     

 
CommandRegistry.add({
    name: "test", 
      
    beforeRun: function (player, fullText) {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: function (player, fullText, id) 
    { 
        return player.call('client::dashboard:open', [player.info.group, player.groupRank, JSON.stringify(serverFactions)]);
    }
}); 