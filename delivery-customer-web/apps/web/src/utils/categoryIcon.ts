// Specific categories come first so "canned food" does not become generic food.
const categoryRules: ReadonlyArray<readonly [RegExp, string]> = [
  [/\b(all|semua)\b/, 'all'],
  [/\b(barber|salon|hair|shav\w*|razor\w*|gunting)\b/, 'barber'],
  [/\b(canned|tinned|tin food|makanan tin)\b/, 'canned'],
  [/\b(coffee|tea|malt|cocoa|kopi|teh)\b/, 'coffee'],
  [/\b(dairy|milk|cheese|butter|yog\w*|susu|tenusu)\b/, 'dairy'],
  [/\b(flour|sugar|baking|tepung|gula)\b/, 'baking'],
  [/\b(fresh produce|produce|fruit\w*|vegetable\w*|buah|sayur\w*)\b/, 'produce'],
  [/\b(hygiene|personal|beauty|care|health|toiletr\w*|soap|sanit\w*)\b/, 'hygiene'],
  [/\b(clean\w*|house\w*|laundry|detergent\w*)\b/, 'cleaning'],
  [/\b(drink\w*|beverage\w*|water|juice|minuman|air)\b/, 'drinks'],
  [/\b(snack\w*|biscuit\w*|sweet\w*|cookie\w*|chocolate\w*|confection\w*)\b/, 'snacks'],
  [/\b(seafood|fish|prawn\w*|ikan)\b/, 'seafood'],
  [/\b(meat|chicken|beef|poultry|ayam|daging)\b/, 'meat'],
  [/\b(egg\w*|telur)\b/, 'eggs'],
  [/\b(frozen|ice cream|beku)\b/, 'frozen'],
  [/\b(spice\w*|herb\w*|seasoning\w*|rempah)\b/, 'spices'],
  [/\b(oil|sauce\w*|condiment\w*|minyak|sos)\b/, 'oil'],
  [/\b(baby|infant|bayi)\b/, 'baby'],
  [/\b(pet\w*|animal\w*)\b/, 'pets'],
  [/\b(food|grocery|groceries|rice|noodle\w*|makanan|beras)\b/, 'food'],
];

export function categoryIconKey(name: string): string {
  const normalized = name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return categoryRules.find(([pattern]) => pattern.test(normalized))?.[1] ?? 'other';
}
