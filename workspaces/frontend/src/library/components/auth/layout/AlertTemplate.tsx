import { ComponentType, useState } from 'react';
import { AlertComponentPropsWithStyle } from 'react-alert';
import { Icon, Message } from 'semantic-ui-react';
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';

const AlertTemplate: ComponentType<AlertComponentPropsWithStyle> = ({
  message,
  options,
  style,
  close,
}) => {
  const [hidden, setHidden] = useState(false);
  let iconName: SemanticICONS;
  let infoMessage = false,
    successMessage = false,
    errorMessage = false;
  switch (options.type) {
    case 'success':
      iconName = 'check';
      successMessage = true;
      break;
    case 'error':
      iconName = 'warning sign';
      errorMessage = true;
      break;
    default:
      iconName = 'info';
      infoMessage = true;
      break;
  }
  return (
    <Message
      style={{ minWidth: '25vw' }}
      info={infoMessage}
      positive={successMessage}
      negative={errorMessage}
      floating
      onDismiss={() => setHidden(true)}
      hidden={hidden}
    >
      <Icon size="small" name={iconName} />
      <Message.Content>{message}</Message.Content>
    </Message>
  );
};

export default AlertTemplate;
