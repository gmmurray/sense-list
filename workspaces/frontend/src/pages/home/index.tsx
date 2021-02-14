import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { getHomePageUserLists } from 'src/library/api/backend/userLists';

const Home = () => {
  const auth = useAuth0();
  const alert = useAlert();
  const [activeLists, setActiveLists] = useState({});

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getHomePageUserLists(auth);
        setActiveLists(data);
      } catch (error) {
        alert.error(error.message, { timeout: 15000 });
      }
    };
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      Home <p></p>
    </div>
  );
};

export default Home;
