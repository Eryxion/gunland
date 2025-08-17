let showroomCam = null; 
 
mp.events.add(
{   
    "client::showroom:start" : (data) =>
    {   
        hideDashboard(false); 
          
        setTimeout(() => {
            mp.game.ui.displayRadar(false);
            mp.gui.cursor.visible = true; 
        }, 1000);
         
        showroomCam = mp.cameras.new("creatorCamera", new mp.Vector3(-1505.4131, -2992.079, -83.19269 + 2.3), new mp.Vector3(0, 0, 285.854), 90);
        showroomCam.pointAtCoord(-1506.6466, -2985.047, -82.200745); 
        showroomCam.setActive(true); 
        mp.game.cam.renderScriptCams(true, false, 3000, true, false);

        globalBrowser.execute(`app.trigger("showDealership", true);`);
 
        return globalBrowser.execute(`DealershipComponent.open(${data});`);  
    },

    "client::showroom:close" : (option = false) =>
    {   
        globalBrowser.execute(`app.trigger("showDealership", false);`); 

        showroomCam.destroy();
        showroomCam = null;
 
        mp.game.cam.renderScriptCams(false, false, 3000, true, true); 

        mp.gui.cursor.visible = false;
        hideDashboard(true);

        if(option)
            return mp.events.callRemote('server::showroom:close');    
    } 
});

  
mp.keys.bind(0x45, false, async function() { //E KEY
 
    if(mp.players.local.isTypingInTextChat || !enums.variables.logged || mp.gui.cursor.visible)
        return;
 
    return mp.events.callRemote('server::showroom:start');    
}); 

mp.keys.bind(0x1B, false, async function() { //ESC
	    
	if(showroomCam != null)
    {
        globalBrowser.execute(`app.trigger("showDealership", false);`); 
        mp.game.cam.renderScriptCams(false, false, 3000, true, true); 

        mp.gui.cursor.visible = false;
        hideDashboard(true);

        return mp.events.call("client::showroom:close", true); 
    }
});