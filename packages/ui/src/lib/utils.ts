// Priority icon mapping (emoji to class name)
export const priorityIconClasses: Record<string, string> = {
  // Color circles
  '🟢': 'Green',
  '🟡': 'Yellow',
  '🟠': 'Orange',
  '🔴': 'Red',
  '🔵': 'Blue',
  '🟣': 'Purple',
  '⚪': 'White',
  '⚫': 'Black',
  // Hearts
  '❤️': 'Red',
  '🧡': 'Orange',
  '💛': 'Yellow',
  '💚': 'Green',
  '💙': 'Blue',
  '💜': 'Purple',
  '🤍': 'White',
  '🖤': 'Black',
  // Squares
  '🟥': 'Red',
  '🟧': 'Orange',
  '🟨': 'Yellow',
  '🟩': 'Green',
  '🟦': 'Blue',
  '🟪': 'Purple',
  // Diamonds
  '🔶': 'Orange',
  '🔷': 'Blue',
  '🔸': 'Orange',
  '🔹': 'Blue',
  // Stars
  '⭐': 'Yellow',
  '🌟': 'Yellow',
  // Flags
  '🚩': 'Red',
  '🏴': 'Black',
  '🏳️': 'White',
  // Alert symbols
  '⚠️': 'Yellow',
  '🔥': 'Orange',
  '💥': 'Red',
  '⚡': 'Yellow',
  // Arrows
  '⬆️': 'Red',
  '➡️': 'Blue',
  '⬇️': 'Green',
  // Exclamation/Question
  '❗': 'Red',
  '❓': 'Blue',
  '❕': 'Red',
  '❔': 'Blue',
};

// Get first emoji from text
export function getFirstEmoji(text: string): string {
  const matches = text.match(/[^\w\s]+/);
  if (!matches) return '';
  return [...matches[0]][0] || '';
}

// Clean non-alphanumeric characters from text
export function clean(text: string): string {
  return text.replace(/[^\w\s]+/g, '').trim();
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
