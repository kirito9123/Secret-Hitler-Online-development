import React, {Component} from 'react';
import PropTypes from "prop-types";
import ButtonPrompt from "./ButtonPrompt";

import ETBoard from '../assets/board-election-tracker.png';
import ETToken from '../assets/board-tracker.png';

import './ElectionTrackerAlert.css';

class ElectionTrackerAlert extends Component {

    constructor(props) {
        super(props);
        let initialPos = "et-position-" + (this.props.trackerPosition - 1);
        let moveClass = "et-moveto-" + (this.props.trackerPosition);
        this.state = {
            trackerClass: initialPos
        };
        setTimeout(()=>this.setState({trackerClass:moveClass}), 500);
    }

    render() {
        return (
            <ButtonPrompt
                label={"NGHỊ VIỆN THẤT BẠI"}
                renderHeader={() => {
                    return (<>
                            <p className={"left-align"}>
                                Bộ đếm bầu cử tăng 1 mỗi khi một chính phủ không thông qua (hoặc từ chối) chính sách, và đặt lại mỗi khi một chính sách được thông qua.
                            </p>
                            <p className={"left-align highlight"}>
                                Khi bộ đếm đạt 3, chính sách đầu tiên trong bộ bài sẽ được thông qua ngay lập tức. Không có quyền tổng thống nào được kích hoạt và tất cả giới hạn nhiệm kỳ sẽ được đặt lại.
                            </p>
                        </>);
                }}
                buttonText={"HIỂU RỒI"}
                buttonOnClick={this.props.closeAlert}
            >
                <div id={"election-tracker-container"}>
                    <img id="election-tracker-board"
                         src={ETBoard}
                         alt={"The election tracker board. A blue board with four circles, which the election tracker advances along."}
                    />
                    <img id="election-tracker-token"
                         className={this.state.trackerClass}
                         src={ETToken}
                         alt={"The election tracker token. It is at position " + this.props.trackerPosition + " out of 3."}
                     />
                </div>
            </ButtonPrompt>
        )
    }
}

ElectionTrackerAlert.propTypes = {
    trackerPosition: PropTypes.number.isRequired,
    closeAlert: PropTypes.func.isRequired,
};

export default ElectionTrackerAlert;