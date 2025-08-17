mp.events.add(
{  
    "client::trade:open" : (data) => {  
        mp.gui.cursor.visible = true;    
        hideDashboard(false);
    
        globalBrowser.execute(`app.trigger("showTrade", true);`); 

        return globalBrowser.execute(`TradeComponent.open(${data});`);   
    },

    "client::trade:close" : () => {  
        mp.gui.cursor.visible = false;    
        hideDashboard(true);
    
        globalBrowser.execute(`app.trigger("showTrade", false);`);  
    },
});

mp.keys.bind(0x1B, false, async function() { //ESC  
    await rpc.callServer('server::trade:close');
});