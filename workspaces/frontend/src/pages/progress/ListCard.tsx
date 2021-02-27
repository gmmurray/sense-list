import React from 'react';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon } from 'semantic-ui-react';
import { BookList } from 'src/library/entities/list/BookList';
import { appRoutes } from 'src/main/routes';

type ListCardProps = {
  list: BookList;
};

const ListCard: FC<ListCardProps> = ({ list }) => {
  const { id, title, description, isPublic, category, bookListItems } = list;
  return (
    <Card
      raised
      fluid
      link
      as={Link}
      to={appRoutes.lists.view.getDynamicPath!(id)}
    >
      <Card.Content>
        <Card.Header>
          {title}{' '}
          <Icon
            name={isPublic ? 'lock open' : 'lock'}
            size="small"
            color="grey"
          />
        </Card.Header>
        <Card.Meta>{category}</Card.Meta>
        <Card.Description>{description}</Card.Description>
      </Card.Content>
      <Card.Content
        extra
      >{`${bookListItems.length} book(s) in list`}</Card.Content>
    </Card>
  );
};

export default ListCard;
