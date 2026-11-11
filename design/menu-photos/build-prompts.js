// Builds one ChatGPT image prompt per dish from the live menu, in the menu's house style.
// Each prompt goes to ChatGPT together with real reference photos of the dish (refs/<file>.jpg).
// Usage: node build-prompts.js <menu.json> <out.json>
const fs = require('fs');

const [menuFile, outFile] = process.argv.slice(2);
const menu = JSON.parse(fs.readFileSync(menuFile, 'utf8'));

// Natural, unstaged look the restaurant approved (test 3 of Kothu porotta)
const STYLE = 'The attached photos are real photos of this dish. Use them only as a reference for how the dish truly looks (its texture, colour, cut and how it is plated) and stay faithful to that. Do not copy them. Create a new, original photograph that looks like a real professional photographer shot it in the restaurant, not an AI or stock image: soft natural light, a subtle film grain, slightly muted true-to-life colours, gentle highlights, nothing over-sharpened, glossy or oversaturated. Dark wooden table. Only the dish and what is normally served with it: no raw onion rings, no lemon wedges, no scattered chillies, spices or props. No text, no logos, no people or hands. Landscape 3:2.';

const ANGLES = [
    'Shot at a 45-degree angle.',
    'Shot from directly overhead.',
    'Shot from a low side angle, at eye level with the dish.',
    'Close-up at a three-quarter angle, the dish filling most of the frame.',
];

// How each category is plated at the restaurant
const SERVING = {
    'Kerala Meals': 'Served as a traditional Kerala meal.',
    'South Specials': 'Served on a steel plate with small steel bowls of sambar and coconut chutney.',
    'Combo Specials': 'Served as a Kerala combo plate on a steel plate.',
    'Biryani': 'Kerala-style biryani with long-grain basmati rice, served on a steel plate.',
    'Breads': 'Served on a steel plate, freshly made.',
    'Main Course': 'Served on its own in a clay chatti or steel bowl; no rice in the shot.',
    'Sides': 'A small side portion in a small steel bowl.',
    'Kids Corner': 'Served casually on a plate, kid-friendly portion.',
    'Desserts': 'Served in a dessert bowl with a scoop of vanilla ice cream.',
    'Hot Drinks': 'Served hot, light steam.',
    'Cool Drinks': 'Served chilled in a glass.',
    'Juice': 'Fresh juice served chilled in a glass.',
    'Milkshake': 'Thick milkshake served in a tall glass.',
};

const DRINKS = ['Hot Drinks', 'Cool Drinks', 'Juice', 'Milkshake'];

// Dishes whose menu text doesn't say what they look like
const LOOKS = {
    'pothichoru': 'Kerala pothichoru: a banana-leaf parcel opened out with red matta rice in the middle, masala fish fry, folded omelette, cabbage thoran, bean mezhukkupuratti, coconut chammanthi, pickle, and small cups of sambar and pulissery.',
    'chatti choru': 'A Kerala meal served inside a wide black clay pot (chatti): red matta rice with fish curry, a piece of chicken fry, folded omelette, thoran, mezhukkupuratti, chammanthi and pickle arranged inside the pot.',
    'kothu porotta chicken': 'Kerala kothu parotta: parotta shredded into small thin strips, chopped together on a tawa with scrambled egg and small pieces of spiced chicken into a moist, finely chopped mound, with a small bowl of salna.',
    'kothu porotta beef': 'Kerala kothu parotta: parotta shredded into small thin strips, chopped together on a tawa with scrambled egg and small pieces of spiced beef into a moist, finely chopped mound, with a small bowl of salna.',
    'lamb kothu porotta': 'Kerala kothu parotta: parotta shredded into small thin strips, chopped together on a tawa with scrambled egg and small pieces of spiced lamb into a moist, finely chopped mound, with a small bowl of salna.',
    'neelgiri chicken chatti curry': 'Chicken in a green Nilgiri-style curry of fresh mint, coriander and green chillies with coconut, in a clay chatti.',
    'falooda': 'Layered falooda in a tall glass: rose syrup, thin vermicelli, sabja (basil) seeds, chilled milk and a scoop of ice cream with chopped nuts.',
    'sharja': 'Kerala Sharjah shake: a thick light-brown milkshake of banana, roasted peanuts and Horlicks, topped with crushed peanuts.',
    'naruneedi': 'Naruneendi sarbath: a chilled pale pink-brown drink of nannari (sarsaparilla) syrup with lime and soda, with ice.',
    'kanthari nellikka': 'Kanthari nellikka: a chilled cloudy green drink of gooseberry (amla) blended with bird\'s eye chillies (kanthari), salt and soda.',
    'milk sarbath': 'Milk sarbath: a chilled pink drink of milk, nannari syrup and basil seeds.',
    'lime soda': 'Fresh lime soda, sparkling, with ice.',
    'boost': 'A hot malted chocolate milk drink (Boost) in a glass cup.',
    'horlicks': 'A hot malted milk drink (Horlicks) in a glass cup.',
    'tea': 'Kerala chai (milky tea with a frothy top from being pulled) in a glass.',
    'coffee': 'South Indian filter coffee in a steel tumbler and dabarah with a frothy top.',
    'palada + ice-cream': 'Kerala palada payasam (rice flakes in sweet thickened milk, pale pink) with a scoop of vanilla ice cream.',
    'carrots halawa + ice-cream': 'Carrot halwa garnished with cashews, with a scoop of vanilla ice cream.',
    'nidhi chicken': 'A Kerala chicken curry with thick coconut masala, served with Kerala parottas.',
    'nidhi beef': 'A Kerala beef curry with thick coconut masala, served with Kerala parottas.',
    'kappa fish': 'Mashed tapioca (kappa) with a red Kerala fish curry beside it.',
    'paal kappa fish': 'Tapioca cooked in coconut milk (paal kappa) with a red Kerala fish curry beside it.',
    'paal kappa beef': 'Tapioca cooked in coconut milk (paal kappa) with Kerala beef roast beside it.',
    'travankoor prawns curry': 'Prawns in a rich red Travancore-style curry of roasted coconut, Kashmiri chilli and kudampuli.',
    'beef pollichathu': 'Spiced beef cooked wrapped in banana leaf, shown as the opened, charred banana-leaf parcel with the masala-coated beef inside.',
    'meen pollichathu (bone-in)': 'A whole fish (bone in) coated in red masala and cooked wrapped in banana leaf, shown as the opened, charred banana-leaf parcel.',
};

// Search words for finding real photos of each dish
const SEARCH = {
    'Biryani': name => `kerala ${name} biryani`,
    'Juice': name => `${name} juice glass`,
    'Milkshake': name => `${name} milkshake kerala`,
    'Hot Drinks': name => `kerala ${name} glass`,
    'Cool Drinks': name => `${name} kerala drink`,
    'Kids Corner': name => name,
    'Desserts': name => name.replace(/\+/g, 'with'),
};

const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Short dish names need context to be unambiguous
const dishTitle = item => {
    if (item.category === 'Biryani') return `${item.name} biryani`;
    if (DRINKS.includes(item.category) && !/tea|coffee|soda|sarbath/i.test(item.name)) return `${item.name} ${item.category === 'Milkshake' ? 'milkshake' : item.category === 'Juice' ? 'juice' : 'drink'}`;
    return item.name;
};

const seen = new Set();
const prompts = [];
let n = 0;
for (const item of menu) {
    // Half and full Vizhinjam share one photo
    const photoName = item.name.toLowerCase().replace(/ (half|full)$/, '');
    if (seen.has(photoName)) continue;
    seen.add(photoName);

    const angle = DRINKS.includes(item.category) ? 'Shot from a low side angle, at eye level with the glass.' : ANGLES[n++ % ANGLES.length];
    const desc = LOOKS[photoName] || (item.desc || '').replace(/Complimentary rice not included\.?/i, '').trim();
    const title = dishTitle(item).replace(/ (half|full)$/i, '');
    const name = photoName.replace(/\(.*?\)/g, '').trim();
    prompts.push({
        file: `adipoli-${slug(item.category)}-${slug(photoName)}.png`,
        name: item.name,
        search: (SEARCH[item.category] || (x => `kerala ${x}`))(name),
        prompt: `${STYLE} ${angle} Dish: ${title}. ${desc} ${SERVING[item.category] || ''}`.replace(/\s+/g, ' ').trim(),
    });
}
fs.writeFileSync(outFile, JSON.stringify(prompts, null, 2));
console.log(prompts.length + ' prompts');
