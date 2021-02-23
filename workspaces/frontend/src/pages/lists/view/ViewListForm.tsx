import React from 'react';
import { Fragment } from 'react';
import { FC } from 'react';
import { Control, DeepMap, FieldError } from 'react-hook-form';
import { Button, Form, Message } from 'semantic-ui-react';
import WrappedCheckbox from 'src/library/components/form/WrappedCheckbox';
import WrappedTextInput from 'src/library/components/form/WrappedTextInput';
import { BookList } from 'src/library/entities/list/bookList';
import { IEditListInputs } from './schema';

type ViewListFormProps = {
  list: BookList;
  active: boolean;
  loading: boolean;
  error: string | null;
  formErrors: DeepMap<IEditListInputs, FieldError>;
  formControl: Control<IEditListInputs>;
  onSubmit: any;
  onReset: any;
};

const ViewListForm: FC<ViewListFormProps> = ({
  list,
  active,
  loading,
  error,
  formErrors,
  formControl,
  onSubmit,
  onReset,
}) => {
  return (
    <Form size="big" onSubmit={onSubmit} error={!!error} loading={loading}>
      <WrappedTextInput
        name="title"
        control={formControl}
        defaultValue={list.title}
        label="Title"
        placeholder="My reading list"
        error={formErrors.title?.message}
        readOnly={!active}
      />
      <WrappedTextInput
        name="category"
        control={formControl}
        defaultValue={list.category}
        label="Category"
        placeholder="Fantasy"
        error={formErrors.category?.message}
        readOnly={!active}
      />
      <WrappedTextInput
        name="description"
        control={formControl}
        defaultValue={list.description}
        label="Description"
        placeholder="The best way to read these books!"
        error={formErrors.description?.message}
        readOnly={!active}
      />
      <Form.Field error={formErrors.isPublic?.message}>
        <WrappedCheckbox
          name="isPublic"
          control={formControl}
          defaultValue={list.isPublic}
          label="Public"
          toggle
          readOnly={!active}
          disabled={!active}
        />
      </Form.Field>
      {active && (
        <Fragment>
          <Button type="submit" icon="check" content="Save" color="green" />
          <Button onClick={onReset}>Reset</Button>
        </Fragment>
      )}
      <Message error header="Error" content={error} />
    </Form>
  );
};

export default ViewListForm;
