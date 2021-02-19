export const truncateDescription = (str: string, num: number) =>
  str.length > num ? str.slice(0, num) + '...' : str;

export const combineAuthors = (authors: string[]): string =>
  authors.length > 1 ? authors.join(', ') : authors[0];
