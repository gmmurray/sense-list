import React from 'react';
import { FC } from 'react';
import { Button, Header, Icon, Item, Menu, Segment } from 'semantic-ui-react';
import { BookListItem } from 'src/library/entities/listItem/BookListItem';
import { ListItemOrdinalUpdate } from 'src/library/entities/listItem/ListItem';
import { onSortEndParams } from 'src/library/types/reactSortableHoc';
import { ListItemCard, SortableListItem } from './ListItemCard';
import { ListItemCardGroup, SortableListItems } from './ListItemCardGroup';

type ViewListBooksProps = {
  items: BookListItem[] | string[];
  ordinalChanges: ListItemOrdinalUpdate[];
  canEdit: boolean;
  listLoading: boolean;
  deleteLoading: boolean;
  changesLoading: boolean;
  active: boolean;
  onModalOpen: () => void;
  onActiveToggle: () => void;
  onDelete: (item: { id: string; title: string; authors: string }) => void;
  onSortEnd: (params: onSortEndParams) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
};

const ViewListBooks: FC<ViewListBooksProps> = ({
  items,
  ordinalChanges,
  canEdit,
  listLoading,
  deleteLoading,
  changesLoading,
  active,
  onModalOpen,
  onActiveToggle,
  onDelete,
  onSortEnd,
  onSave,
  onReset,
}) => {
  if (items.length === 0) {
    return (
      <Segment placeholder>
        <Header icon>
          <Icon name="search" />
          This list does not have any books yet.
        </Header>
        {canEdit && (
          <Button
            icon="plus"
            primary
            content="Add a book"
            onClick={onModalOpen}
          />
        )}
      </Segment>
    );
  }

  return (
    <Segment
      loading={listLoading || deleteLoading || changesLoading}
      as={Item.Group}
      color={active ? 'green' : undefined}
      divided
    >
      {canEdit && (
        <Menu stackable secondary>
          <Menu.Item position="left">
            {active ? (
              <Button
                icon="checkmark"
                content="Save"
                compact
                color="green"
                onClick={onSave}
                disabled={!!!ordinalChanges.length}
              />
            ) : (
              <Button
                icon="plus"
                content="Add a book"
                compact
                primary
                onClick={onModalOpen}
              />
            )}
          </Menu.Item>
          <Menu.Item position="right">
            {active ? (
              <Button
                icon="cancel"
                content="Cancel"
                compact
                onClick={onReset}
              />
            ) : (
              <Button
                icon="edit"
                content="Edit order"
                compact
                onClick={onActiveToggle}
              />
            )}
          </Menu.Item>
        </Menu>
      )}
      {active ? (
        <SortableListItems onSortEnd={onSortEnd}>
          {(items as BookListItem[])
            .sort((a, b) => a.ordinal - b.ordinal)
            .map((item, index) => (
              <SortableListItem
                key={index}
                item={item}
                index={index}
                onDelete={onDelete}
                canEdit={canEdit}
              />
            ))}
        </SortableListItems>
      ) : (
        <ListItemCardGroup>
          {(items as BookListItem[])
            .sort((a, b) => a.ordinal - b.ordinal)
            .map((item, index) => (
              <ListItemCard
                key={index}
                item={item}
                onDelete={onDelete}
                canEdit={canEdit}
              />
            ))}
        </ListItemCardGroup>
      )}
    </Segment>
  );
};

export default ViewListBooks;
