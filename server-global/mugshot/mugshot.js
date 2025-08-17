let pedHeadShot;
let screenResolution = false;
let takingScreenshot = false;
let headshotTexture = false;
let screenshotBrowser = false;
let frameCount = 0;

mp.events.add("prepareScreenshot", () => {
  
    pedHeadShot = mp.players.local.registerheadshot();
    screenResolution = mp.game.graphics.getScreenActiveResolution(100, 100);
    setTimeout(() => {
        if (mp.game.ped.isPedheadshotValid(pedHeadShot) && mp.game.ped.isPedheadshotReady(pedHeadShot)) {
            headshotTexture = mp.game.ped.getPedheadshotTxdString(pedHeadShot);
            frameCount = 0;
            takingScreenshot = true;
        }
    }, 2000);
});


mp.events.add("playerheadshot_taken", () => {
    screenshotBrowser = mp.browsers.new("package://server-global/mugshot/index.html");
})

mp.events.add('browserDomReady', (browser) => {
    if(browser != screenshotBrowser) return;
    screenshotBrowser.call("recieveHeadshotImage", "http://screenshots/player_headshot.jpg", screenResolution);
});

mp.events.add("uploadHeadshot", (base64) => {
    mp.events.callRemote("uploadPlayerHeadshot", base64);
    screenshotBrowser.destroy();
    screenshotBrowser = false;
})

mp.events.add('render', () => {
    if (!takingScreenshot) return;

    mp.game.graphics.drawSprite(headshotTexture, headshotTexture, 0.045, 0.085, 0.10, 0.18, 0.0, 255, 255, 255, 1000);

    if (frameCount == 1) {
        mp.gui.takeScreenshot(`player_headshot.jpg`, 0, 100, 0);
        takingScreenshot = false;
        mp.players.local.unregisterheadshot();
        mp.events.call("playerheadshot_taken");
    }
    frameCount++;
});
