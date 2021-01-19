type expressionType = (key: string) => boolean;

export function cleanDtoFields<T>(
  reference: T,
  additionalExpression?: expressionType,
) {
  return {
    ...Object.keys(reference)
      .filter(
        (key: string) =>
          reference[key] !== undefined &&
          (additionalExpression ? additionalExpression(key) : true),
      )
      .reduce((obj, key) => {
        obj[key] = reference[key];
        return obj;
      }, {}),
  };
}
