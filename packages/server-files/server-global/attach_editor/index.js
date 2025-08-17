const fs = require('fs');

const objectsList = [
	'prop_fishing_rod_01',
	'prop_ld_fireaxe',
	'prop_fruit_stand_02',
	'ex_mp_h_acc_fruitbowl_01',
	'prop_tool_pickaxe',
	'ng_proc_binbag_01a',
	'v_res_filebox01'
];

const bodyParts = [
 	{
		name: 'Skel root',
		id: 0
	},

	{
		name: 'Right hand',
		id: 57005
	},

	{
		name: 'Left hand',
		id: 18905
	},

	{
		name: 'Head',
		id: 12844
	}
];

mp.events.addCommand('attach', (player, _, object, body) => {
	let len = objectsList.length; 

	if(object == undefined) {
		player.outputChatBox('!{#ff0000}/attach [ID object] [ID body part]');

		let msg = '';

		for(let i = 0; i < len; i++) {
			msg +=  '(' +i+ ')'+ objectsList[i]+ ' | ';
		}
		player.outputChatBox(msg);
		return;
	}

	let id = parseInt(object);
	if(id < 0 || id > len) {
		return;
	}

	let lenBody = bodyParts.length;

	if(body == undefined) {
		let msg = '';

		for(let i = 0; i < lenBody; i++) {
			msg += '(' +i+ ')'+ bodyParts[i].name+ ' | ';
		}
		player.outputChatBox(msg);
		return;
	}

	let bodyID = parseInt(body);
	if(bodyID < 0 || bodyID > lenBody) {
		return;
	}

	player.call("attachObject", [ objectsList[id], bodyParts[bodyID].id ]);
});
 
mp.events.addCommand('anim1', (player) => {
	
	player.playAnimation("amb@world_human_stand_fishing@idle_a", "idle", 1, 49); // 49 = Loop + Upper Body Only + Allow Rotation
});

mp.events.addCommand('anim2', (player) => {
	
	player.playAnimation("amb@world_human_stand_fishing@base", "base", 1, 49); // 49 = Loop + Upper Body Only + Allow Rotation
});

mp.events.addCommand('animation', (player, _, dict, name) => {

	sendMessage(player, 'fff', `Dict: ${dict} | Name: ${name}`);

	return player.playAnimation(dict, name, 1, 49); 
});
 

//missfbi4prepp1 idle

 
mp.events.add('finishAttach', (player, object) => {

	let objectJSON = JSON.parse(object);
	let text = `{ ${objectJSON.object}, ${objectJSON.body}, ${objectJSON.x.toFixed(4)}, ${objectJSON.y.toFixed(4)}, ${objectJSON.z.toFixed(4)}, ${objectJSON.rx.toFixed(4)}, ${objectJSON.ry.toFixed(4)}, ${objectJSON.rz.toFixed(4)} },\r\n`;
	
	player.outputChatBox(text);

	fs.appendFile('./attachments.txt', text, err => {

		if (err) {
		  console.error(err)
		  return
		}
	});
});