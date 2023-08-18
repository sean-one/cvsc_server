const cannabisAdjectives = [
    "dank", "sticky", "pungent", "hazy", "stony",
    "euphoric", "giggly", "mellow", "blissful", "earthy",
    "piney", "skunky", "aromatic", "zesty", "herbal",
    "uplifting", "chill", "potent", "cerebral", "dreamy",
    "buzzy", "relaxing", "groovy", "toasty", "spicy",
    "citrusy", "fruity", "diesel-like", "sweet", "woody",
    "hashy", "gaseous", "floral", "minty", "tart",
    "tangy", "ripe", "resinous", "lemony", "balmy",
    "crisp", "creamy", "berry-like", "tropical", "nutty",
    "caramel", "peppery", "sugary", "malty", "juicy"
];

const cannabisNouns = [
    "bud", "joint", "bong", "sativa", "indica",
    "kush", "hash", "edible", "roach", "strain",
    "dab", "resin", "kief", "nectar", "terpenes",
    "tincture", "flower", "trichome", "cannabinoid", "vaporizer",
    "oil", "rig", "pipe", "blunt", "hemp",
    "cbd", "thc", "cone", "grinder", "capsule",
    "crumble", "wax", "shatter", "isolate", "distillate",
    "infusion", "rolling-paper", "vape", "munchies", "entourage-effect",
    "phenotype", "genotype", "hybrid", "cultivar", "topical",
    "endocannabinoid", "sinsemilla", "terpinolene", "decarboxylation", "cannabidiol"
];

const generateUsername = () => {
    // Randomly select an adjective and a noun from the arrays.
    const randomAdjective = cannabisAdjectives[Math.floor(Math.random() * cannabisAdjectives.length)];
    const randomNoun = cannabisNouns[Math.floor(Math.random() * cannabisNouns.length)];

    // Generate a random three-digit number.
    const randomNumber = Math.floor(Math.random() * 900) + 100; // This will give a number between 100 and 999.

    // Combine them to form the username.
    const username = `${randomAdjective}.${randomNoun}_${randomNumber}`;

    return username;
}

module.exports = { generateUsername }