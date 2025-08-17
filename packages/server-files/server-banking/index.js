const { CommandRegistry } = require("../server-global/improved-commands"); 
const { Op } = require("sequelize");
 
global.Transactions = sequelize.define('server-transactions', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: null,
        autoIncrement: true
    }, 
    sender: DataTypes.INTEGER,  
    receiver: DataTypes.INTEGER,
    date: DataTypes.DATE, 
    optionTransfer: DataTypes.STRING,
    title: DataTypes.STRING, 
    amount: DataTypes.INTEGER 

}, { timestamps: false });  
 
global.Banking = sequelize.define('server-bankings', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: null,
        autoIncrement: true
    }, 
   
    name: DataTypes.STRING, 
    position: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({
            x: 0, y: 0, z: 0 
        }) 
    }

}, { timestamps: false });  


setTimeout(() => {
    
    loadServerBankings(); 
    loadServerBusiness();
    loadServerJobs();
    loadServerSafezones();
    loadServerDealership();
    loadServerClothing();
    loadServerFacions();
    loadServerClans();
    loadServerHouses();
    loadFactionVehicles();
    loadServerTurfs();

}, 2000); 
 
global.loadServerBankings = async function() {

    global.serverBankings = [];
    let count = 0;
 
    await Banking.findAll({ raw: true }).then((found) => {
        
        if(found.length) {

            found.forEach(element => {

                let position = JSON.parse(element.position);
                
                serverBankings[count] = 
                { 
                    id: element.id,
                    name: element.name,
                    position: position, 
                    blip: mp.blips.new(374, new mp.Vector3(position.x, position.y, position.z), { name: element.name, color: 4, shortRange: true}), 
                };

                mp.colshapes.newSphere(position.x, position.y, position.z, 3).bankingPosition = count + 1;  

                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded server bankings: ' + serverBankings.length);

    }).catch((e) => console.log(e)); 
};
   
global.loadPlayerTransactions = async function(player)
{
    player.transactions = [];
    player.atBankPosition = 0;
  
    try 
    { 
       player.transactions = await Transactions.findAll({ raw: true, where: {[Op.or]: [ { receiver: player.info.id }, { sender: player.info.id } ]} }); 
    }
    catch(e) 
    {
        return console.log(error);
    }    
};

global.getTimeAgo = function(databaseTimestamp) 
{
    const timestamp = new Date(databaseTimestamp);
    const now = new Date();
    const diffInMilliseconds = now - timestamp;
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  
    if (diffInMinutes < 1) 
    {
        return 'just now';
    } 
    else if (diffInMinutes === 1) 
    {
        return '1 minute ago';
    } 
    else if (diffInMinutes < 60) 
    {
        return `${diffInMinutes} minutes ago`;
    } 
    else if (diffInMinutes < 1440) 
    {
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } 
    else 
    {
        const diffInDays = Math.floor(diffInMinutes / 1440);
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
}
 
global.curentTimestamp = function() {
    var datetime = new Date().toJSON().slice(0, 10) + " " + new Date(new Date()).toString().split(' ')[4];
    return datetime;
}

global.formatMoney = function(x) { 
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

global.createTransaction = async function(player, data) 
{ 
    const raw = JSON.parse(data);
 
    try 
    {  
        await Transactions.create({ sender: raw.sender, receiver: raw.receiver, optionTransfer: raw.option, title: raw.title, amount: raw.amount, date: curentTimestamp() });    
    }
    catch(e)
    {
        return console.log(e)
    } 
}; 

CommandRegistry.add({
    name: "gotobank", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 2)  
            return player.staffPerms(2);

        return true;
    },
    run: function (player, id) 
    { 
        if(!id) 
            return sendUsage(player, '/gotobank [id]'); 

        if(id > Object.keys(serverBankings).length || id < 1) 
            return sendMessage(player, '009933', 'Invalid bank ID.');
    
        player.position = new mp.Vector3(serverBankings[id - 1].position.x, serverBankings[id - 1].position.y, serverBankings[id - 1].position.z);
    
        return sendAdmins('ff9900', 'local', `(Notice): ${player.name} teleported to bank #${serverBankings[id - 1].id}.`);
    }
});
  
mp.events.add({
 
    "playerEnterColshape" : (player, shape) => 
    {
        if(shape.bankingPosition) {
            player.atBankingPosition = shape.bankingPosition; 

            return player.call("client::hud:interractShow", [true, 'Los Santos Banking', JSON.stringify(['Manage your bank account']), JSON.stringify([{key: 'E', text: 'Press to interract'}])]);
        }
    },

    "playerExitColshape" : (player) => 
    {
        if(player.atBankingPosition != -1) {
            player.atBankingPosition = -1;

            return player.call("client::hud:interractShow", [false, '', '', '']); 
        } 
    },
 
    'server::banking:open' : (player) => 
    { 
        if(!player.loggedInAs)
            return;

        const x = player.atBankingPosition - 1;
 
        if(player.atBankingPosition != -1 && player.IsInRange(serverBankings[x].position.x, serverBankings[x].position.y, serverBankings[x].position.z, 5))
        { 
            return player.call('client::banking:open', [JSON.stringify({name: player.name, bank: player.info.bank, cash: player.info.money, number: player.info.id + '2023', business: player.info.business, bsafe: (player.info.business != -1 ? serverBusiness[player.info.business - 1].safebox : 0)})]);
        } 
    },

    'server:banking::finishTransaction' : async (player, option, username, amount) =>
    { 
        switch(option)
        {
            case 'deposit':
            {
                if(player.info.money < amount)
                    return sendNotiffication(player, 'error', 'You dont have cash this amount.');

                player.giveMoney(1, amount);
                player.giveMoneyBank(0, amount);

                sendNotiffication(player, 'success', `You deposited $${formatMoney(amount)} in your bank account.`);

                createTransaction(player, JSON.stringify({sender: player.info.id, receiver: -1, option: 'received', title: 'Los Santos Bank', amount: amount})); 

                player.call('client::banking:open', [JSON.stringify({name: player.name, bank: player.info.bank, cash: player.info.money, number: player.info.id + '2023', business: player.info.business, bsafe: (player.info.business != -1 ? serverBusiness[player.info.business - 1].safebox : 0)})]);
                break;
            }

            case 'withdraw':
            {
                if(player.info.bank < amount)
                    return sendNotiffication(player, 'error', 'You dont have this amount in bank.');
 
                player.giveMoney(0, amount);
                player.giveMoneyBank(1, amount);

                sendNotiffication(player, 'success', `You withdrawed $${formatMoney(amount)} from your bank account.`);

                createTransaction(player, JSON.stringify({sender: player.info.id, receiver: -1, option: 'send', title: 'Los Santos Bank', amount: amount})); 
 
                player.call('client::banking:open', [JSON.stringify({name: player.name, bank: player.info.bank, cash: player.info.money, number: player.info.id + '2023', business: player.info.business, bsafe: (player.info.business != -1 ? serverBusiness[player.info.business - 1].safebox : 0)})]);
                break;
            }

            case 'transfer':
            {
                const user = mp.players.toArray().find((user) => user.name === username); 

                if(user == undefined || !user.loggedInAs)
                    return sendNotiffication(player, 'error', 'This player is not connected.');

                if(player.info.bank < amount)
                    return sendNotiffication(player, 'error', 'You dont have this amount in bank.');
 
                sendNotiffication(player, 'success', `You send $${formatMoney(amount)} to ${user.name} (transfer).`);
                sendNotiffication(user, 'success', `You received $${formatMoney(amount)} from ${player.name} (transfer).`);

                player.giveMoneyBank(1, amount);
                user.giveMoneyBank(0, amount); 
 
                createTransaction(player, JSON.stringify({sender: player.info.id, receiver: user.info.id, option: 'send', title: user.name, amount: amount})); 
                createTransaction(user, JSON.stringify({sender: player.info.id, receiver: user.info.id, option: 'received', title: player.name, amount: amount})); 

                player.call('client::banking:open', [JSON.stringify({name: player.name, bank: player.info.bank, cash: player.info.money, number: player.info.id + '2023', business: player.info.business, bsafe: (player.info.business != -1 ? serverBusiness[player.info.business - 1].safebox : 0)})]);
                break;
            }

            case 'business':
            {
                const business = player.data.business;

                if(business == -1)
                    return sendNotiffication(player, 'error', 'You dont have a business.', 'Business:');

                if(serverBusiness[business - 1].safebox < amount)
                    return sendNotiffication(player, 'error', 'You dont have this amount in business safebox.', 'Bank:');

                serverBusiness[business - 1].safebox -= amount;  
                await Business.update({ safebox: serverBusiness[business - 1].safebox }, { where: { id: serverBusiness[business - 1].id } } ); 
  
                player.giveMoney(0, amount);

                createTransaction(player, JSON.stringify({sender: -1, receiver: player.info.id, option: 'received', title: 'Los Santos Bank', amount: amount})); 
                sendNotiffication(player, 'success', `You withdraw $${formatMoney(amount)} from business safebox.`, 'Bank:');
 
                player.call('client::banking:open', [JSON.stringify({name: player.name, bank: player.info.bank, cash: player.info.money, number: player.info.id + '2023', business: player.info.business, bsafe: (player.info.business != -1 ? serverBusiness[player.info.business - 1].safebox : 0)})]);
                break;
            }
        } 
    }
}); 