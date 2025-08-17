mp.keys.bind(0x46, true, function() //KEY F
{ 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || !enums.variables.logged)
        return;

    return mp.events.callRemote("server:houses::enterHouse");  
});

mp.keys.bind(0x45, true, function() //KEY E
{ 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || !enums.variables.logged)
        return;

    return mp.events.callRemote("server:houses::showOptions");  
});
 
mp.events.add({
 
    /*---------------------------------------------------------HOUSE MENU--------------------------------------------------------*/ 
    "client:house::showMenu" : (data, page, visitor = false) => 
    { 
        mp.gui.cursor.visible = true;  
        hideDashboard(false);

        globalBrowser.execute(`app.trigger("showHouse", true);`);  
        return globalBrowser.execute(`HousesComponent.open(${data}, ${page}, ${visitor})`); 
    },

    "client::house:closeMenu" : () =>
    {
        globalBrowser.execute(`app.trigger("showHouse", false);`); 

        hideDashboard(true); 
        return mp.gui.cursor.visible = false;  
    },  
});