const { json } = require("sequelize");
const { CommandRegistry } = require("../server-global/improved-commands"); 
const rpc = require("rage-rpc");

global.server_houses = [];


global.Houses = sequelize.define('server_houses', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    
    owner: {
        type: DataTypes.STRING,
        defaultValue: null
    },  
    ownersql: DataTypes.INTEGER, 
    rent: DataTypes.INTEGER, 
    price: DataTypes.INTEGER, 
    safebox: DataTypes.INTEGER, 
    locked: DataTypes.INTEGER, 
    rent: DataTypes.INTEGER, 
 
    exitpos: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({x: 0, y: 0, z: 0}) 
    },
    enterpos: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({x: 0, y: 0, z: 0}) 
    }

}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'server_houses' }); 


global.loadServerHouses = async function() {
 
    let count = 0;
 
    await Houses.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
                const housePos = JSON.parse(element.exitpos);
                const interiorPos = JSON.parse(element.enterpos);
                
                server_houses[count] = { 
                    id: element.id,
                    owner: element.owner,
                    ownerSQL: element.ownersql,  
                    rent: element.rent,
                    safebox: element.safebox,
                    price: element.price,
                    locked: element.locked,
                    doors: [],

                    position: housePos, 
                    positionInt: interiorPos,
                    name: 'House ' + element.id,
 
                    blip: mp.blips.new(411, new mp.Vector3(housePos.x, housePos.y, housePos.z), { name: 'House' + element.id, color: (element.price > 0 ? 49 : 2), shortRange: true}),
                    marker: mp.markers.new(1, new mp.Vector3(housePos.x, housePos.y, housePos.z - 1.4), 1, { color: [255,255,255,255], dimension: 0 }),
                    markerInterior: mp.markers.new(1, new mp.Vector3(interiorPos.x, interiorPos.y, interiorPos.z - 1.4), 1, { color: [255,255,255,255], dimension: element.id }) 
                };

                mp.colshapes.newSphere(housePos.x, housePos.y, housePos.z, 3, 0).houseExterior = count + 1; 
                mp.colshapes.newSphere(interiorPos.x, interiorPos.y, interiorPos.z, 3, element.id).houseInterior = count + 1;

                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded server houses: ' + server_houses.length);

    }).catch((e) => console.log(e)); 
};
 
global.showHouseMenu = async function(player, house, page, visitor = false)
{   
    let renters = await getHouseRenters(player, house);
 
    let string = {
        locked: server_houses[house - 1].locked, safebox: server_houses[house - 1].safebox,
        price: server_houses[house - 1].price, doors: server_houses[house - 1].doors, 
        rent: server_houses[house - 1].rent, renters: JSON.parse(renters)
    }
 
    await player.call('client:house::showMenu', [JSON.stringify(string), page, visitor]);  
};

mp.events.add({
  
    "server:houses::showOptions" : (player) => {
        const interior = player.atHouseEnter - 1; 
        const house = player.atHouseExit - 1;
 
        if(player.working || player.createdObject)
            return;

        //HOUSE OPTION ONLY FOR OWNER 
        if(interior >= 0 && server_houses[interior].ownerSQL == player.info.id && player.IsInRange(server_houses[interior].positionInt.x, server_houses[interior].positionInt.y, server_houses[interior].positionInt.z, 3)) {  
            return showHouseMenu(player, player.info.house, 0);
        }
 
        //HOUSE OPTION FOR PLAYERS
        if(house >= 0 && server_houses[house].ownerSQL != player.info.id && player.IsInRange(server_houses[house].position.x, server_houses[house].position.y, server_houses[house].position.z, 3)) {  
            return showHouseMenu(player, player.atHouseExit, 9, true);   
        }
    },
 
    "playerEnterColshape" : (player, shape) => {
        if(shape.houseExterior && !player.working)
        {   
            player.atHouseExit = shape.houseExterior; 
            player.buttons = [];

			const x = player.atHouseExit - 1;
               
            player.buttons.push({ key: 'F', text: 'Enter' });

            if((server_houses[x].ownerSQL > 0 && server_houses[x].ownerSQL != player.info.id) || (server_houses[x].price && server_houses[x].ownerSQL != player.info.id) || (server_houses[x].rent && server_houses[x].ownerSQL != player.info.id && player.info.house != server_houses[x].id)) {
                player.buttons.push({key: 'E', text: 'Options'}) 
            }
 
			const ownerString = (server_houses[x].price ? 'This property is for sale' : (server_houses[x].owner == null ? "This house don't have owner" : 'This property is owned by ' + server_houses[x].owner));
 
            player.call("client::hud:interractShow", [true, 'House', JSON.stringify([ownerString, server_houses[x].price ? `You can buy it for $${formatMoney(server_houses[x].price)}` : '']), JSON.stringify(player.buttons)]); 
        }

        if(shape.houseInterior)
        {   
            player.atHouseEnter = shape.houseInterior; 
            player.buttons = [];
           
            if(player.dimension === server_houses[player.atHouseEnter - 1].id)
            { 
                player.buttons.push({ key: 'F', text: 'Exit' });
 
                if(server_houses[player.atHouseEnter - 1].ownerSQL == player.info.id) { 
                    player.buttons.push({key: 'E', text: 'House Menu'})
                }
    
                return player.call("client::hud:interractShow", [true, 'House Interior', JSON.stringify(''), JSON.stringify(player.buttons)]);
            }   
        }
    },

    "playerExitColshape" : (player, shape) => 
    { 
        if(player.atHouseExit)
        {   
            player.atHouseExit = 0; 

            const haveRequest = server_houses[player.atHouseExit].doors.findIndex(object => object.name === player.name);

            if(haveRequest != -1) {
                server_houses[player.atHouseExit].doors.splice(haveRequest, 1);
            } 

            if(player.inHouseMenu) {
                player.call('client::house:closeMenu', []);
            }

            player.call("client::hud:interractShow", [false, '', '', '']);
        }

        if(player.atHouseEnter)
        { 
            player.atHouseEnter = 0;

            player.call("client::hud:interractShow", [false, '', '', '']);
        }
    },
 
    "server:houses::enterHouse": (player) =>
    {
        const exterior = player.atHouseExit - 1;
        const interior = player.atHouseEnter - 1; 
    
        if((!player.atHouseExit && !player.atHouseEnter) || player.working || player.createdObject)
            return;
  
        if(exterior >= 0 && player.IsInRange(server_houses[exterior].position.x, server_houses[exterior].position.y, server_houses[exterior].position.z, 3) && (!server_houses[exterior].locked || player.info.id == server_houses[exterior].ownerSQL))
        { 
            player.houseInt = exterior;
            player.dimension = server_houses[exterior].id;
 
            player.position = new mp.Vector3(server_houses[exterior].positionInt.x, server_houses[exterior].positionInt.y, server_houses[exterior].positionInt.z);
            player.heading = server_houses[exterior].positionInt.heading;
            return;
        }

        if(interior >= 0 && player.houseInt != null && player.IsInRange(server_houses[interior].positionInt.x, server_houses[interior].positionInt.y, server_houses[interior].positionInt.z, 3) && player.dimension == server_houses[interior].id)
        {   
            const index = player.houseInt;
 
            player.position = new mp.Vector3(server_houses[index].position.x, server_houses[index].position.y, server_houses[index].position.z);
            player.heading = server_houses[index].position.heading;
            player.dimension = 0;

            return player.houseInt = null;
        }   
    } 
}); 

rpc.register('server:houses::changeLock', async (_, user) =>  
{
    try
    {
        const player = user.player; 
        const house = player.info.house - 1;

        server_houses[house].locked = !server_houses[house].locked;
  
        await Houses.update({ locked: server_houses[house].locked }, { where: { id: server_houses[house].id }});  

        return sendNotiffication(player, 'info', `Your house is now ${server_houses[house].locked ? 'locked' : 'unlocked'}`, 'House:');
    }
    catch(error) { console.log(error) }   
});

rpc.register('server:houses::withdrawMoney', async (_, user) =>  
{
    try
    {
        const player = user.player; 
        const house = player.info.house - 1;

        if(!server_houses[house].safebox) 
            return sendNotiffication(player, 'error', 'You dont have money in house safebox.');
 
        sendNotiffication(player, 'success', `You get $${formatMoney(server_houses[house].safebox)} from your house safebox.`, 'Safe Box:')

        player.giveMoney(0, server_houses[house].safebox);

        server_houses[house].safebox = 0;
  
        showHouseMenu(player, player.info.house, 0);
 
        await Houses.update({ safebox: server_houses[house].safebox }, { where: { id: server_houses[house].id }});  
    }
    catch(error) { console.log(error) }   
});

rpc.register('server:houses::sellToState', async (_, user) =>  
{
    try
    {
        const player = user.player; 
        const house = player.info.house - 1;
 
        server_houses[house].owner = 'none';
        server_houses[house].ownerSQL = 0;
        server_houses[house].price = 10000000;
 
        await Houses.update({ owner: server_houses[house].owner, ownersql: server_houses[house].ownerSQL, price: server_houses[house].price }, { where: { id: server_houses[house].id }});  

        player.giveMoney(0, 10000000); 
        player.info.house = -1;
 
        await Account.update({ house: player.info.house }, { where: { id: player.info.id } }); 

        player.call('client::house:closeMenu', []);

        return sendNotiffication(player, 'success', `You sell this property to state for $${formatMoney(10000000)}`, 'House:');
    }
    catch(error) { console.log(error) }   
});
 
rpc.register('server:houses::acceptDoor', (index, requester) =>  
{
    try
    {
        const player = requester.player; 
        let house = player.info.house - 1; 
        let haveRequest = server_houses[house].doors.findIndex(object => object.name === server_houses[house].doors[index].name);

        if(haveRequest == -1)
        {
            sendNotiffication(player, 'info', 'This player left your front door.');
            return showHouseMenu(player, player.info.house, 0);
        }
      
        let user = mp.players.toArray().find((user) => user.name === server_houses[house].doors[index].name); 

        if(user != -1)
        {
            user.houseInt = house; 
            user.position = new mp.Vector3(server_houses[house].positionInt.x, server_houses[house].positionInt.y, server_houses[house].positionInt.z);
            user.heading = server_houses[house].positionInt.heading; 

            sendNotiffication(player, 'success', `${user.name} joined in your house.`, 'House:');
            sendNotiffication(user, 'success', `${player.name} accepted your request.`, 'House:');
        } 
    }
    catch(error) { console.log(error) }   
});

rpc.register('server:houses::purchaseHouse', async (_, user) =>  
{
    try
    {
        const player = user.player; 
        const house = player.atHouseExit - 1;
 
        if(house >= 0)
        {
            if(player.info.house != -1 && server_houses[player.info.house - 1].ownerSQL == player.info.id)
                return sendNotiffication(player, 'error', 'You already own a house, you cant rent another one.', 'House:');

            if(player.info.money < server_houses[house].price)
                return sendNotiffication(player, 'error', 'You dont have this amount.', 'Bank:');
 
            const propietar = getNameOnNameID(server_houses[house].owner);

            if(propietar != undefined) { 
                if(propietar.loggedInAs) {
                    propietar.giveMoney(0, server_houses[house].price);  
                    propietar.info.house = -1;

                    sendNotiffication(propietar, 'info', `${player.name} bought your house for $${formatMoney(server_houses[house].price)}.`, 'House:');
                } 
            }
            else { 
                Account.update({ money: sequelize.literal('houseDays' + server_houses[house].price), house: -1 }, { where: { id: server_houses[house].ownerSQL }});
            }

            player.giveMoney(1, server_houses[house].price); 
            player.info.house = house + 1;

            player.inHouseMenu = false;
            player.call('client::house:closeMenu', []);

            sendNotiffication(player, 'success', `You bought this house [ID: ${house + 1}] for $${formatMoney(server_houses[house].price)}.`, 'House:');

            server_houses[house].owner = player.name;
            server_houses[house].ownerSQL = player.info.id;
            server_houses[house].price = 0;
 
            await Account.update({ house: player.info.house }, { where: { id: player.info.id } }); 
 
            await Houses.update({ owner: server_houses[house].owner, ownersql: server_houses[house].ownerSQL, price: server_houses[house].price }, { where: { id: server_houses[house].id }});  
        }
    }
    catch(error) { console.log(error) }   
});
 
rpc.register('server:houses::requestEnter', (_, user) =>  
{
    try
    {
        const player = user.player;   
        const house = player.atHouseExit - 1;

        player.call('client::house:closeMenu', []);
   
        const haveRequest = server_houses[house].doors.findIndex(object => object.name === player.name);
        const owner = mp.players.toArray().find((user) => user.name === server_houses[house].owner); 

        if(haveRequest != -1)
            return sendNotiffication(player, 'info', 'You already have a request to join in this house.');

        if(owner == -1 || owner == undefined)
            return sendNotiffication(player, 'info', 'Owner off this house is not connected.');

        if(owner.houseInt == null)
            return sendNotiffication(player, 'info', 'Owner of this house is not at home.');

        server_houses[house].doors.push({name: player.name, faction: (player.info.group ? serverFactions[player.info.group - 1].name : 'CIVILIAN')}); 
    
        sendNotiffication(owner, 'success', 'You have a visitor.');
        sendNotiffication(player, 'success', 'Request send to house owner, please wait.');   
    }
    catch(error) { console.log(error) } 
}); 


rpc.register('server:houses::rentHouse', async (days, user) =>  
{
    try
    {
        const player = user.player;  
        const house = player.atHouseExit - 1;
 
        if(player.info.house && server_houses[player.info.house - 1].ownerSQL == player.info.id)
            return sendNotiffication(player, 'error', 'You already own a house, you cant rent another one.', 'House:');
         
        if(player.info.money < server_houses[house].rent * days)
            return sendNotiffication(player, 'error', 'You dont have this amount.', 'Bank:')
 
        player.call('client::house:closeMenu', []); 
        player.giveMoney(1, server_houses[house].rent * days);

        player.info.house = house + 1;
        player.data.houseDays = days;
        player.inHouseMenu = false;
          
        await Account.update({ house: player.info.house, houseDays: player.info.houseDays }, { where: { id: player.info.id } } ); 
          
        return sendNotiffication(player, 'success', `You rent this house for ${days} days (price: ${server_houses[house].rent * days})`, 'Rent House:'); 
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server:houses::setRentPrice', async (price, user) =>  
{
    try
    {
        const player = user.player; 
        const house = player.info.house - 1;

        server_houses[house].rent = price;
 
        await Houses.update({ rent: server_houses[house].rent }, { where: { id: server_houses[house].id }});  
 
        sendNotiffication(player, 'info', `Rent price for this house is now $${formatMoney(price)}`, 'Rent Price:'); 

        return showHouseMenu(player, player.info.house, 0);
    }
    catch(error) { console.log(error) }   
}); 


CommandRegistry.add({
    name: "gotohouse", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/gotohouse [house id]'); 

        if(id > Object.keys(server_houses).length || id < 1) 
            return sendMessage(player, '009933', 'Invalid house ID.');
    
        return player.position = new mp.Vector3(server_houses[id - 1].position.x, server_houses[id - 1].position.y, server_houses[id - 1].position.z);
    }
});
 
global.getHouseRenters = async function(player, house)
{ 
    player.rentersstring = [];
   
    await Account.findAll({ raw: true, where: { house: house } }).then((found) => {
 
        if(found.length) {
 
            found.forEach(element => { 

                if(server_houses[house - 1].ownerSQL != element.id) {
                    player.rentersstring.push({ name: element.username, rent: element.houseDays });    
                }  
            });  
        }    
    });
    
    return JSON.stringify(player.rentersstring);
}
 
global.removeMemberFromHouse = async function(player)
{
    if(player.info.house != -1)
    { 
        if(!player.data.houseDays && server_houses[player.info.house - 1].ownerSQL != player.info.id)
        {  
            sendMessage(player, '4d79ff', `(House):!{#fff} Your lease with house ${player.info.house} has expired.`);

            player.info.house = -1;
 
            await Account.update({ house: player.info.house }, { where: { id: player.info.id } } ); 
        } 
    } 
};