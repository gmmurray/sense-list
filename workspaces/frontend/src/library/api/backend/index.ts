import { Auth0ContextInterface } from '@auth0/auth0-react';
import axios, { AxiosRequestConfig } from 'axios';
import { getToken } from '../auth0/getToken';

export type authenticatedRequestParams = {
  authContext: Auth0ContextInterface;
  method: AxiosRequestConfig['method'];
  url: AxiosRequestConfig['url'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
};

const axiosClient = axios.create({ timeout: 5000 });

export const authenticatedRequest = async ({
  authContext,
  method,
  url,
  data,
  params,
}: authenticatedRequestParams): Promise<any> => {
  try {
    const token = await getToken(authContext);
    const res = await axiosClient({
      url,
      method,
      data,
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error) {
    if (error.response && error.response.data.message) {
      throw new Error(error.response.statusText);
    } else {
      throw error;
    }
  }
};
