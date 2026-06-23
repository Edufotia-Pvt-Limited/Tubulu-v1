import { Button } from 'native-base';
import PropTypes from 'prop-types';
import React from 'react';

function ISNewButton(props) {
  return (
    <Button
      _text={{
        color: '#ffffff',
      }}
      onPress={props?.onPress}
      minWidth={120}
      height={props.height || 42}
      borderRadius={props.borderRadius ?? 8}
      style={{
        backgroundColor: props.backgroundColor || '#0C54A0',
      }}
      isLoading={props.loading || false}>
      {props?.title || ''}
    </Button>
  );
}

ISNewButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  backgroundColor: PropTypes.string,
  borderRadius: PropTypes.string,
  loading: PropTypes.bool,
};

export default ISNewButton;
