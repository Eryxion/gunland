global.dashboardOpen = false;  
const localPlayer = mp.players.local; 

 

 
mp.keys.bind(0x45, false, async function() { //E KEY
	 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible)
        return;
  
	return mp.events.callRemote('server::faction:changeClothes');
});
 
mp.keys.bind(0x48, false, async function() { //H KEY
	 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible)
        return;
  
	return mp.events.callRemote('server::faction:surrender');
});

mp.keys.bind(0x78, false, async function() { //F9
	    
	if(!mp.players.local.isTypingInTextChat && !mp.gui.cursor.visible && !dashboardOpen)
	{ 
		return mp.events.callRemote('server::faction:openDashboard'); 
	}  
});

mp.keys.bind(0x1B, false, async function() { //ESC
	    
	if(dashboardOpen)
    {
		globalBrowser.execute(`app.trigger("showFactions", false);`);  
		mp.gui.cursor.visible = false;
		dashboardOpen = false;
		hideDashboard(true);
    }
});
 
mp.events.add({  
	'client::faction:openDashboard' : (wantedList, jailedPlayers, playerdata) =>
	{ 
		globalBrowser.execute(`app.trigger("showFactions", true);`);  
		mp.gui.cursor.visible = true;
		dashboardOpen = true;
		hideDashboard(false);

		return globalBrowser.execute(`FactionsComponent.openMenu(${wantedList}, ${jailedPlayers}, ${playerdata})`); 
	},
 
	'client::faction:closeMenu' : () =>
	{
		globalBrowser.execute(`app.trigger("showFactions", false);`);  
		mp.gui.cursor.visible = false;
		dashboardOpen = false;
		hideDashboard(true);
	} 
});