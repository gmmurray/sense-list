import React from 'react';
import { Grid, Loader } from 'semantic-ui-react';

const LoginLoader = () => (
  <Grid style={{ height: '100vh' }} verticalAlign="middle">
    <Grid.Column>
      <Loader active inline="centered" size="big" />
    </Grid.Column>
  </Grid>
);

export default LoginLoader;
