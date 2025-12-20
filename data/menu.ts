export interface MenuItem {
  name: string;
  price: number;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    name: "SOUP",
    items: [
      { name: "Nadan Mutton Soup", price: 11.99 },
      { name: "Nadan Chicken Soup", price: 10.99 },
      { name: "Sweetcorn Veg Soup", price: 8.99 },
      { name: "Sweetcorn Chicken Soup", price: 10.99 },
      { name: "Clear Veg Soup", price: 8.99 },
      { name: "Clear Chicken Soup", price: 10.99 },
    ],
  },
  {
    name: "STARTERS",
    items: [
      { name: "Beef dry fry (BDF)", price: 13.99 },
      { name: "Chicken 65", price: 12.99 },
      { name: "Kerala prawns fry", price: 14.99 },
      { name: "Squid rings", price: 12.99 },
      { name: "Dragon beef", price: 14.99 },
      { name: "Inji puli chicken", price: 14.99 },
      { name: "Mushroom 65", price: 11.99 },
      { name: "Gobi 65", price: 11.99 },
      { name: "Honey chilly potato", price: 10.99 },
      { name: "Kung pao paneer", price: 13.99 },
    ],
  },
  {
    name: "Idly & DOSA",
    items: [
      { name: "Idly (3pcs)", price: 10.99 },
      { name: "Podi idly", price: 11.99 },
      { name: "Vada (3pcs)", price: 10.99 },
      { name: "Plain dosa", price: 10.99 },
      { name: "Masala dosa", price: 14.99 },
      { name: "Podi masala dosa", price: 15.99 },
      { name: "Mysoor masala dosa", price: 16.99 },
      { name: "Chicken masala dosa", price: 17.99 },
      { name: "Paneer dosa", price: 16.99 },
      { name: "Egg dosa", price: 14.99 },
      { name: "Ghee roast", price: 14.99 },
      { name: "Ghee masala dosa", price: 15.99 },
      { name: "Cheese masala dosa", price: 17.99 },
      { name: "Uttappam", price: 13.99 },
      { name: "Kanjipuram masala dosa", price: 17.99 },
    ],
  },
  {
    name: "BREADS",
    items: [
      { name: "Kallappam (3pcs)", price: 6 },
      { name: "Palappam (3pcs)", price: 6 },
      { name: "Egg appam", price: 4 },
      { name: "Kerala parotta", price: 4 },
      { name: "Garlic parotta", price: 5 },
      { name: "Cheese parotta", price: 6 },
      { name: "Cheese & garlic parotta", price: 7 },
      { name: "Nool paratha", price: 5 },
      { name: "Puttu", price: 6 },
      { name: "Chappathi", price: 3 },
      { name: "Idiyappam (4pcs)", price: 8 },
    ],
  },
  {
    name: "Adipoli Special BIRYANI",
    items: [
      { name: "Chicken (bone in)", price: 17.99 },
      { name: "Beef", price: 18.99 },
      { name: "Goat (bone in)", price: 20.99 },
      { name: "Prawns", price: 21.99 },
      { name: "Fish (bone in)", price: 22.99 },
      { name: "Veg", price: 13.99 },
      { name: "Egg", price: 15.99 },
      { name: "Family pack chicken (bone in)", price: 59.99 },
      { name: "Family pack beef", price: 64.99 },
    ],
  },
  {
    name: "COMBO",
    items: [
      { name: "Kappa fish", price: 15.99 },
      { name: "Kappa biriyani beef", price: 16.99 },
      { name: "Paal kappa beef", price: 18.99 },
      { name: "Paal kappa fish", price: 17.99 },
      { name: "Kothu porotta chicken", price: 15.99 },
      { name: "Kothu porotta beef", price: 16.99 },
      { name: "Lamb kothu porotta", price: 17.99 },
      { name: "Nidhi chicken", price: 20.99 },
      { name: "Nidhi beef", price: 22.99 },
      { name: "Chilly porotta chicken", price: 16.99 },
      { name: "Chilly porotta beef", price: 17.99 },
      { name: "Chatti biriyani beef", price: 24.99 },
      { name: "Chatti biriyani chicken", price: 22.99 },
      { name: "Sea food chatti biriyani", price: 26.99 },
    ],
  },
  {
    name: "Kerala Meals (12pm to 3pm)",
    items: [
      { name: "Pothichoru", price: 20.99 },
      { name: "Chatti choru", price: 23.99 },
    ],
  },
  {
    name: "MAIN COURSE - VEG",
    items: [
      { name: "Paneer butter masala", price: 15.99 },
      { name: "Paneer kadai", price: 15.99 },
      { name: "Aloo gobi", price: 14.99 },
      { name: "Kadai Mushroom", price: 15.99 },
      { name: "Veg kuruma", price: 14.99 },
      { name: "Veg stew", price: 15.99 },
      { name: "Dal fry", price: 13.99 },
      { name: "Kadala curry", price: 14.99 },
      { name: "Channa masala", price: 14.99 },
      { name: "Green peas curry", price: 14.99 },
    ],
  },
  {
    name: "MAIN COURSE - EGG",
    items: [
      { name: "Egg kuruma", price: 15.99 },
      { name: "Egg masala", price: 15.99 },
      { name: "Masala omlet", price: 12.99 },
      { name: "Egg & peas fry", price: 13.99 },
    ],
  },
  {
    name: "MAIN COURSE - CHICKEN",
    items: [
      { name: "Chicken curry", price: 18.99 },
      { name: "Kanthari chicken masala", price: 19.99 },
      { name: "Neelgiri chicken chatti curry", price: 20.99 },
      { name: "Pepper chicken masala", price: 18.99 },
      { name: "Chicken roast", price: 20.99 },
      { name: "Chicken stew", price: 19.99 },
      { name: "Chicken kuruma", price: 18.99 },
      { name: "Butter chicken", price: 18.99 },
      { name: "Vizhinjam chicken fry (Bone-in) half", price: 16.99 },
      { name: "Vizhinjam chicken fry (Bone-in) full", price: 29.99 },
      { name: "Payroll chicken fry", price: 18.99 },
    ],
  },
  {
    name: "MAIN COURSE - BEEF",
    items: [
      { name: "Beef curry", price: 19.99 },
      { name: "Beef stew", price: 19.99 },
      { name: "Beef chatti curry", price: 21.99 },
      { name: "Kanthari beef masala", price: 20.99 },
      { name: "Beef coconut fry", price: 21.99 },
      { name: "Beef pollichathu", price: 22.99 },
      { name: "Beef roast", price: 20.99 },
      { name: "Beef pepper masala", price: 19.99 },
    ],
  },
  {
    name: "MAIN COURSE - MUTTON (bone in)",
    items: [
      { name: "Mutton curry", price: 22.99 },
      { name: "Mutton roast", price: 22.99 },
      { name: "Mutton kadai", price: 22.99 },
      { name: "Mutton stew", price: 22.99 },
      { name: "Mutton kanthari", price: 22.99 },
      { name: "Mutton chatti curry", price: 24.99 },
    ],
  },
  {
    name: "Seafood - FISH",
    items: [
      { name: "Meen shappu curry", price: 21.99 },
      { name: "Travankoor fish curry", price: 21.99 },
      { name: "Angamali fish mango curry", price: 22.99 },
      { name: "Fish molee", price: 22.99 },
      { name: "Fish nirvana", price: 24.99 },
      { name: "Meen pollichathu (Bone-in)", price: 26.99 },
    ],
  },
  {
    name: "Seafood - PRAWNS",
    items: [
      { name: "Prawns mango curry", price: 21.99 },
      { name: "Prawns moile", price: 22.99 },
      { name: "Prawns roast", price: 22.99 },
      { name: "Travankoor prawns curry", price: 21.99 },
      { name: "Prawns kanthari", price: 23.99 },
      { name: "Venad pal konju", price: 25.99 },
    ],
  },
  {
    name: "Seafood - SQUID",
    items: [
      { name: "Squid masala", price: 20.99 },
      { name: "Squid roast", price: 21.99 },
      { name: "Squid pepper fry", price: 21.99 },
      { name: "Peri peri kalamari", price: 22.99 },
    ],
  },
  {
    name: "INDO CHINESE - VEG",
    items: [
      { name: "Chilly paneer", price: 16.99 },
      { name: "Chilly mushroom", price: 16.99 },
      { name: "Chilly gobi", price: 16.99 },
      { name: "Gobi manchurian", price: 16.99 },
      { name: "Mushroom manchurian", price: 16.99 },
      { name: "Paneer manchurian", price: 16.99 },
    ],
  },
  {
    name: "INDO CHINESE - NON VEG",
    items: [
      { name: "Chilly chicken", price: 18.99 },
      { name: "Chicken manchurian", price: 18.99 },
      { name: "Garlic chicken", price: 18.99 },
      { name: "Ginger chicken", price: 18.99 },
      { name: "Chilly beef", price: 19.99 },
      { name: "Chilly prawns", price: 21.99 },
    ],
  },
  {
    name: "Fried RICE",
    items: [
      { name: "Veg fried rice", price: 15.99 },
      { name: "Chicken fried rice", price: 17.99 },
      { name: "Sea food fried rice", price: 19.99 },
      { name: "Mixed fried rice", price: 21.99 },
    ],
  },
  {
    name: "NOODLES",
    items: [
      { name: "Veg noodles", price: 16.99 },
      { name: "Chicken noodle", price: 18.99 },
      { name: "Seafood noodles", price: 20.99 },
      { name: "Mixed noodles", price: 22.99 },
    ],
  },
  {
    name: "SALAD",
    items: [
      { name: "Green Salad", price: 11.99 },
      { name: "Kerala Mix Salad", price: 12.99 },
    ],
  },
  {
    name: "Kids corner",
    items: [
      { name: "French fries", price: 7.99 },
      { name: "Onion rings", price: 6.99 },
      { name: "Chicken nuggets", price: 9.99 },
      { name: "Parotta burger", price: 11.99 },
      { name: "Chicken Momos", price: 10.99 },
    ],
  },
  {
    name: "Dessert",
    items: [
      { name: "Palada + ice-cream", price: 8.99 },
      { name: "Brownie + ice cream", price: 7.99 },
      { name: "Fruit salad + ice cream", price: 9.99 },
      { name: "Carrots halawa + ice-cream", price: 6.99 },
    ],
  },
  {
    name: "SIDES",
    items: [
      { name: "Biriyani rice", price: 10.99 },
      { name: "Plain rice", price: 6.99 },
      { name: "Ghee rice", price: 11.99 },
      { name: "Chutney (coconut & tomato)", price: 1.99 },
      { name: "Sambar", price: 7.99 },
      { name: "Pappad (2pcs)", price: 1.99 },
      { name: "Pickle", price: 0.99 },
      { name: "Boiled egg", price: 1.99 },
      { name: "Raitha", price: 3.99 },
    ],
  },
  {
    name: "SNACKS",
    items: [
      { name: "Puffs (chicken)", price: 4.99 },
      { name: "Puffs (egg)", price: 3.99 },
      { name: "Cutlet (chicken)", price: 4.99 },
      { name: "Cutlet (beef)", price: 5.99 },
      { name: "Roll (chicken)", price: 6.99 },
      { name: "Roll (beef)", price: 7.99 },
    ],
  },
  {
    name: "HOT DRINKS",
    items: [
      { name: "Tea", price: 3.99 },
      { name: "Coffee", price: 4.99 },
      { name: "Horlicks", price: 5.99 },
      { name: "Boost", price: 5.99 },
    ],
  },
  {
    name: "Cooldrinks",
    items: [
      { name: "Lime soda", price: 6.99 },
      { name: "Kanthari nellikka", price: 6.99 },
      { name: "Naruneedi", price: 6.99 },
      { name: "Milk Sarbath", price: 7.99 },
    ],
  },
  {
    name: "JUICE",
    items: [
      { name: "Pineapple", price: 10.99 },
      { name: "Carrot", price: 10.99 },
      { name: "Orange", price: 10.99 },
    ],
  },
  {
    name: "MILK SHAKE",
    items: [
      { name: "Strawberry", price: 12.99 },
      { name: "Chocolate", price: 12.99 },
      { name: "Sharja", price: 12.99 },
      { name: "Mango", price: 12.99 },
      { name: "Blueberry", price: 12.99 },
      { name: "Falooda", price: 15.99 },
    ],
  },
];
