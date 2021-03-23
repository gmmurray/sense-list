import { Fragment, useCallback } from 'react';
import { FC } from 'react';
import { Progress } from 'semantic-ui-react';
import SegmentPlaceholder from 'src/library/components/shared/SegmentPlaceholder';
import {
  CreateBULIDto,
  PatchBULIDto,
} from 'src/library/entities/uli/BookUserListItem';
import { BookReadingStatus } from 'src/library/types/BookReadingStatus';
import { ItemMatch } from 'src/library/types/ItemMatch';
import {
  combineAuthors,
  truncateString,
} from 'src/library/utilities/bookPropertyHelpers';
import {
  getListOwnedProgressValue,
  getListReadingProgressValue,
  getListRatingProgressValue,
} from 'src/library/utilities/listProgress';
import { removeHTMLTags } from 'src/library/utilities/stringHelpers';
import BULICard from './BULICard';

type ViewUserListBooksProps = {
  items: ItemMatch[];
  createLoading: string | null;
  updateLoading: string | null;
  updates: Record<string, PatchBULIDto>;
  onUpdatesSave: (buliId: string, updates: PatchBULIDto) => Promise<void>;
  onUpdateChange: (buliId: string, updates: PatchBULIDto) => void;
  onCreate: (data: Partial<CreateBULIDto>) => Promise<void>;
};

const ViewUserListBooks: FC<ViewUserListBooksProps> = ({
  items,
  createLoading,
  updateLoading,
  updates,
  onUpdatesSave,
  onUpdateChange,
  onCreate,
}) => {
  const handleStatusChange = useCallback(
    (value, buliId: string) => {
      onUpdatesSave(buliId, { status: value as BookReadingStatus });
    },
    [onUpdatesSave],
  );

  const handleOwnedChange = useCallback(
    (value, buliId: string) => {
      onUpdatesSave(buliId, { owned: value });
    },
    [onUpdatesSave],
  );

  const handleRatingChange = useCallback(
    (value, buliId: string) => {
      onUpdatesSave(buliId, { rating: value });
    },
    [onUpdatesSave],
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, buliId: string) => {
      onUpdateChange(buliId, { notes: e.target.value });
    },
    [onUpdateChange],
  );

  const handleNotesSave = useCallback(
    (buliId: string, updates: PatchBULIDto) => {
      onUpdatesSave(buliId, updates);
    },
    [onUpdatesSave],
  );

  const userItems = items
    .filter(item => item.userItem !== null)
    .map(item => item.userItem!);
  const readingProgress = getListReadingProgressValue(userItems);
  const ownedProgress = getListOwnedProgressValue(userItems);
  const ratingProgress = getListRatingProgressValue(userItems);

  if (items.length === 0) {
    return (
      <SegmentPlaceholder
        text="This list does not have any books yet"
        iconName="search"
        hideButton
      />
    );
  }

  return (
    <Fragment>
      <Progress
        value={readingProgress}
        total={items.length}
        progress={readingProgress > 0 ? 'percent' : undefined}
        indicating={readingProgress > 0}
        label="Reading progress"
        precision={readingProgress > 0 ? 0 : undefined}
      />
      <Progress
        value={ownedProgress}
        total={items.length}
        progress={ownedProgress > 0 ? 'ratio' : undefined}
        indicating={ownedProgress > 0}
        label="Books owned"
      />
      <Progress
        value={ratingProgress}
        total={items.length}
        progress={ratingProgress > 0 ? 'ratio' : undefined}
        indicating={ratingProgress > 0}
        label="Books rated"
      />
      {items
        .sort((a, b) => a.book.ordinal - b.book.ordinal)
        .map(match => {
          const { book, userItem } = match;
          const {
            meta: { thumbnail_url, title, authors, description, pageCount },
          } = book;
          const combinedAuthors = combineAuthors(authors);
          const cleanedDescription = removeHTMLTags(description);
          const truncatedDescription = truncateString(cleanedDescription, 150);
          const showBookInfo = !!pageCount || truncatedDescription.length > 0;
          if (userItem) {
            const { id: userItemId, status, notes, owned, rating } = userItem;
            const {
              status: updatesStatus,
              notes: updatesNotes,
              owned: updatesOwned,
              rating: updatesRating,
            } = updates[userItemId];
            const isUpdating = updateLoading === userItemId;
            return (
              <BULICard
                key={`${userItemId}-card`}
                id={userItemId}
                status={status}
                notes={notes}
                owned={owned}
                rating={rating}
                updatesStatus={updatesStatus}
                updatesNotes={updatesNotes}
                updatesOwned={updatesOwned}
                updatesRating={updatesRating}
                onStatusChange={(e, { value }) =>
                  handleStatusChange(value, userItemId)
                }
                onNotesChange={(e: any) => handleNotesChange(e, userItemId)}
                onNotesSave={() =>
                  handleNotesSave(userItemId, {
                    notes: updates[userItemId].notes,
                  })
                }
                onOwnedChange={() =>
                  handleOwnedChange(!!!updates[userItemId].owned, userItem.id)
                }
                onRatingChange={(e, newRating) =>
                  handleRatingChange(newRating, userItemId)
                }
                isUpdating={isUpdating}
                bookId={book.id}
                thumbnail={thumbnail_url}
                title={title}
                authors={combinedAuthors}
                description={truncatedDescription}
                pageCount={pageCount}
                showBookInfo={showBookInfo}
                onBULICreate={() =>
                  onCreate({
                    bookListItem: book.id,
                    status: BookReadingStatus.notStarted,
                    owned: false,
                    notes: '',
                    rating: null,
                  })
                }
              />
            );
          } else {
            return (
              <BULICard
                key={`${book.id}-card`}
                isUpdating={false}
                bookId={book.id}
                thumbnail={thumbnail_url}
                title={title}
                authors={combinedAuthors}
                description={truncatedDescription}
                pageCount={pageCount}
                showBookInfo={showBookInfo}
                onBULICreate={() =>
                  onCreate({
                    bookListItem: book.id,
                    status: BookReadingStatus.notStarted,
                    owned: false,
                    notes: '',
                    rating: null,
                  })
                }
                isCreating={createLoading !== null}
              />
            );
          }
        })}
    </Fragment>
  );
};

export default ViewUserListBooks;
