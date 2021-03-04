export enum BookReadingStatus {
  notStarted = 'NOT_STARTED',
  inProgress = 'IN_PROGRESS',
  completed = 'COMPLETED',
}

export type statusOption = {
  text: string;
  value: BookReadingStatus;
};

export const bookReadingStatusWithValues: { [key: string]: statusOption } = {
  notStarted: {
    text: 'Not started',
    value: BookReadingStatus.notStarted,
  },
  inProgress: {
    text: 'In progress',
    value: BookReadingStatus.inProgress,
  },
  completed: {
    text: 'Completed',
    value: BookReadingStatus.completed,
  },
};

export const bookReadingStatusSelectOptions = Object.keys(
  bookReadingStatusWithValues,
).map(status => ({
  text: bookReadingStatusWithValues[status].text,
  value: bookReadingStatusWithValues[status].value,
}));
