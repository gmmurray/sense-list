import { FC } from 'react';
import { Card, Popup, Button, Grid, Header } from 'semantic-ui-react';

type BookInfoPopupProps = {
  description: string;
  pageCount?: number;
};

const BookInfoPopup: FC<BookInfoPopupProps> = ({ description, pageCount }) => {
  return (
    <Popup
      trigger={
        <Card.Meta>
          <Button basic compact content="Book info" icon="info" />
        </Card.Meta>
      }
      on="click"
    >
      <Grid columns="two">
        {description.length > 0 && (
          <Grid.Column width={10}>
            <Header size="small" sub content="Description" />
            {description}
          </Grid.Column>
        )}
        {pageCount && pageCount > 0 && (
          <Grid.Column width={6}>
            <Header size="small" sub content="Pages" />
            {pageCount}
          </Grid.Column>
        )}
      </Grid>
    </Popup>
  );
};

export default BookInfoPopup;
