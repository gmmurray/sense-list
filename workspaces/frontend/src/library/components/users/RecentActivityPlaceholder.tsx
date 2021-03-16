import { FC } from 'react';
import { Fragment } from 'react';
import { Placeholder } from 'semantic-ui-react';

type RecentActivityPlaceholderProps = { elements: number };

const RecentActivityPlaceholder: FC<RecentActivityPlaceholderProps> = ({
  elements,
}) => {
  return (
    <Fragment>
      {[...Array(elements)].map((e, i: number) => (
        <Placeholder key={`ra-placeholder-${i}`} fluid>
          <Placeholder.Header image>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
        </Placeholder>
      ))}
    </Fragment>
  );
};

export default RecentActivityPlaceholder;
