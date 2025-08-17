var tunCam = null;
var localPlayer = mp.players.local; 


var categoryPositions = [
    { 'CarHeading': 85.0, 'CamPosition': [-333.7966, -137.409, 38.88963] },
    { 'CarHeading': 148.9986, 'CamPosition': [-333.7966, -137.409, 39.28963] },
    { 'CarHeading': 265.0, 'CamPosition': [-333.7966, -137.409, 40.58963] },
    { 'CarHeading': 85.0, 'CamPosition': [-333.7966, -137.409, 39.28963] },
    { 'CarHeading': 265.0, 'CamPosition': [-333.7966, -137.409, 38.88963] },
    { 'CarHeading': 148.9986, 'CamPosition': [-333.7966, -137.409, 39.28963] },
    { 'CarHeading': 148.9986, 'CamPosition': [-333.7966, -137.409, 40.08963] },
    { 'CarHeading': 160.9986, 'CamPosition': [-333.7966, -137.409, 42.08963] },
    { 'CarHeading': 265.0, 'CamPosition': [-333.7966, -137.409, 38.88963] },
    { 'CarHeading': 85.0, 'CamPosition': [-333.7966, -137.409, 38.88963] },
    { 'CarHeading': 265.0, 'CamPosition': [-333.7966, -137.409, 40.58963] },
    { 'CarHeading': 265.0, 'CamPosition': [-333.7966, -137.409, 40.58963] },
    { 'CarHeading': 148.9986, 'CamPosition': [-333.7966, -137.409, 40.58963] },
    { 'CarHeading': 265.0, 'CamPosition': [-333.7966, -137.409, 40.58963] },
    { 'CarHeading': 148.9986, 'CamPosition': [-333.7966, -137.409, 39.28963] },
    { 'CarHeading': 148.9986, 'CamPosition': [-333.7966, -137.409, 39.28963] },
    { 'CarHeading': 265.0, 'CamPosition': [-333.7966, -137.409, 40.58963] },
    { 'CarHeading': 265.0, 'CamPosition': [-333.7966, -137.409, 38.88963] },
    { 'CarHeading': 85.0, 'CamPosition': [-333.7966, -137.409, 38.88963] },
    { 'CarHeading': 148.9986, 'CamPosition': [-333.7966, -137.409, 39.28963] },
    { 'CarHeading': 160.9986, 'CamPosition': [-333.7966, -137.409, 40.08963] },
	{ 'CarHeading': 160.9986, 'CamPosition': [-333.7966, -137.409, 40.08963] },
	{ 'CarHeading': 160.9986, 'CamPosition': [-333.7966, -137.409, 40.08963] },
	{ 'CarHeading': 160.9986, 'CamPosition': [-333.7966, -137.409, 40.08963] },
	{ 'CarHeading': 160.9986, 'CamPosition': [-333.7966, -137.409, 40.08963] },
	{ 'CarHeading': 160.9986, 'CamPosition': [-333.7966, -137.409, 40.08963] },
	{ 'CarHeading': 160.9986, 'CamPosition': [-333.7966, -137.409, 40.08963] } 
];
var categoryIds = {

    "Engine": 10,
    "Turbo": 11,
    "Hood": 2,
    "Suspension": 15,
    "Horn": 12,
    "Wheels": 19,
    "Roof": 6,
    "Spoiler": 3,
    "Head Lights": 17,
    "Colors": 20,
    "Front Bumper": 8,
    "Rear Bumper": 9,  
    "Exhaust": 0,
    "Tyre Smoke": 7, 
    "Griller": 4,
    "Transmision": 13,

       
    "Trunk": 5,   
    "Livery": 16,  
	"Fender": 21, 
	"Neon": 21,
	"paint_4": 21,
	"paint_5": 21,
	"armor_menu": 26,
};

 
mp.events.add(
{  
    "client::tunning:start" : (page) => {  
        hideDashboard(false);
        mp.gui.cursor.visible = true;  

        if(page != 0) {
            tunCam = mp.cameras.new('default', new mp.Vector3(-333.7966, -137.409, 40.58963), new mp.Vector3(0, 0, 0), 60);
            tunCam.pointAtCoord(-338.7966, -137.409, 37.88963);
            tunCam.setActive(true);
            mp.game.cam.renderScriptCams(true, true, 1500, true, false);
        }
  
        globalBrowser.execute(`app.trigger("showTunning", true);`);

        return globalBrowser.execute(`TunningComponent.open(${page});`);   
    },

    "client::tunning:close" : () => {  
        mp.gui.cursor.visible = false;    
        hideDashboard(true);

        if(tunCam) {
            tunCam.destroy();
            tunCam = null;
        }

        mp.game.cam.renderScriptCams(false, false, 3000, true, true); 
    
        return globalBrowser.execute(`app.trigger("showTunning", false);`);  
    },

    "client::tunning:change" : (item) => {  
        
        localPlayer.vehicle.setHeading(categoryPositions[categoryIds[item]].CarHeading);
 
        tunCam.setCoord(categoryPositions[categoryIds[item]].CamPosition[0], categoryPositions[categoryIds[item]].CamPosition[1], categoryPositions[categoryIds[item]].CamPosition[2]);
    },

    "client::tunning:changeMod" : (item) =>
    {
        const raw = JSON.parse(item);
        const mod = JSON.parse(raw.data);
    
        switch(raw.category) {
            case 0: { 
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            case 1: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            case 2: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            case 4: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }

            case 23: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            } 
            case 7: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            
            case 10: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            case 11: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            case 18: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            case 13: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            case 15: {  
                mp.events.callRemote('server::tunning:changeMod', raw.category, mod.index); 
                break;
            }
            case 22: {
                
                localPlayer.vehicle.setLights(1); 
                if(mod.index >= 0) {
                    localPlayer.vehicle.setMod(22, 0);
                  

                    mp.game.invoke('0xE41033B25D003A07', localPlayer.vehicle.handle, parseInt(mod.index));
                } 
                else localPlayer.vehicle.setMod(22, -1);
                break;
            } 
        } 
    }
});

mp.keys.bind(0x1B, false, async function() { //ESC
	    
	if(tunCam != null) { 
        mp.events.call("client::tunning:close"); 
    }
});
 
async function getAvailableMods(mod, vehicle) { 
    let modNames = [];

    for (let i = -1; i < vehicle.getNumMods(mod); i++) { 
        modNames.push({ name: (i == -1 ? 'Standard' : 'Mod ' + i), price: 100, index: i });
    };

    return JSON.stringify(modNames);
}
 
rpc.register("getListOfAvailabeVehicleMods", (mod) => {
     
    let modNames = [];

    for (let i = -1; i < mp.players.local.vehicle.getNumMods(mod); i++) {
        modNames.push({ name: (i == -1 ? 'Standard' : 'Mod ' + i), price: 100, index: i });
    };

    return JSON.stringify(modNames);
});
 
mp.keys.bind(0x49, false, async function() { //I

    if(!mp.players.local.vehicle)
        return;
 
    let vehicleMods = await getAvailableMods(0, mp.players.local.vehicle);
  
	//mp.gui.chat.push(`${vehicleMods}`);
}); 