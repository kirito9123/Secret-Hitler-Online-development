import React from "react";
import "./RulesPanel.css";

interface RulesPanelProps {
  side: "left" | "right";
}

const RulesPanel: React.FC<RulesPanelProps> = ({ side }) => {
  if (side === "left") {
    return (
      <div className="rules-panel">
        <h3 className="rules-header">LUẬT CHƠI CƠ BẢN</h3>
        <div className="rules-content">
          <h4>Mục tiêu:</h4>
          <ul>
            <li><span className="text-liberal">Tự Do:</span> Thông qua 5 chính sách Tự Do hoặc ám sát Hitler.</li>
            <li><span className="text-fascist">Phát Xít:</span> Thông qua 6 chính sách Phát Xít hoặc bầu Hitler làm Thủ Tướng (sau khi đã có 3 chính sách Phát Xít).</li>
          </ul>

          <h4>Lượt chơi:</h4>
          <ol>
            <li><strong>Bầu Cử:</strong> Tổng thống chỉ định Thủ tướng. Mọi người bỏ phiếu (Ja/Nein). Nếu thất bại 3 lần liên tiếp, chính sách trên cùng của bộ bài sẽ tự động thông qua.</li>
            <li><strong>Lập Pháp:</strong> Tổng thống rút 3 thẻ, bỏ 1 thẻ. Thủ tướng nhận 2 thẻ, bỏ 1 thẻ và thông qua thẻ còn lại.</li>
            <li><strong>Quyền Tổng Thống:</strong> Nếu chính sách Phát Xít được thông qua, Tổng thống có thể có quyền đặc biệt (Xem bài, Điều tra, Bầu cử đặc biệt, Ám sát).</li>
          </ol>
        </div>
      </div>
    );
  } else {
    return (
      <div className="rules-panel">
        <h3 className="rules-header">CÁC VAI TRÒ</h3>
        <div className="rules-content">
          <h4>Phe Tự Do (Đa số)</h4>
          <p>Không biết ai là ai. Phải tìm ra nhau và ngăn chặn Phát Xít.</p>

          <h4>Phe Phát Xít (Thiểu số)</h4>
          <p>Biết nhau và biết ai là Hitler. Phải lừa dối phe Tự Do. Hitler không biết ai là Phát Xít.</p>

          <h4>Hitler</h4>
          <p>Thuộc phe Phát Xít. Nếu bị ám sát, phe Tự Do thắng ngay lập tức. Cần tránh bị nghi ngờ.</p>

          <hr className="rules-divider" />
          
          <h4>Quyền Phủ Quyết (Veto)</h4>
          <p>Khi có 5 chính sách Phát Xít trên bàn, Thủ tướng có quyền đề nghị Phủ quyết 2 lá bài đang chọn. Nếu Tổng thống đồng ý, cả 2 lá bị bỏ đi và thanh Bầu cử tăng 1.</p>
        </div>
      </div>
    );
  }
};

export default RulesPanel;
