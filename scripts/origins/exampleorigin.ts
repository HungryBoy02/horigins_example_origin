import { registerOrigin, registerOriginGamerule, getGameruleValue, getRegisteredOriginIds } from '../libs/horiginsapi.js'
import { system, world } from '@minecraft/server'

const originId = 'example_origin' // Origin's unique ID
// Players will also be tagged with "horigins.origin." this when they select this origin
//                                     (so this one's tag would actually be "horigins.origin.example_origin")
const originTitle = "Example Origin" // What your origin is called
const iconTexture = 'textures/items/diamond' // The icon for your origin
const shortDescription = " Example origin" // Your origin's short description
const longDescription = "Example origin, blah blah blah"
//     ^^^^^^^^^^^^^^ your origin's long description, used when choosing or displaying your origin. use '\n' to make a new line

const componentModifications = [
    // Component modifies, all must be strings
    { id: 'health', value: '20' }, // Health up to 149, no decimals
    { id: 'exhaustion', value: 'normal' }, // Acceptable values are 'nonefrommovement', 'inneficienthealing', 'nonefrommining', and 'normal'
    { id: 'breathable', value: 'land' }, // Acceptable values are 'land' and 'underwater'
    { id: 'buoyant', value: 'normal' }, // Acceptable values are 'normal', and 'float_on_water'
    { id: 'attack', value: '1' }, // Acceptable values are between 0 and 10, no decimals.
    { id: 'scale', value: '1' }, // Increments of .25, from 0.25 to 3, do not include trailing zeros (eg, dont write 0.50, write 0.5)
    { id: 'movement', value: '0.1' } // Increments of 0.05, no trailing zeros, changes movement speed, default vanilla movement is 0.1
]

const abilities = [
    // If you are having trouble figuring out how origin abilities work, here's the perfect time to find out how to set it up!
    {
        abilityId: 'horigins.exampleorigin.saystuffinchat',
        //The id of the ability, when a user uses this ability, they will recieve a tag with the same name.
        // this allows you to make a function or a script for the ability depending on your preference.
        //  just make sure to remove the tag after you've activated the ability, or it will activate more than once!
        abilityName: 'Say stuff in chat', // Self explanitory
        abilityDescription: 'Says stuff in chat', // Self explanitory
        abilityIcon: 'textures/items/feather', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 5 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    }
]
// Register your origin to the main addon
world.afterEvents.worldInitialize.subscribe(() => {
    system.waitTicks(20)
    registerOrigin(originId, originTitle, abilities, componentModifications, iconTexture, shortDescription, longDescription)
    // Below is an optional thing you can add that disables or enables certian aspects of your origin.
    // I added this because some server admins probably don't want creeper origins blowing up their stuff
    // If you don't have a reason to add this, don't.

    // EDIT: Ignore all of that because if you use this you can't even read the value because dynamic properties are addon specific and this one is
    //tied to the main addon
    //registerOriginGamerule("example.yapping", true, "Enable yapping")

    //Will fix later.

    // Registers a gamerule in case you want to let server admins choose if their origin does something or not.
    // As of writing this script (9/6/2024) I have only implemented toggles to this.
    // Please do not use things other than booleans (that's true or false, for those who are making their first project)
})


// If you're using an MCFUNCTION file, you can delete everything below this line. Just make sure in your function to
//  delete your ability tags after they've been used, or you'll have problems!

// Check if someone is using their ability every tick
system.runInterval(() => {
    // Get everyone who is using their ability

    var chatters = world.getPlayers({ tags: ['horigins.exampleorigin.saystuffinchat'] })

    for (let i = 0; i < chatters.length; i++) {
        var plr = chatters[i]

        // If they're using their ability, we dont want them to activate it more than once, so we delete the tag
        plr.removeTag("horigins.exampleorigin.saystuffinchat")

        // Check if our gamerule allows this (optional)
        //if (getGameruleValue("example.yapping") != true) continue;
        // Then we activate the ability!
        world.sendMessage(plr.name + " Says hi!")
    }
})

