mp.keys.bind(0x51, false, async function() { //Q KEY
	 
    if(mp.players.local.isTypingInTextChat || mp.gui.cursor.visible)
        return;

        //globalBrowser.execute(`app.trigger("showDriving", true);`); 
  
	return mp.events.callRemote('server:radio::starting');
});
 
mp.events.add({
  
    "client:radio::openMenu" : (station) => 
    {
        globalBrowser.execute(`app.trigger("showHud", false);`); 

        globalBrowser.execute(`app.trigger("showRadio", true);`); 
        globalBrowser.execute(`RadioComponent.open(${station});`);  

        return mp.gui.cursor.visible = true;  
    },

    "client:radio::closeMenu" : () =>
    {  
        mp.gui.cursor.visible = false;   
        globalBrowser.execute(`app.trigger("showRadio", false);`); 

        return globalBrowser.execute(`app.trigger("showHud", true);`); 
    },

    "client::radio:enterVehicle" : (radioStation, volume) =>
    { 
        return globalBrowser.execute(`RadioComponent.startRadio(${radioStation}, ${parseInt(volume)})`);
    },

    "client::radio:exitVehicle" : () =>
    {
        return globalBrowser.execute(`RadioComponent.stopRadio();`); 
    },
 
    "client:radio::radioChange" : (stationID) =>
    {
        mp.gui.cursor.visible = false;
        globalBrowser.execute(`app.trigger("showRadio", false);`);  
        globalBrowser.execute(`app.trigger("showHud", true);`); 

        return mp.events.callRemote("server:radio::radioChange", stationID);   
    },

    "client:radio::radioChangeVolume" : (volume) =>
    { 
        return globalBrowser.execute(`RadioComponent.radioChangeVolume(${volume})`);  
    }
}); 