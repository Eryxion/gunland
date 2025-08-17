let tatoo = {
    category: 'none',
    player: mp.players.local,
    
    gender: true, 
    tatoos: [], 

    selected: null, //here is actual item selected 
    checkout: [],
    tattooIds: { 
        "torso": 0, 
        "head": 1, 
        "leftarm": 2, 
        "rightarm": 3, 
        "leftleg": 4, 
        "rightleg": 5
    },
 
    bodyCam: null,
    bodyCamStart: new mp.Vector3(0, 0, 0),

    bodyCamValues: { 
        "torso": [
            { Angle: 0, Dist: 1, Height: 0.2 }, //fata
            { Angle: 0, Dist: 2.3, Height: -0.2 }, //PRIMARY CLASS IF PLAYER START TATOO  
            { Angle: 0, Dist: 1, Height: 0.2 },
            { Angle: 180, Dist: 1, Height: 0.2 }, //spate
            { Angle: 180, Dist: 1, Height: 0.2 },
            { Angle: 180, Dist: 1, Height: 0.2 },
            { Angle: 180, Dist: 1, Height: 0.2 },
            { Angle: 305, Dist: 1, Height: 0.2 }, //stanga ta / dreapta caracterului
            { Angle: 55, Dist: 1, Height: 0.2 }, //dreapta ta / stanga caracterului
        ],
        "head": [
            { Angle: 0, Dist: 1, Height: 0.5 },
            { Angle: 305, Dist: 1, Height: 0.5 }, 
            { Angle: 55, Dist: 1, Height: 0.5 },
            { Angle: 180, Dist: 1, Height: 0.5 },
            { Angle: 0, Dist: 0.5, Height: 0.5 },
            { Angle: 0, Dist: 0.5, Height: 0.5 },
        ],
        "leftarm": [
            { Angle: 55, Dist: 1, Height: 0.0 },
            { Angle: 55, Dist: 1, Height: 0.1 }, 
        ],
        "rightarm": [
            { Angle: 305, Dist: 1, Height: 0.0 },
            { Angle: 305, Dist: 1, Height: 0.1 }, 
        ],
        "leftleg": [
            { Angle: 55, Dist: 1, Height: -0.6 },
            { Angle: 55, Dist: 1, Height: -0.6 },
        ],
        "rightleg": [
            { Angle: 305, Dist: 1, Height: -0.6 },
            { Angle: 305, Dist: 1, Height: -0.6 },
        ] 
    }
};
 
mp.events.add(
{    
    'client::tatoo:open' : (gender, data) =>
    {     
        tatoo.gender = gender;
        tatoo.tatoos = JSON.parse(tatoo.player.getVariable("tatoos"));
           
        hideDashboard(false);
        mp.gui.cursor.visible = true; 
     
        tatoo.bodyCamStart = new mp.Vector3(324.9798, 180.6418, 103.6665);
     
        var camValues = tatoo.bodyCamValues['torso'][1],
            pos = getCameraOffset(new mp.Vector3(tatoo.bodyCamStart.x, tatoo.bodyCamStart.y, tatoo.bodyCamStart.z + camValues.Height), tatoo.player.getRotation(2).z + 90 + camValues.Angle, camValues.Dist);
        
        tatoo.bodyCam = mp.cameras.new('default', pos, new mp.Vector3(0, 0, 0), 50);
        tatoo.bodyCam.pointAtCoord(tatoo.bodyCamStart.x, tatoo.bodyCamStart.y, tatoo.bodyCamStart.z + camValues.Height);
        tatoo.bodyCam.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 500, true, false);
 
        globalBrowser.execute(`app.trigger("showTatoo", true);`);
        
        return globalBrowser.execute(`TatooComponent.open(${tatoo.player.getRotation(2).z}, ${data}, ${JSON.stringify(tatoo.player.getVariable("tatoos"))});`);  
    },

    'client::tatoo:close' : () => {

        hideDashboard(true);
        mp.gui.cursor.visible = false; 

        if(tatoo.bodyCam != null) {
            tatoo.bodyCam.destroy();
            tatoo.bodyCam = null;
        }

        mp.game.cam.renderScriptCams(false, false, 3000, true, true); 

        tatoo.player.clearDecorations();

        return globalBrowser.execute(`app.trigger("showTatoo", false);`); 
    },

    'client::tatoo:changeCategory' : (category) => {  
        tatoo.category = category;
 
        const camValues = (category != 'none' ? tatoo.bodyCamValues[category][0] : tatoo.bodyCamValues['torso'][1]);
        const camPos = getCameraOffset(new mp.Vector3(tatoo.bodyCamStart.x, tatoo.bodyCamStart.y, tatoo.bodyCamStart.z + camValues.Height), tatoo.player.getRotation(2).z + 90 + camValues.Angle, camValues.Dist);

        tatoo.bodyCam.setCoord(camPos.x, camPos.y, camPos.z);
        tatoo.bodyCam.pointAtCoord(tatoo.bodyCamStart.x, tatoo.bodyCamStart.y, tatoo.bodyCamStart.z + camValues.Height);
    },

    'client::tatoo:select' : async (item) => {
        let raw = JSON.parse(item) 
            hash = (tatoo.gender) ? raw.MaleHash : raw.FemaleHash,
            playerTattoos = JSON.parse(tatoo.player.getVariable("tatoos"));
  
        if(getPlayerTatoos(tatoo.category) >= 2) {  
            globalBrowser.execute(`TatooComponent.selected.item=null;`);  

            return sendNotiffication('info', 'You dont have slot for this tatoo.', 'Tatoo:');
        } 
 
        changeTatooCamera(tatoo.bodyCamValues[tatoo.category][raw.Camera]); 
        tatoo.player.clearDecorations();
   
        if(tatoo.selected != item) {
            await tatoo.player.setDecoration(mp.game.joaat(raw.Collection), mp.game.joaat(hash));  
        }

        tatoo.selected = (tatoo.selected == item ? null : item);
 
        for(let i = 0; i < tatoo.checkout.length; i++) {  
            await tatoo.player.setDecoration(mp.game.joaat(tatoo.checkout[i].Collection), mp.game.joaat((tatoo.gender) ? tatoo.checkout[i].MaleHash : tatoo.checkout[i].FemaleHash));
        } 
         
        if(playerTattoos.length) {
            for(let x = 0; x < playerTattoos.length; x++) {    
                await tatoo.player.setDecoration(mp.game.joaat(playerTattoos[x].collection), mp.game.joaat(playerTattoos[x].hash));
            } 
        }  
    },

    'client::tatoo:addItemToCart' : async () => {

        if(tatoo.selected == null)
            return;

        const raw = JSON.parse(tatoo.selected); 
  
        tatoo.checkout.push({ 
            Name: raw.Name,
            LocalizedName: raw.LocalizedName,
            MaleHash: raw.MaleHash,
            FemaleHash: raw.FemaleHash,
            Collection: raw.Collection,
            Price: raw.Price,
            Category: tatoo.category 
        });

        tatoo.selected = null;
    
        await rpc.callBrowsers('reloadBrowserTatoo', JSON.stringify(tatoo.checkout)); 
    },
 
    'client::tatoo:apply' : async () => { 
        tatoo.player.clearDecorations();

        var playerTattoos = JSON.parse(tatoo.player.getVariable("tatoos"));

        if(playerTattoos.length) {
            for(let x = 0; x < playerTattoos.length; x++) {    
                await tatoo.player.setDecoration(mp.game.joaat(playerTattoos[x].collection), mp.game.joaat(playerTattoos[x].hash));
            } 
        }  
    },

    'client::tatoo:remove' : async (item) =>
    {
        const raw = JSON.parse(item); 
        const index = tatoo.checkout.findIndex(object => object.MaleHash === raw.MaleHash || object.FemaleHash == raw.FemaleHash); 
        const playerTattoos = JSON.parse(tatoo.player.getVariable("tatoos"));

        mp.console.logInfo(`client::tatoo:remove | index ${index}`, true, true);
  
        if(index != -1) {
            tatoo.player.clearDecorations();

            tatoo.checkout.splice(index, 1);
 
            for(let i = 0; i < tatoo.checkout.length; i++) {  
                tatoo.player.setDecoration(mp.game.joaat(tatoo.checkout[i].Collection), mp.game.joaat((tatoo.gender) ? tatoo.checkout[i].MaleHash : tatoo.checkout[i].FemaleHash));
            }
        }

        if(playerTattoos.length) {
            for(let x = 0; x < playerTattoos.length; x++) {    
                await tatoo.player.setDecoration(mp.game.joaat(playerTattoos[x].collection), mp.game.joaat(playerTattoos[x].hash));
            } 
        }  

        await rpc.callBrowsers('reloadBrowserTatoo', JSON.stringify(tatoo.checkout));
    },

    'client::tatoo:rotatePlayer' : (value) => { 
        return tatoo.player.setHeading(parseInt(value));
    }
});
  
mp.keys.bind(0x1B, false, async function() { //ESC  
    if(tatoo.bodyCam == null)
        return;

	if(tatoo.category == 'none') {
        return rpc.callServer('server::tatoo:close');
    }

    if(tatoo.category != 'none') { 
        tatoo.category = 'none';

        tatoo.player.setHeading(101.022);
        tatoo.player.clearDecorations();
 
        tatoo.selected = null;
        const playerTattoos = JSON.parse(tatoo.player.getVariable("tatoos"));

        for(let i = 0; i < tatoo.checkout.length; i++) {  
            await tatoo.player.setDecoration(mp.game.joaat(tatoo.checkout[i].Collection), mp.game.joaat((tatoo.gender) ? tatoo.checkout[i].MaleHash : tatoo.checkout[i].FemaleHash));
        }

        if(playerTattoos.length) {
            for(let x = 0; x < playerTattoos.length; x++) {    
                await tatoo.player.setDecoration(mp.game.joaat(playerTattoos[x].collection), mp.game.joaat(playerTattoos[x].hash));
            } 
        }  
 
        changeTatooCamera(tatoo.bodyCamValues['torso'][1]); 
        mp.events.call("client::tatoo:changeCategory", 'none');  

        await rpc.callBrowsers('reloadBrowserTatoo', false);
    }
});
 
global.getPlayerTatoos = function(slot) { 
    var countActual = 0,
        countCheckout = 0,
        playerTattoos = JSON.parse(tatoo.player.getVariable("tatoos"));
      
    for(let x = 0; x < playerTattoos.length; x++) {  
        if(playerTattoos[x].slot == slot) {
            countActual ++;
        }
    } 

    for(let x = 0; x < tatoo.checkout.length; x++) {  
        if(tatoo.checkout[x].Category == slot) {
            countCheckout ++;
        }
    } 

    mp.console.logInfo(`Actual tatoos: ${countActual} / Checkout tatoos: ${countCheckout} / Total: (${(countActual + countCheckout)}).`);
    
    return (countActual + countCheckout); 
};


global.changeTatooCamera = function(data) {
    const camValues = data;
    const camPos = getCameraOffset(new mp.Vector3(tatoo.bodyCamStart.x, tatoo.bodyCamStart.y, tatoo.bodyCamStart.z + camValues.Height), tatoo.player.getRotation(2).z + 90 + camValues.Angle, camValues.Dist);

    tatoo.bodyCam.setCoord(camPos.x, camPos.y, camPos.z);
    tatoo.bodyCam.pointAtCoord(tatoo.bodyCamStart.x, tatoo.bodyCamStart.y, tatoo.bodyCamStart.z + camValues.Height);
};

global.sendNotiffication = async function(type, text, title = 'Notify:') { 
    await mp.events.call("client::hud:sendNotify", type, text, title);  
};  