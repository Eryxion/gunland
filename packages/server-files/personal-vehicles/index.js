const rpc = require("rage-rpc");  
const { CommandRegistry } = require('../server-global/improved-commands'); 
 

global.PersonalVehicles = sequelize.define('personal_vehicles', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    user: DataTypes.INTEGER,  
    name: DataTypes.STRING,  
    status: DataTypes.STRING, 
    locked: DataTypes.INTEGER, 
    odometer: DataTypes.INTEGER, 
    days: DataTypes.INTEGER, 
    fuel: DataTypes.INTEGER, 
    insurance: DataTypes.INTEGER, 
    number: DataTypes.INTEGER, 

    position: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    },
    primarycolor: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    },
    secondarycolor: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    } 
}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'personal_vehicles' }); 


global.isInPersonalVehicle = function(player, vehicle)
{
    var exist = null;

    if(Object.keys(player.personalVeh).length)
    {
        const index = player.personalVeh.findIndex(object => object.vehicle == vehicle);
    
        if(index != -1) {  
            exist = index;
        } 
    } 
    
    return exist;
} 

global.insertNewVehicle = async function(player, name, dealerPos, primaryColor, secondaryColor)
{     
    const jane = await PersonalVehicles.create({ user: player.info.id, name: name, status: 'despawned', odometer: 0, days: 0, insurance: 100, position: dealerPos, primarycolor: primaryColor, secondarycolor: secondaryColor, number: 'new-vehicle' });
 
    player.personalVeh.push({id: jane.id, user: player.info.id, fuel: 100, name: name, position: JSON.parse(dealerPos), primary: JSON.parse(primaryColor), secondary: JSON.parse(secondaryColor), vehicle: null, status: 'despawned', odometer: 0, days: 0, insurance: 100, number: 'new-vehicle'});
};

global.destroyPersonalVehicle = function(vehicle)
{
    const player = vehicle.params.user;

    if(Object.keys(player.personalVeh).length)
    {
        const index = player.personalVeh.findIndex(object => object.vehicle === vehicle);

        if(index != -1)
        {
            player.personalVeh[index].vehicle = null; 
            player.personalVeh[index].status = 'despawned';

            console.log('vehicle personal has been destroyed');
        }
    } 
}; 

mp.events.add({
    "server::personalVehicles:load" : async (player) =>
    {  
        player.personalVeh = [];

        let count = 0;
 
        await PersonalVehicles.findAll({ raw: true, where: { user: player.info.id } }).then((found) => {
        
            if(found.length) {
     
                found.forEach(element => { 
                    let vehPos = JSON.parse(element.position);

                    player.personalVeh[count] = { 
                        id: element.id,
                        user: element.user,
                        name: element.name,
                        position: vehPos,  
                        vehicle: null,

                        primary: JSON.parse(element.primarycolor),  
                        secondary: JSON.parse(element.secondarycolor),  
                        status: 'despawned',
                        locked: element.locked,

                        odometer: element.odometer,
                        days: element.days,
                        insurance: element.insurance,
                        fuel: element.fuel,
                        number: element.number    
                    };
     
                    count ++;
                }); 
            } 
    
            return console.log('[MYSQL] Loaded personal vehicles: ' + player.personalVeh.length); 
        }).catch((e) => console.log(e));   
    },

    "playerQuit" : async (player, exitType, reason) =>
    {
        try 
        { 
            if(player.loggedInAs && player.personalVeh.length) 
            { 
                for(let index = 0; index < player.personalVeh.length; index ++)
                {    
                    await PersonalVehicles.update({ locked: player.personalVeh[index].locked, odometer: player.personalVeh[index].odometer, fuel: player.personalVeh[index].fuel }, { where: { id: player.personalVeh[index].id }});   
 
                    if(player.personalVeh[index].vehicle != null && player.personalVeh[index].status == 'spawned') { 
                        player.personalVeh[index].vehicle.destroy();
                        player.personalVeh[index].vehicle = null;
                    } 
                } 
            }  
        }
        catch(e)
        {
            return console.log(e)
        }  
    },

    "server::personal:calculateKM" : (player, speed) =>
    { 
        try 
        {
            if(player.vehicle && speed > 0 && player.seat == 0) 
            {
                const vehicle = player.vehicle;
                const user = vehicle.params.user;
    
                if(vehicle.params.type === 'personal')
                {
                    if(Object.keys(user.personalVeh).length)
                    {
                        let km = ((speed > 150 ? 2 : 1) + 1) + getRandomArbitrary(1, 2);
                
                        const index = user.personalVeh.findIndex(object => object.vehicle == vehicle);
                    
                        if(index != -1)
                        { 
                            user.personalVeh[index].odometer += parseInt(km); 
                            vehicle.setVariable('vehicleOdometer', user.personalVeh[index].odometer);
            
                            if(user.personalVeh[index].fuel)
                            {
                                user.personalVeh[index].fuel -= 0.05; 
                            } 
                        } 
                    } 
                }
    
                if(!vehicle.getVariable('vehicleGass'))
                {
                    return vehicle.engine = false;
                }    
                
                vehicle.setVariable('vehicleGass', vehicle.getVariable('vehicleGass') - 0.05);  
            }  
        }
        catch(e)
        {
            return console.log(e)
        }  
    },


    "server:radio::starting" : (player) =>
    {
        if(!player.vehicle || player.seat != 0)
            return;

        return player.call('client:radio::openMenu', [player.vehicle.getVariable('radioStation')]); 
    },

    "server:radio::radioChange" : (player, station) =>
    {
        try 
        {
            if(player.vehicle)
            {
                player.vehicle.setVariable('radioStation', station); 
    
                sendNotiffication(player, 'info', 'Vehicle radio changed succesfuly.');
    
                mp.players.forEach(users => {
    
                    if(users.loggedInAs && users.vehicle == player.vehicle)
                    { 
                        if(station && users.info.playerSettings.radio)
                        {  
                            users.call('client::radio:enterVehicle', [player.vehicle.getVariable('radioStation'), users.info.playerSettings.radioVolume]);
                        }
    
                        if(station == 0)
                        {
                            users.call('client::radio:exitVehicle', []);
                        }  
                    }
                }); 
            } 
        } 
        catch(e)
        {
            return console.log(e)
        }  
    }
});
  
rpc.register('server::phone::vehicles:inspect', (vehicle, user) => {}); 
rpc.register('server::phone::vehicles:sell', (vehicle, user) => {});

rpc.register('server::phone::vehicles:changePlate', async (data, user) =>
{
    const player = user.player;
    const raw = JSON.parse(data);
 
    player.personalVeh[raw.vehicle].number = raw.number;

    sendNotiffication(player, 'success', `Now your vehicle ${player.personalVeh[raw.vehicle].name} have number: ${raw.number}`); 
  
    await PersonalVehicles.update({ number: player.personalVeh[raw.vehicle].number }, { where: { id: player.personalVeh[raw.vehicle].id }});   
 
    return rpc.callBrowsers(mp.players.at(player.id), 'reloadPhoneData', [JSON.stringify({vehicles: JSON.stringify(player.personalVeh, getCircularReplacer()), locations: { businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }})]);
}); 
 
rpc.register('server::phone::vehicles:despawn', (index, user) =>
{
    const player = user.player;

    if(player.personalVeh[index].status == 'despawned')
        return sendNotiffication(player, 'info', 'This vehicle is not spawned.', 'Vehicle:');

    if(player.personalVeh[index].status == 'spawned' && player.personalVeh[index].vehicle != null)
    {
        player.personalVeh[index].vehicle.destroy();
        player.personalVeh[index].vehicle = null; 
    }

    player.personalVeh[index].status = 'despawned';

    sendNotiffication(player, 'info', `Your ${player.personalVeh[index].name} is now <a style = "color: #ff4d4d;">despawned</a>.`, 'Vehicle:'); 
 
    return rpc.callBrowsers(mp.players.at(player.id), 'reloadPhoneData', [JSON.stringify({vehicles: JSON.stringify(player.personalVeh, getCircularReplacer()), locations: { businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }})]);
});

rpc.register('server::phone::vehicles:locate', (index, user) =>
{
    const player = user.player;

    if(player.personalVeh[index].status == 'despawned')
        return sendNotiffication(player, 'info', 'This vehicle is not spawned.', 'Vehicle:');
 
    setPlayerCheckpoint(player, parseFloat(player.personalVeh[index].position.x), parseFloat(player.personalVeh[index].position.y), parseFloat(player.personalVeh[index].position.z), null);  
    return sendNotiffication(player, 'success', `Your ${player.personalVeh[index].name} has been located, follow marker.`, 'Vehicle:'); 
});

rpc.register('server::phone::vehicles:lock', async (index, user) =>
{
    const player = user.player;

    player.personalVeh[index].locked = !player.personalVeh[index].locked  

    if(player.personalVeh[index].status == 'spawned')
    {
        const vehicle = mp.vehicles.toArray().find((vehIndex) => vehIndex.id == player.personalVeh[index].vehicle.id);

        if(vehicle != -1)
        {
            vehicle.locked = (player.personalVeh[index].locked == '1' ? true : false);
        }
    }

    await rpc.callBrowsers(mp.players.at(player.id), 'reloadPhoneData', [JSON.stringify({vehicles: JSON.stringify(player.personalVeh, getCircularReplacer()), locations: { businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }})]);

    return sendNotiffication(player, 'success', `Your ${player.personalVeh[index].name} is now <a style = "color: ${player.personalVeh[index].locked ? '#ff4d4d;' : '#00cc44;'}">${player.personalVeh[index].locked ? 'locked' : 'unlocked'}</a>`, 'Vehicle:'); 
});

rpc.register('server::phone::vehicles:tow', (index, user) =>
{
    const player = user.player;

    if(player.personalVeh[index].status == 'spawned')
        return sendNotiffication(player, 'info', 'This vehicle is already spawned.', 'Vehicle:');

    player.personalVeh[index].vehicle = createVehicle(player, JSON.stringify({
        model: player.personalVeh[index].name, 
        position: new mp.Vector3(player.personalVeh[index].position.x, player.personalVeh[index].position.y, player.personalVeh[index].position.z), 
        putIn: false, 
        faction: null,
        type: 'personal', 
        heading: player.personalVeh[index].position.rotation,
        number: player.personalVeh[index].number,
        fuel: player.personalVeh[index].fuel,
        odometer: player.personalVeh[index].odometer,
        color1: player.personalVeh[index].primary, 
        color2: player.personalVeh[index].secondary
    })); 
     
    player.personalVeh[index].status = 'spawned';

    sendNotiffication(player, 'info', `Your ${player.personalVeh[index].name} is now <a style = "color: #00cc44;">spawned</a>.`, 'Vehicle:'); 

    return rpc.callBrowsers(mp.players.at(player.id), 'reloadPhoneData', [JSON.stringify({vehicles: JSON.stringify(player.personalVeh, getCircularReplacer()), locations: { businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }})]);
});
 
CommandRegistry.add({
    name: "park", 
     
    run: async function (player) 
    { 
        if(!player.vehicle)
            return sendNotiffication(player, 'error', 'You are not in a vehicle.');

        if(isInPersonalVehicle(player, player.vehicle) == null)
            return sendNotiffication(player, 'error', 'This vehicle is not personal.'); 
  
        const index = isInPersonalVehicle(player, player.vehicle);

        player.personalVeh[index].position = { x: player.position.x.toFixed(3), y: player.position.y.toFixed(3), z: player.position.z.toFixed(3), rotation: player.vehicle.rotation.z.toFixed(3) } 

        sendNotiffication(player, 'info', 'Your vehicle is now parked here.', 'Personal Vehicle:');  
 
        await PersonalVehicles.update({ position: JSON.stringify(player.personalVeh[index].position) }, { where: { id: player.personalVeh[index].id }});   
    }
});