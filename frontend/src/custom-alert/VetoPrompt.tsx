import React, { Component } from "react";
import ButtonPrompt from "./ButtonPrompt";
import { SERVER_TIMEOUT } from "../constants";
import { SendWSCommand, WSCommandType } from "../types";

type VetoPromptProps = {
  sendWSCommand: SendWSCommand;
  electionTracker: number;
};

type VetoPromptState = {
  waitingForServer: boolean;
};

class VetoPrompt extends Component<VetoPromptProps, VetoPromptState> {
  constructor(props: VetoPromptProps) {
    super(props);
    this.state = {
      waitingForServer: false,
    };
  }

  onButtonClick(accepted: boolean) {
    this.setState({ waitingForServer: true });
    setTimeout(
      () => this.setState({ waitingForServer: false }),
      SERVER_TIMEOUT
    );

    this.props.sendWSCommand({
      command: WSCommandType.REGISTER_PRESIDENT_VETO,
      veto: accepted,
    });
  }

  render() {
    return (
      <ButtonPrompt
        label={"PHỦ QUYẾT LẬP PHÁP"}
        renderHeader={() => {
          return (
            <>
              <p className={"left-align"}>
                Thủ tướng đã yêu cầu phủ quyết chương trình.
              </p>
              {this.props.electionTracker === 2 && (
                <p className={"left-align highlight"}>
                  Nếu phủ quyết được chấp thuận, chính sách hàng đầu trong bộ bài sẽ được thông qua tự động.
                </p>
              )}
              {this.props.electionTracker !== 2 && (
                <p className={"left-align"}>
                  Nếu phủ quyết được chấp thuận, các chính sách còn lại sẽ bị hủy và bộ đếm bầu cử sẽ tiến thêm 1.
                </p>
              )}
              <p className={"left-align"}>
                Ngược lại, thủ tướng sẽ phải thông qua một chính sách như bình thường.
              </p>
              <br />
            </>
          );
        }}
        footerText={"Chấp nhận phủ quyết?"}
        renderButton={() => {
          return (
            <>
              <button
                onClick={() => this.onButtonClick(false)}
                disabled={this.state.waitingForServer}
              >
                TỪ CHỐI
              </button>
              <button
                onClick={() => this.onButtonClick(true)}
                disabled={this.state.waitingForServer}
              >
                CHẤP NHẬN
              </button>
            </>
          );
        }}
      />
    );
  }
}

export default VetoPrompt;
