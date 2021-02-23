import React, { Fragment } from 'react';
import { FC } from 'react';
import { Modal, Image, Container, List, Header } from 'semantic-ui-react';
import { GoogleApiBook } from 'src/library/entities/googleBooks/GoogleApiBook';
import { combineAuthors } from 'src/library/utilities/bookPropertyHelpers';

type SelectedViewProps = {
  selectedBook: GoogleApiBook;
};

const SelectedView: FC<SelectedViewProps> = ({ selectedBook }) => {
  return (
    <Fragment>
      {selectedBook.volumeInfo.imageLinks && (
        <Image src={selectedBook.volumeInfo.imageLinks.smallThumbnail} />
      )}
      <Modal.Description>
        <Header as="h1">{selectedBook.volumeInfo.title}</Header>
        <Container text style={{ overflow: 'hidden' }}>
          {selectedBook.volumeInfo.authors && (
            <p>{combineAuthors(selectedBook.volumeInfo.authors)}</p>
          )}
          <List horizontal size="large">
            {selectedBook.volumeInfo.language && (
              <List.Item>
                <List.Content>
                  <List.Header>{selectedBook.volumeInfo.language}</List.Header>
                  Language
                </List.Content>
              </List.Item>
            )}
            {selectedBook.volumeInfo.pageCount && (
              <List.Item>
                <List.Content>
                  <List.Header>{selectedBook.volumeInfo.pageCount}</List.Header>
                  Pages
                </List.Content>
              </List.Item>
            )}
          </List>
          <p>{selectedBook.volumeInfo.description}</p>
          <Container textAlign="center"></Container>
        </Container>
      </Modal.Description>
    </Fragment>
  );
};

export default SelectedView;
