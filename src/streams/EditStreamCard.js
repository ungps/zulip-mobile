/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { ErrorMsg, Input, Label, OptionRow, ZulipButton } from '../common';
import type { Stream, GlobalState } from '../types';
import { caseInsensitiveCompareFunc } from '../utils/misc';
import { getStreams } from '../selectors';
import styles from '../styles';

type Props = {|
  isNewStream: boolean,
  initialValues: {
    name: string,
    description: string,
    invite_only: boolean,
  },
  streams: Stream[],
  onComplete: (name: string, description: string, isPrivate: boolean) => void,
|};

type State = {|
  name: string,
  description: string,
  isPrivate: boolean,
  error: ?string,
|};

class EditStreamCard extends PureComponent<Props, State> {
  state = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    isPrivate: this.props.initialValues.invite_only,
    error: undefined,
  };

  handlePerformAction = () => {
    const { onComplete, streams } = this.props;
    const { name, description, isPrivate } = this.state;

    if (streams.find(stream => !caseInsensitiveCompareFunc(stream.name, name))) {
      this.setState({ error: 'Stream name unavailable' });
    } else {
      onComplete(name, description, isPrivate);
    }
  };

  handleNameChange = (name: string) => {
    this.setState({ name });
  };

  handleDescriptionChange = (description: string) => {
    this.setState({ description });
  };

  handleIsPrivateChange = (isPrivate: boolean) => {
    this.setState({ isPrivate });
  };

  render() {
    const { initialValues, isNewStream } = this.props;
    const { name, error } = this.state;

    return (
      <View>
        <Label text="Name" />
        <Input
          style={styles.marginBottom}
          placeholder="Name"
          autoFocus
          defaultValue={initialValues.name}
          onChangeText={this.handleNameChange}
        />
        <Label text="Description" />
        <Input
          style={styles.marginBottom}
          placeholder="Description"
          defaultValue={initialValues.description}
          onChangeText={this.handleDescriptionChange}
        />
        <OptionRow
          label="Private"
          defaultValue={initialValues.invite_only}
          onValueChange={this.handleIsPrivateChange}
        />
        {error !== undefined && error !== null && <ErrorMsg error={error} />}
        <ZulipButton
          style={styles.marginTop}
          text={isNewStream ? 'Create' : 'Update'}
          disabled={name.length === 0}
          onPress={this.handlePerformAction}
        />
      </View>
    );
  }
}

export default connect((state: GlobalState) => ({
  streams: getStreams(state),
}))(EditStreamCard);
