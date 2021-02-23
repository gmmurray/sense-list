import { FC } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { Item } from 'semantic-ui-react';

type ListItemCardGroupProps = { children: React.ReactNode };
type SortableListItemsProps = { children: React.ReactNode };

export const ListItemCardGroup: FC<ListItemCardGroupProps> = ({ children }) => (
  <Item.Group divided>{children}</Item.Group>
);

export const SortableListItems = SortableContainer(
  ({ children }: SortableListItemsProps) => {
    return <ListItemCardGroup>{children}</ListItemCardGroup>;
  },
);
