let rpc = require("rage-rpc");
let bcrypt = require('bcrypt-nodejs'); 

global.DataTypes = require('../../../node_modules/sequelize/lib/data-types');

global.registerAccount = async function(player, name, sqlid)
{ 
    player.heading = 327.559;
    player.health = 100;
    player.armour = 50;
    player.name = name;  

    player.call("server:authorization::end", []);

    let userData = await Account.findOne({ where: { username: name } });
 
    if(userData != null) {
        player.info = userData.dataValues;
 
        player.info.characterData = {};
 
        await startPlayerCreator(player);   
    }  
};
 
global.loadAccount = async function(player)
{  
    if(player.info.clan.id) {
        player.setVariable('clanColor', serverClans[player.info.clan.id - 1].color); 
        player.setVariable('clanName', serverClans[player.info.clan.id - 1].name);
        player.setVariable('clanTag', serverClans[player.info.clan.id - 1].tag);
    }
 
    player.setVariable('hotkeys', player.info.playerSettings.hotkeys); 
    player.setVariable('newbie', player.info.playerSettings.newbie);
    player.setVariable('voice', player.info.playerSettings.voice);
    player.setVariable('voiceVolume', player.info.playerSettings.voiceVolume);

    player.setVariable('radio', player.info.playerSettings.radio); 
    player.setVariable('radioVolume', player.info.playerSettings.radioVolume);  
    player.setVariable('radioStation', 0);


    player.call('client::keybinds:loadAll', [player.info.playerBinds['CHAT'].id, player.info.playerBinds['TALK'].id, player.info.playerBinds['PHONE'].id, player.info.playerBinds['INVENTORY'].id, player.info.playerBinds['PROFILE & SETTINGS'].id, player.info.playerBinds['PLAYERS LIST'].id, player.info.playerBinds['VEHICLE LOCK'].id, player.info.playerBinds['VEHICLE ENGINE'].id, player.info.playerBinds['VEHICLE SEATBELT'].id]);
    player.call('client::login:setData', [player.info.house, player.info.group]);   
 
    console.log(player.info.playerBinds)
   
    rpc.callBrowsers(mp.players.at(player.id), 'setChatGrades', [JSON.stringify({ admin: player.info.admin, group: player.info.group, reload: false })]);
    rpc.callBrowsers(mp.players.at(player.id), 'reloadAuthData', [JSON.stringify({ data: { name: player.name, socialclub: player.socialClub, house: player.info.house, faction: player.info.group}, page: 1 })]);

    return console.log(`${player.name} has logged in`);    
}  
 
rpc.register('server:authorization::spawn', async (option, user) =>  
{
    try
    {
        const player = user.player; 
       
        player.loggedInAs = true;   
        player.dimension = 0; 

        loadPlayerData(player, player.info.id); 
     
        await Account.update({ status: 1 }, { where: { id: player.info.id } }); 

        player.call("server:authorization::end", []);
  
        player.pushChat('8080ff', 'local', `(Server):</span> Welcome to the server ${player.name} [${player.id}].`);
 
        if(player.info.admin) {  
            player.pushChat('ffffff', 'local', 'You are a staff member, loading permisions...');
            player.pushChat('ff0000', 'local', `>>> Permissions:`);
 
            sendMessage(player, 'ff0000', `>> staff:!{#ffffff} true`);   
            sendMessage(player, 'ff0000', `> operator:!{#ffffff} ${(player.info.admin) >= 7 ? ('true') : ('false')}`); 
            sendMessage(player, 'ff0000', `Greeter:!{#ffffff} Admin ${player.name} [${player.id}] logged in.`); 
        }
 
        if(player.info.quests[0] == null && player.info.quests[0] == null) {
            generateDailyQuest(player, false);
        }
 
        removeMemberFromHouse(player);
  
        if(player.info.jail) {
            return serverPlayerJail(player);
        }
             
        switch(option)
        {
            case 0:
            {
                player.spawn(new mp.Vector3(-61.349, -792.933, 44.225)); 
                player.heading = parseFloat(-41.017);   
                break;
            }  
            case 1:
            { 
                if(player.info.house == -1)
                    return;

                let house = player.info.house - 1;

                player.spawn(new mp.Vector3(server_houses[house].positionInt.x, server_houses[house].positionInt.y, server_houses[house].positionInt.z)); 
                player.heading = server_houses[house].positionInt.heading;   
                player.houseInt = house;  
                player.dimension = player.info.house;
                break;
            } 
 
            case 2:
            {
                if(!player.info.group)
                    return;

                const group = player.info.group - 1;
 
                player.spawn(new mp.Vector3(factionSpawns[group].x, factionSpawns[group].y, factionSpawns[group].z)); 
                player.heading = factionSpawns[group].heading;    
                player.dimension = serverFactions[group].id;
                break;
            }    
        }  
    }
    catch(error) { console.log(error) }   
});
 
 
rpc.register('server:authorization::login', async (data, user) =>  
{
    try
    {
        const player = user.player; 
        const raw = JSON.parse(data); 
        const loggedAccount = mp.players.toArray().find(players => players.loggedInAs && players.name === raw.data.name); 
   
        if(loggedAccount) {
            showPlayerCursor(player, true);
            return sendNotiffication(player, 'info', 'This account is already connected.', 'Account:'); 
        }
 
        const project = await Account.findOne({ where: { username: raw.data.name } });
        if(project === null) 
            return sendNotiffication(player, 'error', 'This accound is not registred.');
  
        bcrypt.compare(raw.data.password, project.password, async function(err, res2) 
        { 
            if(res2 === false)
                return sendNotiffication(player, 'error', "Your password is incorrect.");
                
            player.loggedInAs = true;
            player.name = raw.data.name;  
            player.info = project;
        
            player.info.playerSettings = JSON.parse(player.info.playerSettings);
            player.info.playerBinds = JSON.parse(player.info.playerBinds);
            player.info.phoneSettings = JSON.parse(player.info.phoneSettings);  
            player.info.tickets = JSON.parse(player.info.tickets);

            player.info.characterData = JSON.parse(player.info.characterData); 
            player.info.tatoos = JSON.parse(player.info.tatoos);
            player.setVariable('tatoos', JSON.stringify(player.info.tatoos));

            player.info.clan = JSON.parse(player.info.clan);
            player.info.wanted = JSON.parse(player.info.wanted);
        
            player.info.quests = JSON.parse(player.info.quests);
            player.info.questsProgress = JSON.parse(player.info.questsProgress);
            player.info.achievements = JSON.parse(player.info.achievements);
 
            await mp.events.call("loadVariables", player); 
            await loadAccount(player);     
            showPlayerCursor(player, true); 
        }); 
    }
    catch(error) { console.log(error) }   
}); 
 
rpc.register('server:authorization::register', async (data, user) =>  
{
    try
    {
        const player = user.player; 
        const raw = JSON.parse(data); 
        const loggedAccount = mp.players.toArray().find(players => players.loggedInAs && players.name === raw.data.name); 

        if(loggedAccount) {
            showPlayerCursor(player, true);
            return sendNotiffication(player, 'info', 'This account is already connected.', 'Account:');
        } 
 
        if(raw.data.name.length > 10) {
            showPlayerCursor(player, true);
            return sendNotiffication(player, 'info', 'Your name is too long (max 10 characters).');
        }

        if(raw.data.password.length < 5) { 
            showPlayerCursor(player, true);
            return sendNotiffication(player, 'info', 'Your password is too small (min 5 characters).');
        }
 
        mp.events.call("loadVariables", player);
   
        const project = await Account.findOne({ where: { username: raw.data.name }}); 
 
        if(project !== null) {
            showPlayerCursor(player, true);
            return sendNotiffication(player, 'info', 'This account already exist.', 'Account:');
        }

        bcrypt.hash(raw.data.password, null, null, async function(errorBcrypt, hashBcrypt) {  
            if(errorBcrypt)
                return console.log("\x1b[31m[BCrypt]: " + errorBcrypt) 

            player.info = [];
 
            let newAccount = await Account.create({ username: raw.data.name, password: hashBcrypt, email: raw.data.email });
  
            await registerAccount(player, raw.data.name, newAccount.id);   
        }); 
    }
    catch(error) { console.log(error) }   
}); 

global.showPlayerCursor = function(player, status) {
    player.call("client::hud:showCursor", [status]);
};

global.loadPlayerData = function(player, sqlid)
{    
    mp.events.call("server:inventory::loading", player, sqlid);  
    mp.events.call("server::personalVehicles:load", player);
 
    loadPlayerMessages(player, sqlid);
  
    player.setVariable('REMOTE_ID', player.id);	

    player.call("client::hud:open", [true, player.info.money, player.info.bank, player.info.admin, player.info.group, player.info.hungry, player.info.thirst, JSON.stringify(player.info.wanted), player.info.jail, JSON.stringify(player.info.playerBinds), player.info.playerSettings.hotkeys, player.info.payday]);
 
    load_player_group(player);
    loadPlayerTransactions(player);
 
    return startPlayerCreator(player);
};
 
global.Account = sequelize.define('accounts', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    username: DataTypes.STRING,
    password: DataTypes.STRING,  
    email: DataTypes.STRING,  
    socialclub: DataTypes.STRING,  
    
    money: DataTypes.INTEGER,
    bank: DataTypes.INTEGER,
    helper: DataTypes.INTEGER,
    admin: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    hours: DataTypes.INTEGER,
    experience: DataTypes.INTEGER,
    payday: DataTypes.INTEGER,
    warns: DataTypes.INTEGER,
    house: DataTypes.INTEGER,
    business: DataTypes.INTEGER,
    houseDays: DataTypes.INTEGER,
    mute: DataTypes.INTEGER,
    newbieMute: DataTypes.INTEGER,
    drivingLicence: DataTypes.INTEGER,
    motorbike: DataTypes.INTEGER,
    hungry: DataTypes.INTEGER,
    thirst: DataTypes.INTEGER, 
    status: DataTypes.INTEGER, 
    phoneNumber: DataTypes.INTEGER, 
    
    group: DataTypes.INTEGER,
    groupRank: DataTypes.INTEGER,
    groupWarns: DataTypes.INTEGER,
     
    arrests: DataTypes.INTEGER,
    commands: DataTypes.INTEGER,

    photo: DataTypes.STRING, 
    joinedGroup: DataTypes.STRING,
    registered: DataTypes.DATE, 

	premium: DataTypes.INTEGER,
    premiumpoints: DataTypes.INTEGER,
    //vip: DataTypes.INTEGER,


    job: DataTypes.INTEGER,
    jail: DataTypes.INTEGER,
    quests: {
        type: DataTypes.STRING,   
        defaultValue: JSON.stringify(null, null)
    },

    questsProgress: {
        type: DataTypes.STRING,   
        defaultValue: JSON.stringify(0, 0)
    },
    achievements: {
        type: DataTypes.STRING,
        defaultValue: JSON.stringify(0, 0, 0, 0, 0, 0, 0)
    },

    phoneSettings: {
        type: DataTypes.JSON, 
        allowNull: false,
        defaultValue: { 
            wallpaper: 2,
            airplane: false,
            ignoreCalls: false,
            ignore: false,
            ringtone: 0,
            photo: "https://i.imgur.com/DP7NqWU.png" 
        }
    }, 
    tickets: {
        type: DataTypes.JSON,
        allowNull: false, 
        defaultValue: []
    }, 
    characterData: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    }, 
    tatoos: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
      
    clan: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
			id: 0, tag: 0, rank: 0, permissions: [false,false,false]
		}
    }, 
    playerSettings: { 
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
			hotkeys: true, 
			newbie: true, 
			voice: true, 
			radio: true, 
			radioVolume: 100, 
			voiceVolume: 100, 
			pagesize: 10, 
			fontsize: 13, 
			timestamp: false
		}
    },
     
    playerBinds: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false, 

        defaultValue: { 
            "CHAT": {id:84, has:"0x54", key: "T"},
            "TALK": {id:75, has: "0x4B", key: "K"},
            "PHONE": {id:38, has: "0x26", key: "UP"},
            "INVENTORY": { id: 73, has: "0x49", key: "I"},
            "PROFILE & SETTINGS": {id: 77, has: "0x4D", key: "M"},
            "PLAYERS LIST": {id: 90, has: "0x5A", key: "Z"},
            "VEHICLE LOCK": {id: 76, has: "0x4C", key: "L"},
            "VEHICLE ENGINE": {id: 50, has: "0x32", key: "2"},
            "VEHICLE SEATBELT": {id: 72, has: "0x48", key: "H"} 
        }
    },
     
    wanted: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
			level: 0, time: 0, reporters: [], reasons: []
		}
    } 
}, { timestamps: false });   