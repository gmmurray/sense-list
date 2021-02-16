import React, { useState } from 'react';
import { FC } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Checkbox } from 'semantic-ui-react';

export type WrappedCheckboxProps = {
  name: string;
  control: Control<any>;
  defaultValue: boolean;
  label: string;
  [key: string]: any;
};

const WrappedCheckbox: FC<WrappedCheckboxProps> = ({
  name,
  control,
  defaultValue,
  label,
  ...rest
}) => {
  const [checked, setChecked] = useState(false);
  const handleChange = (func: (newValue: boolean) => void, value: boolean) => {
    func(value);
    setChecked(value);
  };
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ onChange, value }) => (
        <Checkbox
          onChange={() => {
            handleChange(onChange, !checked);
          }}
          checked={value}
          label={label}
          {...rest}
        />
      )}
    />
  );
};

export default WrappedCheckbox;
