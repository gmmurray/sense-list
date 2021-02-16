export enum ListType {
  Book,
}

export const getListTypeOptions = (): { text: string; value: number }[] => {
  const result = [];
  for (let n in ListType) {
    if (typeof ListType[n] === 'string')
      result.push({ text: ListType[n], value: parseInt(n) });
  }
  return result;
};
