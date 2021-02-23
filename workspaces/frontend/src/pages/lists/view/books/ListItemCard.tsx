import { FC } from 'react';
import { SortableElement } from 'react-sortable-hoc';
import { Item, Label, Button } from 'semantic-ui-react';
import { BookListItem } from 'src/library/entities/listItem/BookListItem';
import {
  combineAuthors,
  truncateDescription,
} from 'src/library/utilities/bookPropertyHelpers';
import { removeHTMLTags } from 'src/library/utilities/stringHelpers';

type ListItemCardProps = {
  item: BookListItem;
  onDelete: (item: { id: string; title: string; authors: string }) => void;
  hideImage?: boolean;
  canEdit: boolean;
};
type SortableListItemProps = {
  item: BookListItem;
  onDelete: (item: { id: string; title: string; authors: string }) => void;
  canEdit: boolean;
};

export const ListItemCard: FC<ListItemCardProps> = ({
  item,
  onDelete,
  hideImage,
  canEdit,
}) => {
  const {
    id,
    meta: { thumbnail_url, title, authors, description, pageCount },
  } = item;
  const combinedAuthors = combineAuthors(authors);
  const cleanedDescription = removeHTMLTags(description);
  const truncatedDescription = truncateDescription(cleanedDescription, 150);
  return (
    <Item as="div">
      {!hideImage && <Item.Image size="tiny" src={thumbnail_url} />}
      <Item.Content verticalAlign="top">
        <Item.Header as="h1">{title}</Item.Header>
        <Item.Meta>{combinedAuthors}</Item.Meta>
        <Item.Description>{truncatedDescription}</Item.Description>
        <Item.Extra>
          {canEdit && (
            <Button
              color="red"
              floated="right"
              icon="minus"
              compact
              onClick={() => onDelete({ id, title, authors: combinedAuthors })}
            />
          )}
          <Label>{`${pageCount} pages`}</Label>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

export const SortableListItem = SortableElement(
  ({ item, onDelete, canEdit }: SortableListItemProps) => {
    return (
      <ListItemCard
        item={item}
        onDelete={onDelete}
        hideImage={true}
        canEdit={canEdit}
      />
    );
  },
);
