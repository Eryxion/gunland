var fathers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 42, 43];
var mothers = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41];

var features = [];
var appearance = []; 
 
let bodyCam = null;
let localplayer = mp.players.local;

global.hairIDList = 
[ 
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 30, 31, 32, 33, 34, 73, 76, 77, 78, 79, 80, 81, 82, 84], //male  (37 coafuri)
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 31, 76, 77, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 90, 91] //female (37 coafuri)
];

let character_data = 
{
    gender: true, father: 0, mother: 21, similarity: 0.5, skin: 0.5, hairStyle: 0, hair: 0, hairColor: 0, eyeColor: 0
}

for(var i = 0; i < 20; i++) features[i] = 0.0; 
for(var i = 0; i < 11; i++) appearance[i] = 255;

mp.game.streaming.requestAnimDict("anim@mp_player_intcelebrationmale@cats_cradle");
mp.game.streaming.requestAnimDict("rcmcollect_paperleadinout@"); 

function updateCharacterParents() 
{
    return localplayer.setHeadBlendData(character_data.mother, character_data.father, 0, character_data.mother, character_data.father, 0, character_data.similarity, character_data.skin, 0.0, true);
}

function updateCharacterHairAndColors() 
{
    let currentGender = (character_data.gender) ? 0 : 1;
     
    localplayer.setComponentVariation(2, hairIDList[currentGender][character_data.hair], 0, 0); // hair
    localplayer.setHairColor(character_data.hairColor, 0);

    // appearance colors
    localplayer.setHeadOverlayColor(2, 1, character_data.hairColor, 100); // eyebrow
    localplayer.setHeadOverlayColor(1, 1, character_data.hairColor, 100); // beard
    localplayer.setHeadOverlayColor(10, 1, character_data.hairColor, 100); // chesthair
 
    localplayer.setEyeColor(character_data.eyeColor); // eye color
}

function updateAppearance() 
{
    for (var i = 0; i < 11; i++) 
	{
        localplayer.setHeadOverlay(i, appearance[i], 100, 0, 0);
    }
}
 
mp.events.add({
  
    'client::character:openMenu' : () => 
    { 
        hideDashboard(false);  
        globalBrowser.execute(`app.trigger("showCharacter", true);`); 
     
        localplayer.freezePosition(true);
        localplayer.setRotation(0.0, 0.0, -185.0, 2, true);
     
        //Create camera
        bodyCam = mp.cameras.new("creatorCamera", new mp.Vector3(402.8664, -997.5515, -98.5), new mp.Vector3(0, 0, 0), 45);
        bodyCam.pointAtCoord(402.8664, -996.4108, -98.5);
        bodyCam.setActive(true); 
        mp.game.cam.renderScriptCams(true, false, 500, true, false);
     
        appearance[1] = 255; 
        for(var i = 0; i < 20; i++) localplayer.setFaceFeature(i, 0.0);
    
        updateCharacterParents();
        updateCharacterHairAndColors();
        updateAppearance();
     
        localplayer.taskPlayAnim("rcmcollect_paperleadinout@", "kneeling_arrest_get_up", 33, 1, -1, 1, 0, false, false, false);
     
        setTimeout(() => { mp.gui.cursor.visible = true; }, 1000);  
    },
 
    'client::character:applyData' : (data, dataApperance, dataFeatures) => 
    { 
        const player = mp.players.local; 
        const raw = JSON.parse(data);
        const rawApperance = JSON.parse(dataApperance);
        const rawFeatures = JSON.parse(dataFeatures);

        player.model = mp.game.joaat(raw.gender ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
     
        player.setHeadBlendData(raw.mother, raw.father, 0, raw.mother, raw.father, 0, raw.similarity, raw.skin, 0.0, true);
    
        //Hair
        player.setComponentVariation(2, raw.hairStyle, 0, 0);
        player.setHairColor(raw.hairColor, 0);
    
        player.setHeadOverlayColor(2, 1, raw.hairColor, 100);  //eyebrow
        player.setHeadOverlayColor(1, 1, raw.hairColor, 100);  //beard
        player.setHeadOverlayColor(10, 1, raw.hairColor, 100); //chesthair
     
        player.setEyeColor(parseInt(raw.eyeColor)); //Eye
     
        for(var i = 0; i < rawApperance.length; i++) 
        {
            player.setHeadOverlay(i, rawApperance[i].Value, 100, 0, 0);
        }
    
        for(var i = 0; i < rawFeatures.length; i++) 
        {
            player.setFaceFeature(i, features[i]);
        }
    },
    
    'client::character:saveData' : () => 
    {
        if(new Date().getTime() - global.lastCheck < 1000) return; 
        global.lastCheck = new Date().getTime();

        mp.events.call("prepareScreenshot");

        globalBrowser.execute(`app.trigger("showCharacter", false);`); 
        mp.gui.cursor.visible = false;
 
        setTimeout(() => {

            if(bodyCam)
            {
                bodyCam.destroy();
                bodyCam = false;  
            }

            hideDashboard(true); 
         
            mp.game.cam.renderScriptCams(false, false, 3000, true, true);  
            localplayer.freezePosition(false);
             
            var appearance_values = [];
            for (var i = 0; i < 11; i++) appearance_values.push({ Value: appearance[i], Opacity: 100 });
         
            mp.events.callRemote("server::character:save", JSON.stringify(character_data), JSON.stringify(features), JSON.stringify(appearance_values));

        }, 5000); 
    },


    'client::character:changeGender' : (param) => 
    {
        character_data.gender = (param === "Male") ? true : false; 
        localplayer.model = mp.game.joaat(character_data.gender ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
    
        appearance[1] = (character_data.gender ? appearance[1] : 255); 
        updateCharacterParents();
        updateAppearance();
         
        updateCharacterHairAndColors();
        for (var i = 0; i < 20; i++) localplayer.setFaceFeature(i, features[i]);
    },

    'client::character:editCharacter' : (parameter, value) => 
    { 
        var lvl = parseFloat(value);
         
        switch(parameter) 
        {  
            case "resemblance": character_data.similarity = lvl; updateCharacterParents(); break;
    
            case "father": character_data.father = fathers[value]; updateCharacterParents(); return;
            case "mother": character_data.mother = mothers[value]; updateCharacterParents(); return;
            
            case "eyeScale": localplayer.setFaceFeature(11, lvl); features[11] = lvl; return;
            case "eyebrowHeight": localplayer.setFaceFeature(6, lvl); features[6] = lvl; return;
            case "eyebrowDepth": localplayer.setFaceFeature(7, lvl); features[7] = lvl; return;
            
            case "noseWidth": localplayer.setFaceFeature(0, lvl); features[0] = lvl; return;
            case "noseHeight": localplayer.setFaceFeature(1, lvl); features[1] = lvl; return;
            case "noseTipLength": localplayer.setFaceFeature(2, lvl); features[2] = lvl; return;
            case "noseTipHeight": localplayer.setFaceFeature(4, lvl); features[4] = lvl; return;
            case "noseDepth": localplayer.setFaceFeature(3, lvl); features[3] = lvl; return;
            case "noseBroke": localplayer.setFaceFeature(5, lvl); features[5] = lvl; return; 
    
            case "cheekboneWidth": localplayer.setFaceFeature(9, lvl); features[9] = lvl; return;
            case "cheekboneHeight": localplayer.setFaceFeature(8, lvl); features[8] = lvl; return; 
            case "cheekDepth": localplayer.setFaceFeature(10, lvl); features[10] = lvl; return;
    
            case "lipThickness": localplayer.setFaceFeature(12, lvl); features[12] = lvl; return;
            case "neckWidth": localplayer.setFaceFeature(19, lvl); features[19] = lvl; return;
    
            case "jawWidth": localplayer.setFaceFeature(13, lvl); features[13] = lvl; return;
            case "jawShape": localplayer.setFaceFeature(14, lvl); features[14] = lvl; return;
     
            case "chinHeight": localplayer.setFaceFeature(15, lvl); features[15] = lvl; return;
            case "chinDepth": localplayer.setFaceFeature(16, lvl); features[16] = lvl; return;
            case "chinWidth": localplayer.setFaceFeature(17, lvl); features[17] = lvl; return;
            case "chinIndent": localplayer.setFaceFeature(18, lvl); features[18] = lvl; return;
     
            case "hairColor": character_data.hairColor = value; updateCharacterHairAndColors(); return;
            case "eyeColor": character_data.eyeColor = value; updateCharacterHairAndColors(); return; 
         
            case 'eyebrows': appearance[2] = (value == 0 ? 255 : value); updateAppearance(); break;
            case 'hair': character_data.hair = value; character_data.hairStyle = hairIDList[(character_data.gender) ? 0 : 1][value]; updateCharacterHairAndColors(); break; 
            case "beard": var overlay = (value == 0) ? 255 : value - 1; appearance[1] = overlay; updateAppearance(); return; 
        }
    },

    'client::character:createRandom' : (data) => 
    { 
        const raw = JSON.parse(data);
     
        character_data.similarity = raw.resemblance; 
        character_data.father = fathers[raw.father]; 
        character_data.mother = mothers[raw.mother]; 
     
        features[0] = raw.noseWidth; 
        features[1] = raw.noseHeight;  
        features[2] = raw.noseTipLength;  
        features[3] = raw.noseDepth;
        features[4] = raw.noseTipHeight;   
        features[5] = raw.noseBroke; 
        features[6] = raw.eyebrowHeight;
        features[7] = raw.eyebrowDepth;
        features[8] = raw.cheekboneHeight;
        features[9] = raw.cheekboneWidth;
        features[10] = raw.cheekDepth;
        features[11] = raw.eyeScale;
        features[12] = raw.lipThickness;   
        features[13] = raw.jawWidth;
        features[14] = raw.jawShape;
        features[15] = raw.chinHeight;
        features[16] = raw.chinDepth;
        features[17] = raw.chinWidth;
        features[18] = raw.chinIndent;
        features[19] = raw.neckWidth;
    
        appearance[1] = (character_data.gender ? raw.beardStyle : 255);   
        appearance[2] = (raw.eyebrow == 0 ? 255 : raw.eyebrow); 
     
        character_data.hair = raw.hairStyle; 
        character_data.hairStyle = hairIDList[(character_data.gender) ? 0 : 1][raw.hairStyle];     
        character_data.hairColor = raw.hairColor;  
        character_data.eyeColor = raw.eyeColor; 
     
        updateCharacterParents(); 
        updateCharacterHairAndColors();
        updateAppearance();
    
        localplayer.setFaceFeature(0, raw.noseWidth);   
        localplayer.setFaceFeature(1, raw.noseHeight);   
        localplayer.setFaceFeature(2, raw.noseTipLength);  
        localplayer.setFaceFeature(3, raw.noseDepth);  
        localplayer.setFaceFeature(4, raw.noseTipHeight); 
        localplayer.setFaceFeature(5, raw.noseBroke);  
        localplayer.setFaceFeature(6, raw.eyebrowHeight);
        localplayer.setFaceFeature(7, raw.eyebrowDepth);
        localplayer.setFaceFeature(8, raw.cheekboneHeight);
        localplayer.setFaceFeature(9, raw.cheekboneWidth);
        localplayer.setFaceFeature(10, raw.cheekDepth);
        localplayer.setFaceFeature(11, raw.eyeScale); 
        localplayer.setFaceFeature(12, raw.lipThickness);  
        localplayer.setFaceFeature(13, raw.jawWidth);
        localplayer.setFaceFeature(14, raw.jawShape);
        localplayer.setFaceFeature(15, raw.chinHeight);
        localplayer.setFaceFeature(16, raw.chinDepth);
        localplayer.setFaceFeature(17, raw.chinWidth); 
        localplayer.setFaceFeature(18, raw.chinIndent); 
        localplayer.setFaceFeature(19, raw.neckWidth);
    } 
}); 