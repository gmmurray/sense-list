import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { Fragment } from 'react';
import { FC } from 'react';
import { Feed } from 'semantic-ui-react';
import SegmentPlaceholder from 'src/library/components/shared/SegmentPlaceholder';
import RecentActivityPlaceholder from 'src/library/components/users/RecentActivityPlaceholder';
import {
  RecentActivity,
  RecentBULIActivity,
  RecentUserListActivity,
} from 'src/library/entities/user/RecentActivity';
import { ActivityType } from 'src/library/types/ActivityType';
import { appRoutes } from 'src/main/routes';
import BULIActivity from './BULIActivity';
import UserListActivity from './UserListActivity';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-us');

type RecentUserActivityProps = {
  loading: boolean;
  data: RecentActivity[];
};

const RecentUserActivity: FC<RecentUserActivityProps> = ({ loading, data }) => {
  if (loading) {
    return <RecentActivityPlaceholder elements={5} />;
  } else if (data.length === 0) {
    return (
      <SegmentPlaceholder
        text="You have no recent activity yet"
        iconName="times circle"
        linkTto={appRoutes.progress.start.path}
        linkText="Start now"
      />
    );
  }
  return (
    <Fragment>
      <Feed size="large">
        {data.map(item => {
          if (item.type === ActivityType.start) {
            return (
              <UserListActivity
                data={item as RecentUserListActivity}
                timeAgo={timeAgo}
              />
            );
          } else if (item.type === ActivityType.progress) {
            return (
              <BULIActivity
                data={item as RecentBULIActivity}
                timeAgo={timeAgo}
              />
            );
          } else return null;
        })}
      </Feed>
    </Fragment>
  );
};

export default RecentUserActivity;
