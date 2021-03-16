import TimeAgo from 'javascript-time-ago';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Feed } from 'semantic-ui-react';
import { RecentBULIActivity } from 'src/library/entities/user/RecentActivity';
import { getBookReadingStatusText } from 'src/library/types/BookReadingStatus';
import { appRoutes } from 'src/main/routes';

type BULIActivityProps = {
  data: RecentBULIActivity;
  timeAgo: TimeAgo;
};

const BULIActivity: FC<BULIActivityProps> = ({
  data: { identifier, timeStamp, title, status, owned },
  timeAgo,
}) => {
  const statusText = getBookReadingStatusText(status);
  return (
    <Feed.Event>
      <Feed.Label icon="check" />
      <Feed.Content>
        <Feed.Summary>
          You made progress on a book in{' '}
          <Link to={appRoutes.progress.view.getDynamicPath!(identifier)}>
            a list
          </Link>
          <Feed.Date>{timeAgo.format(new Date(timeStamp))}</Feed.Date>
        </Feed.Summary>
        <Feed.Extra text>{title}</Feed.Extra>
        <Feed.Meta>{statusText}</Feed.Meta>
      </Feed.Content>
    </Feed.Event>
  );
};

export default BULIActivity;
