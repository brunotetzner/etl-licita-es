export function limitNumberOfCaracters(
  text: string,
  limit: number = 200
): string {
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}
