import React, { FC, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Container,
  Icon,
  Image,
  Menu,
  Segment,
  Sidebar,
} from 'semantic-ui-react';
import homeRoutes from 'src/main/routes/home';
import LogoutButton from '../LogoutButton';

type PageLayoutType = { children: JSX.Element };

const PageLayout: FC<PageLayoutType> = ({ children }) => {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div>
      <Sidebar.Pushable
        as={Segment}
        style={{
          overflow: 'hidden',
          borderRight: 'none',
          borderTop: 'none',
          minHeight: '100vh',
        }}
      >
        <Sidebar
          as={Menu}
          onHide={() => setNavOpen(false)}
          animation="overlay"
          direction="left"
          icon="labeled"
          inverted
          vertical
          visible={navOpen}
          width="wide"
          fixed="left"
        >
          <Menu.Item
            as={Link}
            active={location.pathname === homeRoutes.index.path}
            to={homeRoutes.index.path}
          >
            <Icon name="home" />
            Home
          </Menu.Item>
          <Menu.Item
            as={Link}
            active={location.pathname === homeRoutes.index.path}
            to={homeRoutes.index.path}
          >
            <Icon name="list" />
            Lists
          </Menu.Item>
          <Menu.Item
            as={Link}
            active={location.pathname === homeRoutes.index.path}
            to={homeRoutes.index.path}
          >
            <Icon name="book" />
            Progress
          </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher dimmed={navOpen} style={{ minHeight: '100vh' }}>
          <Menu fixed="top" inverted>
            <Container>
              <Menu.Item
                onClick={() => setNavOpen(!navOpen)}
                style={{ marginLeft: 0 }}
              >
                <Icon name="sidebar" />
              </Menu.Item>
              <Menu.Item as={Link} to={homeRoutes.index.path} header>
                <Image
                  size="mini"
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
                  style={{ marginRight: '1.5em' }}
                />
                SenseList Books
              </Menu.Item>
              <Menu.Item as={LogoutButton}>Logout</Menu.Item>
            </Container>
          </Menu>
          <Container text style={{ marginTop: '7rem' }}>
            {children}
          </Container>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </div>
  );
};

export default PageLayout;
