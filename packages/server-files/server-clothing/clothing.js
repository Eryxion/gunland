const { CommandRegistry } = require("../server-global/improved-commands"); 
 
global.isAProp = ['watch', 'glasses', 'hat', 'bracelet', 'ears'];
global.clothingItemsData = ['hat', 'jacket', 'jeans', 'watch', 'mask', 'glasses', 'bracelet', 'shoes'];
global.clothesDefect = {  
    false: [7, 25, 34, 58, 65, 91, 97, 133, 185, 133], //female
    true: [3, 4, 7, 10, 20, 23, 24, 27, 28, 35, 37, 46, 59, 70, 74, 79, 86, 87, 88, 90] //male
}
global.defaultClothes = { 
    false: {'jacket': 15, 'jeans': 0, 'shoes': 0, 'mask': 0, 'bracelet': 0, 'glasses': -1, 'hat': -1, 'watch': -1, 'bracelet': -1}, //female
    true: {'jacket': 15, 'jeans': 0, 'shoes': 0, 'mask': 0, 'bracelet': 0, 'glasses': 0, 'hat': 11, 'watch': -1, 'bracelet': -1}, //male
};
 
global.Clothing = sequelize.define('server-clothing', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: null,
        autoIncrement: true
    }, 
    name: DataTypes.STRING, 
    price: DataTypes.INTEGER,  
    category: DataTypes.STRING,  
    component: DataTypes.INTEGER,  
    variation: DataTypes.INTEGER, 
    gender: DataTypes.STRING, 
     
    colors: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    } 
}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'server-clothing' }); 
 
global.loadServerClothing = async function() {

    global.clothingItems = [];
    let count = 0;
 
    await Clothing.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
            
                clothingItems[count] = { 
                    id: element.id,
                    name: element.name,
                    price: element.price,  
                    category: element.category,
                    component: element.component,
                    variation: element.variation,
                    gender: element.gender,
                    
                    color: JSON.parse(element.colors),  
                };
 
                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded clothing items: ' + clothingItems.length);

    }).catch((e) => console.log(e)); 
};
 
mp.events.add({

    'server::clothing:closeMenu' : (player) =>
    { 
        player.position = player.lastPosition.position;
        player.heading = player.lastPosition.heading;

        return reloadPlayerClothes(player);
    },
 
    'server::clothing:buyItems' : async (player, option, price, data) =>
    {  
        const raw = JSON.parse(data);
        
        if((option == 'cash' && (player.info.money < price)) || (option == 'card' && (player.bank < price))) 
            return sendNotiffication(player, 'info', 'You don`t have this amount.');
 
        player.call('client::clothing:closeMenu', []);  
        player.call('client::character:applyData', [JSON.stringify(player.info.characterData['general']), JSON.stringify(player.info.characterData['appearance']), JSON.stringify(player.info.characterData['features'])]); 
 
        player.position = player.lastPosition.position;
        player.heading = player.lastPosition.heading;
 
        for(let x = 0; x < raw.length; x++)
        { 
            const index = player.inventoryItems.findIndex(object => (object.slot == raw[x].category && object.clothes.color == raw[x].color && object.name == raw[x].name));

            if(index != -1) {
                player.inventoryItems[index].count ++; 
              
                await Inventory.update({ count: player.inventoryItems[index].count }, { where: { id: player.inventoryItems[index].id }});  
            }
            else { 
                const jane = await Inventory.create({ user: player.info.id, name: raw[x].name, count: 1, slot: raw[x].category, image: raw[x].category + '.png', status: false, clothes: JSON.stringify({component: raw[x].component, drawable: raw[x].variation, color: raw[x].color, gender: raw[x].gender})});
                player.inventoryItems.push({id: jane.id, user: player.info.id, name: raw[x].name, count: 1, slot: raw[x].category, image: raw[x].category + '.png', status: false, clothes: { component: raw[x].component, drawable: raw[x].variation, color: raw[x].color, gender: raw[x].gender }})
            } 
        }
 
        reloadPlayerClothes(player); 
        (option == 'cash' ? player.giveMoney(1, price) : player.giveMoneyBank(1, price));
 
        sendNotiffication(player, 'success', `Item purchased for $${formatMoney(price)} (${option})`, 'Clothing Store:')

        return serverBusinessProcent(player.businessID, price); 
    }
});

global.enterPlayerClothing = function(player)
{  
    player.lastPosition = { position: player.position, heading: player.heading } 
    player.model =  mp.joaat(player.info.characterData['general']['gender'] ? 'mp_m_freemode_01' : 'mp_f_freemode_01');

    player.setProp(0, defaultClothes[player.info.characterData['general']['gender']]['hat'], 0);
    player.setProp(1, defaultClothes[player.info.characterData['general']['gender']]['glasses'], 0);
    player.setProp(6, defaultClothes[player.info.characterData['general']['gender']]['watch'], 0);
    player.setProp(7, defaultClothes[player.info.characterData['general']['gender']]['bracelet'], 0);
  
    player.setClothes(4, 0, 0, 0); 
    player.setClothes(6, 0, 0, 0); 

    player.setClothes(3, 15, 0, 0); 
    player.setClothes(8, 15, 0, 0); 
    player.setClothes(11, 15, 0, 0);  
 
    player.position = new mp.Vector3(8.868, 529.477, 170.635);
    player.heading = 158.549;
 
    return player.call('client::clothing:openMenu', [JSON.stringify(clothingItems), (player.info.characterData['general']['gender'] ? 'male' : 'female')]); 
}
 
CommandRegistry.add({
    name: "clothes", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 7)  
            return player.staffPerms(7);

        return true;
    },
    run: function (player, _, component, drawable, texture, palette) 
    { 
        if(parseInt(component) === undefined || parseInt(drawable) === undefined || parseInt(texture) === undefined || parseInt(palette) === undefined)  
            return player.outputChatBox('Use syntax: /setclothes [component_id] [drawable_id] [texture_id] [palette_id]'); 
   
        return player.setClothes(parseInt(component), parseInt(drawable), parseInt(texture), parseInt(palette));
    }
});
 
CommandRegistry.add({
    name: "prop", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 7)  
            return player.staffPerms(7);

        return true;
    },
    run: function (player, _, component, drawable, texture) 
    { 
        if(parseInt(component) === undefined || parseInt(drawable) === undefined || parseInt(texture) === undefined)  
            return player.outputChatBox('Use syntax: /prop [component] [drawable] [texture] [palette]'); 


        player.model =  mp.joaat(player.info.characterData['general']['gender'] ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
     
        player.setClothes(parseInt(component), parseInt(drawable), parseInt(texture), 0); 
    }
});
 
global.reloadPlayerClothes = function(player)
{   
    if(player.info.jail)
        return;

    let raw = player.info.characterData['general'];
 
    player.setProp(0, defaultClothes[raw.gender]['hat'], 0);
    player.setProp(1, defaultClothes[raw.gender]['glasses'], 0);
    player.setProp(6, defaultClothes[raw.gender]['watch'], 0);
    player.setProp(7, defaultClothes[raw.gender]['bracelet'], 0);
 
    player.setClothes(4, 0, 0, 0); 
    player.setClothes(6, 0, 0, 0); 

    player.setClothes(3, 15, 0, 0); 
    player.setClothes(8, 15, 0, 0); 
    player.setClothes(11, 15, 0, 0); 

    if(Object.keys(player.info.tatoos).length) {
        player.call('client::tatoo:apply', [JSON.stringify(player.info.tatoos)]); 
    }
 
    for(let x = 0; x < Object.keys(player.inventoryItems).length; x++)
    {   
        if(clothingItemsData.includes(player.inventoryItems[x].slot) && player.inventoryItems[x].status)
        {   
            let clothing = player.inventoryItems[x].clothes;
            
            if(clothing.gender != (raw.gender ? 'male' : 'female'))
                return;
  
            player.attachedItems[player.inventoryItems[x].slot] = {id: player.inventoryItems[x].id, name: player.inventoryItems[x].name, count: player.inventoryItems[x].count, slot: player.inventoryItems[x].slot, image: player.inventoryItems[x].image, status: player.inventoryItems[x].status, index: player.inventoryItems[x].count}
            
            if(isAProp.includes(player.inventoryItems[x].slot)) 
            {
                player.setProp(clothing.component, clothing.drawable, clothing.color);
            }
            else
            { 
                if(player.inventoryItems[x].slot === 'jacket')
                {
                    player.setClothes(3, (clothesDefect[raw.gender].includes(clothing.drawable) ? (raw.gender ? 14 : 6) : 0), 0, 0);
                } 
                player.setClothes(clothing.component, clothing.drawable, clothing.color, 0); 
            }    
        } 
    }  
}

CommandRegistry.add({
    name: "screen", 
    
    run: function (player) 
    { 
        player.call("prepareScreenshot", []);
    }
});  