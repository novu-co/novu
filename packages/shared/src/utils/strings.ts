export function slugify(text: string) {
  return text
    .toString() // Ensure the input is a string
    .toLowerCase() // Convert to lowercase
    .trim() // Remove whitespace from both ends
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove all non-word characters except hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single hyphen
}
