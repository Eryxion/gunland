const rpc = require("rage-rpc");

global.stationPosition = 
[
    {id: 1, businessID: 4, x: 182.882, y: -1563.298, z: 29.276},
    {id: 2, businessID: 4, x: 176.415, y: -1569.796, z: 29.301},
    {id: 3, businessID: 4, x: 170.231, y: -1563.200, z: 29.271},
    {id: 4, businessID: 4, x: 177.188, y: -1557.207, z: 29.233},
 
    {id: 5, businessID: 5, x: -2558.185, y: 2328.826, z: 33.071}, 
    {id: 6, businessID: 5, x: -2551.592, y: 2329.288, z: 33.073},
    {id: 7, businessID: 5, x: -2558.533, y: 2336.205, z: 33.072}, 
    {id: 8, businessID: 5, x: -2551.951, y: 2336.666, z: 33.073},
    {id: 9, businessID: 5, x: -2552.600, y: 2344.211, z: 33.102}, 
    {id: 10, businessID: 5, x: -2559.022, y: 2343.741, z: 33.105},  
];
 
stationPosition.forEach(index => {
 
    let colshape = mp.colshapes.newSphere(index.x, index.y, index.z, 2);
    colshape.atStationColshape = index.id + 1; 
  
    mp.markers.new(2, new mp.Vector3(index.x, index.y, index.z - 0.2), 0.5, { color: [255, 255, 255, 255], dimension: 0 });
});

rpc.register('server::petrol:checkout', (data, user) =>  
{
    try
    {
        const player = user.player; 
        const raw = JSON.parse(data); 
        const vehicle = player.vehicle;
        const full = vehicle.getVariable('vehicleGass') + raw.amount;
 
        if(vehicle.getVariable('vehicleGass') >= 100) 
            return sendNotiffication(player, 'error', 'This vehicle already have a full tank.');

        if(full >= 100) 
            return sendNotiffication(player, 'error', `You can fill only ${parseInt(100) - parseInt(vehicle.getVariable('vehicleGass'))} liters`); 
    
        if((raw.payment == 'card' && player.info.bank < raw.price) || (raw.payment == 'cash' && player.info.money < raw.price))
            return sendNotiffication(player, 'info', `You dont have this amount (${raw.payment} payment).`, 'Bank:');

        (raw.payment == 'card' ? player.giveMoneyBank(1, raw.price) : player.giveMoney(1, raw.price))

        vehicle.setVariable('vehicleGass', vehicle.getVariable('vehicleGass') + parseInt(raw.amount));

        sendNotiffication(player, 'success', `You filled this ${vehicle.params.model} for $${formatMoney(raw.price)}`, 'Gas Station:');

        serverBusinessProcent(player.businessID, raw.price); 

        return player.call('client::petrol:close', []);
    }
    catch(error) { console.log(error) }   
}); 
 
global.startPetrolBrowser = function(player, vehicleID)
{ 
    const x = player.inStationColshape - 1;
 
    if(x == -1 || !player.IsInRange(stationPosition[x].x, stationPosition[x].y, stationPosition[x].z, 2)) 
        return sendNotiffication(player, 'success', `You are not at a gas station.`);

    player.vehicleSelected = vehicleID;
    player.businessID = stationPosition[x].businessID;

    return player.call("client::petrol:show", []); 
}