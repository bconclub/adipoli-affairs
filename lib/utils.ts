// Utility function to format product names to title case
// First letter of each word capitalized, rest lowercase
export function formatProductName(name: string): string {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}









