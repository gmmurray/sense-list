export const removeHTMLTags = (originalString: string): string =>
  originalString.replace(/(<([^>]+)>)/gi, '');
