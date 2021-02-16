import React from 'react';
import { FC } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Form, Select } from 'semantic-ui-react';

export type WrappedSelectProps = {
  name: string;
  control: Control<any>;
  defaultValue?: string | number;
  label: string;
  error?: string;
  options: { text: string; value: string | number }[];
  [key: string]: any;
};

const WrappedSelect: FC<WrappedSelectProps> = ({
  name,
  control,
  defaultValue,
  label,
  error,
  options,
  ...rest
}) => (
  <Controller
    name={name}
    control={control}
    defaultValue={defaultValue}
    render={({ onChange, value }) => (
      <Form.Input
        control={Select}
        options={options}
        label={label}
        error={error}
        onChange={onChange}
        value={value}
        {...rest}
      />
    )}
  />
);

export default WrappedSelect;
