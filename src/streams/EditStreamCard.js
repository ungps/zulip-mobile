/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import { Input, Label, OptionRow, ZulipButton } from '../common';
import styles from '../styles';

type Props = {|
  isNewStream: boolean,
  initialValues: {
    name: string,
    description: string,
    invite_only: boolean,
  },
  onComplete: (name: string, description: string, isPrivate: boolean) => void,
|};

type State = {|
  name: string,
  description: string,
  isPrivate: boolean,
|};

const componentStyles = StyleSheet.create({
  captionText: {
    fontSize: 12,
    color: 'gray',
  },
});

export default class EditStreamCard extends PureComponent<Props, State> {
  state = {
    name: this.props.initialValues.name,
    description: this.props.initialValues.description,
    isPrivate: this.props.initialValues.invite_only,
  };

  handlePerformAction = () => {
    const { onComplete } = this.props;
    const { name, description, isPrivate } = this.state;
    onComplete(name, description, isPrivate);
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
    const { name, description, isPrivate } = this.state;

    const canSubmit =
      name.length !== 0
      && (initialValues.name !== name
        || initialValues.description !== description
        || initialValues.invite_only !== isPrivate);

    return (
      <View>
        <Label text="Name" />
        <Input
          placeholder="Name"
          autoFocus
          defaultValue={initialValues.name}
          onChangeText={this.handleNameChange}
        />
        <Label style={[styles.marginBottom, componentStyles.captionText]} text="* Required" />
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
        <ZulipButton
          style={styles.marginTop}
          text={isNewStream ? 'Create' : 'Update'}
          disabled={!canSubmit}
          onPress={this.handlePerformAction}
        />
      </View>
    );
  }
}
