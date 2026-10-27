export interface MenuItem {
  name: string;
  price: number;
  description?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    name: "Idly & DOSA",
    items: [
      { name: "Idly (3pcs)", price: 10.99, description: "Fermented rice and urad dal batter is steamed in molds until soft and fluffy." },
      { name: "Podi idly", price: 11.99, description: "Steamed idlies are served with spiced lentil powder (podi) and a drizzle of ghee." },
      { name: "Vada (3pcs)", price: 10.99, description: "Ground urad dal is mixed with spices, shaped into rings, and deep-fried until crisp and golden." },
      { name: "Plain dosa", price: 10.99, description: "Fermented rice and urad dal batter is spread thin on a hot griddle and cooked until golden brown." },
      { name: "Masala dosa", price: 14.99, description: "Thin dosa is cooked on a griddle and filled with a spiced potato-onion mixture before folding." },
      { name: "Podi masala dosa", price: 15.99, description: "Masala dosa is topped with spiced lentil powder (podi) and ghee for extra flavor." },
      { name: "Mysoor masala dosa", price: 16.99, description: "Dosa is spread with a mildly spicy red chutney and filled with potato masala, creating a flavorful Mysore-style classic." },
      { name: "Chicken masala dosa", price: 17.99, description: "A thin, crisp dosa is stuffed with spiced chicken masala, blending South Indian tradition with a hearty filling." },
      { name: "Paneer dosa", price: 16.99, description: "Dosa is filled with gently spiced paneer cubes sautéed with onions and chilies for a soft, savory bite." },
      { name: "Egg dosa", price: 14.99, description: "Dosa is topped with beaten egg, cooked until set, and optionally filled with potato masala." },
      { name: "Ghee roast", price: 14.99, description: "Soft dosa is cooked with ghee brushed on top for a rich flavor." },
      { name: "Ghee masala dosa", price: 15.99, description: "A crisp dosa cooked with fragrant ghee and filled with a spiced potato-onion masala for rich, comforting flavor." },
      { name: "Cheese masala dosa", price: 17.99, description: "Crisp dosa is layered with melted cheese and potato masala for a rich, creamy twist." },
      { name: "Uttappam", price: 13.99, description: "Thick batter is spread on a griddle, topped with onions, tomatoes, and chilies, and cooked until golden." },
      { name: "Kanjipuram masala dosa", price: 17.99, description: "A traditionally seasoned dosa flavored with spices and served with potato masala for an aromatic South Indian specialty." },
    ],
  },
  {
    name: "BREADS",
    items: [
      { name: "Kallappam (3pcs)", price: 6, description: "Fermented rice batter mixed with coconut milk is poured into small pans and steamed until soft and lacy." },
      { name: "Palappam (3pcs)", price: 6, description: "Fermented rice and coconut batter is spread thin at the edges in a pan and cooked until the center is soft and edges crisp." },
      { name: "Egg appam", price: 4, description: "Palappam batter is poured into a pan, and an egg is cracked in the center; cooked until set." },
      { name: "Kerala parotta", price: 4, description: "Maida dough is layered, rolled, and pan-fried with oil until flaky and golden brown." },
      { name: "Garlic parotta", price: 5, description: "Kerala parotta dough is layered with garlic paste and cooked on a hot griddle until golden." },
      { name: "Cheese parotta", price: 6, description: "Parotta dough is layered with grated cheese and pan-fried until soft and slightly crisp." },
      { name: "Cheese & garlic parotta", price: 7, description: "Parotta dough is layered with garlic paste and grated cheese, then cooked on a griddle." },
      { name: "Nool paratha", price: 5, description: "Thin wheat dough is rolled, coiled into threads, and cooked on a hot griddle with oil until lightly browned." },
      { name: "Puttu", price: 6, description: "Rice flour and grated coconut are layered in a cylindrical mold and steamed until cooked." },
      { name: "Chappathi", price: 3, description: "Whole wheat dough is rolled into flat circles and cooked on a hot tawa until lightly browned on both sides." },
    ],
  },
  {
    name: "Adipoli Special BIRYANI",
    items: [
      { name: "Chicken (bone in)", price: 17.99, description: "Chicken is marinated with spices and yogurt, then cooked with partially boiled basmati rice in layers with fried onions, ghee, and aromatic spices." },
      { name: "Beef", price: 18.99, description: "Beef is slow-cooked with spices, then layered with partially cooked basmati rice and fried onions; steamed together for flavor." },
      { name: "Goat (bone in)", price: 20.99, description: "Mutton is marinated and cooked with spices, then layered with basmati rice and fried onions; steamed until aromatic." },
      { name: "Prawns", price: 21.99, description: "Prawns are lightly spiced, then layered with partially cooked rice and cooked with ghee, herbs, and fried onions." },
      { name: "Fish (bone in)", price: 22.99, description: "Fish is marinated with spices, then layered with basmati rice, fried onions, and ghee; steamed gently to preserve flavor." },
      { name: "Veg", price: 13.99, description: "Mixed vegetables are cooked with spices and layered with partially cooked basmati rice, fried onions, and ghee; steamed to perfection." },
      { name: "Egg", price: 15.99, description: "Boiled eggs are cooked with spices, layered with basmati rice, fried onions, and ghee; lightly steamed before serving." },
      { name: "Family pack chicken (bone in)", price: 59.99, description: "Larger portion of chicken is marinated and cooked with basmati rice in layers, flavored with fried onions, ghee, and whole spices." },
      { name: "Family pack beef", price: 64.99, description: "Slow-cooked beef with spices is layered with basmati rice, fried onions, and ghee; steamed in a large vessel for family servings." },
    ],
  },
  {
    name: "COMBO",
    items: [
      { name: "Kappa fish", price: 15.99, description: "Tapioca is boiled until soft. Fish is cooked with turmeric, chili, and spices, then mixed with tapioca and garnished with curry leaves." },
      { name: "Kappa biriyani beef", price: 16.99, description: "Beef is cooked with spices and marinated. Partially cooked tapioca is layered with spiced beef and lightly cooked together for flavor." },
      { name: "Paal kappa beef", price: 18.99, description: "Beef is slow-cooked with aromatic spices and mixed with creamy tapioca simmered in coconut milk, creating a rich, comforting, and flavorful dish." },
      { name: "Paal kappa fish", price: 17.99, description: "Tapioca is boiled and cooked with fish in a spiced coconut milk gravy until soft and flavorful." },
      { name: "Kothu porotta chicken", price: 15.99, description: "Chopped parotta is stir-fried with chicken, onions, garlic, ginger, chilies, and sauces until fully blended and slightly crisp." },
      { name: "Kothu porotta beef", price: 16.99, description: "Chopped parotta is stir-fried with spiced beef, onions, and chilies, tossed until well combined and aromatic." },
      { name: "Lamb kothu porotta", price: 17.99, description: "Chopped parotta is stir-fried with spiced lamb, onions, and chilies, tossed until well combined and aromatic." },
      { name: "Nidhi chicken", price: 20.99, description: "Chicken is slow-cooked with spices and coconut-based masala, then served with parotta." },
      { name: "Nidhi beef", price: 22.99, description: "Beef is slow-cooked with aromatic spices and coconut masala until tender; served with parotta." },
      { name: "Chilly porotta chicken", price: 16.99, description: "Parotta pieces are stir-fried with chicken, garlic, ginger, onions, and chili sauce for a spicy, saucy dish." },
      { name: "Chilly porotta beef", price: 17.99, description: "Parotta is stir-fried with beef, garlic, ginger, onions, and chili sauce until flavorful and slightly crisp." },
      { name: "Chatti biriyani beef", price: 24.99, description: "Beef is slow-cooked with spices and layered with partially cooked basmati rice, fried onions, and ghee; cooked in a sealed vessel for aroma." },
      { name: "Chatti biriyani chicken", price: 22.99, description: "Chicken is cooked with spices, layered with basmati rice and fried onions, then steamed in a sealed pot." },
      { name: "Sea food chatti biriyani", price: 26.99, description: "Mixed seafood (fish, prawns, squid) is cooked with spices and layered with basmati rice, fried onions, and ghee; steamed for a rich aroma." },
    ],
  },
  {
    name: "Kerala Meals (12pm to 3pm)",
    items: [
      { name: "Pothichoru", price: 20.99, description: "Fish fry, Omlet, Thoran, Mezhukkuvaratti, Chammanthi, Pickle, Salad, Sambar, Pulissery or mango curry." },
      { name: "Chatti choru", price: 23.99, description: "Rice, Fish curry, Chicken fry, Omlet, Thoran, Mezhukkuvaratti, Chammanthi, Salad, Pickle, Sambar, Pulissery or mango curry, Payasam." },
    ],
  },
  {
    name: "MAIN COURSE - VEG",
    items: [
      { name: "Paneer butter masala", price: 15.99, description: "Paneer cubes are cooked in a creamy tomato-onion gravy with butter, cream, cashew paste, and mild spices. Complimentary rice not included." },
      { name: "Paneer kadai", price: 15.99, description: "Paneer is sautéed with onions, capsicum, tomatoes, garlic, ginger, and Kadai masala until well coated. Complimentary rice not included." },
      { name: "Kadai Mushroom", price: 15.99, description: "Mushrooms are sautéed with onions, capsicum, tomatoes, garlic, ginger, and Kadai masala for a flavorful dish. Complimentary rice not included." },
      { name: "Veg stew", price: 15.99, description: "Mixed vegetables are simmered in coconut milk with ginger, green chilies, curry leaves, and pepper. Complimentary rice not included." },
      { name: "Kadala curry", price: 14.99, description: "Black chickpeas are cooked with onions, garlic, ginger, coconut paste, and spices until thick and flavorful. Complimentary rice not included." },
      { name: "Channa masala", price: 14.99, description: "Chickpeas are simmered in onion-tomato gravy with garlic, ginger, turmeric, red chili, and garam masala. Complimentary rice not included." },
      { name: "Green peas curry", price: 14.99, description: "Green peas are cooked in a mild onion-tomato coconut gravy with spices until soft and flavorful. Complimentary rice not included." },
      { name: "Gobi 65", price: 11.99, description: "Cauliflower florets are marinated with spices and yogurt, deep-fried until golden, and tossed with curry leaves." },
    ],
  },
  {
    name: "MAIN COURSE - EGG",
    items: [
      { name: "Egg kuruma", price: 15.99, description: "Boiled eggs are cooked in a rich coconut-based onion-tomato masala with ginger, garlic, and spices. Complimentary rice not included." },
      { name: "Egg masala", price: 15.99, description: "Boiled eggs are simmered in a spiced onion-tomato gravy with garlic, ginger, and chili powder. Complimentary rice not included." },
      { name: "Masala omlet", price: 12.99, description: "Beaten eggs are mixed with onions, tomatoes, green chilies, and spices, then pan-fried until golden. Complimentary rice not included." },
      { name: "Egg & peas fry", price: 13.99, description: "Boiled eggs are stir-fried with green peas, onions, garlic, ginger, and spices until well coated and aromatic. Complimentary rice not included." },
    ],
  },
  {
    name: "MAIN COURSE - CHICKEN",
    items: [
      { name: "Chicken curry", price: 18.99, description: "Chicken is cooked in a spiced onion-tomato gravy with garlic, ginger, turmeric, chili powder, and coriander. Complimentary rice not included." },
      { name: "Kanthari chicken masala", price: 19.99, description: "Chicken is cooked with green chilies, onions, ginger, garlic, and Kerala-style spices for a hot and spicy flavor. Complimentary rice not included." },
      { name: "Neelgiri chicken chatti curry", price: 20.99, description: "Chicken is slow-cooked with roasted spices, coconut paste, and onions in a traditional Kerala style. Complimentary rice not included." },
      { name: "Pepper chicken masala", price: 18.99, description: "Chicken is cooked with black pepper, onions, garlic, ginger, and curry leaves for a peppery, aromatic curry. Complimentary rice not included." },
      { name: "Chicken roast", price: 20.99, description: "Chicken pieces are roasted in a spiced onion-tomato gravy until tender and slightly dry. Complimentary rice not included." },
      { name: "Chicken stew", price: 19.99, description: "Chicken is simmered in coconut milk with onions, ginger, green chilies, and curry leaves for a mild, fragrant stew. Complimentary rice not included." },
      { name: "Butter chicken", price: 18.99, description: "Chicken is cooked in a creamy tomato-butter gravy with mild spices and finished with cream. Complimentary rice not included." },
      { name: "Vizhinjam chicken fry (Bone-in) half", price: 16.99, description: "Chicken is marinated with spices, then shallow-fried with onions, curry leaves, and green chilies until crispy. Complimentary rice not included." },
      { name: "Vizhinjam chicken fry (Bone-in) full", price: 29.99, description: "Chicken is marinated with spices, then shallow-fried with onions, curry leaves, and green chilies until crispy. Complimentary rice not included." },
      { name: "Payyoli chicken fry", price: 18.99, description: "Chicken is marinated with spices and shallow-fried with onions and curry leaves until golden and aromatic. Complimentary rice not included." },
      { name: "Chicken 65", price: 12.99, description: "Chicken is marinated in yogurt and spices, then deep-fried until crispy and golden, tossed with curry leaves and green chilies." },
    ],
  },
  {
    name: "MAIN COURSE - BEEF",
    items: [
      { name: "Beef curry", price: 19.99, description: "Beef is slow-cooked with onions, garlic, ginger, turmeric, chili powder, and traditional Kerala spices until tender." },
      { name: "Beef stew", price: 19.99, description: "Beef is simmered in coconut milk with onions, garlic, ginger, curry leaves, and mild spices for a creamy, flavorful stew." },
      { name: "Beef chatti curry", price: 21.99, description: "Beef is cooked in a traditional Kerala-style clay pot with roasted spices, onions, and coconut paste for rich flavor." },
      { name: "Kanthari beef masala", price: 20.99, description: "Beef is cooked with green chilies, onions, garlic, ginger, and spices for a hot and spicy Kerala-style curry." },
      { name: "Beef coconut fry", price: 21.99, description: "Beef is cooked with grated coconut, onions, garlic, curry leaves, and spices until slightly dry and aromatic." },
      { name: "Beef pollichathu", price: 22.99, description: "Beef is marinated in spices, wrapped in banana leaves, and pan-fried for a smoky, flavorful dish." },
      { name: "Beef roast", price: 20.99, description: "Beef pieces are cooked in a thick onion-tomato-spice gravy until tender and slightly dry." },
      { name: "Beef pepper masala", price: 19.99, description: "Beef is cooked with black pepper, onions, garlic, ginger, and curry leaves for a peppery and spicy flavor." },
      { name: "Beef dry fry (BDF)", price: 13.99, description: "Beef is marinated with spices, sautéed with onions, garlic, ginger, green chilies, and curry leaves until dry and flavorful." },
    ],
  },
  {
    name: "MAIN COURSE - MUTTON (bone in)",
    items: [
      { name: "Mutton curry", price: 22.99, description: "Mutton is slow-cooked with onions, garlic, ginger, turmeric, chili powder, and Kerala spices until tender." },
      { name: "Mutton roast", price: 22.99, description: "Mutton pieces are cooked in a thick, spiced onion-tomato gravy until slightly dry and flavorful." },
      { name: "Mutton kadai", price: 22.99, description: "Mutton is sautéed with onions, capsicum, tomatoes, garlic, ginger, and Kadai masala until well coated." },
      { name: "Mutton stew", price: 22.99, description: "Mutton is simmered in coconut milk with onions, ginger, green chilies, and curry leaves for a fragrant, mild stew." },
      { name: "Mutton kanthari", price: 22.99, description: "Mutton is cooked with green chilies, onions, garlic, ginger, and Kerala spices for a hot, spicy curry." },
      { name: "Mutton chatti curry", price: 24.99, description: "Mutton is slow-cooked in a traditional clay pot with roasted spices, onions, and coconut paste for deep, rich flavors." },
    ],
  },
  {
    name: "Seafood - FISH",
    items: [
      { name: "Meen shappu curry", price: 21.99, description: "Fish is cooked in a tangy tamarind and Kerala-style spice gravy with onions, garlic, and curry leaves." },
      { name: "Travankoor fish curry", price: 21.99, description: "Fish is simmered in a coconut-based curry with onions, garlic, ginger, turmeric, and green chilies." },
      { name: "Angamali fish mango curry", price: 22.99, description: "Fish is cooked with raw mango, onions, garlic, ginger, and spices for a tangy, flavorful curry." },
      { name: "Fish molee", price: 22.99, description: "Fish is simmered in a lightly spiced coconut milk gravy with onions, ginger, garlic, and green chilies." },
      { name: "Meen pollichathu (Bone-in)", price: 26.99, description: "Fish is marinated in spices, wrapped in banana leaves, and pan-fried to give a smoky, aromatic flavor." },
    ],
  },
  {
    name: "Seafood - PRAWNS",
    items: [
      { name: "Prawns mango curry", price: 21.99, description: "Prawns are cooked with raw mango, onions, garlic, ginger, and Kerala spices for a tangy and flavorful curry." },
      { name: "Prawns moile", price: 22.99, description: "Prawns are cooked in a spiced coconut gravy with onions, garlic, ginger, and green chilies." },
      { name: "Prawns roast", price: 22.99, description: "Prawns are sautéed with onions, garlic, ginger, curry leaves, and spices until slightly dry and aromatic." },
      { name: "Travankoor prawns curry", price: 21.99, description: "Prawns are cooked with raw mango, onions, garlic, ginger, and Kerala spices for a tangy and flavorful curry." },
      { name: "Prawns kanthari", price: 23.99, description: "Prawns are cooked with green chilies, onions, garlic, ginger, and Kerala spices for a hot, flavorful curry." },
      { name: "Kerala prawns fry", price: 14.99, description: "Prawns are marinated with spices and turmeric, then shallow-fried with onions, garlic, and curry leaves until cooked and aromatic." },
    ],
  },
  {
    name: "Seafood - SQUID",
    items: [
      { name: "Squid masala", price: 20.99, description: "Squid is sautéed with onions, garlic, ginger, tomatoes, and Kerala spices until tender and flavorful." },
      { name: "Squid roast", price: 21.99, description: "Squid is cooked with onions, garlic, ginger, curry leaves, and spices until slightly dry and aromatic." },
      { name: "Squid pepper fry", price: 21.99, description: "Squid is stir-fried with black pepper, garlic, ginger, and spices for a spicy, aromatic dish." },
      { name: "Peri peri kalamari", price: 22.99, description: "Squid is marinated in peri-peri sauce with garlic and spices, then grilled or pan-fried until smoky and flavorful." },
    ],
  },
  {
    name: "Kids corner",
    items: [
      { name: "French fries", price: 7.99, description: "Potato strips deep-fried until golden and crispy." },
      { name: "Onion rings", price: 6.99, description: "Onion slices dipped in batter and deep-fried until crispy." },
      { name: "Chicken nuggets", price: 9.99, description: "Chicken pieces coated with breading and deep-fried until golden." },
      { name: "Chicken Momos", price: 10.99, description: "Minced chicken wrapped in dough and steamed or pan-fried." },
    ],
  },
  {
    name: "Dessert",
    items: [
      { name: "Palada + ice-cream", price: 8.99, description: "Milk-based dessert with rice flakes, served with ice cream." },
      { name: "Brownie + ice cream", price: 7.99, description: "Chocolate brownie served warm with ice cream." },
      { name: "Fruit salad + ice cream", price: 9.99, description: "Mixed fresh fruits served with ice cream." },
      { name: "Carrots halawa + ice-cream", price: 6.99, description: "Slow-cooked sweet carrot pudding served with ice cream." },
    ],
  },
  {
    name: "SIDES",
    items: [
      { name: "Biriyani rice", price: 10.99, description: "Steamed basmati rice cooked with ghee and lightly spiced." },
      { name: "Plain rice", price: 6.99, description: "Steamed rice without added flavors." },
      { name: "Chutney (coconut & tomato)", price: 1.99, description: "Ground coconut or tomato blended with mild spices." },
      { name: "Sambar", price: 7.99, description: "Lentils cooked with tamarind and vegetables in South Indian spices." },
      { name: "Pappad (2pcs)", price: 1.99, description: "Thin lentil wafers roasted or fried until crisp." },
      { name: "Pickle", price: 0.99, description: "Spicy, tangy vegetable or mango pickle." },
      { name: "Boiled egg", price: 1.99, description: "Eggs boiled until firm." },
      { name: "Raitha", price: 3.99, description: "Yogurt mixed with cucumber, onions, or vegetables and mild spices." },
    ],
  },
  {
    name: "HOT DRINKS",
    items: [
      { name: "Tea", price: 3.99, description: "Brewed tea with milk and sugar." },
      { name: "Coffee", price: 4.99, description: "Brewed coffee with milk and sugar." },
      { name: "Horlicks", price: 5.99, description: "Warm milk with Horlicks malted powder." },
      { name: "Boost", price: 5.99, description: "Warm milk with Boost energy drink powder." },
    ],
  },
  {
    name: "Cooldrinks",
    items: [
      { name: "Lime soda", price: 6.99, description: "Lime juice mixed with soda water and sugar." },
      { name: "Kanthari nellikka", price: 6.99, description: "Spiced gooseberry drink served chilled." },
      { name: "Naruneedi", price: 6.99, description: "Spiced herbal drink served cold." },
      { name: "Milk Sarbath", price: 7.99, description: "Sweet milk-based refreshing drink served chilled." },
    ],
  },
  {
    name: "JUICE",
    items: [
      { name: "Pineapple", price: 10.99, description: "Freshly extracted fruit juice, served chilled." },
      { name: "Carrot", price: 10.99, description: "Freshly extracted fruit juice, served chilled." },
      { name: "Orange", price: 10.99, description: "Freshly extracted fruit juice, served chilled." },
    ],
  },
  {
    name: "MILK SHAKE",
    items: [
      { name: "Strawberry", price: 12.99, description: "Blended milk with the respective fruit or flavoring syrup." },
      { name: "Chocolate", price: 12.99, description: "Blended milk with the respective fruit or flavoring syrup." },
      { name: "Sharja", price: 12.99, description: "Blended milk with the respective fruit or flavoring syrup." },
      { name: "Mango", price: 12.99, description: "Blended milk with the respective fruit or flavoring syrup." },
      { name: "Blueberry", price: 12.99, description: "Blended milk with the respective fruit or flavoring syrup." },
      { name: "Falooda", price: 15.99, description: "Blended milk with the respective fruit or flavoring syrup." },
    ],
  },
];
