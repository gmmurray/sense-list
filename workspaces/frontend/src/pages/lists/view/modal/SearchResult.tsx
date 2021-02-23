import React, { FC } from 'react';
import { Card, Image } from 'semantic-ui-react';
import { GoogleApiBook } from 'src/library/entities/googleBooks/GoogleApiBook';
import {
  combineAuthors,
  truncateDescription,
} from 'src/library/utilities/bookPropertyHelpers';

type SearchResultProps = {
  onSelect: () => Promise<void>;
  book: GoogleApiBook;
  excluded: boolean;
};

const SearchResult: FC<SearchResultProps> = ({
  onSelect,
  book: {
    volumeInfo: { title, description, authors, imageLinks, pageCount },
  },
  excluded,
}) => {
  const author = authors ? combineAuthors(authors) : '';
  return (
    <Card
      fluid
      link
      onClick={excluded ? undefined : onSelect}
      color={excluded ? 'green' : undefined}
    >
      <Card.Content>
        {imageLinks && (
          <Image floated="right" size="mini" src={imageLinks.smallThumbnail} />
        )}
        <Card.Header>{title}</Card.Header>
        <Card.Meta>{author}</Card.Meta>
        <Card.Description>
          {description && truncateDescription(description, 200)}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>{pageCount} pages</Card.Content>
    </Card>
  );
};

export default SearchResult;
