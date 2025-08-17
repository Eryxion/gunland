const rpc = require("rage-rpc");
const { CommandRegistry } = require("../server-global/improved-commands"); 
 
require("./alltatoo.js");
 
CommandRegistry.add({
    name: "tatoo", 
    
    run: function (player) 
    {  
        startPlayerTatoo(player);
    }
});  

global.startPlayerTatoo = function(player) {
    player.dimesion = (player.id + 1);

    player.position = new mp.Vector3(324.9798, 180.6418, 103.6665); 
    player.heading = 101.022;

    player.setProp(0, defaultClothes[player.info.characterData['general']['gender']]['hat'], 0);
    player.setProp(1, defaultClothes[player.info.characterData['general']['gender']]['glasses'], 0);
    player.setProp(6, defaultClothes[player.info.characterData['general']['gender']]['watch'], 0);
    player.setProp(7, defaultClothes[player.info.characterData['general']['gender']]['bracelet'], 0);
    
    player.setClothes(6, player.info.characterData['general']['gender'] ? 34 : 35, 0, 0);   
    player.setClothes(4, player.info.characterData['general']['gender'] ? 21 : 15, 0, 0);
    player.setClothes(3, 15, 0, 0); 
    player.setClothes(8, 15, 0, 0); 
    player.setClothes(11, 15, 0, 0); 

    player.playAnimation("amb@world_human_guard_patrol@male@base", "base", 4.0, 49);  

    return player.call("client::tatoo:open", [player.info.characterData['general']['gender'], JSON.stringify(serverTatoos)]);
};
 
rpc.register('server::tatoo:close', async (_, user) => 
{ 
    try {

        const player = user.player; 
       
        player.dimesion = 0;
 
        player.call('client::tatoo:close', []); 
        player.call('client::tatoo:apply', []);

        player.stopAnimation();

        await reloadPlayerClothes(player);
    }
    catch(e) { return console.log(e) };
}); 

rpc.register('server::tatoo:purchaseItems', async (data, user) => 
{ 
    try {

        const player = user.player; 
        const raw = JSON.parse(data);

        if(player.info.money < raw.price)
            return sendNotiffication(player, 'error', 'You dont have enought money.');
 
        for(let x = 0; x < raw.items.length; x++) {
            player.info.tatoos.push({name: raw.items[x].LocalizedName, hash: (player.info.characterData['general']['gender'] ? raw.items[x].MaleHash : raw.items[x].FemaleHash), collection: raw.items[x].Collection, slot: raw.items[x].Category, price: raw.items[x].Price })
        }

        player.setVariable('tatoos', JSON.stringify(player.info.tatoos));
        player.dimesion = 0; 
        player.stopAnimation();
  
        player.call('client::tatoo:close', []);
        player.giveMoney(1, raw.price);

        sendNotiffication(player, 'info', `Tatoos has been purchased for $${formatMoney(raw.price)}.`);
 
        player.call('client::tatoo:apply', []);

        await Account.update({ tatoos: player.info.tatoos }, { where: { id: player.info.id }}); 
        await reloadPlayerClothes(player);
    }
    catch(e) { return console.log(e) };
});  