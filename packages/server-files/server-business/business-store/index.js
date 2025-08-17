const rpc = require("rage-rpc");

rpc.register('server::store:purchaseItem', (data, user) =>  
{  
    try  
    { 
        const player = user.player; 
        const raw = JSON.parse(data);
 
        if(player.info.money < raw.total)
            return sendNotiffication(player, 'info', 'You don`t have this amount.', 'Bank:');
 
        if(raw.checkout.length + player.inventoryItems.length > MAX_SLOTS_ITEMS)
            return sendNotiffication(player, 'error', 'You dont have available slots.');

        player.call("client::store:close", []);

        player.giveMoney(1, raw.total);  
        raw.checkout.forEach(index => {
 
            if(index.name == 'Sim card') {
                givePhoneNumber(player); 
            }
            else { 
                givePlayerItem(player, index.name, index.amount, {component: 0, drawable: 0, color: 0, gender: (player.info.characterData['general']['gender'] ? 'male' : 'female')});
            }
        });
 
        sendNotiffication(player, 'success', `You purchase this items for <a style = "color: #00cc66">$${formatMoney(raw.total)}</a>`, 'Business:');

        return serverBusinessProcent(player.businessID, raw.total);
    } 
    catch(error) { console.log(error) }   
});
rpc.register('server::gunshop:purhcase', (data, user) =>  
{  
    try  
    {  
        const player = user.player; 
        const raw = JSON.parse(data);

        if(player.info.money < raw.price)
            return sendNotiffication(player, 'info', 'You don`t have this amount.', 'Bank:');
 
        player.giveMoney(1, raw.price);  
        serverBusinessProcent(player.businessID, raw.price);

        player.giveWeapon(mp.joaat(raw.hash), 1000);
 
        return sendNotiffication(player, 'success', `You purchase this ${raw.name} for <a style = "color: #00cc66">$${formatMoney(raw.price)}</a>`, 'Business:');
    } 
    catch(error) { console.log(error) }   
});
  
global.givePhoneNumber = async function(player) 
{
    try
    {
        if(player.info.phoneNumber != 0)
            return;

        const val = Math.floor(100000 + Math.random() * 900000)

        Account.findAll({ attributes: ['phoneNumber'], where: {phoneNumber: val } }).then(async function(projects) {
 
            if(projects.length) {
                return givePhoneNumber(player); 
            }
 
            player.info.phoneNumber = parseInt(val);
            
            await Account.update({ phoneNumber: player.info.phoneNumber }, { where: { id: player.info.id } }); 
        })   
    }  
    catch(errors) { return console.log(errors) }
};