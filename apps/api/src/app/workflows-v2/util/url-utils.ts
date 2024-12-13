export function isValidUrlForActionButton(url: string): boolean {
  const fullUrlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
  const partialPathPattern = /^(\/[^\s]*)?$/;

  return fullUrlPattern.test(url) || partialPathPattern.test(url);
}
