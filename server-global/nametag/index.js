const maxDistance = 25 * 25;
const width = 0.03;
const height = 0.0065;
const border = 0.001;

mp.nametags.enabled = false;

function loadStreamedTextureDict() 
{
    mp.game.graphics.requestStreamedTextureDict("mpleaderboard", true);  
    mp.game.graphics.requestStreamedTextureDict("mpinventory", true); 
}

function getSpriteOffsetByNickname(nickname) 
{
    return 0.025 + (nickname.length - 8) * 0.002;
}

function hexToRgb(hex) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

//hexToRgb('#' + serverClans[clan - 1].color)
 
mp.events.add('render', (nametags) => {

    //NAMETAG
    const graphics = mp.game.graphics;
    const screenRes = graphics.getScreenResolution(0, 0);
 
    nametags.forEach(nametag => {
        let [player, x, y, distance] = nametag;

        if(distance <= maxDistance) 
        {
            let scale = (distance / maxDistance);
            if (scale < 0.6) scale = 0.3;

            var health = player.getHealth() <= 100 ? player.getHealth() / 100 : ((player.getHealth() - 100) / 100); 
            var armour = player.getArmour() / 100;

            y -= scale * (0.002 * (screenRes.y / 1080));
            
            if(!player.getVariable('haveTarget'))
            {   
                if(player.getVariable('clan') != null && player.getVariable('clan'))
                { 
                    let clanColor = player.getVariable('clanColor');
 
                    mp.game.graphics.drawText(player.getVariable('clanName'), [x, y - (0.01)], { font: 0, color: [hexToRgb('#' + clanColor).r, hexToRgb('#' + clanColor).g, hexToRgb('#' + clanColor).b, 255], scale: [0.2, 0.2], outline: false }); 
                }
 
                mp.game.graphics.drawText(`${player.name} [${player.remoteId}]`, [x, y], { font: 0, color: [255, 255, 255, 255], scale: [0.3, 0.3], outline: true });
          
                if((mp.game.graphics.hasStreamedTextureDictLoaded("mpleaderboard") || mp.game.graphics.hasStreamedTextureDictLoaded("mpinventory"))) 
                {
                    let offset = getSpriteOffsetByNickname(`${player.name} [${player.remoteId}]`); 
                
                    if(player.isVoiceActive)
                    {
                        mp.game.graphics.drawSprite("mpleaderboard", "leaderboard_audio_3", x - ( offset += 0.005), y - 0.01, 0.018, 0.036, 0, 255, 255, 255, 255);
                    }

                    if(player.getVariable('playerCuff')) //de facut sa se dea iconita mai in colo
                    {
                        mp.game.graphics.drawSprite("mpinventory", "mp_specitem_cuffkeys", (player.isVoiceActive ? (x - (offset += 0.002)) : x), y - 0.01, 0.018, 0.036, 0, 255, 255, 255, 255);
                    }   
                } 
                else 
                {
                    loadStreamedTextureDict();
                }
            }
             
            if(mp.game.player.isFreeAimingAtEntity(player.handle) && !player.getVariable('haveTarget')) 
            {
                let y2 = y + 0.042;

                if (armour > 0) {
                    let x2 = x - width / 2 - border / 2;

                    graphics.drawRect(x2, y2, width + border * 2, 0.0085, 0, 0, 0, 200);
                    graphics.drawRect(x2, y2, width, height, 150, 150, 150, 255);
                    graphics.drawRect(x2 - width / 2 * (1 - health), y2, width * health, height, 255, 255, 255, 200);

                    x2 = x + width / 2 + border / 2;

                    graphics.drawRect(x2, y2, width + border * 2, height + border * 2, 0, 0, 0, 200);
                    graphics.drawRect(x2, y2, width, height, 41, 66, 78, 255);
                    graphics.drawRect(x2 - width / 2 * (1 - armour), y2, width * armour, height, 48, 108, 135, 200);
                }
                else {
                    graphics.drawRect(x, y2, width + border * 2, height + border * 2, 0, 0, 0, 200);
                    graphics.drawRect(x, y2, width, height, 150, 150, 150, 255);
                    graphics.drawRect(x - width / 2 * (1 - health), y2, width * health, height, 255, 255, 255, 200);
                }
            }
        }
    }); 
});
 
function drawPlayerVoiceIcon(player, x, y) 
{
	if(player.isVoiceActive) drawVoiceSprite("mpleaderboard", 'leaderboard_audio_3', [0.7, 0.7], 0, [255, 255, 255, 255], x, y - 0.02 * 0.7);
}

function drawPlayerCuff(player, x, y) 
{
    drawVoiceSprite("mpinventory", 'mp_specitem_cuffkeys', [0.7, 0.7], 0, [255, 0, 0, 255], x, y - 0.01);
}

function drawPlayercrown(player, x, y) 
{
    drawVoiceSprite("commonmenu", 'mp_hostcrown', [0.7, 0.7], 0, [255, 255, 255, 255], x, y - 0.01);
}
 
function drawVoiceSprite(dist, name, scale, heading, colour, x, y, layer) {
    var resolution = mp.game.graphics.getScreenActiveResolution(0, 0),
        textureResolution = mp.game.graphics.getTextureResolution(dist, name),
        textureScale = [scale[0] * textureResolution.x / resolution.x, scale[1] * textureResolution.y / resolution.y];

    if (mp.game.graphics.hasStreamedTextureDictLoaded(dist)) {
        if (typeof layer === 'number') mp.game.graphics.set2dLayer(layer);
        mp.game.graphics.drawSprite(dist, name, x, y, textureScale[0], textureScale[1], heading, colour[0], colour[1], colour[2], colour[3]);
    } else mp.game.graphics.requestStreamedTextureDict(dist, true);
}