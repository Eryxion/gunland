
let serverInterval = null;
global.factionColors = {
	'5': 25,
	'6': 27
};
 
if(mp.storage.data.gangzones == undefined) {
    mp.storage.data.gangzones = [];
    mp.storage.flush();
}


let weaponsHashName = 
{
	'-1716589765': 'Pistol',
	'-2084633992': 'Carabine Rifle',
	'1432025498': 'Pump Shotgun Mk II', 
	'-1569615261': 'punch'
};

rpc.register('GET_PLAYER_WEAPON', () => 
{
	let weaponHashed = mp.game.invoke(`0x0A6DB4965674D243`, mp.players.local.handle); //GET_SELECTED_PED_WEAPON

    return weaponsHashName[weaponHashed];
});

mp.keys.bind(0x76, false, function () { // F7 key
    let weaponHash = mp.game.invoke(`0x0A6DB4965674D243`, mp.players.local.handle); //GET_SELECTED_PED_WEAPON
    let clipSize = mp.game.weapon.getWeaponClipSize(weaponHash);
    //mp.gui.chat.push(`hash: ${weaponHash}, clipSize: ${clipSize}`);
});
 
mp.events.add({ 
	'render' : () =>
	{
		if(mp.storage.data.gangzones.length !== 0) {
			mp.storage.data.gangzones.forEach(blip => {
				mp.game.invoke("0xF87683CDF73C3F6E", blip, 0);
			});
		}
	},

    'client::wars:loadTurfs' : (data) =>
    {  
        let objects = JSON.parse(data);

		if(mp.storage.data.gangzones.length !== 0) {
			mp.events.call('client::wars:unlodTurfs');
		}
	
		objects.forEach(element => {
			const blip = mp.game.ui.addBlipForRadius(element.position.x, element.position.y, element.position.z, 50);
			mp.game.invoke("0xDF735600A4696DAF", blip, 5); //SET_BLIP_SPRITE
			mp.game.invoke("0x45FF974EEE1C8734", blip, 175); //SET_BLIP_ALPHA
			mp.game.invoke("0x03D7FB09E75D6B7E", blip, factionColors[element.faction]); //SET_BLIP_COLOR
		
			mp.storage.data.gangzones.push(blip); 
		}); 
    },

	'client::wars:unlodTurfs' : () =>
	{
		if(serverInterval != null) {
			clearInterval(serverInterval);
			serverInterval = null;
		}

		mp.storage.data.gangzones.forEach(element =>{
			mp.game.ui.removeBlip(element);
		});
		 
		mp.storage.data.gangzones = [];
		mp.storage.flush();
	},
 
	'client::wars:flashTurf' : (data, id, state, colorOne, colorTwo) => {
		if(mp.storage.data.gangzones.length == 1 || mp.storage.data.gangzones.length == 0)  { 
			if(state) {
				let position = JSON.parse(data);

				const blip = mp.game.ui.addBlipForRadius(position.x, position.y, position.z, 50);
				
				mp.game.invoke("0xDF735600A4696DAF", blip, 5);
				mp.game.invoke("0x45FF974EEE1C8734", blip, 175); 
				
				mp.storage.data.gangzones[id] = blip; 
			}
			else 
			{
				if(mp.storage.data.gangzones.length == 0) return;
				mp.game.invoke("0x45FF974EEE1C8734", mp.storage.data.gangzones[id], 0);
			} 
		}
 
		if(mp.storage.data.gangzones.length) {
			serverInterval = setInterval(() => {
 
				let blipcolor = mp.game.invoke("0xDF729E8D20CF7327", mp.storage.data.gangzones[id]);
	 
				mp.game.invoke("0x03D7FB09E75D6B7E", mp.storage.data.gangzones[id], (blipcolor == colorOne ? colorTwo : blipcolor == colorTwo ? colorOne : colorTwo)); 
				 
			}, 300);
		} 
	}
});  