const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc");

global.MAX_SLOTS_ITEMS = 50;
global.nearbyInventoryItems = [];

const itemsAvailable = ['bagmoney', 'aspirine', 'bait', 'beer', 'chocolate', 'cola', 'gascan', 'gift', 'hamburger', 'hotdog', 'medkit', 'milk', 'phone', 'pizza', 'repairkit', 'rod', 'sandwich', 'seeds', 'sprite', 'walkie'] 
 
global.availableFoods = ['chocolate', 'hamburger', 'hotdog', 'pizza', 'sandwich'];
global.availableDrinks = ['milk', 'sprite', 'beer', 'cola'];

const globalInventoryItems = {  
    'gascan': 'gascan',
    'gift': 'gift',
    
    'chocolate': 'chocolate',
    'hamburger': 'hamburger',
    'hotdog': 'hotdog',
    'pizza': 'pizza',
    'sandwich': 'sandwich',

    'milk': 'milk',
    'sprite': 'sprite',
    'beer': 'beer', 
    'cola': 'cola',

    'bagmoney': 'bagmoney',

    'aspirine': 'aspirine',  
    'medkit': 'medkit', 
    'repair kit': 'repairkit',  
 
    'seeds': 'seeds', 
    'walkie talkie': 'walkie', 
    'walkie': 'walkie', 

    'phone': 'phone',  
    'phonebook': 'phonebook',  
}; 

global.Inventory = sequelize.define('server-inventory', { 
    id: { 
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    user: DataTypes.INTEGER,  
    name: DataTypes.STRING, 
    count: DataTypes.INTEGER,  
    slot: DataTypes.STRING,  
    image: DataTypes.STRING,  
    status: DataTypes.INTEGER, 
     
    clothes: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    } 
}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'server-inventory' }); 

rpc.register('server:inventory::unequipItem', async (itemID, user) =>  
{  
    try  
    { 
        const player = user.player; 
        const index = player.inventoryItems.findIndex(object => object.id === itemID);  

        if(index != -1)
        { 
            player.inventoryItems[index].status = false; 
            player.attachedItems[player.inventoryItems[index].slot] = {};

            dettachItemFromPlayer(player, index); 
          
            await Inventory.update({ status: player.inventoryItems[index].status }, { where: { id: player.inventoryItems[index].id }});  
 
            return rpc.callBrowsers(mp.players.at(player.id), 'reloadInventory', [JSON.stringify({ stock: player.inventoryItems, attached: player.attachedItems, nearby: player.nearbyItems})]);
        }
    } 
    catch(error) { console.log(error) }   
});

rpc.register('server:inventory::attachItem', async (itemID, user) =>  
{
    try
    {
        const player = user.player; 
        const index = player.inventoryItems.findIndex(object => object.id === itemID);  

        if(index != -1)
        {  
            if(Object.keys(player.attachedItems[player.inventoryItems[index].slot]).length)
                return sendNotiffication(player, 'info', 'An item is already attached to this slot.', 'Inventory:');

            if(player.inventoryItems[index].clothes.gender != (player.info.characterData['general']['gender'] ? 'male' : 'female'))
                return sendNotiffication(player, 'info', `This item is for ${player.inventoryItems[index].clothes.gender  == 'male' ? 'man' : 'woman'} and you are ${(player.info.characterData['general']['gender'] ? 'man' : 'woman')}`, 'Inventory:');
            
            player.inventoryItems[index].status = true; 
            player.attachedItems[player.inventoryItems[index].slot] = {id: player.inventoryItems[index].id, name: player.inventoryItems[index].name, count: player.inventoryItems[index].count, slot: player.inventoryItems[index].slot, image: player.inventoryItems[index].image, status: player.inventoryItems[index].status, index: index};
            
            attachItemOnPlayer(player, index); 
            await Inventory.update({ status: player.inventoryItems[index].status }, { where: { id: player.inventoryItems[index].id }});  
             
            return rpc.callBrowsers(mp.players.at(player.id), 'reloadInventory', [JSON.stringify({ stock: player.inventoryItems, attached: player.attachedItems, nearby: player.nearbyItems})]);
        } 
    }
    catch(error) { console.log(error) }   
});
 
rpc.register('server:inventory::dropItem', async (data, user) => 
{    
    try 
    { 
        const player = user.player; 
        const raw = JSON.parse(data); 
        const index = player.inventoryItems.findIndex(object => object.id === raw.item.id && object.name == raw.item.name);  

        if(index != -1)
        {  
            if(raw.count > player.inventoryItems[index].count)
                return sendNotiffication(player, 'error', 'You dont have this quantity.');

            if(clothingItemsData.includes(player.inventoryItems[index].slot))
            {
                player.attachedItems[player.inventoryItems[index].slot] = {}; 

                dettachItemFromPlayer(player, index);
            }
 
            dropinventoryItem(player, player.inventoryItems[index].id, player.inventoryItems[index].name, parseInt(raw.count), player.inventoryItems[index].slot, player.inventoryItems[index].image, player.inventoryItems[index].clothes);

            if(raw.count == player.inventoryItems[index].count) { 
                await Inventory.destroy({ where: { id: player.inventoryItems[index].id }});

                player.inventoryItems.splice(index, 1);
            }
            else {
                player.inventoryItems[index].count --; 
                await Inventory.update({ count: player.inventoryItems[index].count }, { where: { id: player.inventoryItems[index].id }});    
            }
 
            return reloadInventory(player);
        }
    }
    catch(error) { console.log(error) }  
});
 
rpc.register('server:inventory::pickItem', async (itemID, user) =>
{  
    try  
    { 
        const player = user.player; 
        const index = player.nearbyItems.findIndex(object => object.id === itemID); 
        const nearbyIndex = nearbyInventoryItems.findIndex(object => object.id === itemID);

        if(index != -1)
        {
            const haveItem = player.inventoryItems.findIndex(object => object.name === player.nearbyItems[index].name); 

            if(haveItem != -1) {
                player.inventoryItems[haveItem].count += player.nearbyItems[index].count;  
                await Inventory.update({ count: player.inventoryItems[haveItem].count }, { where: { id: player.inventoryItems[haveItem].id }});    
            }
            else {   
 
                const inventoryInsert = await Inventory.create({ user: player.info.id, name: player.nearbyItems[index].name, count: player.nearbyItems[index].count, slot: player.nearbyItems[index].slot, image: player.nearbyItems[index].image, status: false, clothes: JSON.stringify(player.nearbyItems[index].clothes)});
                player.inventoryItems.push({
                    id: inventoryInsert.id, 
                    user: player.info.id, 
                    name: player.nearbyItems[index].name, 
                    count: player.nearbyItems[index].count, 
                    slot: player.nearbyItems[index].slot, 
                    image: player.nearbyItems[index].image, 
                    status: false, 
                    clothes: player.nearbyItems[index].clothes
                });  
            } 

            setTimeout(() => {
                if(nearbyIndex != -1)
                {
                    if(nearbyInventoryItems[nearbyIndex].label) { nearbyInventoryItems[nearbyIndex].label.destroy() } 
                    if(nearbyInventoryItems[nearbyIndex].object) { nearbyInventoryItems[nearbyIndex].object.destroy() }

                    nearbyInventoryItems.splice(nearbyIndex, 1);
                }

                reloadInventory(player);   
            }, 300); 
        } 
    }
    catch(error) { console.log(error)}
});
 
rpc.register('server:inventory::useitem', async (data, user) => {  
    try {
        const player = user.player; 
        const raw = JSON.parse(data); 
        const index = player.inventoryItems.findIndex(object => object.id === raw.id && object.name === raw.name);  
        if(index === -1) return;

        const item = player.inventoryItems[index];

        if(availableFoods.includes(item.slot)) {
            if(player.info.hungry >= 100) return;

            play_animation(player, 'amb@code_human_wander_eating_donut@male@idle_a', 'idle_c', 1, 49);

            player.info.hungry = Math.min(player.info.hungry + 10, 100);
            await Account.update({ hungry: player.info.hungry }, { where: { id: player.info.id } });

            if(['pizza','hamburger'].includes(item.name.toLowerCase())) {
                updateQuestProgress(player, item.name.toLowerCase());
            }

            player.call('client::hud:edit', ['hunger', player.info.hungry]);

        } else if(availableDrinks.includes(item.slot)) {
            if(player.info.thirst >= 100) return;

            play_animation(player, 'amb@world_human_drinking@coffee@male@idle_a', 'idle_b', 1, 49);

            player.info.thirst = Math.min(player.info.thirst + 10, 100);
            await Account.update({ thirst: player.info.thirst }, { where: { id: player.info.id } });

            player.call('client::hud:edit', ['water', player.info.thirst]);

        } else {
            return sendNotiffication(player, 'error', 'You cannot use this item.', 'Inventory:');
        }

        // Scade count-ul și distruge itemul dacă nu mai are
        item.count--;
        await Inventory.update({ count: item.count }, { where: { id: item.id } });

        if(item.count <= 0) {
            destroyItem(player, index, true);
        }

        reloadInventory(player);

    } catch(error) { 
        console.log(error); 
    } 
});

  
mp.events.add( 
{
    "server:inventory::loading" : async (player, user) =>
    {   
        var count = 0; 

        player.inventoryItems = [];
        player.nearbyItems = [];  
        player.attachedItems = { 'hat': {}, 'jacket': {}, 'jeans': {}, 'watch': {}, 'mask': {}, 'glasses': {}, 'bracelet': {}, 'shoes': {} } 
   
        await Inventory.findAll({ raw: true, where: { user: user } }).then((found) => {
        
            if(found.length) {
     
                found.forEach(element => { 
                
                    player.inventoryItems[count] = { 
                        id: element.id,
                        user: element.user,
                        name: element.name,
                        count: element.count,  
                        slot: element.slot,
                        image: element.image,
                        status: element.status,
                        
                        clothes: JSON.parse(element.clothes),  
                    };
     
                    count ++;
                }); 
            } 
    
            return console.log('[MYSQL] Loaded inventory items: ' + player.inventoryItems.length); 
        }).catch((e) => console.log(e));  
    }, 
 
    'server:inventory::open' : (player) =>
    { 
        try 
        {  
            player.nearbyItems = []; 

            nearbyInventoryItems.forEach(element => {

                if(player.IsInRange(element.position.x, element.position.y, element.position.z, 3)) { 
                    player.nearbyItems.push({ id: element.id, name: element.name, count: element.count, slot: element.slot, image: element.image, clothes: element.clothes})
                } 
            });
 
            return player.call('client:inventory::open', [JSON.stringify(player.inventoryItems), JSON.stringify(player.attachedItems), JSON.stringify(player.nearbyItems)]);
        }
        catch(error) {console.log(error)}
    }   
});

global.destroyItem = async function(player, index, reloadInventoryStatus = false)
{ 
    try 
    { 
        await Inventory.destroy({ where: { id: player.inventoryItems[index].id }});

        player.inventoryItems.splice(index, 1);
        
        if(reloadInventoryStatus) {
            return reloadInventory(player);
        }
    }
    catch(error) {console.log(error)} 
}
 
global.attachItemOnPlayer = function(player, index)
{  
    try 
    {
        let raw = player.info.characterData['general'];
        const drawable = (player.inventoryItems[index].status ? player.inventoryItems[index].clothes.drawable : 0);
         
        if(isAProp.includes(player.inventoryItems[index].slot)) {
            return player.setProp(player.inventoryItems[index].clothes.component, drawable, player.inventoryItems[index].clothes.color); 
        }
 
        if(player.inventoryItems[index].slot === 'jacket') {
            player.setClothes(3, (clothesDefect[raw.gender].includes(drawable) ? (raw.gender ? 14 : 6) : 0), 0, 0);
        }
    
        return player.setClothes(player.inventoryItems[index].clothes.component, drawable, player.inventoryItems[index].clothes.color, 0); 
    }
    catch(error) {console.log(error)} 
}
 
global.dettachItemFromPlayer = function(player, index)
{  
    try 
    { 
        if(isAProp.includes(player.inventoryItems[index].slot)) {
            return player.setProp(player.inventoryItems[index].clothes.component, defaultClothes[player.info.characterData['general']['gender']][player.inventoryItems[index].slot], 0);
        }

        if(player.inventoryItems[index].slot === 'jacket') { 
            player.setClothes(3, 15, 0, 0); 
            player.setClothes(8, 15, 0, 0); 
            player.setClothes(11, 15, 0, 0);  
        }
    
        return player.setClothes(player.inventoryItems[index].clothes.component, defaultClothes[player.info.characterData['general']['gender']][player.inventoryItems[index].slot], 0, 0); 
    }
    catch(error) { console.log(error) } 
}
 
global.reloadInventory = function(player)
{
    try 
    {
        player.nearbyItems = [];
    
        nearbyInventoryItems.forEach(element => {

            if(player.IsInRange(element.position.x, element.position.y, element.position.z, 20)) { 
                player.nearbyItems.push({ id: element.id, name: element.name, count: element.count, slot: element.slot, image: element.image, clothes: element.clothes})
            } 
        });
    
        return rpc.callBrowsers(mp.players.at(player.id), 'reloadInventory', [JSON.stringify({ stock: player.inventoryItems, attached: player.attachedItems, nearby: player.nearbyItems})]);
    } 
    catch(error) { console.log(error) } 
}
  
global.dropinventoryItem = function(player, id, item, count, slot, image, clothes)
{ 
    return nearbyInventoryItems.push({

        id: id, 
        name: item, 
        count: count, 
        slot: slot, 
        image: image, 
        clothes: clothes, 
        position: player.position,

        label: mp.labels.new('~p~' + count + 'x~s~ ' + item, new mp.Vector3(player.position.x, player.position.y, player.position.z - 0.6), { los: false, font: 2, drawDistance: 10, }), 
        object: mp.objects.new('p_ld_heist_bag_s_1', new mp.Vector3(player.position.x, player.position.y, player.position.z - 1), { rotation: new mp.Vector3(0, 0, 0), alpha: 255, dimension: player.dimension })
    }); 
}

CommandRegistry.add({
    name: "giveitem", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: async function (player, _, userID, item, slot, count) 
    {  
        try 
        {   
            if(!userID || !item || !slot || !count) 
                return sendUsage(player, '/giveitem [player] [item name] [item slot (food / drink)] [count]'); 
            
            const user = getNameOnNameID(userID); 
            if(user == undefined) 
                return sendNotiffication(player, 'error', 'This player is not connected.', 'Error:');
  
            if(!itemsAvailable.includes(item.toLowerCase()))
                return sendNotiffication(player, 'error', 'This item not exist on server.', 'Error:');
   
            const jane = await Inventory.create({ user: user.info.id, name: item.toLowerCase(), count: count, slot: slot, image: item.toLowerCase() + '.png', status: false, clothes: JSON.stringify({component: 0, drawable: 0, color: 0, gender: (player.info.characterData['general']['gender'] ? 'male' : 'female')})});
            user.inventoryItems.push({id: jane.id, user: user.info.id, name: item, count: count, slot: slot, image: item.toLowerCase() + '.png', status: false, clothes: JSON.stringify({component: 0, drawable: 0, color: 0, gender: (player.info.characterData['general']['gender'] ? 'male' : 'female')})})
 
            sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} [#${player.id}] give a item ${item.toLowerCase()} (quantity: ${count}) to ${user.name} [#${user.id}].`);
        }
        catch(error) {console.log(error)} 
    }
});             
 
global.givePlayerItem = async function(player, item, count, clothes)
{ 
    try 
    {   
        const index = player.inventoryItems.findIndex(object => object.name === item);

        if(index != -1) {
            player.inventoryItems[index].count += count;  
            return await Inventory.update({ count: player.inventoryItems[index].count }, { where: { id: player.inventoryItems[index].id }});   
        }
       
        const jane = await Inventory.create({ user: player.info.id, name: item, count: count, slot: globalInventoryItems[item.toLowerCase()], image: globalInventoryItems[item.toLowerCase()] + '.png', status: false, clothes: JSON.stringify(clothes) });
  
        player.inventoryItems.push({id: jane.id, user: player.info.id, name: item, count: count, slot: globalInventoryItems[item.toLowerCase()], image: globalInventoryItems[item.toLowerCase()] + '.png', status: 0, clothes: clothes})
    }
    catch(error) { console.log(error) } 
};

global.removePlayerItem = async function(player, item) {

    try 
    {  
        const raw = JSON.parse(item);
        
        console.log(raw)
         
        const index = player.inventoryItems.findIndex(object => object.name === raw.name && object.slot == raw.slot && object.clothes == raw.clothes);

        if(index != -1) {
 
            if(player.inventoryItems[index].count > 0) {
                player.inventoryItems[index].count --;
                await Inventory.update({ count: player.inventoryItems[index].count }, { where: { id: player.inventoryItems[index].id }});   

                sendMessage(player, 'fff', `Item updatat, cantitate actuala ${player.inventoryItems[index].count}.`);
            }

            if(player.inventoryItems[index].count <= 0) {
                await Inventory.destroy({ where: { id: player.inventoryItems[index].id }});

                player.inventoryItems.splice(index, 1);

                sendMessage(player, 'fff', 'Item distrus pentru ca a ajuns la cantitate 0.');
            } 
        } 
    }
    catch(error) { console.log(error) } 
};
 
global.haveItem = function(player, item)
{ 
    if(!player.loggedInAs)
        return;

    const index = player.inventoryItems.findIndex(object => object.name === item);
  
    return (index != -1 ? true : false);
}; 