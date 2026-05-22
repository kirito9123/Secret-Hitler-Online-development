import React, { Component } from "react";
import ButtonPrompt from "./ButtonPrompt";
import { SERVER_TIMEOUT } from "../constants";

import "../util/PolicyDisplay.css";
import PolicyDisplay from "../util/PolicyDisplay";
import { PolicyType, SendWSCommand, WSCommandType } from "../types";

type ChancellorLegislativePromptProps = {
  policyOptions: PolicyType[];
  sendWSCommand: SendWSCommand;
  fascistPolicies: number;
  showError: (message: string) => void;
  enableVeto: boolean;
};

type ChancellorLegislativePromptState = {
  selection: number | undefined;
  waitingForServer: boolean;
};

class ChancellorLegislativePrompt extends Component<
  ChancellorLegislativePromptProps,
  ChancellorLegislativePromptState
> {
  constructor(props: ChancellorLegislativePromptProps) {
    super(props);
    this.state = {
      selection: undefined,
      waitingForServer: false,
    };
    this.onEnactButtonClick = this.onEnactButtonClick.bind(this);
    this.onVetoButtonClick = this.onVetoButtonClick.bind(this);
  }

  onEnactButtonClick() {
    if (this.state.selection === undefined) {
      return;
    }
    // Lock the button so that it can't be pressed multiple times.
    this.setState({ waitingForServer: true });
    setTimeout(() => {
      this.setState({ waitingForServer: false });
    }, SERVER_TIMEOUT);

    // Contact the server using provided method.
    this.props.sendWSCommand({
      command: WSCommandType.REGISTER_CHANCELLOR_CHOICE,
      choice: this.state.selection,
    });
  }

  onVetoButtonClick() {
    if (this.props.fascistPolicies === 5) {
      // If veto power is activated:
      // Lock the button so that it can't be pressed multiple times.
      this.setState({ waitingForServer: true });
      setTimeout(() => {
        this.setState({ waitingForServer: false });
      }, SERVER_TIMEOUT);

      this.props.sendWSCommand({
        command: WSCommandType.REGISTER_CHANCELLOR_VETO,
      });
    } else {
      // veto power is not activated
      this.props.showError(
        "Quyền phủ quyết được mở khóa khi có 5 chính sách Phát Xít."
      );
    }
  }

  // noinspection DuplicatedCode
  render() {
    let props = this.props;
    return (
      <ButtonPrompt
        label={"PHIÊN LẬP PHÁP"}
        headerText={
          "Chọn một chính sách để thông qua. Chính sách còn lại sẽ bị loại bỏ."
        }
        renderHeader={() => {
          return (
            <>
              <p className={"left-align"}>
                Chọn một chính sách để thông qua. Chính sách còn lại sẽ bị loại bỏ.
              </p>
              {props.fascistPolicies === 5 && (
                <p className={"left-align highlight"}>
                  Quyền phủ quyết được mở khóa: Nếu bạn chọn phủ quyết và tổng thống đồng ý, chương trình sẽ bị hủy bỏ.
                </p>
              )}
            </>
          );
        }}
        renderButton={() => {
          return (
            <div id={"legislative-button-container"}>
              {this.props.enableVeto && (
                <button
                  onClick={this.onVetoButtonClick}
                  disabled={this.state.waitingForServer}
                >
                  PHỦ QUYẾT
                </button>
              )}
              <button
                onClick={this.onEnactButtonClick}
                disabled={
                  this.state.selection === undefined ||
                  this.state.waitingForServer
                }
              >
                THÔNG QUA
              </button>
            </div>
          );
        }}
      >
        <PolicyDisplay
          policies={this.props.policyOptions}
          onClick={(index: number) => this.setState({ selection: index })}
          selection={this.state.selection}
          allowSelection={true}
        />
      </ButtonPrompt>
    );
  }
}

export default ChancellorLegislativePrompt;
