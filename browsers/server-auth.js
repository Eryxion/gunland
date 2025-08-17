
const player = mp.players.local;   
const allowedSocialClubs = [
    'vladyboss47', 'domnulemi', 'GrecuAdi', 'ZxVlad', 'Fluard', 'TESTY1994'
];

setTimeout(() => { mp.gui.cursor.visible = true; }, 2000);
 
mp.events.add(
{    
    'server:authorization::start' : (data) =>
    {  
        const raw = JSON.parse(data);

        if(!allowedSocialClubs.includes(raw.socialclub)) {
            mp.gui.cursor.visible = false;
        }
         
        mp.game.ui.displayRadar(false); 

        globalBrowser.execute(`AuthComponent.showAuthData(${data}, ${true/*allowedSocialClubs.includes(raw.socialclub)*/})`);  
 
        return globalBrowser.execute(`app.trigger("showAuth", true);`);  
    },

    'server:authorization::end' : () => 
    {
        mp.gui.cursor.visible = false;  
        global.enums.variables.logged = true; 
 
        mp.players.local.freezePosition(false);   
        mp.game.ui.displayRadar(true);

        return globalBrowser.execute(`app.trigger("showAuth", false);`);  
    }   
});  