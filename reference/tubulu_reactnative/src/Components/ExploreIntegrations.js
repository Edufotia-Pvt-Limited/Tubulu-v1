import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FlatList } from 'react-native';

function ExploreIntegrations(props) {
  return (
    <FlatList

    />
  )
}


ExploreIntegrations.propTypes = {
  data: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  onEndReached: PropTypes.func,
  displayPageLoading: PropTypes.bool
}

export default ExploreIntegrations;