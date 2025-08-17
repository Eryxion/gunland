let creatorCamera = null;
let player = mp.players.local;  
let playerGender = 1;

let clothesCamValues = 
{    
    'jacket': { Angle: 0, Dist: 1.4, Height: 0.3 },  
    'jeans': { Angle: 0, Dist: 1.05, Height: -0.4 }, 
    'shoes': { Angle: 0, Dist: 1.2, Height: -0.7 },  
    'watch': { Angle: 74, Dist: 1, Height: 0 },  
    'mask': { Angle: 0, Dist: 0.7, Height: 0.6 },  
    'glasses': { Angle: 0, Dist: 0.7, Height: 0.6 },
    'hat': { Angle: 0, Dist: 0.7, Height: 0.7 } ,
    'bracelet': { Angle: -70, Dist: 1, Height: 0 },  
}

global.bodyCamera = new mp.Vector3(0, 0, 0); 
global.isAProp = ['watch', 'glasses', 'hat', 'bracelet', 'ears']; 
global.clothesDefect = 
[       
    [7, 25, 34, 58, 65, 91, 97, 133, 185, 133],
    [3, 4, 7, 10, 20, 23, 24, 27, 28, 35, 37, 46, 59, 70, 74, 79, 86, 87, 88, 90]
]
 
global.defaultClothes = 
[  
    {'jacket': 0, 'jeans': 0, 'shoes': 0, 'mask': 0, 'bracelet': 0, 'glasses': -1, 'hat': -1, 'watch': -1, 'bracelet': -1}, //female
    {'jacket': 0, 'jeans': 0, 'shoes': 0, 'mask': 0, 'bracelet': 0, 'glasses': 0, 'hat': 11, 'watch': -1, 'bracelet': -1}, //male
];
 
global.getCameraOffset = function(pos, angle, dist) 
{  
    pos.y = pos.y + dist * Math.sin(angle * 0.0174533);
    pos.x = pos.x + dist * Math.cos(angle * 0.0174533);  
    return pos;
}
 
mp.events.add(
{    
    'client::clothing:openMenu' : (data, gender) =>
    {   
        setTimeout(() => {
            hideDashboard(false);
            mp.gui.cursor.visible = true; 
        }, 500);


        playerGender = gender;
        bodyCamera = player.position; 
        player.freezePosition(true);  

        var camValues = { Angle: player.getRotation(2).z + 90, Dist: 1.4, Height: 0.3 };
        var pos = getCameraOffset(new mp.Vector3(bodyCamera.x, bodyCamera.y, bodyCamera.z + camValues.Height), camValues.Angle, camValues.Dist); 
        creatorCamera = mp.cameras.new('default', pos, new mp.Vector3(0, 0, 0), 50); 
        creatorCamera.pointAtCoord(bodyCamera.x, bodyCamera.y, bodyCamera.z + camValues.Height);
        creatorCamera.setActive(true); 
        mp.game.cam.renderScriptCams(true, false, 500, true, false);

        globalBrowser.execute(`app.trigger("showClothing", true);`); 

        return globalBrowser.execute(`ClothingComponent.openMenu(${data}, '${gender}');`);  
    },

    'client::clothing:closeMenu' : () =>
    {
        creatorCamera.destroy();
        creatorCamera = null; 
        mp.game.cam.renderScriptCams(false, false, 3000, true, true); 

        globalBrowser.execute(`app.trigger("showClothing", false);`); 
 
        hideDashboard(true);
        mp.gui.cursor.visible = false; 
        player.freezePosition(false);  

        return mp.events.callRemote("server::clothing:closeMenu"); 
    },

    'client::clothing:changeCategory' : (value) =>
    {  
        const camValues = clothesCamValues[value];
        const camPos = getCameraOffset(new mp.Vector3(bodyCamera.x, bodyCamera.y, bodyCamera.z + camValues.Height), player.getRotation(2).z + 90 + camValues.Angle, camValues.Dist);
    
        creatorCamera.setCoord(camPos.x, camPos.y, camPos.z);
        creatorCamera.pointAtCoord(bodyCamera.x, bodyCamera.y, bodyCamera.z + camValues.Height);
    },

    'client::clothing:addItem' : (object) =>
    {    
        const data = JSON.parse(object);
  
        if(isAProp.includes(data.category)) 
        { 
            player.setPropIndex(data.component, data.variation, data.color, true);
        }
        else 
        {   
            if(data.category == 'jacket')
            {
                player.setComponentVariation(3, (clothesDefect[(playerGender == 'male' ? 1 : 0)].includes(data.variation) ? (playerGender == 'male' ? 14 : 6) : 0), 0, 0); //14 - fara maini
            }
 
            return player.setComponentVariation(data.component, data.variation, data.color, 0);
        }  
    },

    'client::clothing:removeItem' : (object) =>
    {
        const data = JSON.parse(object);

        if(isAProp.includes(data.category)) 
        { 
            return player.setPropIndex(data.component, defaultClothes[playerGender == 'male' ? 1 : 0][data.category], 0, true);
        }

        if(data.category == 'jacket')
        {
            player.setComponentVariation(3, 0, 0, 0); 
        }

        return player.setComponentVariation(data.component, defaultClothes[playerGender == 'male' ? 1 : 0][data.category], 0, 0);
    },

    'client::clothing:changeColor' : (object) =>
    {    
        const data = JSON.parse(object);
 
        if(isAProp.includes(data.category)) 
        { 
            return player.setPropIndex(data.component, data.variation, data.color, true);
        }
    
        return player.setComponentVariation(data.component, data.variation, data.color, 0);
    }, 

    'client::clothing:buyItems' : (option, price, data) =>
    {
        return mp.events.callRemote("server::clothing:buyItems", option, price, data);
    }
});