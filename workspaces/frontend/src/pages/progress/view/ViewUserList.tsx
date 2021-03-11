import { useAuth0 } from '@auth0/auth0-react';
import { Fragment, useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useAlert } from 'react-alert';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import {
  Segment,
  Placeholder,
  Header,
  Button,
  Input,
  Divider,
  Icon,
  Confirm,
  Grid,
} from 'semantic-ui-react';
import dateformat from 'dateformat';
import SegmentPlaceholder from 'src/library/components/shared/SegmentPlaceholder';
import {
  BULI,
  CreateBULIDto,
  PatchBULIDto,
} from 'src/library/entities/uli/BookUserListItem';
import { PopulatedBookUserList } from 'src/library/entities/userList/BookUserList';
import { truncateString } from 'src/library/utilities/bookPropertyHelpers';
import { appRoutes } from 'src/main/routes';
import * as userListApi from 'src/library/api/backend/userLists';
import * as buliApi from 'src/library/api/backend/buli';
import { defaultErrorTimeout } from 'src/library/constants/alertOptions';
import BreadcrumbWrapper from 'src/library/components/layout/BreadcrumbWrapper';
import { BookReadingStatus } from 'src/library/types/BookReadingStatus';
import ViewUserListBooks from './ViewUserListBooks';
import { BookListItem } from 'src/library/entities/listItem/BookListItem';
import { ItemMatch } from 'src/library/types/ItemMatch';

type ViewUserListParams = { userListId: string };

const ViewUserList = () => {
  const auth = useAuth0();
  const alert = useAlert();
  const history = useHistory();
  const { userListId } = useParams<ViewUserListParams>();
  const [userList, setUserList] = useState<PopulatedBookUserList | null>(null);
  const [userListLoading, setUserListLoading] = useState(true);

  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionConfirmOpen, setDeletionConfirmOpen] = useState(false);

  const [visibleBuli, setVisibleBuli] = useState<BULI[]>([]);

  const [buliCreateLoading, setBuliCreateLoading] = useState<string | null>(
    null,
  );

  const [buliUpdateLoading, setBuliUpdateLoading] = useState<string | null>(
    null,
  );
  const [buliUpdates, setBuliUpdates] = useState<Record<string, PatchBULIDto>>(
    {},
  );

  const [noteUpdate, setNoteUpdate] = useState<string | null>(null); // set when loading user list
  const [noteUpdateLoading, setNoteUpdateLoading] = useState(false);

  const getUserListData = useCallback(async () => {
    setUserListLoading(true);
    try {
      const data = await userListApi.getFullUserList(auth, userListId);
      setUserList(data);
      setVisibleBuli(data.userListItems);
      setNoteUpdate(data.notes);

      const defaultBuliUpdates: Record<string, PatchBULIDto> = {};
      data.userListItems.forEach(
        ({ id, notes, status, owned }) =>
          (defaultBuliUpdates[id] = {
            notes,
            status,
            owned,
          }),
      );
      setBuliUpdates(defaultBuliUpdates);
    } catch (error) {
      alert.error(error.message, defaultErrorTimeout);
    } finally {
      setUserListLoading(false);
    }
  }, [setUserListLoading, auth, userListId, alert]);

  useEffect(() => {
    if (userList) {
      setVisibleBuli(userList.userListItems);
      setNoteUpdate(userList.notes);
      const itemUpdates: Record<string, PatchBULIDto> = {};
      userList.userListItems.forEach(
        ({ id, notes, status, owned }) =>
          (itemUpdates[id] = {
            notes,
            status,
            owned,
          }),
      );
      setBuliUpdates(itemUpdates);
    }
  }, [userList]);

  const handleUserListDeletion = useCallback(async () => {
    setDeletionConfirmOpen(false);
    setDeletionLoading(true);
    try {
      await userListApi.deleteUserList(auth, userListId);
      setDeletionLoading(false);
      history.push(appRoutes.progress.start.path);
    } catch (error) {
      alert.error(error.message, defaultErrorTimeout);
      setDeletionLoading(false);
    }
  }, [alert, auth, history, userListId]);

  const handleEditClick = useCallback(() => {
    if (
      userList &&
      userList.list &&
      auth.user &&
      auth.user.sub === userList.list.ownerId
    ) {
      history.push(appRoutes.lists.view.getDynamicPath!(userList.list.id));
    }
  }, [userList, auth, history]);

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setNoteUpdate(e.target.value),
    [setNoteUpdate],
  );

  const handleNoteSave = useCallback(async () => {
    setNoteUpdateLoading(true);
    try {
      const update = { notes: noteUpdate || '' };
      await userListApi.updateUserList(auth, userListId, update);
      setUserList({
        ...(userList as PopulatedBookUserList),
        notes: update.notes,
      });
    } catch (error) {
      alert.error(
        'There was an error updating your notes',
        defaultErrorTimeout,
      );
    } finally {
      setNoteUpdateLoading(false);
    }
  }, [userList, setNoteUpdateLoading, noteUpdate, auth, userListId, alert]);

  const handleBuliUpdateSave = useCallback(
    async (buliId: string, updates: PatchBULIDto) => {
      if (userList && updates) {
        setBuliUpdates({ ...buliUpdates, [buliId]: updates });
        setBuliUpdateLoading(buliId);
        const updatedIndex = userList.userListItems.findIndex(
          item => item.id === buliId,
        );
        try {
          await buliApi.updateBuli(auth, buliId, updates);
          const updatedItems = userList.userListItems;
          updatedItems[updatedIndex] = {
            ...updatedItems[updatedIndex],
            ...updates,
          };
          setUserList({
            ...(userList as PopulatedBookUserList),
            userListItems: updatedItems,
          });
        } catch (error) {
          setBuliUpdates({
            ...buliUpdates,
            [buliId]: userList.userListItems[updatedIndex],
          });
          alert.error(
            'There was an error updating the item',
            defaultErrorTimeout,
          );
        } finally {
          setBuliUpdateLoading(null);
        }
      }
    },
    [userList, buliUpdates, auth, alert],
  );

  const handleBuliCreate = useCallback(
    async (data: Partial<CreateBULIDto>) => {
      const { bookListItem, status, owned, notes } = data;
      if (
        userList &&
        bookListItem &&
        (!userList?.userListItems.some(
          item => item.bookListItem === bookListItem,
        ) ??
          false)
      ) {
        setBuliCreateLoading(bookListItem);
        try {
          const req: CreateBULIDto = {
            userList: userListId,
            bookListItem,
            status: status || BookReadingStatus.notStarted,
            owned: !!owned,
            notes,
          };
          const result = await buliApi.createBuli(auth, req);
          if (result) {
            const newBuliState = [...userList.userListItems, result];
            setUserList({ ...userList, userListItems: newBuliState });
          }
        } catch (error) {
          alert.error(
            'There was an error saving your progress',
            defaultErrorTimeout,
          );
        } finally {
          setBuliCreateLoading(null);
        }
      }
    },
    [userList, userListId, auth, alert],
  );

  useEffect(() => {
    if (userListId) {
      getUserListData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!userListId) {
    return <Redirect to={appRoutes.progress.start.path} />;
  } else if (userListLoading) {
    return (
      <Fragment>
        <Segment loading>
          <Placeholder>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder>
        </Segment>
      </Fragment>
    );
  } else if (userList) {
    const { list } = userList;
    const formatedUpdatedAt = dateformat(new Date(list.updatedAt), 'longDate');

    const hasEditListPermission = list.ownerId === auth.user.sub;

    const matchedItems: ItemMatch[] = (list.bookListItems as BookListItem[]).map(
      item => ({
        book: item,
        userItem:
          visibleBuli.find(buli => buli.bookListItem === item.id) || null,
      }),
    );
    return (
      <Fragment>
        <BreadcrumbWrapper breadcrumbs={appRoutes.progress.view.breadcrumbs!} />
        <Segment>
          {hasEditListPermission && (
            <div>
              <Button
                icon="edit"
                content="Edit list"
                floated="right"
                compact
                onClick={handleEditClick}
              />
            </div>
          )}
          <Header
            as="h1"
            content={list.title}
            subheader={truncateString(list.description, 150)}
          />
          <Grid columns={2} stackable>
            <Grid.Row>
              <Grid.Column>
                <Header sub>By</Header>
                <span>{list.ownerId}</span>
              </Grid.Column>
              <Grid.Column>
                <Header sub>Category</Header>
                <span>{list.category}</span>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Header sub>Last updated</Header>
                <span>{formatedUpdatedAt}</span>
              </Grid.Column>
              <Grid.Column>
                <Header sub>Personal note</Header>
                <Input
                  value={noteUpdate}
                  onChange={handleNoteChange}
                  action={
                    <Button
                      color={
                        noteUpdate !== userList.notes ? 'green' : undefined
                      }
                      compact
                      content="Save"
                      onClick={handleNoteSave}
                      loading={noteUpdateLoading}
                    />
                  }
                  disabled={noteUpdateLoading}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider horizontal>
            <Header as="h4">
              <Icon name="book" />
              Books
            </Header>
          </Divider>
          <ViewUserListBooks
            items={matchedItems}
            createLoading={buliCreateLoading}
            updateLoading={buliUpdateLoading}
            updates={buliUpdates}
            onUpdatesSave={handleBuliUpdateSave}
            onCreate={handleBuliCreate}
            onUpdateChange={(buliId: string, updates: PatchBULIDto) =>
              setBuliUpdates({ ...buliUpdates, [buliId]: updates })
            }
          />
          <Grid textAlign="center">
            <Grid.Column>
              <Button
                icon="close"
                content="Remove progress"
                compact
                negative
                onClick={() => setDeletionConfirmOpen(true)}
                loading={deletionLoading}
              />
            </Grid.Column>
          </Grid>
        </Segment>
        <Confirm
          open={deletionConfirmOpen}
          onCancel={() => setDeletionConfirmOpen(false)}
          onConfirm={handleUserListDeletion}
          cancelButton="Nevermind"
          confirmButton="Yes"
          content="Are you sure you want to remove your progress on this list?"
        />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <BreadcrumbWrapper breadcrumbs={appRoutes.progress.view.breadcrumbs!} />
      <SegmentPlaceholder
        iconName="search"
        text="That list progress could not be found"
        linkTo={appRoutes.progress.list.path}
        linkText="View lists"
      />
    </Fragment>
  );
};

export default ViewUserList;
