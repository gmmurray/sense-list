export function syncSearch<T extends Record<string, any>>(
  searchTerm: string,
  fields: string[],
  data: T[],
): T[] {
  if (!searchTerm) return data;

  const formattedSearchTerm = searchTerm.toLocaleLowerCase();

  return data.filter(item =>
    fields.some(
      field =>
        typeof field === 'string' &&
        field in item &&
        item[field].toLocaleLowerCase().includes(formattedSearchTerm),
    ),
  );
}
