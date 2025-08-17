global.gpsTracking = {};
let localplayer = mp.players.local;

mp.events.add({
 
    "client::checkpoint:mark" : (player, x, y, z, job = '', scale) =>
    {
        if(Object.keys(gpsTracking).length)
        {
            mp.events.call('client::checkpoint:destroy');
        }

        gpsTracking = 
        {
            player: false,
            job: job,
            blip: mp.blips.new(1, new mp.Vector3(x, y, z), { name: 'GPS Location', scale: 1, color: 3, alpha: 255, shortRange: false, dimension: player.dimension }),
            checkpoint: mp.checkpoints.new(0, new mp.Vector3(x, y, z - 1.0), scale, { direction: new mp.Vector3(0, 0, 75), color: [ 255, 255, 255, 255 ], visible: true, dimension: player.dimension })
        }
 
        return gpsTracking.blip.setRoute(true);  
    },

    "client::checkpoint:destroy" : () =>
    {
        if(Object.keys(gpsTracking).length)
        {
            gpsTracking.blip.destroy();
            gpsTracking.checkpoint.destroy();

            return gpsTracking = {};
        }   
    },
    
    "client::checkpoint:findPlayer" : (player, x, y, z) =>
    { 
        if(!Object.keys(gpsTracking).length)
        {
            gpsTracking = 
            {
                player: true,
                checkpoint: mp.checkpoints.new(4, new mp.Vector3(x, y, z), 1, { color: [ 255, 0, 255, 100 ], visible: true, dimension: 0 }),
                blip: mp.blips.new(1, new mp.Vector3(x, y, z), { name: 'GPS Location', scale: 1, color: 3, alpha: 255, shortRange: false, dimension: 0 })
            }   
        }

        if(Object.keys(gpsTracking).length && gpsTracking.player)
        {
            gpsTracking.checkpoint.position = new mp.Vector3(x, y, z - 1.0);   
        }  
    }, 

    "playerEnterCheckpoint" : (checkpoint) =>
    {  
        if(gpsTracking.blip != null && checkpoint == gpsTracking.checkpoint && !gpsTracking.player) 
        {    
            if(gpsTracking.job == 5 && mp.players.local.vehicle)
            { 
                gpsTracking.blip.setRoute(false);   
                gpsTracking.blip.destroy();
                gpsTracking.checkpoint.destroy(); 
                gpsTracking = {};
     
                return mp.events.callRemote("server::job:trucker:enterTruckerCP"); 
            } 
 
            if(gpsTracking.job == null)
            {
                gpsTracking.blip.setRoute(false);   
                gpsTracking.blip.destroy();
                gpsTracking.checkpoint.destroy(); 
                gpsTracking = {}; 
                return 
            }  
        } 
    }, 
});