 
let shopOpened = false;
 
mp.keys.bind(0x1B, false, async function() { //ESC
	if(!shopOpened)
		return;    

	globalBrowser.execute(`app.trigger("showShop", false);`);   

	mp.gui.cursor.visible = false; 
	shopOpened = false;
	
	return hideDashboard(true);
});

mp.events.add({ 
    'client::premium:open': (data) => {
		if(shopOpened)
			return;   
 
		hideDashboard(false);
        mp.gui.cursor.visible = true;
        shopOpened = true;

        globalBrowser.execute(`app.trigger("showShop", true);`);   
      
        return globalBrowser.execute(`ShopComponent.open(${data})`);  
	},

	'client::premium:close': () => {
		if(!shopOpened)
			return;    
 
		globalBrowser.execute(`app.trigger("showShop", false);`);   

		mp.gui.cursor.visible = false; 
		shopOpened = false;
		
		return hideDashboard(true);
	}
});