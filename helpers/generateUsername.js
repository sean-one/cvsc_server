const dbUser = require('../data/models/user');

const cannabisAdjectives = [
    "dank", "sticky", "pungent", "hazy", "stony",
    "euphoric", "giggly", "mellow", "blissful", "earthy",
    "piney", "skunky", "aromatic", "zesty", "herbal",
    "uplifting", "chill", "potent", "cerebral", "dreamy",
    "buzzy", "relaxing", "groovy", "toasty", "spicy",
    "citrusy", "fruity", "sweet", "woody",
    "hashy", "gassy", "floral", "minty", "tart",
    "tangy", "resinous", "lemony",
    "crisp", "creamy", "berry", "tropical", "nutty",
    "caramel", "peppery", "sugary", "malty", "juicy"
];

const cannabisNouns = [
    "bud", "joint", "bong", "sativa", "indica",
    "kush", "hash", "edible", "roach", "strain",
    "dab", "resin", "kief", "nectar", "terpenes",
    "tincture", "flower", "trichome", "cannabinoid", "vaporizer",
    "oil", "rig", "pipe", "blunt", "hemp",
    "cbd", "thc", "cone", "grinder", "capsule",
    "crumble", "wax", "shatter",
    "infusion", "papers", "vape", "munchies", 
    "phenotype", "genotype", "hybrid", "cultivar", "topical",
    "terpinolene", "cannabidiol"
];

const generateUsername = async () => {
    let isDuplicate = true;
    let username;

    while (isDuplicate) {
        // Randomly select an adjective and a noun from the arrays.
        const randomAdjective = cannabisAdjectives[Math.floor(Math.random() * cannabisAdjectives.length)];
        const randomNoun = cannabisNouns[Math.floor(Math.random() * cannabisNouns.length)];
    
        // Generate a random three-digit number.
        const randomNumber = Math.floor(Math.random() * 900) + 100; // This will give a number between 100 and 999.
    
        // Combine them to form the username.
        username = `${randomAdjective}.${randomNoun}_${randomNumber}`;

        // check if generated username is a duplicate
        isDuplicate = await dbUser.checkUsernameDuplicate(username)
    }

    return username;
}

module.exports = {
    generateUsername
};