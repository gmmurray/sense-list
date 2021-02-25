import { useAuth0 } from '@auth0/auth0-react';
import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Grid, Header, Image, Segment } from 'semantic-ui-react';
import { appRoutes } from 'src/main/routes';
import Logo from '../../library/assets/images/logo.png';

type LoginType = { from?: string };

const Login: FC<LoginType> = ({ from }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (isAuthenticated) {
    return <Redirect to={appRoutes.home.index.path} />;
  }
  return (
    <Grid textAlign="center" verticalAlign="middle" style={{ height: '100vh' }}>
      <Grid.Column textAlign="center" style={{ maxWidth: 450 }}>
        <Segment>
          <Image src={Logo} fluid /> <Header>Get started</Header>
          <Button onClick={loginWithRedirect} primary>
            Login or register
          </Button>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default Login;
