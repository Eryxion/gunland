const rpc = require("rage-rpc");
const { CommandRegistry } = require("../server-global/improved-commands"); 

global.serverClans = [];
global.clanVehicles = [];


global.Clans = sequelize.define('server-clans', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    name: DataTypes.STRING, 
    tag: DataTypes.INTEGER,  
    color: DataTypes.STRING,  
    owner: DataTypes.INTEGER,  
    slots: DataTypes.INTEGER, 
    vehslots: DataTypes.INTEGER, 
    money: DataTypes.INTEGER, 
    gold: DataTypes.INTEGER, 
    expire: DataTypes.INTEGER, 
      
    ranks: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    },
    members: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    },
    logs: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    } 
}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'server-clans' }); 


global.ClansVehicles = sequelize.define('clan-vehicles', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    clan: DataTypes.INTEGER, 
    name: DataTypes.STRING,  
    rank: DataTypes.INTEGER, 
    locked: DataTypes.INTEGER, 
       
    position: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    } 
}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'clan-vehicles' }); 
 
global.loadServerClans = async function() { 
    let count = 0;
 
    await Clans.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => {  
                serverClans[count] = { 
                    id: element.id, 
                    name: element.name,
                    tag: element.tag, 
                    color: element.color, 
                    owner: element.owner,
                    
                    slots: element.slots, 
                    vehslots: element.vehslots, 
                    money: element.money, 
                    gold: element.gold, 
                    expire: element.expire, 
                    
                    ranks: JSON.parse(element.ranks),  
                    members: JSON.parse(element.members),  
                    logs: JSON.parse(element.logs)
                };
  
                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded server clans: ' + serverClans.length);

    }).catch((e) => console.log(e)); 

    await loadServerClanVehicles();
};

global.loadServerClanVehicles = async function() {
 
    let count = 0;
 
    await ClansVehicles.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => {  
                clanVehicles[count] = { 
                    id: element.id, 
                    clan: element.clan,
                    name: element.name, 
                    rank: element.rank, 
                    locked: element.locked,
                    vehicle: null,

                    position: JSON.parse(element.position)
                };
  
                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded clan vehicles: ' + clanVehicles.length);

    }).catch((e) => console.log(e)); 
};
 
rpc.register('server:clans::leave', async (_, user) =>  
{
    try
    { 
        const player = user.player; 
        const clan = (player.info.clan.id - 1);
        const index = serverClans.findIndex(object => object.id === player.info.clan.id);   
        const userindex = serverClans[clan].members.findIndex(object => object.name === player.name);   
           
        if(serverClans[index].owner == player.info.id)
        {  
            await Clans.destroy({ where: { id: serverClans[index].id }  });
 
            serverClans.splice(index, 1);
        }

        serverClans[clan].members.splice(userindex, 1); 
        player.info.clan = { id: 0, tag: 0, rank: 0, permissions: [false, false, false, false] } 
 
        await Account.update({ clan: JSON.stringify(player.info.clan) }, { where: { id: player.info.id } }); 
        
        await Clans.update({ members: JSON.stringify(serverClans[clan].members) }, { where: { id: serverClans[clan].id } } ); 

        sendNotiffication(player, 'success', 'You have successfully left the clan.');
  
        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: [], clanVehicles: getClanVehicles(player.info.clan.id)})]); 
    }
    catch(error) { console.log(error) }   
}); 
  
rpc.register('server:clans::upgrade:slots', async (_, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1);
         
        if(serverClans[clan].gold < 500)
        {
            rpc.callBrowsers(mp.players.at(player.id), 'closeClanModal', []);
            return sendNotiffication(player, 'error', 'You dont have 500 gold in safebox.', 'Clan Safebox:'); 
        }

        serverClans[clan].gold -= 500;
        serverClans[clan].slots += 10;
 
        await Clans.update({ slots: serverClans[clan].slots, gold: serverClans[clan].gold }, { where: { id: serverClans[clan].id } } ); 

        sendNotiffication(player, 'success', 'Clan members slots has been upgraded with 10 slots.');
              
        return rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server:clans::upgrade:vehicles', async (_, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1);
         
        if(serverClans[clan].gold < 1000)
        {
            rpc.callBrowsers(mp.players.at(player.id), 'closeClanModal', []);
            return sendNotiffication(player, 'error', 'You dont have 1.000 gold in safebox.', 'Clan Safebox:'); 
        }

        serverClans[clan].gold -= 1000;
        serverClans[clan].vehslots += 10;
 
        await Clans.update({ vehslots: serverClans[clan].vehslots, gold: serverClans[clan].gold }, { where: { id: serverClans[clan].id } } ); 

        sendNotiffication(player, 'success', 'Clan vehicle slots has been upgraded with 10 slots.');
              
        return rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 
 
rpc.register('server:clans::upgrade:days', async (_, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1);
         
        if(serverClans[clan].gold < 5000)
        {
            rpc.callBrowsers(mp.players.at(player.id), 'closeClanModal', []);
            return sendNotiffication(player, 'error', 'You dont have 5.000 gold in safebox.', 'Clan Safebox:'); 
        }

        serverClans[clan].gold -= 5000;
        serverClans[clan].expire += 30;

        await Clans.update({ expire: serverClans[clan].expire, gold: serverClans[clan].gold }, { where: { id: serverClans[clan].id } } ); 
 
        sendNotiffication(player, 'success', 'Your clan has been extended with 30 days for 5.000 gold', 'Clan:'); 

        return rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server:clans::safebox:deposit', async (amount, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1);
         
        if(player.info.money < amount) 
            return sendNotiffication(player, 'error', 'You dont have this amount.', 'Money:');  

        player.giveMoney(1, amount);  

        serverClans[clan].money += amount;
    
        await Clans.update({ money: serverClans[clan].money }, { where: { id: serverClans[clan].id } } ); 

        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);

        return sendNotiffication(player, 'success', `You deposited ${formatMoney(amount)} in clan safebox.`, 'Clan Safebox:'); 
    }
    catch(error) { console.log(error) }   
}); 
 
rpc.register('server:clans::ranks:changename', async (data, user) =>  
{
    try
    {
        const player = user.player; 
        const raw = JSON.parse(data);
        const clan = (player.info.clan.id - 1);
 
        serverClans[clan].ranks[raw.selected] = raw.input;
        
        await Clans.update({ ranks: JSON.stringify(serverClans[clan].ranks) }, { where: { id: serverClans[clan].id } } ); 
 
        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
         
        sendNotiffication(player, 'success', `Rank name (${raw.selected + 1}) has been changed.`);
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server:clans::ranks:change', async (data, user) =>  
{
    try
    {
        const player = user.player; 
        const raw = JSON.parse(data);
        const clan = (player.info.clan.id - 1); 
        const receiver = mp.players.toArray().find((user) => user.name === raw.selected.name && user.info.clan.id == player.info.clan.id);
        const index = serverClans[clan].members.findIndex(object => object.name === raw.selected.name);  

        if(receiver != undefined && receiver.loggedInAs) {
            receiver.info.clan.rank = raw.rank;
        }
 
        serverClans[clan].members[index].rank = raw.rank; 

        await Clans.update({ members: JSON.stringify(serverClans[clan].members) }, { where: { id: serverClans[clan].id } } );  
        await Account.update({ clan: sequelize.fn("JSON_SET", sequelize.col('clan'), `$.rank`, raw.rank)}, { where: { username: raw.selected.name }})
 
        sendNotiffication(player, 'info', `Now <b>${raw.selected.name}</b> have rank ${raw.rank} (${serverClans[clan].ranks[raw.rank - 1]}).`);
 
        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server:clans::members:permissions:manage', async (data, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1); 

        const raw = JSON.parse(data);
        const options = ['invite members', 'kick members', 'manage vehicles'];
         
        const receiver = mp.players.toArray().find((user) => user.name === raw.selected.name && user.info.clan.id == player.info.clan.id);
        const index = serverClans[clan].members.findIndex(object => object.name === raw.selected.name);   
          
        if(receiver != undefined && receiver.loggedInAs)
        {
            receiver.info.clan.permissions[raw.option] = !receiver.info.clan.permissions[raw.option];
        }

        serverClans[clan].members[index].permissions[raw.option] = !serverClans[clan].members[index].permissions[raw.option];   
        await Clans.update({ members: JSON.stringify(serverClans[clan].members) }, { where: { id: serverClans[clan].id } } );  
  
        Account.update({ clan: sequelize.fn("JSON_SET", sequelize.col('clan'), `$.permissions[${raw.option}]`, serverClans[clan].members[index].permissions[raw.option])}, { where: { username: raw.selected.name }})
 
        sendNotiffication(player, 'info', `Now <b>${raw.selected.name}</b> ${serverClans[clan].members[index].permissions[raw.option] ? 'can' : 'can`t'} ${options[raw.option]}.`);

        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server:clans::members:kick', async (data, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1); 

        const raw = JSON.parse(data);
        const receiver = mp.players.toArray().find((user) => user.name === raw.selected.name && user.info.clan.id == player.info.clan.id);
        const index = serverClans[clan].members.findIndex(object => object.name === raw.selected.name);   
 
        serverClans[clan].members.splice(index, 1);
 
        if(receiver != undefined && receiver.loggedInAs)
        { 
            removeClanMember(receiver); 

            sendNotiffication(receiver, 'info', `${player.name} kicked you out of clan <b>${serverClans[clan].name}</b>.`);
 
            rpc.callBrowsers(mp.players.at(receiver.id), 'reloadClanProfile', [JSON.stringify({ clan: receiver.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(receiver.info.clan.id)})]);
        }
  
        await Account.update({ clan: JSON.stringify({ id: 0, tag: 0, rank: 1, permissions: [false, false, false] }) }, { where: { username: raw.selected.name } }); 

        await Clans.update({ members: JSON.stringify(serverClans[clan].members) }, { where: { id: serverClans[clan].id } } );  

        createClanLog(clan, `${player.name} kicked ${raw.selected.name} out of the clan (${serverDate()}).`);
        sendNotiffication(player, 'info', `You kicked <b>${raw.selected.name}</b> out of the clan`);
         
        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 
 
rpc.register('server:clans::log:delete', async (data, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1);  
        const raw = JSON.parse(data);
           
        sendNotiffication(player, 'info', `Log ID ${raw.selected + 1} has been deleted.`);

        serverClans[clan].logs.splice(raw.selected, 1);
  
        await Clans.update({ logs: JSON.stringify(serverClans[clan].logs) }, { where: { id: serverClans[clan].id } } );  
         
        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 

rpc.register('server:clans::tag:change', async (option /*0 - left | 1 - right*/, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1);   
        const index = serverClans[clan].members.findIndex(object => object.name === player.name);   
      
        if((!option && player.info.clan.tag <= 0) || (option && player.info.clan.tag >= 6))
            return;

        if(!option && player.info.clan.tag > 0) 
            player.info.clan.tag --; 

        if(option && player.info.clan.tag < 6)  
            player.info.clan.tag ++; 

        if(index != undefined)
        {
            serverClans[clan].members[index].tag = player.info.clan.tag;
        }
  
        await Account.update({ clan: JSON.stringify(player.info.clan) }, { where: { id: player.info.id } }); 
     
        await Clans.update({ members: JSON.stringify(serverClans[clan].members) }, { where: { id: serverClans[clan].id } } );  

        sendNotiffication(player, 'info', 'Clan tag has been changed successfully.');

        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 


global.getClanVehicles = function(clan)
{
    let object = [];

    for(let index = 0; index < clanVehicles.length; index ++) 
    { 
        if(clanVehicles[index].clan == clan)
        {
            object.push(clanVehicles[index]);
        }  
    }

    return object;
}
 
rpc.register('server:clans::vehicles:rank:change', async (data, user) =>  
{
    try
    { 
        const player = user.player;
        const clan = (player.info.clan.id - 1);
        const raw = JSON.parse(data);
        const index = clanVehicles.findIndex(object => object.name === raw.selected.name && object.id == raw.selected.id);
         
        clanVehicles[index].rank = (raw.rank);

        sendNotiffication(player, 'info', `Now <b>${raw.selected.name}</b> is only for rank ${raw.rank}.`);
 
        await ClansVehicles.update({ rank: clanVehicles[index].rank }, { where: { id: clanVehicles[index].id } } ); 
        
        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id) })]);
    }
    catch(error) { console.log(error) }
});

rpc.register('server:clans::vehicles:manage', async (data, user) =>
{
    try
    {
        const player = user.player;
        const clan = (player.info.clan.id - 1);
        const raw = JSON.parse(data); 
        const index = clanVehicles.findIndex(object => object.name === raw.item.name && object.id == raw.item.id);
  
        if(index == undefined || index == -1)
            return sendNotiffication(player, 'info', 'Invalid vehicle ID.');

        switch(raw.action)
        {
            case 'tow':
            {
                var colorOne = [hexToRgb('#' + serverClans[clan].color).r, hexToRgb('#' + serverClans[clan].color).g, hexToRgb('#' + serverClans[clan].color).b] 
                 
                if(clanVehicles[index].vehicle != null)
                    return sendNotiffication(player, 'error', 'This vehicle is already spawned.');

                console.log('locked ' + clanVehicles[index].locked)
                  
                clanVehicles[index].vehicle = createVehicle(null, JSON.stringify({model: raw.item.name, position: new mp.Vector3(raw.item.position.x, raw.item.position.y, raw.item.position.z), heading: raw.item.position.rotation, putIn: false, type: 'clan', faction: player.info.clan.id, locked: clanVehicles[index].locked, fuel: 100, odometer: 0, color1: colorOne, color2: colorOne, number: 'Clan' }))             
                clanVehicles[index].status = true;

                sendNotiffication(player, 'info', `Vehicle <b>${raw.item.name} [${clanVehicles[index].vehicle.id}]</b> has been spawned.`, 'Vehicle:');  
                break;
            }

            case 'find':
            { 
                if(clanVehicles[index].vehicle == null)
                    return sendNotiffication(player, 'error', 'This vehicle is not spawned.');
 
                setPlayerCheckpoint(player, parseFloat(raw.item.position.x), parseFloat(raw.item.position.y), parseFloat(raw.item.position.z), null);  
        
                sendNotiffication(player, 'success', `Vehicle <b>${raw.item.name} [${clanVehicles[index].vehicle.id}]</b> has been located, follow marker.`, 'Vehicle:'); 
                break;
            }

            case 'sell':
            {  
                await ClansVehicles.destroy({ where: { id: clanVehicles[index].id } });
 
                if(clanVehicles[index].vehicle != null) {
                    clanVehicles[index].vehicle.destroy();
                }

                serverClans[clan].money += 5000000;  
                await Clans.update({ money: serverClans[clan].money }, { where: { id: serverClans[clan].id } } );  
 
                sendNotiffication(player, 'success', `The <b>${raw.item.name} vehicle was sold to the state for $5.000.000`, 'Vehicle:'); 

                clanVehicles.splice(index, 1);
                break;
            }
        }
         
        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id) })]);
    }
    catch(error) { console.log(error) }   
}); 

global.hexToRgb = function(hex) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

global.serverDate = function()
{ 
    let date = new Date();
    let minutes = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    let hours = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
     
    return (date.getDay() < 10 ? '0' + date.getDay() : date.getDay()) + '.' + (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()) + '.' + date.getFullYear() + ' | ' + hours + ':' + minutes;
}
 
global.vehicleClanMessage = function(player, vehicle, seat)
{  
    if(seat != 0)
        return;
 
    if(vehicle.params.type === 'clan')
    { 
        const clan = (vehicle.params.faction - 1);
        const index = clanVehicles.findIndex(object => object.name === vehicle.params.model && object.vehicle === vehicle);    
        
        if(index == undefined || index == -1) 
            return;

        if(player.info.clan.rank < clanVehicles[index].rank && player.info.clan.id == clanVehicles[index].rank)
        {
            player.removeFromVehicle();
            player.stopAnimation();

            return sendMessage(player, serverClans[clan].color, `(Clan):!{#fff} You don't have rank ${clanVehicles[index].rank} for this vehicle.`);
        }
           
        sendMessage(player, 'fff', `This ${clanVehicles[index].name} is owned by clan !{#${serverClans[clan].color}}${serverClans[clan].name} !{#fff}(!{#${serverClans[clan].color}}${serverClans[clan].tag}!{#fff}).`);
    } 
}
 
global.createClanLog = async function(clan, string)
{
    try
    {
        serverClans[clan].logs.push(string);
 
        await Clans.update({ logs: JSON.stringify(serverClans[clan].logs) }, { where: { id: serverClans[clan].id } } );  
    }
    catch(e) { return console.log(e) }  
};
 
rpc.register('server:clans::manage:color', async (input, user) =>  
{
    try
    {
        const player = user.player; 
        const clan = (player.info.clan.id - 1);   
            
        serverClans[clan].color = input; 
        await Clans.update({ color: serverClans[clan].color }, { where: { id: serverClans[clan].id } } );  

        sendNotiffication(player, 'info', 'Clan color has been changed successfully.', 'Clan:');
 
        mp.players.forEach(users => 
        {
            if(users.loggedInAs && users.clan.id && users.clan.id == player.info.clan.id)
            {   
                users.setVariable('clanColor', serverClans[clan].color); 
            }
        });
 
        rpc.callBrowsers(mp.players.at(player.id), 'reloadClanProfile', [JSON.stringify({ clan: player.info.clan, clanData: serverClans[clan], clanVehicles: getClanVehicles(player.info.clan.id)})]);
    }
    catch(error) { console.log(error) }   
}); 
 
global.removeClanMember = function(player) 
{
    try
    {
        player.info.clan = { id: 0, tag: 0, rank: 1, permissions: [false, false, false] }

        player.setVariable('clanColor', null);
        player.setVariable('clanName', null);
        player.setVariable('clanTag', null);
        player.setVariable('clan', null); 
    }
    catch(e) { return console.log(e) } 
};

global.setClanMember = async function(player, clan) 
{ 
    try
    {
        player.info.clan = { id: clan, tag: 0, rank: 1, permissions: [false, false, false] }

        player.setVariable('clanColor', serverClans[clan - 1].color); 
        player.setVariable('clanName', serverClans[clan - 1].name);
        player.setVariable('clanTag', serverClans[clan - 1].tag);
        player.setVariable('clan', clan);
     
        serverClans[clan - 1].members.push({name: player.name, permissions: [false, false, false], rank: 1, tag: 0, money: 0, gold: 0, photo: player.info.photo, joined: curentTimestamp()})
  
        await Account.update({ clan: JSON.stringify(player.info.clan) }, { where: { id: player.info.id } }); 
    
        await Clans.update({ members: JSON.stringify(serverClans[clan - 1].members) }, { where: { id: serverClans[clan - 1].id } } );  
    }
    catch(e) { return console.log(e) }
};


global.getPlayerNameClan = function(player, withcolor = true)
{
    const clan = (player.info.clan.id - 1);
 
    let string = player.name;

    if(player.info.clan.id >= 1)
    {
        switch(player.info.clan.tag)
        {
            case 0:
            {
                string = serverClans[clan].tag + player.name + ' [' + player.id + ']'; break;
            } 
            case 1:
            {
                string = serverClans[clan].tag + '.' + player.name + ' [' + player.id + ']'; break;
            } 
            case 2:
            {
                string = '[' + serverClans[clan].tag + ']' + player.name + ' [' + player.id + ']'; break;
            } 
    
            case 3:
            {
                string = player.name + '[' + player.id + ']' + serverClans[clan].tag; break;
            } 
            case 4:
            {
                string = player.name + '.' + serverClans[clan].tag + ' [' + player.id + ']'; break;
            } 
            case 5:
            {
                string = player.name + '[' + serverClans[clan].tag + ']' + ' [' + player.id + ']'; break;
            } 
            case 6:
            {
                string = player.name;
                break;
            } 
        }
    }  
 
    return (withcolor && player.info.clan.id ? `!{#${serverClans[clan].color}}` + string : string);
};
 
global.isInClanVehicle = function(clan, vehicle)
{
    try
    { 
        let exist = null;

        if(clan != null && vehicle.params.type === 'clan')
        {  
            const index = clanVehicles.findIndex(object => object.vehicle === vehicle && object.clan == clan);   

            if(index != -1) { exist = index; } 
        }

        return exist;
    }
    catch(e) { console.log(e) } 
};

global.lockClanVehicle = async function(player, vehicle)
{
    if(!player.info.clan.id || (player.info.clan.id != vehicle.params.faction))
        return;

    const index = clanVehicles.findIndex(object => object.vehicle === vehicle && object.clan == player.info.clan.id && vehicle.params.faction == player.info.clan.id);   

    if(index != -1) 
    {  
        clanVehicles[index].locked = !clanVehicles[index].locked;

        sendNotiffication(player, 'info', `Your clan vehicle is now ${clanVehicles[index].locked ? 'locked' : 'unlocked'}.`, 'Clan Vehicle:'); 
      
        await ClansVehicles.update({ locked: clanVehicles[index].locked }, { where: { id: clanVehicles[index].id } } ); 

        vehicle.locked = clanVehicles[index].locked;

        if(player.vehicle)
            return player.call('client::spedometer:showProps', [player.seatBelt, vehicle.engine, vehicle.locked]);    
    }  
};

global.sendClanMessage = function(clan, color, message) 
{
    mp.players.forEach(users => 
    {
        if(users.loggedInAs && users.clan.id && users.clan.id == clan) {   
            return users.outputChatBox(`!{#${color}} ${message}`); 
        }
    }); 
};
 
CommandRegistry.add({
    name: "c", 
     
    run: function (player, _, ...message) 
    { 
        message = message.join(" ");

        if(!player.info.clan.id)
            return sendNotiffication(player, 'error', 'You dont have a clan', 'Clan:');

        if(!message)
            return sendUsage(player, '/c [text]'); 

        sendClanMessage(player.info.clan.id, serverClans[player.info.clan.id - 1].color, '(/clan) ' + player.name + '[' + player.id + ']: ' + message);
    }
});

CommandRegistry.add({
    name: "cpark", 
     
    run: async function (player) 
    { 
        if(!player.vehicle)
            return sendNotiffication(player, 'error', 'You are not in a vehicle.');

        if(isInClanVehicle((player.info.clan.id), player.vehicle) == null)
            return sendNotiffication(player, 'error', 'This vehicle is not clan vehicle.'); 
  
        const index = isInClanVehicle((player.info.clan.id), player.vehicle);

        clanVehicles[index].position = { x: player.position.x.toFixed(3), y: player.position.y.toFixed(3), z: player.position.z.toFixed(3), rotation: player.vehicle.rotation.z.toFixed(3) } 

        sendNotiffication(player, 'info', 'Your clan vehicle is now parked here.', 'Clan Vehicle:');  
  
        await ClansVehicles.update({ position: JSON.stringify(clanVehicles[index].position) }, { where: { id: clanVehicles[index].id } } ); 
    }
});
 
CommandRegistry.add({
    name: "cinvite", 
       
    run: function (player, _, id) 
    { 
        if(!id) 
            return sendUsage(player, '/cinvite [player ID]'); 

        if(!player.info.clan.id)
            return sendNotiffication(player, 'error', 'You dont have a clan.', 'Clan:');
  
        const clan = (player.info.clan.id - 1);
        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);
   
        user.clanInvitation = true;
        user.clanInvitationID = player.info.clan.id;
 
        setTimeout(() => {
            user.clanInvitation = false;
            user.clanInvitationID = null;
        }, 30000);
 
        sendNotiffication(player, 'success', `Invitation sent to ${user.name} succesfully.`, 'Clan:'); 
        sendMessage(user, 'fff', `${player.name} invite you in clan !{#${serverClans[clan].color}}${serverClans[clan].name} !{#fff}(!{#${serverClans[clan].color}}${serverClans[clan].tag}!{#fff}) use (/clanaccept <id>) for accept invitation.`);
    }
}); 
 
CommandRegistry.add({
    name: "clanaccept", 
       
    run: function (player, id) 
    {  
        if(!id) 
            return sendUsage(player, '/clanaccept [player ID]'); 

        if(player.info.clan.id)
            return sendNotiffication(player, 'error', 'You already have a clan.', 'Clan:');

        if(!player.clanInvitation && player.clanInvitationID == null)
            return sendNotiffication(player, 'error', 'You dont have a invitation in a clan.', 'Clan:');
  
        const user = getNameOnNameID(id); 
        if(user == undefined) 
            return sendMessage(player, 'ffffff', `Player not found.`);

        sendNotiffication(player, 'success', `You are now a member of ${user.name} clan.`, 'Clan:'); 

        setClanMember(player, player.clanInvitationID);

        player.clanInvitation = false;
        player.clanInvitationID = null;
    }
}); 


CommandRegistry.add({
    name: "createclan", 
       
    run: function (player) 
    {   
        player.call('client:clans::maine:create', []);    
    }
});


/*
    - Acum radioul se poate porni de pe tasta Q (doar de sofer)
    - Acum la inregistrare nu poti pune o parola mai mica de 5 caractere
    - Rezolvat un bug la chat 
    - Acum la telefon cand este blocat iti apare un text informativ pentru a-l deschide
    - Rezolvat un bug la telefon legat de wallpaper
    - Acum cand cumperi o cartela de telefon automat vei primi si un numar pe care poti fii apelat
    - Acum nu mai poti accesa telefonul daca nu ai unul in inventar
    - Nu mai poti efectua apeluri/mesaje catre cineva daca nu ai o cartela sim
    - Acum orele jucate din profil apar sub forma 00:00:00 
    - Rezolvat un bug la culoarea clanului ce dadea eroare jucatorului
    - Rezolvat un bug prin care puteai porni masina chiar daca erai pasager
    - Adaugata tasta [G] pentru a te urca ca pasager in masina
    - Acum nu te mai poti urca in masina daca ai un obiect atasat
    - Acum nu mai poti urca in masina de factiune daca nu faci parte din acea factiune
    - Acum nu mai poti urca intr-o masina de job ce nu este facuta pentru tine
    - Fixate comenzile /goto & /gethere
    - Rescris intreg sistemul de Dealership
    - Fixata functia de intrare in vehicule (dadeai f sa iesi si te baga in alta)
    - Rezolvat un bug la sistemul de reporturi 
    - Rezolvata o eroare legata de clan cand scriai pe chat
    - Rescris intreg sistemul de chat
    - Daca esti admin si scrii in chat o comanda iti apar mai jos comenzi in functie de ce scrii
    - Acum daca o masina personala "bubuie" aceasta va fii automat despawnata

    - Houses:
        - Actualizat meniul pentru propietarii caselor
        - Acum daca esti langa o casa poti apasa tasta E unde iti va aparea un mic meniu
        - Zilele de inchiriere ale caselor scad la ora 7 dimineata


    DAILY QUESTS
        - Fiecare jucator primeste 2 questuri zilnice
        - Questurile se reseteaza la ora 07:00 
        - Atunci cand faci progres la quest iti va aparea un UI 
         
    CLAN SYSTEMS

        - Poti parasi clanul
        - Poti depozita o suma de bani in seiful clanului

        - Poti extinde sloturile pentru membri (rank 4+)
        - Poti extinde sloturile pentru vehicule (rank 4+)
        - Poti extinde sloturile pentru zilele clanului (rank 4+) 
        - Poti schimba numele rankurilor (rank 4+)
        - Poti schimba permisiunile membrilor (rank 4+)
        - Poti schimba rankul membrilor (rank 4+) 
        - Acum cand scrii pe chat iti va aparea numele in functie de tag
        - Acum deasupra capului apare numele clanului cu culoarea respectiva

    CLAN VEHICLE SYSTEM
        - Poti spawna un vehicul (rank 5+ / manage vehicle permission)
        - Poti da find pe un vehicul de clan
        - Cand intri intr-ul vehicul de clan apare de cine e detinut 
        - Poti vinde vehiculul pentru 5.000.000$ care se duc in seiful clanului
        - Poti incuia vehiculul de pe tasta [L]
          
        - De facut sa scada zilele la clan
        - De facut cand owneru iese sa se dea clanu la urmatoru rank mai mare


    --UPDATES V2--

    - Adaugate texte informative la jobul Courier
    - Rezolvate probleme la player profile
    - Adaugat sistem de "inspectare" a jucatorilor (/spec)
    - Rescris sistemul de chat al jucatorilor
    - Blocat butonul ENTER atunci cand ai un UI activ (anti bug)
    - Nu mai poti da F la case/factiuni daca muncesti sau ai un obiect atasat pe tine
    - Rezolvat un bug la jail ce nu iti dadea skinul corect
    - Rezolvat un bug la tastele [F / G] care nu functionau la masinile de politie
    - Rezolvat un bug la rington-urile de la telefon (nu se auzeau)
    - Rescris ui-ul de la businessul "Gas Station"

    - Adaugat sistem de "safezone"
        - Nu poti da cu pumnu cand esti in safezone
        - Nu poti trage cu arma cand esti in safezone
        - Un admin poate crea un safezone utilizant /createsafezone [range]

    - Adaugat o mapa custom la jail
    - Police Computer
        - Cu ajutorul acestuia poti da wanted unui jucator
        - Cu ajutorul acestuia poti amenda un jucator 
        - Cu ajutorul acestuia poti suspenda licenta de condus a unui jucator
        
        - Lista cu toti playerii ce au wanted (optiuni: find / clear wanted)
        - Lista cu toti playerii ce sunt arestati (in jail) 
 
    - Adaugata limita de viteza, aceasta apare pe minimap
    - Limitele de viteza sunt 180 autostrada respectiv 90 in oras
    - Ui-ul ce arata limita de viteza va avea un efect de "pulse" daca treci de ea

    - Youtube Music
        - Adaugata aplicatia respectiva in telefon
        - Rezultate luate de pe youtube
        - Functii:
            - poti asculta o melodie
            - poti opri melodia respectiva
            - poti accesa urmatoarea melodie / sau pe cea dinainte
            - poti modifica volumu melodiei
            - poti "scrola" partea melodiei
 
            
    --UPDATES V3--

    - Acum in aplicatia "garage" iti va arata si o imagine cu vehiculul
    - Numarul masini se poate schimba acum din aplicatia "garage"
    - Rezolvat un bug la aplicatia banking
    - Rezolvat un mic bug la clothing store
    - Modificate mici aspecte la telefon
    - Rezolvat un bug la sistemul de login 
    - Adaugat business de tip Gun Shop + ui pentru cumpararea armelor
    - Acum la inventar cand vrei sa dropezi un item poti alege si cantitatea 
    - Acum daca ai amenzi acestea vor fii platite la payday (1 / per payday) cu banii din banca / cash (depinde de caz)
    - Adaugata optiunea de a intra/iesi din jail daca esti politist
    - Adaugata comanda /free respectiv /acceptfree pentru a scoate un jucator din jail (pentru politisti)
    - Acum daca nu mai deschizi chatul timp de 10 secunde acesta va avea un efect de "transparenta"
    - Adaugat in hud indicator pentru procentaju de mancare si apa
    - Acum nu mai pot dropa telefonu din inventar
    - Acum zilele de la casa inchiriata scad la ora 7
    - Baza de date a fost modificata in sequelize
    - Adaugate in clothing store si tricouri
    - Adaugata posibilitatea de a da tricou/jacketa jos de pe tine (viitor update tatuaje)
     
    - Achievements sistems
        - Jucatorul is poate vedea achievement-urile in profilul sau
        - Cand ai completat un achievement vei primi o notificare + un premiu
        - Un achievement se poate completa o singura data


    --UPDATES V4--    

    - Acum la trucker nu mai poti selecta cursa ce ai facut-o inainte (protectie bug)
    - Rezolvat un bug la telefon
    - Acum cand vei asculta o melodie pe Youtube Music si deschizi telefonu iti va aparea un ui cu playerul
    - Acum cand nivelul de la thirsty / hungry scade sub 50% nu vei mai putea alerga
    - Rezolvat un bug la inventar ce nu te lasa sa consumi mancare / bauturi
    - Acum la clothing cand vei selecta un item iti va aparea ca fiind selectat
    - Rezolvat un bug la jobul fisherman ce nu iti atasa undita
    - Rezolvat un bug la case ce facea sa se blocheze meniul

    -- Tatoo
        - Tatuajele se pot cumpara de la businessul "Tatoo" de pe mapa
        - Un player poate avea cate 2 tatuaje per element (ex: 2 mana / 2 picior / etc) 
        - In viitor va fii adaugata posibilitatea de a le sterge / schimba
 
    - Radar sistem 
        - Politisul primeste automat un radar cand se echipeaza (on duty)
        - Cand un jucator trece peste limta legala politisul poate sa-i dea wanted
        - Radarul te anunta cand ai prins pe cineva printr-un sunet
*/