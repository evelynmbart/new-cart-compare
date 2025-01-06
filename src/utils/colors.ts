export function getItemColor(itemName: string): string {
  // Generate a consistent hash from the string
  let hash = 0;
  for (let i = 0; i < itemName.length; i++) {
    hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate pastel color components
  const h = hash % 360;
  const s = 50 + (hash % 30); // 50-80% saturation
  const l = 85 + (hash % 10); // 85-95% lightness

  return `hsla(${h}, ${s}%, ${l}%, 0.2)`;
}
