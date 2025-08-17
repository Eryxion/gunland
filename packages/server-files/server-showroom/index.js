const { CommandRegistry } = require('../server-global/improved-commands');  
const rpc = require("rage-rpc");
  
global.showRoomPosition = mp.colshapes.newSphere(-31.224, -1104.523, 26.422, 3);
global.dealerMarker = mp.markers.new(1, new mp.Vector3(-31.224, -1104.523, 26.422 - 1.4), 1, { color: [255, 255, 255, 255], dimension: 0 });
global.dealerBlip  = mp.blips.new(225, new mp.Vector3(-31.224, -1104.523, 26.422), { dimension: 0, color: 4, name: 'Shoowroom LS'});
    
global.showroomPosition = [
    {x: -61.97,  y: -1117.08, z: 26.0147, rotation: 1.30},
    {x: -59.161, y: -1116.92, z: 26.016,  rotation: 1.85}
];

global.formatKM = function(x) { 
    return x.toString().replace(/\B(?=(\d{2})+(?!\d))/g, ".")
};

global.Dealership = sequelize.define('server-showroom', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    price: DataTypes.INTEGER, 
    stock: DataTypes.INTEGER,  
    model: DataTypes.STRING,  
    category: DataTypes.STRING, 
     
    specifications: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({speed: "47.0", acceleration: "0.30", braking: "1.3", traction: "2.2"}) 
    },
 
    moodsprices: DataTypes.STRING, 
    moodsnames: DataTypes.STRING, 
    moodsindex: DataTypes.STRING 

}, { timestamps: false, paranoid: true, underscored: true, freezeTableName: true, tableName: 'server-showroom' }); 
 
global.loadServerDealership = async function() {

    global.serverDealership = [];
    let count = 0;
 
    await Dealership.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
            
                serverDealership[count] = { 
                    id: element.id,
                    model: element.model,
                    price: element.price,  
                    stock: element.stock,
                    category: element.category,
                    specifications: JSON.parse(element.specifications), 
                
                    moods: {
                        prices: JSON.parse(element.moodsprices), 
                        names: JSON.parse(element.moodsnames), 
                        index: JSON.parse(element.moodsindex), 
                    } 
                };
 
                count ++;
            }); 
        } 

        console.log('[MYSQL] Loaded dealership vehicles: ' + serverDealership.length);


        return console.log('element moods' + JSON.stringify(serverDealership[0].moods.names));

    }).catch((e) => console.log(e)); 
};
 
mp.events.add({ 
    "server::showroom:start" : (player) =>
    {  
        if(!player.IsInRange(-31.224, -1104.523, 26.422, 3)) 
            return;
 
        player.dealerVehicle = null;
        player.inDealer = true;

        player.position = new mp.Vector3(-1506.980, -2998.541, -82.207); 

        player.call("client::showroom:start", [JSON.stringify(serverDealership)]); 
    },

    "server::showroom:close" : (player) =>
    {
        player.position = new mp.Vector3(-31.224, -1104.523, 26.422);
        player.inDealer = false;

        if(player.dealerVehicle != null)
        {
            player.dealerVehicle.destroy();
            player.dealerVehicle = null;
        } 
    }  
});  

rpc.register('server::showroom:::color:change', (data, user) => 
{ 
    try {
        const player = user.player;
        const raw = JSON.parse(data); 
        
        if(player.dealerVehicle)
        {  
            return player.dealerVehicle.setColorRGB(hexToRgb('#' + raw.colors[0]).r, hexToRgb('#' + raw.colors[0]).g, hexToRgb('#' + raw.colors[0]).b, 
            hexToRgb('#' + raw.colors[1]).r, hexToRgb('#' + raw.colors[1]).g, hexToRgb('#' + raw.colors[1]).b);
        }
    }
    catch(e) { return console.log(e) } 
});

rpc.register('server::showroom:changeVehicle', (data, user) => 
{ 
    try {

        const player = user.player; 
        const raw = JSON.parse(data);
    
        if(player.dealerVehicle != null)
        {
            player.dealerVehicle.destroy();
            player.dealerVehicle = null;
        };
        
        if(Object.keys(raw).length)
        {
            var colorOne = [hexToRgb('#' + raw.colors[0]).r, hexToRgb('#' + raw.colors[0]).g, hexToRgb('#' + raw.colors[0]).b] 
            var colorTwo = [hexToRgb('#' + raw.colors[1]).r, hexToRgb('#' + raw.colors[1]).g, hexToRgb('#' + raw.colors[1]).b] 
        
            player.dealerVehicle = createVehicle(null, JSON.stringify({model: raw.model, position: new mp.Vector3(-1506.734, -2987.121, -82.631), heading: 175, putIn: false, type: 'showroom', faction: null, locked: true, fuel: 100, odometer: 0, color1: colorOne, color2: colorTwo, number: 'showroom' }))             
        };
    }
    catch(e) { return console.log(e) };
}); 
 
rpc.register('server::showroom:purchaseVehicle', async (data, user) => 
{ 
    try {
        const player = user.player; 
        const raw = JSON.parse(data);
    
        const randomPos = showroomPosition[Math.floor(Math.random() * Object.keys(showroomPosition).length)]; 
        const index = serverDealership.findIndex(object => object.model === raw.model);
    
        if(player.dealerVehicle != null) {
            player.dealerVehicle.destroy();
            player.dealerVehicle = null;
        }
         
        if(player.info.money < raw.price && raw.category != 'premium')
            return sendNotiffication(player, 'error', 'You don`t have this amount.'); 

		if(player.info.premiumpoints < raw.price && raw.category == 'premium')
            return sendNotiffication(player, 'error', 'You don`t have premium points for this vehicle.'); 
    
        if(index != -1 && !serverDealership[index].stock)
            return sendNotiffication(player, 'error', 'This vehicle is not in stock.'); 
        
        player.call('client::showroom:close', [false]);
    
        player.position = new mp.Vector3(-31.224, -1104.523, 26.422);
        player.inDealer = false;
    
		if(raw.category != 'premium') {
			player.giveMoney(1, raw.price); 
		}
		else {
			player.info.premiumpoints -= raw.price;
			await Account.update({ premiumpoints: player.info.premiumpoints }, { where: { id: player.info.id } });  
		}

		const textString = (raw.category != 'premium' ? `You bought ${raw.model} for $<a style = "color: #00cc44">${raw.price}</a>.` : `You bought ${raw.model} for ${raw.price} premium points.`); 
        sendNotiffication(player, 'info', textString, 'Dealership:'); 
          
        updatePlayerAchievement(player, 2);

        if(index != -1)
        {
            serverDealership[index].stock --;
 
            await Dealership.update({ safebox: serverDealership[index].stock }, { where: { id: serverDealership[index].id } } );        
        } 
    
        const primary = [hexToRgb('#' + raw.colors[0]).r, hexToRgb('#' + raw.colors[0]).g, hexToRgb('#' + raw.colors[0]).b];
        const secondary = [hexToRgb('#' + raw.colors[1]).r, hexToRgb('#' + raw.colors[1]).g, hexToRgb('#' + raw.colors[1]).b];
             
        insertNewVehicle(player, raw.model, JSON.stringify(randomPos), JSON.stringify(primary), JSON.stringify(secondary)); 
    }
    catch(e) { return console.log(e) } 
}); 
  
CommandRegistry.add({
    name: "setgas", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: function (player) 
    { 
        if(!gas)
            return sendUsage(player, '/setgas [gas]'); 

        if(player.vehicle)
        {
            vehicle.setVariable('vehicleGass', gas);  

            let vehicle = player.vehicle;
            let user = player.vehicle.user;
 
            if(Object.keys(user.personalVeh).length)
            {
                const index = vehicle.user.personalVeh.findIndex(object => object.vehicle == vehicle);
            
                if(index != -1)
                {  
                    vehicle.user.personalVeh[index].fuel = gas;  
                } 
            }  
        }  
    }
});

global.vehicleDealer = null;
 
CommandRegistry.add({
    name: "createdealercar", 
  
    run: async function(player, _, vehicle, category, stock, price) 
    {    
        if(player.info.admin < 7)  
            return player.staffPerms(7);
  
        vehicleDealer = createVehicle(player, JSON.stringify({model: vehicle, position: new mp.Vector3(0, 0, 0), heading: 175, putIn: false, type: 'showroom', faction: null, locked: true, fuel: 100, odometer: 0, color1: generateRGB(), color2: generateRGB(), number: 'showroom' }))             
        player.setVariable('vehicleCreated', vehicleDealer);
  
        rpc.callClient(player, 'GET_VEHICLE_ACCELERATION').then((raw) => {
               
            const specs = { speed: raw.speed, acceleration: raw.acceleration, braking: raw.braking, traction: raw.traction }
   
            Dealership.create({ model: vehicle, category: category, price: price, stock: stock, specifications: specs });
          
            serverDealership.push({id: serverDealership.length + 1, name: vehicle, category: category, price: price, stock: stock, specifications: specs});

            return sendMessage(player, 'ff00ff', `(Notice): ${player.name} [#${player.id}] added vehicle ${vehicle} in Dealership (price: ${price} stock: ${stock}).`); 
        }); 

        if(vehicleDealer)
        {
            vehicleDealer.destroy();
            vehicleDealer = null;
        }
    }
});