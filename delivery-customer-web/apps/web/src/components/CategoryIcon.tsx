import { categoryIconKey } from "../utils/categoryIcon";

// Color emoji use the device's built-in artwork; no external image requests.
const icons: Record<string, string> = {
  all: "🛍️", barber: "💈", canned: "🥫", coffee: "☕",
  dairy: "🥛", baking: "🌾", produce: "🍎", hygiene: "🧴",
  cleaning: "🧹", drinks: "🥤", snacks: "🍪",
  seafood: "🐟", meat: "🥩", eggs: "🥚", frozen: "🧊",
  spices: "🌿", oil: "🫙", baby: "🍼", pets: "🐾",
  food: "🍚", other: "🛒",
};

export function CategoryIcon({ name }: { name: string }) {
  return (
    <span className="category-icon" aria-hidden="true">
      {icons[categoryIconKey(name)] ?? icons.other}
    </span>
  );
}
