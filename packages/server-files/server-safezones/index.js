const { CommandRegistry } = require("../server-global/improved-commands"); 
 

global.Safezones = sequelize.define('server-safezones', { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
   
    ranges: DataTypes.STRING,  
    position: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: JSON.stringify({
            x: 0, y: 0, z: 0 
        }) 
    }

}, { timestamps: false });

global.loadServerSafezones = async function() {

    global.serverSafezones = [];
    let count = 0;
 
    await Safezones.findAll({ raw: true }).then((found) => {
        
        if(found.length) {
 
            found.forEach(element => { 
                let position = JSON.parse(element.position);
                
                serverSafezones[count] = { 
                    id: element.id, 
                    position: position,  
                    range: element.ranges 
                };

                mp.colshapes.newSphere(position.x, position.y, position.z, element.ranges).inSafeZoneShape = count + 1;  

                count ++;
            }); 
        } 

        return console.log('[MYSQL] Loaded server safezones: ' + serverSafezones.length);

    }).catch((e) => console.log(e)); 
};
  
mp.events.add({
    "playerJoin": (player) =>
    {
        player.inSafe = false;
        player.setVariable('inSafeZone', false); 
    },
 
    "playerEnterColshape" : (player, shape) => 
    { 
        if(shape.inSafeZoneShape) {
            player.inSafe = true; 
            player.setVariable('inSafeZone', true);
 
            return player.call('client::player:changeSafezone', [player.inSafe]);
        } 
    },

    "playerExitColshape" : (player, shape) => 
    {  
        if(shape.inSafeZoneShape)
        {
            player.inSafe = false; 
            player.setVariable('inSafeZone', false);
  
            return player.call('client::player:changeSafezone', [player.inSafe]);
        } 
    },
});

CommandRegistry.add({
    name: "createsafezone", 
      
    beforeRun: function (player) 
    {
        if(player.info.admin < 6)  
            return player.staffPerms(6);

        return true;
    },
    run: async function(player, range) 
    {   
        if(!range || isNaN(range))
            return sendUsage(player, '/createsafezone [range]'); 
   
        await Safezones.create({ position: { x: parseFloat(player.position.x.toFixed(3)), y: parseFloat(player.position.y.toFixed(3)), z: parseFloat(player.position.z.toFixed(3)) }, ranges: parseInt(range) });
         
        serverSafezones.push({id: serverSafezones.length + 1, position: { x: player.position.x.toFixed(3), y: player.position.y.toFixed(3), z: player.position.z.toFixed(3) }, range: range})
     
        sendAdmins(COLOR_ADMIN, 'local', `(Notice): ${player.name} created new safezone (id: ${serverSafezones.length}).`); 

        await loadServerBusiness();
    }
});