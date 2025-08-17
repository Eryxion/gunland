const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc");
 
mp.events.add({
    "playerJoin": (player) => {
        player.rob = { active: false, steps: [ false, false, false, false, false, false, false ], time: 0 };
    }, 
});
 
rpc.register('server::rob::update', (data, user) =>  
{
    try
    {
        const player = user.player; 
        const raw = JSON.parse(data);

        if(raw.index == 5) { 
            player.dimension = 0;

            createWanted(null, player, 6, 'Armed bank robbery');
        }
  
        player.rob.steps[raw.index] = true;

        return player.call('client::rob:update', [0, JSON.stringify(player.rob.steps), raw.index]); 
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server::rob::start', (_, user) =>  
{
    try
    {
        const player = user.player;  

        if(player.rob.active)
            return;

        player.dimension = (player.id + 2);

        //if(!haveItem(player, 'Bomb'))
            //return sendNotiffication(player, 'info', 'You dont have C4 Bomb.', 'Rob:');

        //if(!haveItem(player, 'Bomb'))
            //return sendNotiffication(player, 'info', 'You dont have a pistol.', 'Rob:');
 
        player.rob = { active: true, steps: [ false, false, false, false, false, false ], time: 120 }; 
        player.call('client::rob:open', [1, JSON.stringify(player.rob.steps)]);   
    }
    catch(error) { console.log(error) }   
}); 
 
CommandRegistry.add({
    name: "gotorob", 
       
    run: function (player) {   
        player.position = new mp.Vector3(-1207.270, -323.877, 37.859);
    }
});

rpc.register('server::rob::end', (type = 0, user) =>  
{
    try
    {
        const player = user.player;  
        player.dimension = 0;

        if(type)
        {
            let money = getRandomArbitrary(1000, 5240).toFixed(0);
            player.giveMoney(0, money);  

            sendMessage(player, 'a64dff', `(Rob):!{#fff} Thanks for this loot.`);
            sendMessage(player, 'a64dff', `(Rob):!{#fff} Rob finished and you received $${formatMoney(money)}.`);
        }
 
        player.rob = { active: false, steps: [ false, false, false, false, false, false ], time: 0 };  
    }
    catch(error) { console.log(error) }   
});  