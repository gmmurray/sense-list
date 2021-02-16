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
import { appRoutes } from 'src/main/routes';
import LogoutButton from '../auth/LogoutButton';

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
          border: 'none',
          borderRadius: '0',
          minHeight: '100vh',
        }}
      >
        <Sidebar
          as={Menu}
          onHide={() => setNavOpen(false)}
          animation="overlay"
          direction="left"
          inverted
          vertical
          visible={navOpen}
          width="wide"
          fixed="left"
        >
          <Menu.Item as="a" onClick={() => setNavOpen(false)}>
            <Icon name="close" />
            Close Menu
          </Menu.Item>
          <Menu.Item
            as={Link}
            active={location.pathname === appRoutes.home.index.path}
            to={appRoutes.home.index.path}
          >
            <Icon name="home" />
            Home
          </Menu.Item>
          <Menu.Item
            as={Link}
            active={location.pathname === appRoutes.progress.start.path}
            to={appRoutes.progress.start.path}
          >
            <Icon name="list" />
            Lists
          </Menu.Item>
          <Menu.Item
            as={Link}
            active={location.pathname === appRoutes.lists.new.path}
            to={appRoutes.lists.new.path}
          >
            New List
          </Menu.Item>
          <Menu.Item
            as={Link}
            active={location.pathname === appRoutes.home.index.path}
            to={appRoutes.home.index.path}
          >
            <Icon name="book" />
            Progress
          </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher dimmed={navOpen} style={{ minHeight: '100vh' }}>
          <Menu fixed="top" inverted>
            <Menu.Item
              onClick={() => setNavOpen(!navOpen)}
              style={{ marginLeft: 0 }}
            >
              <Icon name="sidebar" />
            </Menu.Item>
            <Container>
              <Menu.Item as={Link} to={appRoutes.home.index.path} header>
                <Image
                  size="mini"
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
                  style={{ marginRight: '1.5em' }}
                />
                SenseList Books
              </Menu.Item>
              <Menu.Menu position="right">
                <Menu.Item>
                  <LogoutButton />
                </Menu.Item>
              </Menu.Menu>
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
