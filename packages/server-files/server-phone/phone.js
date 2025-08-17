const rpc = require("rage-rpc");
const { Op } = require("sequelize");
const { CommandRegistry } = require("../server-global/improved-commands"); 
 

global.getCircularReplacer = function() {
    const seen = new WeakSet();
    return (key, value) => {
        if(typeof value === 'object' && value !== null) 
        {
            if(seen.has(value)) { return; }
            seen.add(value);
        }
        return value;
    };
};
 
global.Messages = sequelize.define('server-messages', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    sender: DataTypes.STRING,  
    sendernumber: DataTypes.INTEGER, 
    receiver: DataTypes.STRING,  
    receivernumber: DataTypes.INTEGER,  
 
    messages: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: []
    } 
}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'server-messages' }); 

global.Contacts = sequelize.define('server-contacts', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    user: DataTypes.INTEGER,  
    name: DataTypes.STRING, 
    number: DataTypes.INTEGER,  
    photo: DataTypes.STRING 
}, { timestamps: false,paranoid: true, underscored: true, freezeTableName: true, tableName: 'server-contacts' }); 
    
global.loadPlayerMessages = async function(player) 
{
    try 
    { 
        var countMessages = 0;
        var countContacts = 0;

        player.contacts = []; 
        player.messages = [];
 
        await Messages.findAll({ raw: true, where: {[Op.or]: [ { sendernumber: player.info.phoneNumber }, { receivernumber: player.info.phoneNumber } ]}}).then((found) => {
        
            if(found.length) {
     
                found.forEach(element => { 
                
                    player.messages[countMessages] = { 
                        id: element.id,
                        sender: element.sender,
                        senderNumber: element.sendernumber,

                        receiver: element.receiver,  
                        receiverNumber: element.receivernumber, 
                        messages: JSON.parse(element.messages) 
                    }; 
                    countMessages ++;
                }); 
            } 
    
            return console.log('[MYSQL] Loaded messages: ' + player.messages.length); 
        }).catch((e) => console.log(e));  


        await Contacts.findAll({ raw: true, where: { user: player.info.id }}).then((found) => {
        
            if(found.length) {
     
                found.forEach(element => { 
                
                    player.contacts[countContacts] = { 
                        id: element.id,
                        user: element.user,
                        name: element.name,

                        number: element.number,  
                        photo: element.photo 
                    }; 

                    countContacts ++;
                }); 
            } 
    
            return console.log('[MYSQL] Loaded contacts: ' + player.contacts.length); 
        }).catch((e) => console.log(e));     
    }
    catch(err) { console.log(err) }
}

global.updateConversation = async function(player, data)
{
    const raw = JSON.parse(data);   
    const numberReceiver = (player.messages[raw.index].receiverNumber == player.info.phoneNumber ? player.messages[raw.index].senderNumber : player.messages[raw.index].receiverNumber);
    const receiver = mp.players.toArray().find((index) => index.info.phoneNumber == numberReceiver); 
 
    if(receiver != undefined && receiver.loggedInAs)
    {
        const index = receiver.messages.findIndex((element) => element.senderNumber == numberReceiver || element.receiverNumber == numberReceiver);

        if(index != -1)
        { 
            const senderNumber = receiver.contacts.findIndex(object => object.number == numberReceiver); 
            receiver.messages[index].messages.push({ sender: (senderNumber != -1 ? senderNumber : player.name), receiver: '', text: raw.input });  
        } 
 
        rpc.callBrowsers(mp.players.at(receiver.id), 'updateMessages', [JSON.stringify({option: false, messages: receiver.messages})]);  
    }
 
    player.messages[raw.index].messages.push({sender: player.name, receiver: '', text: raw.input});  
    await Messages.update({ messages: JSON.stringify(player.messages[raw.index].messages) }, { where: { id: player.messages[raw.index].id }});   
 
    return rpc.callBrowsers(mp.players.at(player.id), 'updateMessages', [JSON.stringify({option: false, messages: player.messages})]);  
}
 
global.createConversation = async function(player, data)
{
    const raw = JSON.parse(data);  //raw.name este egal cu raw.number da nu am mai modificat 
    const receiverName = player.contacts.findIndex(object => object.number == raw.name); 
    const user = mp.players.toArray().find((index) => index.info.phoneNumber === raw.name); 
  
    const jane = await Messages.create({ sender: player.name, sendernumber: player.info.phoneNumber, receiver: (receiverName != -1 ? player.contacts[receiverName].name : 'null'), receivernumber: raw.name, messages: JSON.stringify([{sender: player.name, text: raw.input}])});
    player.messages.push({id: jane.id, sender: player.name, senderNumber: player.info.phoneNumber, receiver: (receiverName != -1 ? player.contacts[receiverName].name : 'null'), receiverNumber: raw.name, messages: [{ sender: player.name, text: raw.input }] })
  
  
    if(user != undefined && user.loggedInAs) { 
        user.messages.push({ id: user.messages.length + 1, sender: player.name, senderNumber: player.info.phoneNumber, receiver: (receiverName != -1 ? player.contacts[receiverName].name : 'null'), receiverNumber: raw.name, messages: [{sender: player.name, text: raw.input}]}); 
    }
       
    setTimeout(() => {
        const newIndex = player.messages.length - 1;
  
        rpc.callBrowsers(mp.players.at(player.id), 'updateMessages', [JSON.stringify({option: false, messages: player.messages})]);   
        player.call('client::phone::messages:openConversation:finish', [JSON.stringify({entered: true, input: '', index: newIndex, new: false, name: player.messages[newIndex].senderNumber == player.info.phoneNumber ? player.messages[newIndex].receiverNumber : player.messages[newIndex].senderNumber})]) 
    }, 500);    
}

global.showPlayerPhone = function(player)
{
    const locations = { businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }
 
    const user = {
        name: player.name,
        position: player.position,
        number: player.info.phoneNumber,
        money: player.info.bank 
    };
 
    return player.call('client::phone:openNow', [JSON.stringify(player.info.phoneSettings), JSON.stringify(player.messages), JSON.stringify(player.contacts), JSON.stringify(player.personalVeh, getCircularReplacer()), JSON.stringify(locations), JSON.stringify(player.transactions), JSON.stringify(player.callData), JSON.stringify(player.crime), JSON.stringify(user)]); 
}

mp.events.add({  
    'server::phone:openNow' : (player) =>
    {   
        if(!haveItem(player, 'Phone'))
            return sendNotiffication(player, 'info', 'You dont have a phone.'); 

        showPlayerPhone(player); 
    },   
    /*------------------------------------------------------------------------------------------------------------------------------------------*/
 
    'server::phone:closeNow' : (player) =>
    { 
        if(player.callData.status === 'incoming') {  
            closePlayerCall(player); 
        } 
    },  
});  
 
global.closePlayerCall = function(player)
{
    const caller = mp.players.toArray().find((index) => index.info.phoneNumber == player.callData.caller); 
    const receiver = mp.players.toArray().find((index) => index.info.phoneNumber == player.callData.receiver); 

    if(caller != undefined && caller.loggedInAs)
    { 
        caller.callData = { caller: 0, receiver: 0, input: '', time: 0, status: 'no call', photo: '' }
        caller.call('client::phone:contacts:updateCall', [JSON.stringify(caller.callData), true]);

        caller.stopAnimation();
        caller.inAnimation = false;

        if(receiver != undefined && receiver.loggedInAs)
        {
            caller.call('voice.phoneStop', [receiver]); 
        }     
    }

    if(receiver != undefined && receiver.loggedInAs)
    { 
        receiver.callData = { caller: 0, receiver: 0, time: 0, input: 0, status: 'no call', photo: '' }
        receiver.call('client::phone:contacts:updateCall', [JSON.stringify(receiver.callData), true]); 
 
        if(caller != undefined && caller.loggedInAs)
        {
            return receiver.call('voice.phoneStop', [caller]);
        }  
    }   
}
 
rpc.register('server::phone::contact:create', async (data, user) => 
{
    const raw = JSON.parse(data);
    const player = user.player; 
     
    try 
    { 
        if(!player.info.phoneNumber)
            return sendNotiffication(player, 'error', 'You dont have sim card.', 'Phone:');
 
        const project = await Account.findOne({ where: { phoneNumber: raw.newContactNumber } }); 
        const alreadyExist = player.contacts.findIndex(object => object.number == raw.newContactNumber);
             
        if(project === null) 
            return sendNotiffication(player, 'error', 'Acest numar nu este inca folosit.', 'Contacts:'); 

        if(alreadyExist != -1)
            return sendNotiffication(player, 'error', 'Acest numar este deja in contactele tale.', 'Contacts:'); 
 
        const contactsInser = await Contacts.create({ user: player.info.id, name: raw.newContactName, number: raw.newContactNumber, photo: project.photo });
 
        player.contacts.push({ id: contactsInser.id, user: player.info.id, name: raw.newContactName, number: raw.newContactNumber, photo: project.photo}); 
        sendNotiffication(player, 'success', `${raw.newContactName} (number: ${raw.newContactNumber}) has been added to your contact list.`, 'Contacts:'); 

        return rpc.callBrowsers(mp.players.at(player.id), 'reloadPlayerContacts', [JSON.stringify({contacts: player.contacts})]);
       
    }
    catch(err) { console.log(err) }    
});
 
rpc.register('server::phone::contact:search', (input, user) =>  
{
    try
    {
        const player = user.player; 
        player.resultContacts = [];

        player.contacts.forEach(element => { 
            if(element.name.toLowerCase().startsWith(input.toLowerCase())) 
            { 
                player.resultContacts.push(element); 
            } 
        }); 
  
        return rpc.callBrowsers(mp.players.at(player.id), 'reloadContacts', [JSON.stringify({ results: (!input ? player.contacts : player.resultContacts) })]);
    }
    catch(error) { console.log(error) }   
}); 
 
rpc.register('server::phone::phonebook:search', (input, user) =>  
{
    const player = user.player;  
    player.resultBook = [];

    try
    {  
        if(input.length && input)
        {
            mp.players.forEach((players) => 
            {
                if(players.name.toLowerCase().startsWith(input.toLowerCase())) 
                { 
                    player.resultBook.push({ name: players.name, number: players.phoneNumber });  
                } 
            });
        }
 
        return rpc.callBrowsers(mp.players.at(player.id), 'reloadPhonebook', [JSON.stringify({ results: player.resultBook })]);
    }
    catch(error) { console.log(error) }   
});  
/*------------------------------------------------------------------------------------------------------------------------------------------*/ 


/*--------------------------------------------------------- [ CONTACTS APPLICATION ] -------------------------------------------------------*/  
rpc.register('server::phone::settings:change', async (data, user) =>
{
    const player = user.player;

    player.info.phoneSettings = JSON.parse(data); 
    sendNotiffication(player, 'info', 'Your settings has been changed.', 'Settings:');
 
    await Account.update({ phoneSettings: player.info.phoneSettings }, { where: { id: player.info.id } } );
}); 
/*------------------------------------------------------------------------------------------------------------------------------------------*/ 


/*-------------------------------------------------------- [ BANKING APPLICATION ] ---------------------------------------------------------*/  
rpc.register('server::phone::banking:executeTransfer', (data, user) =>
{
    const player = user.player;
    const raw = JSON.parse(data); 
    const receiver = mp.players.toArray().find((index) => index.name == raw.name); 

    if(receiver == undefined && !receiver.loggedInAs)
        return sendNotiffication(player, 'info', 'This player is not connected.');

    player.giveMoneyBank(1, raw.amount); 
    receiver.giveMoneyBank(0, raw.amount);

    createTransaction(player, JSON.stringify({sender: player.info.id, receiver: receiver.info.id, option: 'send', title: receiver.name, amount: raw.amount})); 
    createTransaction(receiver, JSON.stringify({sender: player.info.id, receiver: receiver.info.id, option: 'received', title: player.name, amount: raw.amount})); 
 
    rpc.callBrowsers(mp.players.at(player.id), 'reloadBanking', [JSON.stringify({ transactions: player.transactions, cash: player.bank })]);
 
    return sendNotiffication(player, 'success', `You transfer $${formatMoney(raw.amount)} to ${receiver.name}.`, 'Bank:');
});
/*------------------------------------------------------------------------------------------------------------------------------------------*/  
 
/*----------------------------------------------------------- [ MAPS APPLICATION ] ---------------------------------------------------------*/  
rpc.register('server::phone::maps:findLocation', (data, user) =>
{
    const raw = JSON.parse(data);
    const player = user.player;

    setPlayerCheckpoint(player, raw.position.x, raw.position.y, raw.position.z, null);   
    return sendNotiffication(player, 'info', `Follow the red dot on your minimap.`, 'Location:');   
});

rpc.register('server::phone::maps:search', (data, user) =>
{
    const player = user.player;
    const raw = JSON.parse(data);

    player.resultLocations = [];
 
    if(raw.input.length)
    {  
        if(raw.category === 'atm')
        {
            serverBankings.forEach((item) => 
            {
                if(item.name.toLowerCase().startsWith(raw.input.toLowerCase())) { player.resultLocations.push({atm: item}) } 
            });
        }

        if(raw.category === 'businesses')
        {
            serverBusiness.forEach((item) => 
            {
                if(item.name.toLowerCase().startsWith(raw.input.toLowerCase())) { player.resultLocations.push(item) } 
            });  
        }

        if(raw.category === 'factions')
        {
            serverFactions.forEach((item) => 
            {
                if(item.name.toLowerCase().startsWith(raw.input.toLowerCase())) { player.resultLocations.push(item) } 
            });
        }

        if(raw.category === 'jobs')
        {
            serverJobs.forEach((item) => 
            {
                if(item.name.toLowerCase().startsWith(raw.input.toLowerCase())) { player.resultLocations.push({jobs: item}) } 
            }); 
        }

        if(raw.category === 'house')
        {
            server_houses.forEach((item) => 
            {
                if(item.name.toLowerCase().startsWith(raw.input.toLowerCase())) { player.resultLocations.push({house: item}) } 
            });
        }
    }
 
    return rpc.callBrowsers(mp.players.at(player.id), 'reloadPhoneData', [JSON.stringify({vehicles: JSON.stringify(player.personalVeh, getCircularReplacer()), locations: player.resultLocations.length ? player.resultLocations : { businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }})]);
});
 
rpc.register('server::phone::maps:goBack', (locked, user) =>
{ 
    const player = user.player; 
 
    return rpc.callBrowsers(mp.players.at(player.id), 'reloadPhoneData', [JSON.stringify({vehicles: JSON.stringify(player.personalVeh, getCircularReplacer()), locations: { businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }})]); 
}); 
/*------------------------------------------------------------------------------------------------------------------------------------------*/ 


/*--------------------------------------------------------- [ HITMAN APPLICATION ] ---------------------------------------------------------*/ 
rpc.register('server::phone::darkweb:search', (username, user) =>
{
    try
    { 
        const player = user.player;
        player.results = [];

        if(username.length) 
        {
            mp.players.forEach((players) => 
            {
                if(players.name.toLowerCase().startsWith(username.toLowerCase()) && !players.name.toLowerCase().startsWith(player.name.toLowerCase())) 
                { 
                    player.results.push({name: players.name, card: 1, faction: (!players.group ? 'Civilian' : serverFactions[players.group - 1].name)});  
                } 
            });
        }
 
        return rpc.callBrowsers(mp.players.at(player.id), 'reloadDarkWeb', [JSON.stringify({results: player.results})]);  
    }
    catch(error) { console.log(error) }
});

rpc.register('server::phone::darkweb:placeContract', (data, user) =>
{  
    const player = user.player;
    const raw = JSON.parse(data); 
    const victim = mp.players.toArray().find((index) => index.name === raw.user); 

    if(victim == undefined)
        return sendNotiffication(player, 'error', 'This player is not connected.', 'Darkweb:');

    if(victim.name == player.name)
        return sendNotiffication(player, 'error', 'You can`t put a contract on yourself.', 'Darkweb:');

    if(victim.admin || victim.helper)
        return sendNotiffication(player, 'error', 'This player is in staff.', 'Darkweb:');

    if(victim.group == 3)
        return sendNotiffication(player, 'error', 'This player is in Hitman Agency.', 'Darkweb:');

    const alreadyContracted = serverFactions[2].contracts.findIndex(object => object.name === victim.name);

    if(alreadyContracted != -1)
        return sendNotiffication(player, 'error', 'This player is already on the list.', 'Darkweb:');

    sendNotiffication(player, 'info', `Contract has been placed on ${victim.name} (#${user.id}) for price $${raw.price} ${raw.silent ? '(silent contract)' : ''}.`, 'Darkweb:')

    hitmanPlaceContract(player, victim, raw.price, raw.silent);

    return player.call('client::phone::darkweb:close', []);
});
/*------------------------------------------------------------------------------------------------------------------------------------------*/ 


/*--------------------------------------------------------- [ EMERGENCY APPLICATION ] ------------------------------------------------------*/ 
CommandRegistry.add({
    name: "crime", 
 
    run: function (player) 
    {  
        //;;createCrime(player, player.name, 'Ilegal use of firearms');

        createTransaction(player, JSON.stringify({sender: player.info.id, receiver: 100, option: 'send', title: 'ia la muie', amount: 1000})); 


        setTimeout(() => {
            
            console.log(player.transactions);

        }, 2000);
    }
});

rpc.register('server::phone::emergency:reportCrime', (data, user) =>
{ 
    const raw = JSON.parse(data); 
    const player = user.player; 
    const killer = mp.players.toArray().find((index) => index.name === raw.killer); 

    if(killer == undefined || !killer.loggedInAs)
    {
        player.crime = { killer: undefined, reason: '', date: '', location: '' } 
        rpc.callBrowsers(mp.players.at(player.id), 'reloadCrimes', [JSON.stringify(player.crime)]);
        return sendNotiffication(player, 'This player is not connected.', 'Offline:');
    }

    createWanted(player, killer, 1, 'Ilegal use of firearms');

    player.crime = { killer: undefined, reason: '', date: '', location: '' }  
    rpc.callBrowsers(mp.players.at(player.id), 'reloadCrimes', [JSON.stringify(player.crime)]);

    return sendNotiffication(player, 'info', 'The crime was successfully reported.', 'Report Crime:');
}); 
/*------------------------------------------------------------------------------------------------------------------------------------------*/ 


/*--------------------------------------------------------- [ MESSAGES APPLICATION ] -------------------------------------------------------*/ 
rpc.register('server::phone::messages:send', (data, user) =>
{ 
    const raw = JSON.parse(data); 
    const player = user.player;
 
    if(!raw.new)
    {
        updateConversation(player, JSON.stringify(raw));
    } 
    else 
    {
        createConversation(player, JSON.stringify(raw));
    } 
});

rpc.register('server::phone:::messages:search', (data, user) =>
{  
    const player = user.player; 
    const raw = JSON.parse(data);

    try
    {  
        switch(raw.options)
        {
            case 'list':
            {
                player.resultMessages = [];

                player.messages.forEach(element => { 

                    if(element.sender.toLowerCase().startsWith(raw.input.toLowerCase()) || element.receiver.toLowerCase().startsWith(raw.input.toLowerCase())) 
                    { 
                        player.resultMessages.push(element) 
                    }  
                });  

                rpc.callBrowsers(mp.players.at(player.id), 'updateMessages', [JSON.stringify({option: false, messages: (!raw.input ? player.messages : player.resultMessages)})]);
                break;
            }

            case 'new conversation':
            {
                player.resultMessages = [];

                player.contacts.forEach((players) => 
                {
                    if(players.name.toLowerCase().startsWith(raw.input.toLowerCase())) 
                    { 
                        player.resultMessages.push({name: players.name, number: players.number});  
                    }  
                });

                if(!raw.input) { player.resultMessages = [] }
 
                rpc.callBrowsers(mp.players.at(player.id), 'updateMessages', [JSON.stringify({option: true, messages: player.resultMessages})]);
                break;
            }
        } 
    }
    catch(error) { console.log(error) }  
});

rpc.register('server::phone:::messages:openConversation', (objects, user) =>
{  
    const player = user.player;  
    const raw = JSON.parse(objects);
 
    switch(raw.option)
    {
        case 'new':
        { 
            const index = player.messages.findIndex(object => object.senderNumber === raw.data.number || object.receiverNumber === raw.data.number);
            player.call('client::phone::messages:openConversation:finish', [JSON.stringify({entered: true, input: '', index: index, new: index != -1 ? false : true, name: index != -1 ? (player.messages[index].sender == player.name ? player.messages[index].receiverNumber : player.messages[index].senderNumber) : raw.data.number})])
            break;
        }

        case 'exist':
        {
            const index = player.messages.findIndex(object => object.senderNumber === raw.data.senderNumber || object.receiverNumber === raw.data.senderNumber);
            player.call('client::phone::messages:openConversation:finish', [JSON.stringify({entered: true, input: '', index: index, new: false, name: index != -1 ? (player.messages[index].sender == player.name ? player.messages[index].receiverNumber : player.messages[index].senderNumber) : raw.data.number})])
            break;
        }
        case 'verify':
        { 
            const index = player.messages.findIndex(object => (object.senderNumber === raw.data.number && raw.data.number != player.info.phoneNumber) || (object.receiverNumber === raw.data.number && raw.data.number != player.info.phoneNumber));
            player.call('client::phone::messages:openConversation:finish', [JSON.stringify({entered: true, input: '', index: index, new: (index != -1 ? false : true), name: index != -1 ? (player.messages[index].sender == player.name ? player.messages[index].receiverNumber : player.messages[index].senderNumber) : raw.data.number})])
            break;
        }
    }  
});
/*------------------------------------------------------------------------------------------------------------------------------------------*/ 


/*---------------------------------------------------------- [ GARAGE APPLICATION ] --------------------------------------------------------*/   
rpc.register('server::phone::vehicles:search', (input, user) =>
{
    const player = user.player;
    player.resultVehicles = [];

    if(input.length && input)
    { 
        player.personalVeh.forEach(element => { 
            if(element.name.toLowerCase().startsWith(input.toLowerCase())) 
            { 
                player.resultVehicles.push(element); 
            } 
        }); 
    }

    let vehicleRes = (!input ? JSON.stringify(player.personalVeh, getCircularReplacer()) : JSON.stringify(player.resultVehicles, getCircularReplacer()))
 
    return rpc.callBrowsers(mp.players.at(player.id), 'reloadPhoneData', [JSON.stringify({vehicles: vehicleRes, locations: { businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }})]);
});
/*------------------------------------------------------------------------------------------------------------------------------------------*/ 


/*--------------------------------------------------------- [ CONTACTS APPLICATION ] -------------------------------------------------------*/   
rpc.register('server::phone::contacts:startCalling', (number, user) =>  
{  
    const player = user.player; 
    const receiver = mp.players.toArray().find((index) => index.info.phoneNumber == number); 
 
    if(number == player.info.phoneNumber || receiver == undefined)
        return;

    if(!mp.players.exists(receiver.id) || !receiver.loggedInAs)
        return sendNotiffication(player, 'info', 'This player is not connected', 'Call:');

    if(!player.info.phoneNumber)
        return sendNotiffication(player, 'error', 'You dont have sim card.', 'Phone:');
 
    const alreadyExist = receiver.contacts.findIndex(object => object.number == player.info.phoneNumber);
 
    if(receiver.info.phoneSettings.airplane)
        return sendNotiffication(player, 'info', 'This player have Airplane Mode active.', 'Phone:');

    if(receiver.info.phoneSettings.ignoreCalls)
        return sendNotiffication(player, 'info', 'This player has blocked calls.', 'Phone:');

    if(receiver.info.phoneSettings.ignore && alreadyExist == -1)
        return sendNotiffication(player, 'info', 'This player has blocked unknown calls.', 'Phone:');
 
    player.callData = { caller: player.info.phoneNumber, receiver: receiver.phoneNumber, input: '', time: 0, status: 'rigning', photo: receiver.info.photo }
    player.call('client::phone:calling:start', [JSON.stringify(player.info.phoneSettings), JSON.stringify(player.messages), JSON.stringify(player.contacts), JSON.stringify(player.personalVeh, getCircularReplacer()), JSON.stringify({ businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }), JSON.stringify(player.transactions), JSON.stringify(player.callData), JSON.stringify({ name: player.name, position: player.position, number: player.info.phoneNumber, money: player.bank })]); 
 
    receiver.callData = { caller: player.info.phoneNumber, receiver: receiver.phoneNumber, input: '', time: 0, status: 'incoming', photo: player.info.photo }
    receiver.call('client::phone:calling:start', [JSON.stringify(receiver.info.phoneSettings), JSON.stringify(receiver.messages), JSON.stringify(receiver.contacts), JSON.stringify(receiver.personalVeh, getCircularReplacer()), JSON.stringify({ businesses: serverBusiness, house: server_houses, jobs: serverJobs, factions: serverFactions, atm: serverBankings }), JSON.stringify(receiver.transactions), JSON.stringify(receiver.callData), JSON.stringify({ name: receiver.name, position: receiver.position, number: receiver.phoneNumber, money: receiver.bank })]);  
 
    player.call('voice.phoneCall', [receiver]);
    receiver.call('voice.phoneCall', [player]); 
}); 

rpc.register('server::phone:calling:decline', (user) =>
{
    return closePlayerCall(user.player);
});

rpc.register('server::phone:calling:accept', (user) =>
{
    const player = user.player; 
    const caller = mp.players.toArray().find((index) => (index.info.phoneNumber == player.callData.caller || index.phoneNumber == player.callData.receiver) && index.info.phoneNumber != player.info.phoneNumber); 

    if(caller != undefined && caller.loggedInAs)
    { 
        caller.callData.status = 'ongoing'; 
        caller.call('client::phone:contacts:updateCall', [JSON.stringify(caller.callData), false]); 
        sendMessage(caller, 'fff', `[Phone]: ${player.name} ti-a raspuns la apel`);  

        player.callData.status = 'ongoing';
        player.call('client::phone:contacts:updateCall', [JSON.stringify(player.callData), false]);
        sendMessage(player, 'fff', `[Phone]: i-ai raspuns lui ${caller.name} la apel`); 
    } 
});
/*------------------------------------------------------------------------------------------------------------------------------------------*/ 

/*

    - Rezolvata o eroare ce aparea pe ecran de la hud
    - Schimbat aspectul la name-tag
    - Rezolvat un bug care te lasa sa dai spawn la casa chiar daca nu aveai una
    - Acum cand esti in login si apesi ENTER nu va mai disparea cursoru
    - Cand te inregistrezi pe server o sa ti-se faca o poza automat
    - Schimbat aspectul Ui unde vezi jucatorii online
    - Schimbat aspectul UI la notificari
    - Acum cand ai wanted vei avea o iconita cu o sirena care are efect de "pulse" 
    - Rezolvat un bug la jobul Curier
    - Adaugat jobul Electrician:
    - Acest job consta in 'lipirea' firelor de electricitate cu ajtorul unui UI
    - Trebuie sa tii apasat pe fir si sa-l tragi la culoarea corecta
    - Acum wantedul expira dupa un anumit timp (wanted level * 60 secunde) 
    - In hud iti va aparea cand expira wantedul
    - Acum daca cineva te omoara il poti raporta (de pe telefon) si acesta va primi wanted
    - In profil data cand te-ai inregistrat va fi in formatul "x days ago / x hours ago"
    - Acum te poti urca in masina ca pasager apasand tasta G
    - Detinatorii business-urilor pot retrage bani din seif din meniul bancar

    UPDATE PHONE:

    - CONTACTS:
        - Facuta optiunea de a adauga un contact 
        - Facuta optiunea de a cauta un contact dupa nume
        - Facuta optiunea de 'view contact'
        
        - Facuta optiunea de a apela un contact din contact details 
        - Facuta optiunea de a trimite mesaj uni contact din contact details 
        - Acum poti vedea poza de profil a unui jucator la contacte

    - DARK WEB
        - Facuta optiunea de a pune un contract pe un jucator
 
    - MESSAGES
        - Facuta optiunea de a vedea mesajele
        - Facuta optiunea de a cauta un mesaj dupa numele celui ce l-a trimis
        - Facuta optiunea de a trimite mesaje + update live

        - Facuta optiunea de a creea o noua conversatie = DE FACUT

    - MAPS
        - Facuta optiunea de a cauta o anumita locatie 
        - Facuta optiunea de a da find la o locatie

    - SETTINGS
        - Iti poti schimba walpaperul
        - Poti pune telefonul pe mod avion
        - Poti bloca apelurile de la oricine
        - Poti bloca apelurile de la cei ce nu sunt in lista ta
        - Poti schimba tonul apelului

    - MAPS
        - Poti cauta o locatie 
        - Poti selecta o locatie si iti va pune checkpoint la aceasta

    BANK-
        - Poti vedea ultimele 3 transactii
        - Poti transfera bani unui jucator 
        - Poti vedea numele contului si banii detinuti 

    Emergency
        - Atunci cand cineva te omoara iti va aparea in aplicatie persoana/locatia/ora
        - Poti raporta atacatorul cu ajutorul aplicatiei 
*/