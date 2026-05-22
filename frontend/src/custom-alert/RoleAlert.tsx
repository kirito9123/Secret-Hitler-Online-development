import React, { Component } from "react";
import RoleHitler from "../assets/role-hitler.png";
import RoleLiberal1 from "../assets/role-liberal-1.png";
import RoleLiberal2 from "../assets/role-liberal-2.png";
import RoleLiberal3 from "../assets/role-liberal-3.png";
import RoleLiberal4 from "../assets/role-liberal-4.png";
import RoleLiberal5 from "../assets/role-liberal-5.png";
import RoleLiberal6 from "../assets/role-liberal-6.png";
import RoleFascist1 from "../assets/role-fascist-1.png";
import RoleFascist2 from "../assets/role-fascist-2.png";
import RoleFascist3 from "../assets/role-fascist-3.png";

import "./RoleAlert.css";
import { GameState, Role } from "../types";

const LiberalImages = [
  RoleLiberal1,
  RoleLiberal2,
  RoleLiberal3,
  RoleLiberal4,
  RoleLiberal5,
  RoleLiberal6,
];
const LiberalImagesAltText = [
  "Vai bí mật của bạn là TỰ DO. Thẻ hiển thị một người đàn ông đeo kính với tẩu thuốc.",
  "Vai bí mật của bạn là TỰ DO. Thẻ hiển thị một người phụ nữ sang trọng với tóc xoăn và ngọc trai.",
  "Vai bí mật của bạn là TỰ DO. Thẻ hiển thị một người đàn ông với chiếc mũ kiểu hành hương.",
  "Vai bí mật của bạn là TỰ DO. Thẻ hiển thị một người đàn ông mặc vest đẹp với mũ fedora.",
  "Vai bí mật của bạn là TỰ DO. Thẻ hiển thị một người phụ nữ cao tuổi với kính to đang bế chó chihuahua.",
  "Vai bí mật của bạn là TỰ DO. Thẻ hiển thị một người phụ nữ với mũ rộng vành.",
];
const HitlerImages = [RoleHitler];
const HitlerImagesAltText = [
  "Vai bí mật của bạn là HITLER. Thẻ hiển thị một con cá sấu trong bộ vest và mũ quân sự WW2 đang nhìn chằm chằm.",
];
const FascistImages = [RoleFascist1, RoleFascist2, RoleFascist3];
const FascistImagesAltText = [
  "Vai bí mật của bạn là PHÁT XÍT. Thẻ hiển thị một con rắn trong bộ vest đầy huân chương quân sự.",
  "Vai bí mật của bạn là PHÁT XÍT. Thẻ hiển thị một con kỳ nhông trong mũ quân sự Đức với hàm răng lộ ra.",
  "Vai bí mật của bạn là PHÁT XÍT. Thẻ hiển thị một con kỳ nhông trong mũ quân sự Đức với hàm răng lộ ra.",
];

const LiberalText = [
  "Bạn thắng nếu bảng chính sách đầy chính sách Tự Do, hoặc nếu Hitler bị hành quyết.",
  "Bạn thua nếu bảng chính sách đầy chính sách Phát Xít, hoặc nếu Hitler được bầu làm thủ tướng sau khi 3 chính sách Phát Xít được thông qua.",
  "Hãy để ý và tìm kiếm các hành động đáng ngờ. Tìm ra Hitler và nhớ rằng bất kỳ ai cũng có thể đang nói dối!",
];
const FascistText = [
  "Bạn thắng nếu Hitler được bầu thành công làm thủ tướng sau khi 3 chính sách Phát Xít đã được thông qua, hoặc nếu bảng chính sách đầy chính sách Phát Xít.",
  "Bạn thua nếu bảng chính sách đầy chính sách Tự Do hoặc nếu Hitler bị hành quyết.",
  "Giữ sự nghi ngờ khỏi Hitler và tìm cách gieo rắc nhầm lẫn vào trò chơi.",
];
const HitlerText = [
  "Bạn thắng nếu được bầu thành công làm thủ tướng sau khi 3 chính sách Phát Xít đã được thông qua, hoặc nếu bảng chính sách đầy chính sách Phát Xít.",
  "Bạn thua nếu bảng chính sách đầy chính sách Tự Do hoặc nếu bạn bị hành quyết.",
  "Hãy cố gắng tạo sự tin tưởng và dựa vào các đồng minh Phát Xít để tạo cơ hội cho bạn.",
];

type RoleAlertProps = {
  role?: Role;
  name: string;
  gameState: GameState;
  onClick: () => void;
};

/**
 * CustomAlert content that shows the player's current role and a quick guide on how to play
 * the game.
 * Parameters:
 *      - {@code role} [String]: The role of the player. Should be either LIBERAL, FASCIST, or HITLER.
 *      - {@code roleID} [int]: The integer roleID of the player. This is used to show unique role cards.
 *          The roleID can range from [1, 6] for LIBERALS, [1, 3] for FASCISTS, and [1] for HITLER. If out of bounds,
 *          the value is set to 1 (default).
 *      - {@code onClick} [()]: The callback function for when confirmation button ("OKAY") is pressed.
 */
class RoleAlert extends Component<RoleAlertProps> {
  getRoleImageAndAlt(): { image: string; alt: string } {
    let images: string[];
    let imageAlts: string[];
    switch (this.props.role) {
      case Role.LIBERAL:
        images = LiberalImages;
        imageAlts = LiberalImagesAltText;
        break;
      case Role.FASCIST:
        images = FascistImages;
        imageAlts = FascistImagesAltText;
        break;
      default: // Hitler
        images = HitlerImages;
        imageAlts = HitlerImagesAltText;
    }
    const playerIndex = this.props.gameState.playerOrder.indexOf(
      this.props.name
    );
    const roleId = playerIndex % images.length;

    return {
      image: images[roleId],
      alt: imageAlts[roleId],
    };
  }

  render() {
    let roleText = HitlerText;
    if (this.props.role === Role.FASCIST) {
      roleText = FascistText;
    } else if (this.props.role === Role.LIBERAL) {
      roleText = LiberalText;
    }

    const { image, alt } = this.getRoleImageAndAlt();

    return (
      <div>
        <div>
          <h2 id="alert-header" className={"left-align"}>
            VAI CỦA BẠN:{" "}
            {this.props.role === "LIBERAL" ? "TỰ DO" : this.props.role === "FASCIST" ? "PHÁT XÍT" : "HITLER"}
          </h2>
          <img id="role" src={image} alt={alt} />

          <p className={"left-align"}>{roleText[0]}</p>
          <p className={"left-align"}>{roleText[1]}</p>
          <p className="highlight left-align">{roleText[2]}</p>
        </div>

        <button onClick={this.props.onClick}>HIỂU RỒI</button>
      </div>
    );
  }
}

export default RoleAlert;
