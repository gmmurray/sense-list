import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    getAccessTokenSilently,
    isLoading,
  } = useAuth0();

  useEffect(() => {
    const getData = async () => {
      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/lists`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  const AuthButton = () => {
    if (isAuthenticated) {
      return (
        <button
          className="App-link"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          Log out
        </button>
      );
    }
    return (
      <button className="App-link" onClick={() => loginWithRedirect()}>
        Login
      </button>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <AuthButton />
      </header>
    </div>
  );
}

export default App;
