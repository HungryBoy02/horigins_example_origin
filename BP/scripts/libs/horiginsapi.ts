import { system, world, Player, EntityComponentTypes, EquipmentSlot, ItemStack } from '@minecraft/server'

// the only 2 things that work when using this api outside of the main addon are registerOriginGamerule and registerOrigin.

function initialize() {
    var ids = world.getDynamicPropertyIds()
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].startsWith("horigins.origin")) {
            world.setDynamicProperty(ids[i])
        }
    }

    system.afterEvents.scriptEventReceive.subscribe((event) => {
        if (event.id == "horigins:registerorigin") {
            let message = event.message.substring(1, event.message.length - 1).replaceAll('[**aarp', '"')
            let data = JSON.parse(message)
            world.setDynamicProperty("horigins.origin." + data.originId, JSON.stringify(data))
        } else if (event.id == "horigins:registerorigingamerule") {
            let gamerule = JSON.parse(event.message.replaceAll('[**aarp', '"'))
            let originGameruleTest = getOriginGamerule(gamerule.gameruleId)
            if (originGameruleTest == false) {
                var currentGamerules = getOriginGamerules()
                currentGamerules.push(gamerule)
                world.setDynamicProperty("horigins.gamerules", JSON.stringify(currentGamerules))//currentGamerules
            }
        } else if (event.id == "horigins:registerability") {
            let message = event.message//.substring(1, event.message.length - 1).replaceAll('[**aarp', '"')
            let data = JSON.parse(message)
            world.setDynamicProperty("horigins.origin." + data.originId + '.abilities.' + data.ability.abilityId, JSON.stringify(data.ability))
        }
    })
}

function getOriginGamerules() {
    var gamerules = world.getDynamicProperty("horigins.gamerules")
    if (gamerules == null || gamerules == undefined) {
        gamerules = []
    } else {
        gamerules = JSON.parse(gamerules)
    }
    return gamerules
}
// How gamerules are structured:
// [ {gameruleId: "horigins.examplegamerule", value: true, title: "this is the name of your gamerule" } ]
function registerOriginGamerule(gameruleId: string, defaultValue: any, gameruleText: string) {
    world.getDimension("overworld").runCommand('scriptevent horigins:registerorigingamerule ' + JSON.stringify({ gameruleId: gameruleId, value: defaultValue, title: gameruleText }).replaceAll('"', '[**aarp') + '')
    /*var originGameruleTest = getOriginGamerule(gameruleId)
    if (originGameruleTest == false) {
        var currentGamerules = getOriginGamerules()
        currentGamerules.push({ gameruleId: gameruleId, value: defaultValue, title: gameruleText })
        world.setDynamicProperty("horigins.gamerules", JSON.stringify(currentGamerules))//currentGamerules
    }*/
    //world.setDynamicProperty("horigins.gamerules", JSON.stringify([]))
}

function getOriginGamerule(gameruleId: string) {
    var currentGamerules = getOriginGamerules()
    for (let i = 0; i < currentGamerules.length; i++) {
        if (currentGamerules[i].gameruleId == gameruleId) {
            return currentGamerules[i]
        }
    }
    return false
}

function getGameruleValue(gameruleId: string) {
    var gamerule = getOriginGamerule(gameruleId)
    if (gamerule != false) {
        return gamerule.value
    }
}

function setOriginGameruleValue(gameruleId: string, value: any) {
    var currentGamerules = getOriginGamerules()
    for (let i = 0; i < currentGamerules; i++) {
        if (currentGamerules[i].gameruleId == gameruleId) {
            currentGamerules[i].value = value
        }
    }
    world.setDynamicProperty("horigins.gamerules", JSON.stringify(currentGamerules))
}


const defaultComponentModifiers = [
    { id: 'health', value: '20' }, // Health up to 149, no decimals
    { id: 'exhaustion', value: 'normal' }, // Acceptable values are 'nonefrommovement', 'inneficienthealing', 'nonefrommining', and 'normal'
    { id: 'breathable', value: 'land' }, // acceptable values are 'land' and 'underwater'
    { id: 'buoyant', value: 'normal' }, // acceptable values are 'normal', and 'float_on_water'
    { id: 'attack', value: '1' }, // acceptable values are between 0 and 10, no decimals.
    { id: 'scale', value: '1' }, // Increments of .25, from 0.25 to 3, do not include leading zeros (eg, dont write 0.50, write 0.5)
    { id: 'movement', value: '0.1' } // Increments of 0.05, no trailing zeros, changes movement speed, default vanilla movement is 0.1
]

function modifyPlayerComponents(user: Player, components) {
    for (let i = 0; i < components.length; i++) {
        user.triggerEvent("horigins:" + components[i].id + "." + components[i].value)
    }
}

function resetPlayerComponents(user: Player) {
    user.setDynamicProperty("horigins.bindings")
    modifyPlayerComponents(user, defaultComponentModifiers)
}

function registerOrigin(originId: string, originName: string, originAbilities, componentModifiers, /*damageTypeImmunites,*/ originIconTexturePath: string, originDescription: string, longDescription: string) {
    //var currentOrigins = world.getDynamicProperty("horigins.origins")
    world.getDimension("overworld").runCommand('scriptevent horigins:registerorigin "' + JSON.stringify({ originId: originId, originName: originName, componentModifiers: componentModifiers, /*immunityTags: damageTypeImmunites,*/ icon: originIconTexturePath, description: originDescription, longDescription: longDescription }).replaceAll('"', '[**aarp') + '"')
    for (let ability of originAbilities) {
        //system.waitTicks(1)
        world.getDimension("overworld").runCommand('scriptevent horigins:registerability ' + JSON.stringify({ originId: originId, ability: ability }))
    }

    //world.setDynamicProperty("horigins.origin." + originId, JSON.stringify({ originId: originId, originName: originName, originAbilities: originAbilities, componentModifiers: componentModifiers, /*immunityTags: damageTypeImmunites,*/ icon: originIconTexturePath, description: originDescription, longDescription: longDescription }))
}

function getRegisteredOriginIds() {
    let ids = world.getDynamicPropertyIds()
    let originIds = []
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].startsWith("horigins.origin") && !ids[i].includes(".abilities.")) {
            originIds.push(ids[i])
        }
    }
    return originIds
}
function getRegisteredOrigins() {
    let ids = getRegisteredOriginIds()
    let origins = []
    for (let id of ids) {
        let origin = JSON.parse(world.getDynamicProperty(id))
        let abilities = []
        let abilityids = world.getDynamicPropertyIds()
        for (let i = 0; i < abilityids.length; i++) {
            if (abilityids[i].startsWith(id + ".abilities.")) {
                abilities.push(JSON.parse(world.getDynamicProperty(abilityids[i])))
            }
        }
        origin.originAbilities = abilities
        origins.push(origin)
    }
    return origins;
}

function clearOrigin(user: Player) {
    resetPlayerComponents(user)
    user.setDynamicProperty("horigins.origin")
    var tags = user.getTags()
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].startsWith("horigins")) {
            if (tags[i] == "horigins.firstspawned" || tags[i] == "horigins.admin") continue;
            user.removeTag(tags[i])
        }
    }
    function checkItemRemove(item: ItemStack) {
        return item.getDynamicProperty("horigins.originitem")
    }
    var inventory = user.getComponent("minecraft:inventory")
    var container = inventory.container

    for (let i = 0; i < 36; i++) {
        var item = container.getItem(i)
        if (item) {
            if (checkItemRemove(item)) {
                container.setItem(i)
            }
        }

    }
    var slots = [EquipmentSlot.Chest, EquipmentSlot.Feet, EquipmentSlot.Head, EquipmentSlot.Legs, EquipmentSlot.Offhand]
    const equipmentCompPlayer = user.getComponent(EntityComponentTypes.Equippable);
    if (equipmentCompPlayer) {
        for (let i = 0; i < slots.length; i++) {
            var item = equipmentCompPlayer.getEquipment(slots[i])
            if (item) {
                if (checkItemRemove(item)) {
                    equipmentCompPlayer.setEquipment(slots[i])
                }
            }

        }
    }

}

function joinOrigin(user: Player, originId: string) {
    clearOrigin(user)
    user.setDynamicProperty("horigins.origin", originId)
    var tags = user.getTags()
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].startsWith("horigins")) {
            if (tags[i] == "horigins.firstspawned" || tags[i] == "horigins.admin") continue;
            user.removeTag(tags[i])
        }
    }
    user.addTag("horigins.origin." + originId)

    var origin = getOriginById(originId)
    /*if (origin.immunityTags.length > 0) {
        for (let i = 0; i < origin.immunityTags.length; i++) {
            user.addTag(origin.immunityTags[i])
        }
    }*/
    modifyPlayerComponents(user, origin.componentModifiers)
}

function getUserOrigin(user: Player) {
    var originId = user.getDynamicProperty("horigins.origin")
    if (originId == null || originId == undefined) return false;
    return getOriginById(originId)
}

function getOriginById(originId: string) {
    var origin = null
    var co = getRegisteredOrigins()
    for (let i = 0; i < co.length; i++) {
        if (co[i].originId == originId) {
            return co[i];
        }
    }
}

var exampleOriginAbilities = [
    // If you are having trouble figuring out how origin abilities work, here's the perfect time to find out how to set it up!
    {
        abilityId: 'horigins.fox.superJump',
        //The id of the ability, when a user uses this ability, they will recieve a tag with the same name.
        // this allows you to make a function or a script for the ability depending on your preference.
        //  just make sure to remove the tag after you've activated the ability, or it will activate more than once!
        abilityName: 'Super Jump', // Self explanitory
        abilityDescription: 'Lets you do a cool super jump!', // Self explanitory
        abilityIcon: 'textures/items/feather', // The icon for your ability, used when binding an ability to an emote
        abilityCooldown: 5 // Cooldown in seconds. If you want to be super percice, like an ability that lasts 2 ticks, just do 2/20
    }
]

export { initialize, registerOrigin, getRegisteredOrigins, clearOrigin, joinOrigin, getOriginById, getUserOrigin, defaultComponentModifiers, modifyPlayerComponents, resetPlayerComponents, registerOriginGamerule, getOriginGamerule, setOriginGameruleValue, getOriginGamerules, getGameruleValue, getRegisteredOriginIds }