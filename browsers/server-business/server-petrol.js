global.gasBrowserOpened = false; 
 
mp.events.add(
{ 
    "client::petrol:show" : () =>
    {    
        if(gasBrowserOpened)
            return;
  
        gasBrowserOpened = true;
        mp.gui.cursor.visible = true;  
        hideDashboard(false);

        globalBrowser.execute(`app.trigger("showGas", true);`);  
        return globalBrowser.execute('GasComponent.open();');   
    },

    "client::petrol:close" : () =>
    {
        if(!gasBrowserOpened) 
            return;

        globalBrowser.execute(`app.trigger("showGas", false);`);  
        mp.gui.cursor.visible = false; 
        gasBrowserOpened = false; 
            
        return hideDashboard(true); 
    } 
}); 