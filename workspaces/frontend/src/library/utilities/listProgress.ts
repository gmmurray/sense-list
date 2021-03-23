import { BULI } from '../entities/uli/BookUserListItem';
import {
  BookReadingStatus,
  bookReadingStatusWithValues,
} from '../types/BookReadingStatus';

export const getListReadingProgressValue = (items: BULI[]): number => {
  let readingProgress = 0;
  (items as BULI[]).forEach(item => {
    if (item.status === BookReadingStatus.completed) readingProgress += 1;
    else if (item.status === BookReadingStatus.inProgress)
      readingProgress += 0.5;
  });
  return readingProgress;
};

export const getListOwnedProgressValue = (items: BULI[]): number => {
  return items.filter(item => item && item.owned).length;
};

export const getListRatingProgressValue = (items: BULI[]): number =>
  items.filter(item => item && item.rating).length;

export const getListReadingProgressText = (
  progressValue: number,
  total: number,
): string => {
  let progressText: string;
  if (progressValue === 0)
    progressText = bookReadingStatusWithValues.notStarted.text;
  else if (progressValue === total)
    progressText = bookReadingStatusWithValues.completed.text;
  else progressText = bookReadingStatusWithValues.inProgress.text;

  return progressText;
};
