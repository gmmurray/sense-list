type expressionType = (key: string) => boolean;

/**
 * Removes undefined fields from a given dto object.
 * Accepts an additional function to run against each key as
 * second parameter
 *
 * @param reference
 * @param additionalExpression
 */
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
