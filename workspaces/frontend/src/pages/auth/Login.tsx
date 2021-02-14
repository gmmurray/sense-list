import { useAuth0 } from '@auth0/auth0-react';
import React, { FC, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import LoginButton from 'src/library/components/auth/LoginButton';
import homeRoutes from 'src/main/routes/home';

type LoginType = { from?: string };

const Login: FC<LoginType> = ({ from }) => {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return <Redirect to={homeRoutes.index.path} />;
  }
  return (
    <Fragment>
      <div>Login!</div>
      <div>
        <LoginButton />
      </div>
    </Fragment>
  );
};

export default Login;
