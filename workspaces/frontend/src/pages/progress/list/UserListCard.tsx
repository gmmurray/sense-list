import dateFormat from 'dateformat';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Grid, Header, Label, Progress } from 'semantic-ui-react';
import { BookList } from 'src/library/entities/list/BookList';
import { BULI } from 'src/library/entities/uli/BookUserListItem';
import { BookUserList } from 'src/library/entities/userList/BookUserList';
import {
  getListReadingProgressText,
  getListReadingProgressValue,
} from 'src/library/utilities/listProgress';
import { appRoutes } from 'src/main/routes';

type UserListCardProps = {
  userList: BookUserList;
};

const UserListCard: FC<UserListCardProps> = ({ userList }) => {
  const {
    id: userListId,
    list,
    userId,
    userListItems,
    updatedAt: listUpdatedAt,
  } = userList;
  const {
    id: listId,
    title,
    category,
    bookListItems,
    ownerId,
  } = list as BookList;

  const isOwner = userId === ownerId;
  const readingProgress = getListReadingProgressValue(userListItems as BULI[]);
  const progressText = getListReadingProgressText(
    readingProgress,
    bookListItems.length,
  );
  const latestProgressDate = (userListItems as BULI[]).reduce((a, b) =>
    new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b,
  ).updatedAt;
  const formattedLastProgress = dateFormat(latestProgressDate, 'longDate');
  const formattedListUpdated = dateFormat(listUpdatedAt, 'longDate');

  return (
    <Card raised fluid>
      <Card.Content>
        <Label
          icon={isOwner ? 'user circle' : 'lock open'}
          color={isOwner ? 'blue' : undefined}
          ribbon
          content={isOwner ? 'My list' : 'Public list'}
          style={{ marginBottom: '0.5rem' }}
          as={Link}
          to={appRoutes.lists.view.getDynamicPath!(listId)}
        />
        <Card.Header>{title}</Card.Header>
        <Card.Meta>{category}</Card.Meta>
        <Card.Description>
          <Grid columns="two" stackable padded>
            <Grid.Column width="fourteen">
              <Progress
                value={readingProgress}
                total={bookListItems.length}
                progress={readingProgress > 0 ? 'percent' : undefined}
                indicating={readingProgress > 0}
                label={progressText}
                precision={readingProgress > 0 ? 0 : undefined}
              />
            </Grid.Column>
            <Grid.Column width="two">
              <Header sub content="Books" />
              {bookListItems.length}
            </Grid.Column>
          </Grid>
          <Grid columns="two" padded>
            <Grid.Column>
              <Header sub content="Last progress" />
              {formattedLastProgress}
            </Grid.Column>
            <Grid.Column>
              <Header sub content="List updated" />
              {formattedListUpdated}
            </Grid.Column>
          </Grid>
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Grid>
          <Grid.Column textAlign="center">
            <Button
              as={Link}
              to={appRoutes.progress.view.getDynamicPath!(userListId)}
              content="View"
            />
          </Grid.Column>
        </Grid>
      </Card.Content>
    </Card>
  );
};

export default UserListCard;
