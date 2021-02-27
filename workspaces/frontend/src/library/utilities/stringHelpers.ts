export const removeHTMLTags = (originalString: string): string =>
  originalString ? originalString.replace(/(<([^>]+)>)/gi, '') : '';
