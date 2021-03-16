import { FC } from 'react';
import { Fragment } from 'react';
import { Card, Placeholder } from 'semantic-ui-react';

type ListsPlaceholderProps = { elements: number };

const ListsPlaceholder: FC<ListsPlaceholderProps> = ({ elements }) => {
  return (
    <Fragment>
      {[...Array(elements)].map((e, i: number) => (
        <Card key={`list-placeholder-${i}`} fluid raised>
          <Card.Content>
            <Placeholder fluid>
              <Placeholder.Header image>
                <Placeholder.Line />
                <Placeholder.Line />
              </Placeholder.Header>
              <Placeholder.Paragraph>
                <Placeholder.Line />
                <Placeholder.Line />
              </Placeholder.Paragraph>
            </Placeholder>
          </Card.Content>
        </Card>
      ))}
    </Fragment>
  );
};

export default ListsPlaceholder;
