const { ImgurClient } = require('imgur');

const client = new ImgurClient({
    clientId: "49f0a7efaa7aa43",
    clientSecret: "fe1c440d5701e929411b32e47d726dd524ebe038",
});
 
mp.events.add("uploadPlayerHeadshot", async (player, image) => {
 
    const response = await client.upload({
        image: image.replace("data:image/png;base64,", ""),
        type: "base64"
    }); 

    player.info.photo = response.data.link;

    console.log(response.data.link); 
}); 