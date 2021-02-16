import { useAuth0 } from '@auth0/auth0-react';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { useForm } from 'react-hook-form';
import { Link, Redirect, useParams } from 'react-router-dom';
import {
  Segment,
  Placeholder,
  Header,
  Button,
  Icon,
  Form,
  Message,
  Container,
  Divider,
} from 'semantic-ui-react';
import { getList, updateList } from 'src/library/api/backend/lists';
import WrappedCheckbox from 'src/library/components/form/WrappedCheckbox';
import WrappedTextInput from 'src/library/components/form/WrappedTextInput';
import { BookList } from 'src/library/entities/list/bookList';
import { appRoutes } from 'src/main/routes';
import { editListSchema, IEditListInputs } from './schema';

type ViewListParams = {
  listId: string;
};

const ViewList = () => {
  const auth = useAuth0();
  const alert = useAlert();
  const { listId } = useParams<ViewListParams>();
  const [list, setList] = useState<BookList | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [readOnly, setReadOnly] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { handleSubmit, errors, control, reset } = useForm<IEditListInputs>({
    resolver: yupResolver(editListSchema),
  });

  const getListData = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await getList(auth, listId);
      setList(data);
    } catch (error) {
      alert.error(error.message, { timeout: 15000 });
    } finally {
      setListLoading(false);
    }
  }, [setListLoading, setList, alert, auth, listId]);

  const onSubmit = useCallback(
    async (data: IEditListInputs) => {
      setUpdateLoading(true);
      setUpdateError(null);
      try {
        await updateList(auth, listId, data);
        await getListData();
        setReadOnly(true);
        alert.success('List successfully saved');
      } catch (error) {
        alert.error(error.message, { timeout: 15000 });
      } finally {
        setUpdateLoading(false);
      }
    },
    [getListData, setUpdateLoading, setUpdateError, alert, auth, listId],
  );

  const handleFormReset = useCallback(() => {
    reset();
    setReadOnly(true);
  }, [reset, setReadOnly]);

  useEffect(() => {
    if (listId) {
      getListData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!listId) {
    return <Redirect to={appRoutes.progress.start.path} />;
  }

  const canEdit = auth.user && auth.user.sub === list?.ownerId;
  return (
    <Fragment>
      {listLoading && (
        <Segment loading>
          <Placeholder>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder>
        </Segment>
      )}
      {!listLoading && !list && (
        <Segment placeholder>
          <Header icon>
            <Icon name="search" />
            That list could not be found
          </Header>
          <Button primary as={Link} to={appRoutes.home.index.path}>
            Return home
          </Button>
        </Segment>
      )}
      {!listLoading && list && (
        <Segment color={!readOnly ? 'green' : undefined}>
          {canEdit && (
            <div>
              <Button
                floated="right"
                toggle
                compact
                active={!readOnly}
                onClick={
                  readOnly ? () => setReadOnly(false) : () => handleFormReset()
                }
              >
                {readOnly ? 'Edit' : 'Cancel'}
              </Button>
              <br />
            </div>
          )}
          <Form
            size="big"
            onSubmit={handleSubmit(onSubmit)}
            error={!!updateError}
            loading={updateLoading}
          >
            <WrappedTextInput
              name="title"
              control={control}
              defaultValue={list.title}
              label="Title"
              placeholder="My reading list"
              error={errors.title?.message}
              readOnly={readOnly}
            />
            <WrappedTextInput
              name="category"
              control={control}
              defaultValue={list.category}
              label="Category"
              placeholder="Fantasy"
              error={errors.category?.message}
              readOnly={readOnly}
            />
            <WrappedTextInput
              name="description"
              control={control}
              defaultValue={list.description}
              label="Description"
              placeholder="The best way to read these books!"
              error={errors.description?.message}
              readOnly={readOnly}
            />
            <Form.Field error={errors.isPublic?.message}>
              <WrappedCheckbox
                name="isPublic"
                control={control}
                defaultValue={list.isPublic}
                label="Public"
                toggle
                readOnly={readOnly}
              />
            </Form.Field>
            {!readOnly && (
              <Button type="submit" primary>
                Save
              </Button>
            )}
            <Message error header="Error" content={updateError} />
          </Form>
          <Divider horizontal>
            <Header as="h4">
              <Icon name="book" />
              Books
            </Header>
          </Divider>
          {list.bookListItems.length === 0 && canEdit && (
            <Button icon="plus" primary content="Add a book" />
          )}
          {list.bookListItems.length === 0 && !canEdit && (
            <Container>
              The creator of this list hasn't added any books yet!
            </Container>
          )}
        </Segment>
      )}
    </Fragment>
  );
};

export default ViewList;
