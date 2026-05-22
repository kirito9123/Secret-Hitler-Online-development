import React, { Component } from "react";
import ReactGA from "react-ga";
import "./LoginPageContent.css";
import "./util/CustomAliceCarousel.css";


class LoginPageContent extends Component {

    onClickAbout = () => {
        ReactGA.event({
            category: "Clicked About",
            action: "User clicked the link for the about page."
        });
    };

    onClickGameWebsite = () => {
        ReactGA.event({
            category: "Clicked Game Website",
            action: "User clicked the link for the board game website."
        });
    };

    render() {
        let handleDragStart = (e) => e.preventDefault();
        let items = [
            <img id={"login-page-gif"} src={'https://i.postimg.cc/zvnLRbqq/place-policy.gif'} onDragStart={handleDragStart} alt={"Một thẻ chính sách được đặt lên bảng."} />,
            <img id={"login-page-gif"} src={'https://i.postimg.cc/Wbvqcn7z/show-policy.gif'} onDragStart={handleDragStart} alt={"Hoạt ảnh thư mục mở ra và tiết lộ thẻ chính sách."} />,
            <img id={"login-page-gif"} src={'https://i.postimg.cc/cCNCZxw2/show-votes.gif'} onDragStart={handleDragStart} alt={"Hoạt ảnh hiển thị tất cả phiếu bầu đã bỏ."} />
        ];
        return (
            <>
                <div id={"#login-page-description-container"}>
                    <div id={"login-page-description-text-container"}>
                        <h2 id={"login-page-description-text-header"}>BÍ MẬT HITLER - Nguyễn Minh Trí Edition Online là gì?</h2>
                        <p id={"login-page-description-text"}>
                            BÍ MẬT HITLER - Nguyễn Minh Trí Edition Online là phiên bản trực tuyến của trò chơi bài gốc Secret Hitler,
                            được tái tạo cho web. Hỗ trợ tối đa 10 người chơi, với hình ảnh mượt mà và hoạt ảnh
                            đầy đủ sự bí ẩn và tranh cãi của bản gốc. Được thiết kế để dễ chơi trong mọi
                            buổi game tối.<br /><br />Chơi miễn phí ngay trên trình duyệt, không có quảng cáo!
                            <br /><br />
                        </p>
                    </div>
                    <div id={"login-page-gif-container"}>
                        {items}
                    </div>
                    <div id={"login-page-description-text-container"}>
                        <p id={"login-page-description-text"}>
                            <br />
                            Dự án mã nguồn mở, được cấp phép theo CC BY-NC-SA 4.0.
                            Bạn có thể đọc thêm về dự án <a
                                href={"https://github.com/ShrimpCryptid/Secret-Hitler-Online/"}
                                rel="noreferrer"
                                target={"_blank"} onClick={this.onClickAbout}>
                                trên GitHub
                            </a>!
                            <br /><br />
                            Được chuyển thể từ trò chơi bài gốc <a href={"https://secrethitler.com"} target={"_blank"} rel="noreferrer" onClick={this.onClickGameWebsite}>
                                Secret Hitler
                            </a> của Goat, Wolf &amp; Cabbage (© 2016-2020). Phát triển bởi ShrimpCryptid (© 2020-2023).
                            <br /><br />
                            Tìm thấy lỗi hoặc muốn bình luận? Báo cáo lỗi trên <a href={"https://github.com/ShrimpCryptid/Secret-Hitler-Online/issues"}
                                rel="noreferrer"
                                target={"_blank"}>trang Issues</a> hoặc người việt hóa email: <a href="mailto:tringuyen9123@gmail.com">tringuyen9123@gmail.com</a>.
                        </p>
                        <br />
                    </div>

                </div>
            </>
        );
    }

}

/*
<div id={"login-page-carousel-container"}>
                        <AliceCarousel mouseTracking items={items} />
                    </div>
 */

LoginPageContent.propTypes = {
};

export default LoginPageContent;