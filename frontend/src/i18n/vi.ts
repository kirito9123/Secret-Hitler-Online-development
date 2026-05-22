// Bản dịch Tiếng Việt cho Secret Hitler Online
const vi = {
  // =================== TRANG ĐĂNG NHẬP ===================
  appTitle: "BÍ MẬT HITLER - Ver.NGUYEN-MINH-TRI",
  joinGame: "THAM GIA VÁN CHƠI",
  lobbyCode: "Mã Phòng",
  yourName: "Tên Của Bạn",
  join: "THAM GIA",
  createLobby: "TẠO PHÒNG",
  createLobbyBtn: "TẠO PHÒNG",
  connecting: "Đang kết nối...",

  // Lỗi đăng nhập
  errorLobbyNotFound: "Không tìm thấy phòng chơi.",
  errorDuplicateName: (name: string) =>
    `Đã có người dùng tên '${name}' trong phòng.`,
  errorGameOngoing: "Phòng đang trong ván chơi.",
  errorLobbyFull: "Phòng đã đầy.",
  errorServer: "Có lỗi kết nối máy chủ. Vui lòng thử lại.",
  errorServerContact:
    "Không thể liên hệ máy chủ. Vui lòng chờ và thử lại.",
  errorDisconnected: "Mất kết nối với phòng chơi.",
  errorCouldNotConnect:
    "Có lỗi kết nối máy chủ. Vui lòng thử lại.",
  lostConnectionRetrying: "Mất kết nối với máy chủ: đang kết nối lại...",
  noConnection:
    "Không thể kết nối tới máy chủ. Hãy thử tải lại trang nếu vẫn gặp lỗi.",


  // Mô tả trang đăng nhập
  whatIsTitle: "Secret Hitler Online là gì?",
  whatIsDesc: `Secret Hitler Online là phiên bản trực tuyến của trò chơi bài gốc Secret Hitler,
được tái tạo cho web. Hỗ trợ tối đa 10 người chơi, với hình ảnh mượt mà và hiệu ứng
giống hệt bản gốc đầy bí ẩn và tranh cãi. Được thiết kế để dễ chơi trong mọi
buổi game tối.`,
  playFreeDesc: "Chơi miễn phí ngay trên trình duyệt, không quảng cáo!",
  openSourceDesc: `Dự án mã nguồn mở, được cấp phép theo CC BY-NC-SA 4.0.
Bạn có thể đọc thêm về dự án`,
  onGitHub: "trên GitHub",
  adaptedFrom: "Được chuyển thể từ trò chơi bài gốc",
  byCopyright: "của Goat, Wolf & Cabbage (© 2016-2020). Phát triển bởi ShrimpCryptid (© 2020-2023).",
  foundBug: "Tìm thấy lỗi hoặc muốn bình luận? Báo cáo lỗi trên",
  issuesPage: "trang Issues",

  // =================== TRANG PHÒNG CHỜ ===================
  lobbyCodeLabel: "MÃ PHÒNG:",
  copyShareLink: "Sao chép và chia sẻ liên kết này để mời người chơi khác.",
  copy: "SAO CHÉP",
  copied: "Đã sao chép!",
  players: "Người chơi",
  changeIcon: "ĐỔI BIỂU TƯỢNG",
  onlyVIPStart: "Chỉ VIP mới có thể bắt đầu trò chơi.",
  startGame: "BẮT ĐẦU TRÒ CHƠI",
  leaveLobby: "RỜI PHÒNG",
  aboutProject: "Về dự án này",
  reportBugs: "Bạn có thể báo cáo lỗi trên",
  issuesPageLabel: "trang Issues.",
  host: "[Chủ phòng]",

  // =================== TRANG GAME ===================
  endTerm: "KẾT THÚC NHIỆM KỲ",

  // Trạng thái
  waitingNominate: "Đang chờ tổng thống đề cử thủ tướng.",
  waitingVote: "Đang chờ tất cả người chơi bỏ phiếu.",
  waitingPresidentDiscard:
    "Đang chờ tổng thống chọn chính sách để loại bỏ.",
  waitingChancellorEnact:
    "Đang chờ thủ tướng chọn chính sách để thông qua.",
  waitingVetoDecision:
    "Thủ tướng đề nghị phủ quyết. Đang chờ tổng thống quyết định.",
  tallyingVotes: "Đang kiểm phiếu...",
  votePassed: (yes: number, no: number) => `${yes} - ${no}: Bỏ phiếu thành công`,
  voteFailed: (yes: number, no: number) => `${yes} - ${no}: Bỏ phiếu thất bại`,
  peekStatus: "Nhìn trước: Tổng thống đang xem trước 3 chính sách tiếp theo.",
  specialElectionStatus:
    "Bầu cử đặc biệt: Tổng thống đang chọn tổng thống tiếp theo.",
  executionStatus:
    "Hành quyết: Tổng thống đang chọn người chơi để hành quyết.",
  investigationStatus:
    "Điều tra: Tổng thống đang chọn người chơi để điều tra.",
  waitingEndTerm: "Đang chờ tổng thống kết thúc nhiệm kỳ.",

  // Sự kiện
  eventChancellorNomination: "ĐỀ CỬ THỦ TƯỚNG",
  eventVoting: "BỎ PHIẾU",
  eventLegislativeSession: "PHIÊN LẬP PHÁP",
  eventPresidentialPower: "QUYỀN TỔNG THỐNG",

  // =================== CẢNH BÁO VAI TRÒ ===================
  youAre: "VAI CỦA BẠN:",
  roleLiberal: "TỰ DO",
  roleFascist: "PHÁT XÍT",
  roleHitler: "HITLER",
  okay: "HIỂU RỒI",

  // Mô tả vai trò
  liberalWin:
    "Bạn thắng nếu bảng chính sách đầy chính sách Tự Do, hoặc nếu Hitler bị hành quyết.",
  liberalLose:
    "Bạn thua nếu bảng chính sách đầy chính sách Phát Xít, hoặc nếu Hitler được bầu làm thủ tướng sau khi 3 chính sách Phát Xít được thông qua.",
  liberalTip:
    "Hãy để ý và tìm kiếm các hành động đáng ngờ. Tìm ra Hitler và nhớ rằng bất kỳ ai cũng có thể đang nói dối!",

  fascistWin:
    "Bạn thắng nếu Hitler được bầu thành công làm thủ tướng sau khi 3 chính sách Phát Xít đã được thông qua, hoặc nếu bảng chính sách đầy chính sách Phát Xít.",
  fascistLose:
    "Bạn thua nếu bảng chính sách đầy chính sách Tự Do hoặc nếu Hitler bị hành quyết.",
  fascistTip:
    "Giữ sự nghi ngờ khỏi Hitler và tìm cách gieo rắc nhầm lẫn vào trò chơi.",

  hitlerWin:
    "Bạn thắng nếu bạn được bầu thành công làm thủ tướng sau khi 3 chính sách Phát Xít đã được thông qua, hoặc nếu bảng chính sách đầy chính sách Phát Xít.",
  hitlerLose:
    "Bạn thua nếu bảng chính sách đầy chính sách Tự Do hoặc nếu bạn bị hành quyết.",
  hitlerTip:
    "Hãy cố gắng tạo sự tin tưởng và dựa vào các đồng minh Phát Xít để tạo cơ hội cho bạn.",

  // =================== BỎ PHIẾU ===================
  votingLabel: "BỎ PHIẾU",
  nominatedChancellor: (president: string, chancellor: string) =>
    `${president} đã đề cử ${chancellor} làm thủ tướng.`,
  voteDesc:
    "Bỏ phiếu xem bạn có muốn chính phủ này tiến hành hay không; Cuộc bỏ phiếu thành công nếu hơn 50% phiếu là có.",
  fascistWinWarningVote:
    "Phát Xít sẽ thắng nếu Hitler được bầu thành công làm thủ tướng!",
  trackerWarning:
    "Nếu cuộc bỏ phiếu này thất bại, chính sách tiếp theo trong bộ bài sẽ được thông qua ngay lập tức.",

  // =================== PHIÊN LẬP PHÁP ===================
  legislativeSession: "PHIÊN LẬP PHÁP",
  presidentDiscard:
    "Chọn một chính sách để loại bỏ. Các chính sách còn lại sẽ được trao cho thủ tướng.",
  discard: "LOẠI BỎ",
  chancellorEnact:
    "Chọn một chính sách để thông qua. Chính sách còn lại sẽ bị loại bỏ.",
  vetoPowerUnlocked:
    "Quyền phủ quyết được mở khóa: Nếu bạn chọn phủ quyết và tổng thống đồng ý, chương trình sẽ bị hủy bỏ.",
  enact: "THÔNG QUA",
  veto: "PHỦ QUYẾT",

  // =================== PHỦ QUYẾT ===================
  legislativeVeto: "PHỦ QUYẾT LẬP PHÁP",
  chancellorRequestedVeto: "Thủ tướng đã yêu cầu phủ quyết chương trình.",
  vetoAcceptedTrackerWarn:
    "Nếu phủ quyết được chấp thuận, chính sách hàng đầu trong bộ bài sẽ được thông qua tự động.",
  vetoAcceptedNormal:
    "Nếu phủ quyết được chấp thuận, các chính sách còn lại sẽ bị hủy và bộ đếm bầu cử sẽ tiến thêm 1.",
  vetoRejectedInfo:
    "Ngược lại, thủ tướng sẽ phải thông qua một chính sách như bình thường.",
  acceptVeto: "Chấp nhận phủ quyết?",
  reject: "TỪ CHỐI",
  accept: "CHẤP NHẬN",

  // =================== XEM TRƯỚC ===================
  peekLabel: "XEM TRƯỚC",
  peekDesc: "Đây là ba chính sách tiếp theo trong bộ bài.",

  // =================== BẦU CỬ ĐẶC BIỆT ===================
  specialElection: "BẦU CỬ ĐẶC BIỆT",
  specialElectionDesc:
    "Chọn bất kỳ người chơi nào để trở thành tổng thống tiếp theo. Sau khi nhiệm kỳ của họ kết thúc, thứ tự sẽ tiếp tục như bình thường.",

  // =================== ĐIỀU TRA ===================
  investigateLoyalty: "ĐIỀU TRA LÒNG TRUNG THÀNH",
  investigateDesc:
    "Chọn một người chơi và điều tra đảng phái của họ. Bạn sẽ biết người chơi đó là thành viên của đảng Phát Xít hay Tự Do, nhưng không phải vai trò cụ thể (ví dụ: Hitler).",
  investigateOnce:
    "Người chơi đã bị điều tra một lần không thể bị điều tra lại.",
  investigateLie:
    "(Hãy nhớ rằng bạn có thể nói dối về đảng phái của người chơi!)",
  investigationResults: "KẾT QUẢ ĐIỀU TRA",
  investigationParty: (target: string, party: string) =>
    `${target} là thành viên của đảng ${party}.`,
  investigatedByPresident: (target: string, president: string) =>
    `${target} đã bị điều tra bởi ${president}. Tổng thống bây giờ biết đảng phái của họ.`,
  youInvestigated: (president: string) =>
    `Bạn đã bị điều tra bởi ${president}. Tổng thống bây giờ biết đảng phái của bạn.`,

  // =================== HÀNH QUYẾT ===================
  execution: "HÀNH QUYẾT",
  executionDesc:
    "Chọn một người chơi để hành quyết. Người chơi đó không còn có thể nói chuyện, bỏ phiếu, hoặc tham gia tranh cử.",
  executionWarn:
    "Trò chơi kết thúc và phe Tự Do thắng nếu Hitler bị hành quyết.",
  executionResults: "KẾT QUẢ HÀNH QUYẾT",
  youExecuted:
    "BẠN ĐÃ BỊ HÀNH QUYẾT",
  youExecutedDesc:
    "Người chơi bị hành quyết không thể nói chuyện, bỏ phiếu hoặc tham gia tranh cử. Bạn không được tiết lộ danh tính của mình.",
  playerExecuted: (player: string) =>
    `${player} đã bị hành quyết. Họ không còn có thể nói chuyện, bỏ phiếu hoặc tham gia tranh cử.`,

  // =================== ĐỀ CỬ ===================
  nomination: "ĐỀ CỬ",
  nominateDesc: "Đề cử một người chơi để trở thành Thủ Tướng tiếp theo.",
  fascistWinWarningNominate:
    "Phát Xít sẽ thắng nếu Hitler được đề cử và bỏ phiếu thành công làm Thủ Tướng!",

  // =================== BỘ ĐẾM BẦU CỬ ===================
  legislatureFailed: "NGHỊ VIỆN THẤT BẠI",
  electionTrackerDesc:
    "Bộ đếm bầu cử tăng 1 mỗi khi một chính phủ không thông qua (hoặc từ chối) chính sách, và đặt lại mỗi khi một chính sách được thông qua.",
  electionTrackerWarn:
    "Khi bộ đếm đạt 3, chính sách đầu tiên trong bộ bài sẽ được thông qua ngay lập tức. Không có quyền tổng thống nào được kích hoạt và tất cả giới hạn nhiệm kỳ sẽ được đặt lại.",

  // =================== CHÍNH SÁCH ĐƯỢC THÔNG QUA ===================
  policyEnacted: "CHÍNH SÁCH ĐÃ THÔNG QUA",

  // =================== KẾT QUẢ BẦU CỬ ĐẶC BIỆT ===================
  specialElectionResult: "BẦU CỬ ĐẶC BIỆT",
  specialElectionResultDesc: (president: string, target: string) =>
    `${president} đã chọn ${target} làm tổng thống tiếp theo.\nThứ tự tổng thống bình thường sẽ tiếp tục sau vòng tiếp theo.`,

  // =================== THẮNG / THUA ===================
  fascistVictoryPolicy: "Phát Xít đã thành công thông qua sáu chính sách!",
  fascistVictoryElection:
    "Phát Xít đã thành công bầu Hitler làm thủ tướng!",
  liberalVictoryPolicy:
    "Phe Tự Do đã thành công thông qua năm chính sách!",
  liberalVictoryExecution:
    "Phe Tự Do đã thành công hành quyết Hitler!",
  returnToLobby: "QUAY LẠI PHÒNG CHỜ",

  // Đảng
  partyLiberal: "Tự Do",
  partyFascist: "Phát Xít",
};

export default vi;
