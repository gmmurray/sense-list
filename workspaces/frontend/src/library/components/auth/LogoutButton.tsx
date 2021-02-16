import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'semantic-ui-react';

const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    <Button
      onClick={() => logout({ returnTo: window.location.origin })}
      content="Logout"
      icon="sign-out"
    />
  );
};

export default LogoutButton;
