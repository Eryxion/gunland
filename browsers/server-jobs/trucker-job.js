global.truckerShow = false;

const player = mp.players.local;

mp.events.add({   
    "client::job:trucker:showMenu" : () =>
    {   
        if(mp.players.local.isTypingInTextChat || truckerShow)
            return;

        truckerShow = true;
		mp.gui.cursor.visible = true;  
        hideDashboard(false);
 
        globalBrowser.execute(`app.trigger("showTrucker", true);`);
   
        return globalBrowser.execute(`TruckerComponent.open(${JSON.stringify(player.position)});`);  
    },

    "client::job:trucker:closeMenu": (option = false) =>
    { 
        truckerShow = false;
        mp.gui.cursor.visible = false; 

        hideDashboard(true);
        globalBrowser.execute(`app.trigger("showTrucker", false);`);

        if(option)
        {
            return mp.events.callRemote("server::job:trucker:closeMenu");  
        } 
    }, 
     
    'enableCollisions' : () => 
    {
        mp.players.forEach(player => 
        {
            mp.players.local.vehicle.setNoCollision(player.vehicle.handle, true);
            player.vehicle.setAlpha(255);
            player.setAlpha(255);
        });
    },
    
    'disableCollisions' : () => 
    {
        mp.players.forEach(player => 
        {
            mp.players.local.vehicle.setNoCollision(player.vehicle.handle, false);
            player.vehicle.setAlpha(102);
            player.setAlpha(255);
        });
    } 
});   