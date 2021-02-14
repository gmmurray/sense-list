import { Auth0ContextInterface } from '@auth0/auth0-react';
import axios, { AxiosRequestConfig } from 'axios';
import { getToken } from '../auth0/getToken';

export type authenticatedRequestParams = {
  authContext: Auth0ContextInterface;
  method: AxiosRequestConfig['method'];
  url: AxiosRequestConfig['url'];
  data?: AxiosRequestConfig['data'];
};

const axiosClient = axios.create({ timeout: 1000 });

export const authenticatedRequest = async ({
  authContext,
  method,
  url,
  data,
}: authenticatedRequestParams): Promise<any> => {
  try {
    const token = await getToken(authContext);
    const res = await axiosClient({
      url,
      method,
      data,
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
