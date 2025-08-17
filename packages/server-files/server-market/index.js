


global.showMarket = async function(option) {


    await player.call('client::market:open', [(option == 'normal' ? 0 : 1)]); 
};