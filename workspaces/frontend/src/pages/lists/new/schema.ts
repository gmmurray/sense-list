import { ListType } from 'src/library/types/ListType';
import * as yup from 'yup';

export interface INewListInputs {
  title: string;
  description: string;
  category: string;
  type: ListType;
  isPublic: boolean;
}

export const newListSchema = yup.object().shape({
  title: yup.string().required('Please give your list a title'),
  description: yup.string().required('Please give your list a description'),
  category: yup.string().required('Please give your list a category'),
  type: yup
    .mixed()
    .oneOf(Object.values(ListType))
    .required("Please select your list's type"),
  isPublic: yup.bool().required(),
});
