const { CommandRegistry } = require("../server-global/improved-commands/index.js"); 
  
require("./business-store/index.js");
require("./business_gas/index.js");
 
global.Business = sequelize.define('server-busines', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: null,
        autoIncrement: true
    }, 
   
    name: DataTypes.STRING, 
    owner: DataTypes.INTEGER, 
    price: DataTypes.INTEGER, 
    icon: DataTypes.INTEGER, 
    safebox: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
 
    position: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({
            x: 0, y: 0, z: 0 
        }) 
    }

}, { timestamps: false });  
 
global.loadServerBusiness = async function() {

    global.serverBusiness = [];
    let count = 0;
 
    await Business.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
                let position = JSON.parse(element.position);
                
                serverBusiness[count] = { 
                    id: element.id,
                    name: element.name,
                    position: position,  
                    icon: element.icon,
                    owner: element.owner,
                    price: element.price,
                    safebox: element.safebox,
 
                    blip: mp.blips.new(element.icon, new mp.Vector3(position.x, position.y, position.z), { name: element.name, color: 4, shortRange: true, scale: 0.8 }),
                    marker: mp.markers.new(1, new mp.Vector3(position.x, position.y, position.z - 1.4), 1, { color: [255,255,255,255], dimension: 0 })
                };

                mp.colshapes.newSphere(position.x, position.y, position.z, 3).business_position = count + 1;  

                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded server business: ' + serverBusiness.length);

    }).catch((e) => console.log(e)); 
};
  
global.getBusinessDescription = function(id) {

    let text = '';

    switch(id) {
        case 6: text = 'Here you can get coolest parts'; break;
        default: text = 'Business Los Santos'; break;
    }

    return text;
};
  
mp.events.add({
    "playerEnterColshape" : async (player, shape) => {
        if(shape.business_position)
        {  
            player.buttons = [];
            player.atBusinessPosition = shape.business_position - 1;

            const description = await getBusinessDescription(serverBusiness[shape.business_position - 1].id);
             
            player.call("client::hud:interractShow", [true, serverBusiness[shape.business_position - 1].name, JSON.stringify([description]), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        }

        if(shape.atStationColshape && player.vehicle && player.seat == 0)
        {
            player.businessID = stationPosition[shape.atStationColshape - 1].businessID;

            player.call("client::petrol:show", []); 
        }
    },

    "playerExitColshape" : (player, shape) => {
        if(player.atBusinessPosition) { 
            player.call("client::hud:interractShow", [false, '', '', '']);

            player.atBusinessPosition = -1;
        }

        if(player.inStationColshape) {   
            player.call("client::petrol:close", []); 
        }
    },

    "client::business:accesingKey" : (player) => {  
        const x = player.atBusinessPosition;
 
        if(x != -1 && player.IsInRange(serverBusiness[x].position.x, serverBusiness[x].position.y, serverBusiness[x].position.z, 5)) 
        {
            player.businessID = x;

            switch(serverBusiness[x].name)
            {
                case '24/7 Market': { player.call("client::store:open", []); break; }  
                case 'gas-station': { player.call("client::petrol:show", []); break; }  
                case 'Clothing Store': { enterPlayerClothing(player); break; }
                case 'Gun Shop': { player.call("client::gunshop:show", []); break; }  

                case 'Vehicle Mod Shop': {
                    startTunning(player); break;
                }

                case 'Tatoo': {
                    startPlayerTatoo(player);
                    break;
                }

                case 'News Agency': {
                    showPlayerMarket('normal');
                    break;
                }
            } 
        }   
    } 
});
 
global.serverBusinessProcent = async function(business, amount) 
{  
    serverBusiness[business].safebox += parseInt(amount);
 
    await Business.update({ safebox: serverBusiness[business].safebox }, { where: { id: serverBusiness[business].id } } ); 
};
 
CommandRegistry.add({
    name: "gotobiz", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: function (player, id) {

        if(!id) 
            return sendUsage(player, '/gotobiz [business id]'); 

        if(id > Object.keys(serverBusiness).length || id < 1) 
            return sendMessage(player, '009933', 'Invalid business ID.');
     
        return player.position = new mp.Vector3(serverBusiness[id - 1].position.x, serverBusiness[id - 1].position.y, serverBusiness[id - 1].position.z);
    }
});