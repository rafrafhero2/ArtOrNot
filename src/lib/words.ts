export const WORD_BANK: Record<string, string[]> = {
  Animals: [
    "Penguin","Octopus","Giraffe","Hedgehog","Kangaroo","Sloth","Narwhal","Platypus","Chameleon","Pelican",
    "Owl","Llama","Walrus","Raccoon","Flamingo","Cheetah","Crocodile","Beaver","Hippo","Toucan",
    "Snail","Jellyfish","Bat","Hamster","Lobster","Peacock","Skunk","Squid","Tortoise","Zebra",
    "Crab","Eagle","Fox","Goat","Horse","Iguana","Koala","Mouse","Otter","Panda",
    "Rabbit","Salmon","Tiger","Wolf","Yak","Buffalo","Camel","Donkey","Elephant","Frog",
  ],
  Food: [
    "Pizza","Sushi","Burger","Pancake","Donut","Taco","Burrito","Croissant","Bagel","Spaghetti",
    "Ramen","Dumpling","Lasagna","Waffle","Cupcake","Sandwich","Salad","Pretzel","Muffin","Steak",
    "Omelette","Risotto","Lollipop","Cookie","Brownie","Fries","Curry","Kebab","Pho","Tiramisu",
    "Macaron","Churros","Bacon","Cheese","Yogurt","Mango","Pineapple","Strawberry","Watermelon","Avocado",
    "Coconut","Lemon","Onion","Pumpkin","Pepper","Garlic","Olive","Mushroom","Carrot","Broccoli",
  ],
  Places: [
    "Beach","Castle","Volcano","Library","Airport","Cinema","Bakery","Stadium","Lighthouse","Cathedral",
    "Museum","Garden","Bridge","Subway","Hospital","Pyramid","Forest","Desert","Glacier","Skyscraper",
    "Cave","Harbor","Vineyard","Temple","Windmill","Market","Aquarium","Zoo","Park","School",
    "Bank","Hotel","Studio","Farm","Factory","Tower","Cottage","Igloo","Tent","Treehouse",
    "Theater","Mosque","Bunker","Castle","Stadium","Pier","Dam","Tunnel","Canal","Church",
  ],
  Movies: [
    "Titanic","Inception","Frozen","Avatar","Joker","Gladiator","Shrek","Coco","Up","Wall-E",
    "Ratatouille","Toy Story","Tangled","Moana","Encanto","Aladdin","Jaws","Rocky","Matrix","Alien",
    "Predator","Twilight","Grease","Cars","Brave","Mulan","Hercules","Bambi","Dumbo","Pinocchio",
    "Tarzan","Hook","Annie","Casino","Goodfellas","Psycho","Vertigo","Rambo","Fargo","Heat",
    "Memento","Whiplash","Birdman","Parasite","Drive","Dune","Tenet","Sicario","Logan","Joker",
  ],
  Random: [
    "Umbrella","Astronaut","Pirate","Telescope","Lightning","Rainbow","Robot","Volcano","Compass","Anchor",
    "Cactus","Diamond","Skateboard","Suitcase","Helicopter","Snowman","Mermaid","Vampire","Treasure","Crown",
    "Unicorn","Wizard","Ghost","Dragon","Knight","Ninja","Cowboy","Detective","Mailbox","Microscope",
    "Pizza","Penguin","Castle","Library","Stadium","Camera","Guitar","Trumpet","Piano","Drum",
    "Soccer","Bowling","Tennis","Surfing","Skiing","Camping","Painting","Origami","Magic","Carnival",
  ],
};

export function pickWord(category: string, used: string[] = []): string {
  const pool = WORD_BANK[category] ?? WORD_BANK.Random;
  const fresh = pool.filter((w) => !used.includes(w));
  const list = fresh.length ? fresh : pool;
  return list[Math.floor(Math.random() * list.length)];
}

export const CATEGORIES = ["Animals", "Food", "Places", "Movies", "Random"];
