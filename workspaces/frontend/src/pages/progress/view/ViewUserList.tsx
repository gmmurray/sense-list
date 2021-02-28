import { useAuth0 } from '@auth0/auth0-react';
import { Fragment, useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useAlert } from 'react-alert';
import { Redirect, useParams } from 'react-router-dom';
import {
  Segment,
  Placeholder,
  Header,
  Popup,
  Button,
  List,
  Input,
  Divider,
  Icon,
} from 'semantic-ui-react';
import SegmentPlaceholder from 'src/library/components/shared/SegmentPlaceholder';
import { PopulatedBULI } from 'src/library/entities/uli/BookUserListItem';
import { PopulatedBookUserList } from 'src/library/entities/userList/BookUserList';
import { truncateString } from 'src/library/utilities/bookPropertyHelpers';
import { appRoutes } from 'src/main/routes';
import * as userListApi from 'src/library/api/backend/userLists';
import { defaultErrorTimeout } from 'src/library/constants/alertOptions';
import BreadcrumbWrapper from 'src/library/components/layout/BreadcrumbWrapper';

type ViewUserListParams = { userListId: string };

const ViewUserList = () => {
  const auth = useAuth0();
  const alert = useAlert();
  const { userListId } = useParams<ViewUserListParams>();
  const [userList, setUserList] = useState<PopulatedBookUserList | null>(null);
  const [userListLoading, setUserListLoading] = useState(true);

  const [isEdtingDetails, setIsEditingDetails] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionConfirmOpen, setDeletionConfirmOpen] = useState(false);

  const [visibleBuli, setVisibleBuli] = useState<PopulatedBULI[]>([]);

  const [buliLoading, setBuliLoading] = useState<string[]>([]);

  const [noteUpdate, setNoteUpdate] = useState<string | null>(null); // set when loading user list
  const [noteUpdateLoading, setNoteUpdateLoading] = useState(false);

  const getUserListData = useCallback(async () => {
    setUserListLoading(true);
    try {
      const data = await userListApi.getFullUserList(auth, userListId);
      setUserList(data);
      setNoteUpdate(data.notes);
    } catch (error) {
      alert.error(error.message, defaultErrorTimeout);
    } finally {
      setUserListLoading(false);
    }
  }, [setUserListLoading, auth, userListId, alert]);

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
      setNoteUpdate(update.notes);
    } catch (error) {
      alert.error(
        'There was an error updating your notes',
        defaultErrorTimeout,
      );
    } finally {
      setNoteUpdateLoading(false);
    }
  }, [
    userList,
    setNoteUpdateLoading,
    noteUpdate,
    setNoteUpdate,
    auth,
    userListId,
    alert,
  ]);

  useEffect(() => {
    if (userListId) {
      getUserListData();
    }
  }, []);

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
    const { list, userListItems } = userList;
    return (
      <Fragment>
        <BreadcrumbWrapper breadcrumbs={appRoutes.progress.view.breadcrumbs!} />
        <Segment>
          <Header
            as="h1"
            content={list.title}
            subheader={truncateString(list.description, 150)}
          />
          <Header sub>By</Header>
          <span>{list.ownerId}</span>
          <Header sub>Last updated</Header>
          <span>{list.updatedAt}</span>
          {/* <Popup trigger={<Button basic>Details</Button>}>
            <List>
              <List.Item>
                <List.Header>Description</List.Header>
                <List.Description>{list.description}</List.Description>
              </List.Item>
              <List.Item>
                <List.Header>Last updated</List.Header>
                <List.Description>{list.updatedAt}</List.Description>
              </List.Item>
            </List>
          </Popup> */}
          <Header sub>Personal note</Header>
          <Input
            value={noteUpdate}
            onChange={handleNoteChange}
            action={
              <Button
                color={noteUpdate !== userList.notes ? 'green' : undefined}
                compact
                content="Save"
                onClick={handleNoteSave}
                loading={noteUpdateLoading}
              />
            }
            disabled={noteUpdateLoading}
          />
          <Divider horizontal>
            <Header as="h4">
              <Icon name="book" />
              Books
            </Header>
          </Divider>
        </Segment>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <BreadcrumbWrapper breadcrumbs={appRoutes.progress.view.breadcrumbs!} />
      <SegmentPlaceholder
        iconName="search"
        text="That list progress could not be found"
        linkTo={appRoutes.progress.start.path}
        linkText="View lists"
      />
    </Fragment>
  );
};

export default ViewUserList;
