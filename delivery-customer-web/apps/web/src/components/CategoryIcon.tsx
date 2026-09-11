type CategoryRule = {
  icon: string;
  keywords: readonly string[];
};

const categoryRules: readonly CategoryRule[] = [
  { icon: "💈", keywords: ["barber", "salon", "haircut"] },
  { icon: "🥫", keywords: ["canned", "tinned"] },
  { icon: "☕", keywords: ["coffee", "tea", "malt"] },
  { icon: "🥛", keywords: ["dairy", "milk", "cheese", "yogurt"] },
  { icon: "🌾", keywords: ["flour", "baking", "bakery", "sugar"] },
  { icon: "🍎", keywords: ["fruit", "produce"] },
  { icon: "🥬", keywords: ["vegetable", "vegetables"] },
  { icon: "🧴", keywords: ["hygiene", "shampoo", "soap", "toiletries"] },
  { icon: "🧹", keywords: ["cleaning", "detergent", "household"] },
  { icon: "🥤", keywords: ["beverage", "beverages", "drink", "drinks", "juice"] },
  { icon: "🍪", keywords: ["snack", "snacks", "biscuit", "biscuits", "cookies"] },
  { icon: "🍫", keywords: ["chocolate", "candy", "confectionery", "sweets"] },
  { icon: "🧊", keywords: ["frozen", "ice cream"] },
  { icon: "🐟", keywords: ["seafood", "fish", "prawn", "prawns"] },
  { icon: "🍗", keywords: ["chicken", "poultry"] },
  { icon: "🥩", keywords: ["meat", "beef", "mutton", "pork"] },
  { icon: "🥚", keywords: ["egg", "eggs"] },
  { icon: "🌿", keywords: ["spice", "spices", "herbs", "seasoning"] },
  { icon: "🫙", keywords: ["oil", "ghee"] },
  { icon: "🍅", keywords: ["sauce", "sauces", "ketchup", "condiments"] },
  { icon: "🍼", keywords: ["baby", "infant", "diapers"] },
  { icon: "🐾", keywords: ["pet", "pets", "cat", "dog"] },
  { icon: "🍜", keywords: ["noodle", "noodles", "pasta", "vermicelli"] },
  { icon: "🍚", keywords: ["rice", "grain", "grains", "cereal"] },
  { icon: "🍞", keywords: ["bread", "toast"] },
  { icon: "🥜", keywords: ["nuts", "peanuts", "beans", "pulses"] },
  { icon: "🧻", keywords: ["tissue", "tissues", "paper", "napkins"] },
  { icon: "🍽️", keywords: ["kitchen", "utensils", "tableware"] },
  { icon: "📦", keywords: ["packaging", "disposable", "plastic"] },
  { icon: "🍱", keywords: ["food", "groceries", "grocery"] },
];

const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

function getCategoryIcon(name: string): string {
  const normalized = normalizeName(name);

  if (normalized === "all") return "🛍️";

  const searchableName = ` ${normalized} `;

  const rule = categoryRules.find(({ keywords }) =>
    keywords.some((keyword) =>
      searchableName.includes(` ${keyword} `),
    ),
  );

  return rule?.icon ?? "🛒";
}

export function CategoryIcon({ name }: { name: string }) {
  return (
    <span className="category-icon" aria-hidden="true">
      {getCategoryIcon(name)}
    </span>
  );
}