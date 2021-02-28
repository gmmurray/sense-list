import React, { useCallback, useState } from 'react';
import { FC } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Card, Icon } from 'semantic-ui-react';
import { BookList } from 'src/library/entities/list/BookList';
import { CreateUserListDto } from 'src/library/entities/userList/UserList';
import { appRoutes } from 'src/main/routes';
import * as userListApi from 'src/library/api/backend/userLists';
import { useAuth0 } from '@auth0/auth0-react';
import { useAlert } from 'react-alert';
import { defaultErrorTimeout } from 'src/library/constants/alertOptions';

type ListCardProps = {
  list: BookList;
};

const ListCard: FC<ListCardProps> = ({ list }) => {
  const auth = useAuth0();
  const history = useHistory();
  const alert = useAlert();
  const { id, title, description, isPublic, category, bookListItems } = list;
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClick = useCallback(async () => {
    setIsLoading(true);
    try {
      const body = new CreateUserListDto(id, '');
      const result = await userListApi.createUserList(auth, body);
      if (result) {
        history.push(appRoutes.progress.view.getDynamicPath!(result.id));
      }
    } catch (error) {
      alert.error('There was an error starting that list', defaultErrorTimeout);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, history, auth, alert, id]);

  return (
    <Card raised fluid>
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
      <Card.Content extra>
        <Button.Group>
          <Button
            as={Link}
            to={appRoutes.lists.view.getDynamicPath!(id)}
            disabled={isLoading}
          >
            View
          </Button>
          <Button primary onClick={handleStartClick} loading={isLoading}>
            Start
          </Button>
        </Button.Group>
      </Card.Content>
    </Card>
  );
};

export default ListCard;
