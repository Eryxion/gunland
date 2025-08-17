let storeOpened = false;
let gunShopOpened = false;
 
mp.keys.bind(0x45, true, function() //KEY E
{ 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible || !enums.variables.logged)
        return;

    return mp.events.callRemote("client::business:accesingKey");  
});
 
mp.keys.bind(0x1B, false, async function() { //ESC
	    
	if(storeOpened) {
        return mp.events.call("client::store:close");
    }

    if(gunShopOpened) {
        return mp.events.call("client::gunshop:close");
    }

    if(gasBrowserOpened) {
        return mp.events.call("client::petrol:close");
    }

    if(marketBrowserOpened) {
        return mp.events.call("client::petrol:close");
    }

    if(profileBrowserOpened) {
        return mp.events.call('client::profile:close');
    } 
});
 
mp.events.add(
{ 
    "client::store:open" : () =>
    {   
        if(storeOpened)   
            return;
        
        storeOpened = true; 
        hideDashboard(false);
        mp.gui.cursor.visible = true;   
           
        globalBrowser.execute(`app.trigger("showStore", true);`); 
        return globalBrowser.execute('StoreComponent.open();');   
    },

    "client::store:close" : () =>
    {
        if(!storeOpened)
            return;

        globalBrowser.execute(`app.trigger("showStore", false);`); 
 
        storeOpened = false; 
        mp.gui.cursor.visible = false;
         
        return hideDashboard(true);
    },
 
    "client::gunshop:show" : () =>
    {
        if(gunShopOpened)   
            return;
        
        gunShopOpened = true;  
        mp.gui.cursor.visible = true;   

        hideDashboard(false);
           
        return globalBrowser.execute(`app.trigger("showGunShop", true);`); 
    },

    "client::gunshop:close" : () =>
    {
        if(!gunShopOpened)
            return;

        globalBrowser.execute(`app.trigger("showGunShop", false);`); 

        gunShopOpened = false; 
        mp.gui.cursor.visible = false;
        
        return hideDashboard(true);
    }
});