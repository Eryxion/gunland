global.marketBrowserOpened = false;
 
mp.events.add(
    { 
        "client::market:open" : (page, items) =>
        {   
            if(marketBrowserOpened)   
                return;
            
            marketBrowserOpened = true;  
            mp.gui.cursor.visible = true;   

            hideDashboard(false);
               
            globalBrowser.execute(`app.trigger("showMarket", true);`); 
            return globalBrowser.execute(`MarketComponent.open(${page, items});`);   
        },
    
        "client::market:close" : () =>
        {
            if(!marketBrowserOpened)
                return;
    
            globalBrowser.execute(`app.trigger("showMarket", false);`); 
     
            marketBrowserOpened = false; 
            mp.gui.cursor.visible = false;
             
            return hideDashboard(true);
        } 
    });