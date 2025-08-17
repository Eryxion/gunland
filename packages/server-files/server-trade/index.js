const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc");
 
mp.events.add({
    "playerJoin": (player) => {  
        player.tradeData = {
            active: false,
            inventory: [], 
            yourName: 'undefined',
            yourOffer: [],
            yourMoney: 0,
            house: null,
            vehicles: [],
 
            hisName: 'undefined',
            hisOffer: [],
            hisMoney: 0,

            ready: false,
            tradeInterval: null,
            tradeTime: 0
        }; 
    },

    "playerQuit" : async (player, exitType, reason) => {
        if(mp.players.exists(player) && player.loggedInAs) 
        { 
            const receiver = mp.players.toArray().find((user) => (user.name === player.tradeData.yourName || user.name === player.tradeData.hisName) && user.name != player.name)

            if(mp.players.exists(receiver) && receiver.loggedInAs) {
                resetTrade(receiver);
 
                sendMessage(receiver, COLOR_ADMIN, `(Trade):!{fff} Because ${player.name} disconnected, the trade was stopped.`);
            }
        }
    },
});
 
global.resetTrade = async function(player) { 
    player.call('client::trade:close', []);

    await destroyTradeInterval(player, undefined);

    player.tradeData = { 
        active: false,
        inventory: [], 
        yourName: 'undefined',
        yourOffer: [],
        yourMoney: 0,
        house: null,
        vehicles: [],

        hisName: 'undefined',
        hisOffer: [],
        hisMoney: 0,

        ready: false,
        tradeInterval: null,
        tradeTime: 0
    };
};

global.destroyTradeInterval = function(player = undefined, receiver = undefined) { 
    if(player != undefined && player.tradeData.tradeInterval != null) { 
        clearInterval(player.tradeData.tradeInterval);
        player.tradeData.tradeInterval = null;
    }

    if(receiver != undefined && receiver.tradeData.tradeInterval != null) { 
        clearInterval(receiver.tradeData.tradeInterval);
        receiver.tradeData.tradeInterval = null;
    } 
};

global.sendTradeMessage = function(player, message) { 
    const receiver = mp.players.toArray().find((user) => (user.name === player.tradeData.yourName || user.name === player.tradeData.hisName) && user.name != player.name); 

    rpc.callBrowsers(mp.players.at(player.id), 'web::trade::pushMessage', [JSON.stringify(message)]);  

    if(receiver != undefined && mp.players.exists(receiver) && receiver.loggedInAs) {
        rpc.callBrowsers(mp.players.at(receiver.id), 'web::trade::pushMessage', [JSON.stringify(message)]);  
    } 
};
 
rpc.register('server::trade:putItem', (data, user) => 
{ 
    try {

        const player = user.player; 
        const raw = JSON.parse(data);

        if(player.tradeData.ready)
            return sendNotiffication(player, 'error', 'You cant change offer because you are ready.', 'Trade:');
     
        player.tradeData.yourOffer.push({ 
            id: raw.item.id,
            user: raw.item.user,
            name: raw.item.name,
            slot: raw.item.slot, 
            image: raw.item.image,
            status: raw.item.status,
            clothes: raw.item.clothes,
            count: raw.count
        });

        let indexOffer = player.tradeData.yourOffer.findIndex(object => object.name == raw.item.name && object.id == raw.item.id && object.clothes == raw.item.clothes);
        player.tradeData.yourOffer[indexOffer].option = 'inventory';
 
        let index = player.tradeData.inventory.findIndex(object => object.name == raw.item.name && object.slot == raw.item.slot);
        if(index != -1) { 
          
            if(raw.count >= player.tradeData.inventory[index].count) {
                player.tradeData.inventory.splice(index, 1);
            }
            else {
                player.tradeData.inventory[index].count -= raw.count;
            } 
        }
  
        const receiver = mp.players.toArray().find((user) => (user.name === player.tradeData.yourName || user.name === player.tradeData.hisName) && user.name != player.name)
  
        receiver.tradeData.hisOffer = player.tradeData.yourOffer;
        
        rpc.callBrowsers(mp.players.at(player.id), 'web::trade::reloadYourOffer', [JSON.stringify(player.tradeData)]);  
        rpc.callBrowsers(mp.players.at(receiver.id), 'web::trade::reloadYourOffer', [JSON.stringify(receiver.tradeData)]);  
 
        return sendTradeMessage(player, `${player.name} offered ${raw.count}x ${raw.item.name}.`); 
    }
    catch(e) { return console.log(e) };
}); 

rpc.register('server::trade:addMoney', (money, user) => 
{ 
    try {

        const player = user.player; 

        if(player.tradeData.ready)
            return sendNotiffication(player, 'error', 'You cant change offer because you are ready.', 'Trade:');
  
        const receiver = mp.players.toArray().find((user) => (user.name === player.tradeData.yourName || user.name === player.tradeData.hisName) && user.name != player.name)
 
        player.tradeData.yourMoney = money;
        receiver.tradeData.hisMoney = money;
        
        rpc.callBrowsers(mp.players.at(player.id), 'web::trade::reloadYourOffer', [JSON.stringify(player.tradeData)]);  
        rpc.callBrowsers(mp.players.at(receiver.id), 'web::trade::reloadYourOffer', [JSON.stringify(receiver.tradeData)]);  
 
        return sendTradeMessage(player, `${player.name} offered $${formatMoney(money)}`);
    }
    catch(e) { return console.log(e) };
});  

rpc.register('server::trade:addHouse', (_, user) => 
{ 
    try {

        const player = user.player; 

        if(player.tradeData.ready)
            return sendNotiffication(player, 'error', 'You cant change offer because you are ready.', 'Trade:');
 
        rpc.callBrowsers(mp.players.at(player.id), 'web::trade::reloadYourOffer', [JSON.stringify(player.tradeData)]);  
        return sendTradeMessage(player, `${player.name} offered house #${player.info.house}`);
    }
    catch(e) { return console.log(e) };
});  
 
rpc.register('server::trade:addVehicle', (data, user) => 
{ 
    try {

        const player = user.player; 
        const raw = JSON.parse(data);
 
        player.tradeData.yourOffer.push(raw);
 
        let index = player.tradeData.yourOffer.findIndex(object => object.name == raw.name && object.odometer == raw.odometer && object.days == raw.days && object.id == raw.id);
        player.tradeData.yourOffer[index].option = 'vehicle';
 
 
        rpc.callBrowsers(mp.players.at(player.id), 'web::trade::reloadYourOffer', [JSON.stringify(player.tradeData)]);  
        sendTradeMessage(player, `${player.name} offered 1x ${raw.name}.`); 
    }
    catch(e) { return console.log(e) };
});
  
rpc.register('server::trade:clearOffer', (_, user) => 
{ 
    try {

        let player = user.player; 
        const receiver = mp.players.toArray().find((user2) => (user2.name === player.tradeData.yourName || user2.name === player.tradeData.hisName) && user2.name != player.name);  
 
        if(player.tradeData.ready)
            return sendNotiffication(player, 'error', 'You cant clear offer because you are ready.', 'Trade:');
 
        mp.events.call("server:inventory::loading", player, player.info.id);  
 
        setTimeout(() => {
            player.tradeData = { 
                active: true,
                inventory: player.inventoryItems,

                yourName: player.name,
                yourOffer: [],
                yourMoney: 0,
                house: (player.info.house != -1 && server_houses[player.info.house - 1].ownerSQL == player.info.id ? player.info.house : null),
                vehicles: player.personalVeh,
                
                hisName: 'undefined',
                hisOffer: [],
                hisMoney: 0,

                ready: false,
                tradeInterval: null,
                tradeTime: 0
            }; 
 
            sendTradeMessage(player, `${player.name} delete actual offer.`); 
            rpc.callBrowsers(mp.players.at(player.id), 'web::trade::reloadYourOffer', [JSON.stringify(player.tradeData)]); 

            if(receiver != undefined && mp.players.exists(receiver) && receiver.loggedInAs) {
                rpc.callBrowsers(mp.players.at(receiver.id), 'web::trade::reloadYourOffer', [JSON.stringify(receiver.tradeData)]); 
            }   
        }, 200); 
    }
    catch(e) { return console.log(e) };
});   

rpc.register('server::trade:switchTradeStatus', (_, user) => 
{ 
    try {

        const player = user.player;
        const receiver = mp.players.toArray().find((user2) => (user2.name === player.tradeData.yourName || user2.name === player.tradeData.hisName) && user2.name != player.name);  

        player.tradeData.ready = !player.tradeData.ready;
 
        if(player.tradeData.tradeInterval != null && !player.tradeData.ready) {
            destroyTradeInterval(player, receiver);
        }

        sendTradeMessage(player, `${player.name} marked his offer as ${player.tradeData.ready ? 'final' : 'incomplete'}.`);
  
        if(player.tradeData.ready && player.tradeData.tradeInterval == null) { 
            if(receiver != undefined && mp.players.exists(receiver) && receiver.loggedInAs && receiver.tradeData.ready && receiver.tradeData.tradeInterval == null) {
              
                player.tradeData.tradeTime = receiver.tradeData.tradeTime = 3;

                player.tradeData.tradeInterval = receiver.tradeData.tradeInterval = setInterval(async () => {  
                    console.log('Started interval debug 2'); 

                    if(player.tradeData.tradeTime > 0 && receiver.tradeData.tradeTime > 0) {
 
                        player.tradeData.tradeTime --;
                        receiver.tradeData.tradeTime --;

                        rpc.callBrowsers(mp.players.at(player.id), 'web::trade::changeTradeTimer', [player.tradeData.tradeTime]); 
                        rpc.callBrowsers(mp.players.at(receiver.id), 'web::trade::changeTradeTimer', [receiver.tradeData.tradeTime]); 
 
                        if(player.tradeData.tradeTime == 0 && receiver.tradeData.tradeTime == 0) { 
                            
                            destroyTradeInterval(player, receiver);
 
                            player.call('client::trade:close', []);
                            receiver.call('client::trade:close', []);

                            sendMessage(player, 'fff', 'Trade finished'); 
                            sendMessage(receiver, 'fff', 'Trade finished'); 
 
                            await giveTradeItems(player, receiver);
                        }
                    } 
                }, 1000); 

                if(player.tradeData.ready && receiver.tradeData.ready) {
                    sendTradeMessage(player, `Both players are now ready. Exchange will take place in 20 seconds.`);
                }
            }
        }  
    }
    catch(e) { return console.log(e) };
}); 
 
global.giveTradeItems = async function(player) {   
    //rezolvat sa dea banii
    //rezolvat reload inventory

    const receiver = mp.players.toArray().find((user) => (user.name === player.tradeData.yourName || user.name === player.tradeData.hisName) && user.name != player.name);
 
    if(player.tradeData.yourMoney > 0) { //asta pare ok 
        receiver.giveMoney(0, player.tradeData.yourMoney);
        player.giveMoney(1, player.tradeData.yourMoney);
    }

    if(receiver.tradeData.yourMoney > 0) { //asta pare ok 
        player.giveMoney(0, receiver.tradeData.yourMoney); 
        receiver.giveMoney(1, receiver.tradeData.yourMoney);
    }
 
    for(let x = 0; x < receiver.tradeData.yourOffer.length; x++) {
        sendMessage(player, 'fff', `[DEBUG 1] Ai primit itemele lui ${receiver.name}`);
        sendMessage(player, 'fff', `[DEBUG 1] Item: ${receiver.tradeData.yourOffer[x].name}`); 
  
        const { name, count, clothes, option } = receiver.tradeData.yourOffer[x];

        if(option == 'inventory') { 
            await removePlayerItem(receiver, JSON.stringify(receiver.tradeData.yourOffer[x]));

            await givePlayerItem(player, name, count, clothes); 
        } 
    } 
   
    for(let x = 0; x < player.tradeData.yourOffer.length; x++) {
        sendMessage(receiver, 'fff', `[DEBUG 2] Ai primit itemele lui ${player.name}`);
        sendMessage(receiver, 'fff', `[DEBUG 2] Item: ${player.tradeData.yourOffer[x].name}`);
  
        const { name, count, clothes, option } = player.tradeData.yourOffer[x];

        if(option == 'inventory') {
            await removePlayerItem(player, JSON.stringify(player.tradeData.yourOffer[x]));

            await givePlayerItem(receiver, name, count, clothes); 
        }; 
    }; 

    setTimeout(async () => { 
        if(mp.players.exists(receiver) && receiver.loggedInAs) {
            await mp.events.call("server:inventory::loading", receiver, receiver.info.id);  
        };

        if(mp.players.exists(player) && player.loggedInAs) {
            await mp.events.call("server:inventory::loading", player, player.info.id);  
        }; 
    }, 1000); 
};
 
rpc.register('server::trade:sendTradeMessage', (message, user) => 
{ 
    try {

        const player = user.player;  
        sendTradeMessage(player, `${player.name}: ${message}`);
    }
    catch(e) { return console.log(e) };
});  


rpc.register('server::trade:close', async (_, user) => 
{ 
    try {

        const player = user.player; 

        if(!player.tradeData.active)
            return;

        const receiver = mp.players.toArray().find((user) => (user.name === player.tradeData.yourName || user.name === player.tradeData.hisName) && user.name != player.name);
            
        if(mp.players.exists(receiver) && receiver.loggedInAs) {
            await resetTrade(receiver);
            await mp.events.call("server:inventory::loading", receiver, receiver.info.id); 

            sendMessage(receiver, COLOR_ADMIN, `(Trade):!{fff} ${player.name} leave your trade offer.`);
        }; 

        sendNotiffication(player, 'success', 'You left the trade offer.');
 
        await resetTrade(player); 
        await mp.events.call("server:inventory::loading", player, player.info.id);  
    }
    catch(e) { return console.log(e) };
});  
 
CommandRegistry.add({
    name: "tradetest", 
       
    run: function (player) 
    { 
        if(player.info.admin < 7) 
            return player.staffPerms(7);
  
        player.tradeData = {
            active: true,
            inventory: player.inventoryItems,

            yourName: player.name,
            yourOffer: [],
            yourMoney: 0,
            house: (player.info.house != -1 && server_houses[player.info.house - 1].ownerSQL == player.info.id ? player.info.house : null),
            vehicles: player.personalVeh,
             
            hisName: 'undefined',
            hisOffer: [],
            hisMoney: 0,

            ready: false,
            tradeInterval: null,
            tradeTime: 0
        }; 
  
        return player.call('client::trade:open', [JSON.stringify(player.tradeData)]);
    } 
});
 
CommandRegistry.add({
    name: "trade", 
      
    run: function (player, _, id) 
    {
        if(!id) 
            return sendUsage(player, '/trade [player]'); 

        const user = getNameOnNameID(id); 
        if(user == undefined || !user.loggedInAs) 
            return player.outputChatBox("This player is not connected.");

        if(user == player)
            return;
      
        sendMessage(player, '669999', `Trade invitation send to ${user.name}`);
        sendMessage(user, '669999', `${player.name} want to trade with you, use (/accepttrrade ${player.id}).`);
    }
});
 
CommandRegistry.add({
    name: "accepttrade", 
      
    run: async function (player, _, id) 
    {
        if(!id) 
            return sendUsage(player, '/accepttrrade [player]'); 

        const user = getNameOnNameID(id); 
        if(user == undefined || !user.loggedInAs) 
            return player.outputChatBox("This player is not connected.");

        if(user == player)
            return;
      
        player.tradeData = {
            active: true,
            inventory: player.inventoryItems,

            yourName: player.name,
            yourOffer: [],
            yourMoney: 0,
            house: (player.info.house != -1 && server_houses[player.info.house - 1].ownerSQL == player.info.id ? player.info.house : null),
            vehicles: player.personalVeh,
                
            hisName: user.name,
            hisOffer: [],
            hisMoney: 0,

            ready: false,
            tradeInterval: null,
            tradeTime: 0
        }; 
    
        await player.call('client::trade:open', [JSON.stringify(player.tradeData)]);
 
        user.tradeData = {
            active: true,
            inventory: user.inventoryItems,

            yourName: user.name,
            yourOffer: [],
            yourMoney: 0,
            house: (user.info.house != -1 && server_houses[user.info.house - 1].ownerSQL == user.info.id ? user.info.house : null),
            vehicles: user.personalVeh,
                
            hisName: player.name,
            hisOffer: [],
            hisMoney: 0,

            ready: false,
            tradeInterval: null,
            tradeTime: 0
        }; 
        
        await user.call('client::trade:open', [JSON.stringify(user.tradeData)]); 
    }
});
 