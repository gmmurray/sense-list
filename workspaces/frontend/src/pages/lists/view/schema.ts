import * as yup from 'yup';

export interface IEditListInputs {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
}

export const editListSchema = yup.object().shape({
  title: yup.string().required('Please give your list a title'),
  description: yup.string().required('Please give your list a description'),
  category: yup.string().required('Please give your list a category'),
  isPublic: yup.bool().required(),
});
