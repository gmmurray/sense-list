import React, { Fragment } from 'react';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'semantic-ui-react';
import { RouteBreadcrumb } from 'src/library/types/routes';

type BreadcrumbWrapperProps = {
  breadcrumbs: RouteBreadcrumb[];
};

const BreadcrumbWrapper: FC<BreadcrumbWrapperProps> = ({ breadcrumbs }) => {
  if (breadcrumbs.length === 0) {
    return null;
  } else if (breadcrumbs.length === 1) {
    return (
      <Breadcrumb>
        <Breadcrumb.Section>{breadcrumbs[0].name}</Breadcrumb.Section>
      </Breadcrumb>
    );
  }
  return (
    <Breadcrumb>
      {breadcrumbs.map(({ name, to, root }: RouteBreadcrumb) => {
        if (to) {
          if (root) {
            return (
              <Breadcrumb.Section
                link
                as={Link}
                to={to}
                key={`${name}-breadcrumb`}
              >
                {name}
              </Breadcrumb.Section>
            );
          }
          return (
            <Fragment key={`${name}-breadcrumb`}>
              <Breadcrumb.Divider icon="right angle" />
              <Breadcrumb.Section link as={Link} to={to} key={to}>
                {name}
              </Breadcrumb.Section>
            </Fragment>
          );
        } else {
          return (
            <Fragment key={`${name}-breadcrumb`}>
              <Breadcrumb.Divider icon="right angle" />
              <Breadcrumb.Section>{name}</Breadcrumb.Section>
            </Fragment>
          );
        }
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbWrapper;
