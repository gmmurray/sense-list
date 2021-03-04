import React from 'react';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button, Header, Icon, IconProps, Segment } from 'semantic-ui-react';

type SegmentPlaceHolderProps = {
  text: string;
  iconName: IconProps['name'];
  linkTo?: string;
  linkText?: string;
  hideButton?: boolean;
  [key: string]: any;
};

const SegmentPlaceholder: FC<SegmentPlaceHolderProps> = ({
  text,
  iconName,
  linkTo,
  linkText,
  hideButton,
  ...segmentProps
}) => {
  const showButton = !hideButton && linkText && linkTo;
  return (
    <Segment placeholder {...segmentProps}>
      <Header icon>
        <Icon name={iconName} />
        {text}
      </Header>
      {showButton && (
        <Button primary as={Link} to={linkTo}>
          {linkText}
        </Button>
      )}
    </Segment>
  );
};

export default SegmentPlaceholder;
