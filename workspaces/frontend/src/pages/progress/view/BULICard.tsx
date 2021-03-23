import React, { useCallback } from 'react';
import { FC } from 'react';
import {
  Label,
  ButtonProps,
  Card,
  CardProps,
  CheckboxProps,
  DropdownProps,
  InputOnChangeData,
  Image,
  Grid,
  Header,
  Form,
  Input,
  Button,
  Checkbox,
  Rating,
  RatingProps,
} from 'semantic-ui-react';
import {
  BookReadingStatus,
  bookReadingStatusSelectOptions,
} from 'src/library/types/BookReadingStatus';
import BookInfoPopup from './BookInfoPopup';

type BULICardProps = {
  id?: string;
  status?: BookReadingStatus;
  updatesStatus?: BookReadingStatus;
  onStatusChange?: (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => void;
  notes?: string;
  updatesNotes?: string;
  onNotesChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => void;
  onNotesSave?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    data: ButtonProps,
  ) => void;
  owned?: boolean;
  updatesOwned?: boolean;
  onOwnedChange?: (
    event: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps,
  ) => void;
  rating?: number | null;
  updatesRating?: number | null;
  onRatingChange?: (event: React.SyntheticEvent, data: number) => void;
  isUpdating: boolean;
  bookId: string;
  thumbnail: string;
  title: string;
  authors: string;
  description: string;
  pageCount?: number;
  showBookInfo: boolean;
  onBULICreate: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    data: ButtonProps,
  ) => void;
  isCreating?: boolean;
};

const BULICard: FC<BULICardProps> = ({
  id,
  status,
  updatesStatus,
  onStatusChange,
  notes,
  updatesNotes,
  onNotesChange,
  onNotesSave,
  updatesOwned,
  onOwnedChange,
  updatesRating,
  onRatingChange,
  isUpdating,
  bookId,
  thumbnail,
  title,
  authors,
  description,
  pageCount,
  showBookInfo,
  onBULICreate,
  isCreating,
}) => {
  const handleRatingChange = useCallback(
    (e: React.SyntheticEvent, { rating = 0 }: RatingProps) => {
      if (onRatingChange !== undefined) {
        const parsedRating =
          typeof rating === 'string' ? parseInt(rating) : rating;
        onRatingChange(e, parsedRating);
      }
    },
    [onRatingChange],
  );

  const bookOnly = !!!id;
  let cardColor: CardProps['color'];
  if (bookOnly) cardColor = 'grey';
  else {
    switch (status) {
      case BookReadingStatus.completed:
        cardColor = 'green';
        break;
      case BookReadingStatus.inProgress:
        cardColor = 'blue';
        break;
      default:
        cardColor = 'grey';
        break;
    }
  }

  const notesButtonColor =
    !isUpdating && updatesNotes !== notes ? 'green' : undefined;
  return (
    <Card key={bookOnly ? bookId : id} fluid color={cardColor} raised>
      <Card.Content>
        {bookOnly && (
          <Label
            color="blue"
            ribbon
            content="New book"
            style={{ marginBottom: '0.5rem' }}
          />
        )}
        <Image floated="right" size="mini" src={thumbnail} />
        <Card.Header>{title}</Card.Header>
        <Card.Meta>{authors}</Card.Meta>
        {showBookInfo && (
          <BookInfoPopup description={description} pageCount={pageCount} />
        )}
        <Grid columns="two" stackable padded>
          <Grid.Row>
            <Grid.Column>
              <Header sub content="Status" />
              <Form.Select
                disabled={isUpdating || bookOnly}
                fluid
                value={updatesStatus}
                options={bookReadingStatusSelectOptions}
                onChange={onStatusChange}
              />
            </Grid.Column>
            <Grid.Column>
              <Header sub content="Notes" />
              <Input
                value={updatesNotes}
                onChange={onNotesChange}
                disabled={isUpdating || bookOnly}
                action={
                  <Button
                    color={notesButtonColor}
                    compact
                    content="Save"
                    onClick={onNotesSave}
                  />
                }
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Header sub content="Book ownership" />
              <Checkbox
                disabled={isUpdating || bookOnly}
                label="I have this book"
                checked={updatesOwned}
                onChange={onOwnedChange}
              />
            </Grid.Column>
            <Grid.Column>
              <Header sub content="Rating" />
              <Rating
                disabled={isUpdating || bookOnly}
                clearable
                maxRating={5}
                rating={updatesRating || 0}
                onRate={handleRatingChange}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Card.Content>
      {bookOnly && (
        <Card.Content extra>
          <Button
            onClick={onBULICreate}
            disabled={isCreating}
            icon="add"
            content="Start"
          />
        </Card.Content>
      )}
    </Card>
  );
};

export default BULICard;
