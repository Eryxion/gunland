
const { CommandRegistry } = require("../../server-global/improved-commands"); 
const rpc = require("rage-rpc");

CommandRegistry.add({
	name: "shop", 
	  
	run: async function (player) {  
		try {   
			player.call('client::premium:open', [JSON.stringify({ premiumpoints: player.info.premiumpoints })])
		}
		catch(error) { console.log(error) } 
	}
}); 
 
rpc.register('server::premium:purhcase', async (data, user) => {  
	try  
	{ 
		const player = user.player; 
		const raw = JSON.parse(data);


		if(player.info.premiumpoints < raw.amount)
			return sendNotiffication(player, 'error', `Nu ai ${raw.amount} premium points.`, 'Shop:');

		switch(raw.option) {
			case 'money': {
				player.giveMoney(0, raw.received);  

				sendNotiffication(player, 'success', `Ai platit ${raw.amount} premium points pentru ${raw.name}`, 'Shop:');
				break;
			}
		}
 
		player.info.premiumpoints -= raw.amount;
		await Account.update({ premiumpoints: player.info.premiumpoints }, { where: { id: player.info.id } });  
 
		return rpc.callBrowsers(mp.players.at(player.id), 'browser::premium:update', [JSON.stringify({ premiumpoints: player.info.premiumpoints })]);
	}
    catch(error) { console.log(error)}
});

//functie pentru a primi bani in plus daca ai cont premium la joburi
global.playerPremiumBenefits = function(player, money) {  
	if(player.info.premium) {
		const newMoney = (money *getRandomArbitrary(1, 3).toFixed(0) )
 
		player.giveMoney(0, newMoney);  
	}
}