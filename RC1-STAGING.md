# MINDI Mầm Vui · Bản staging tích hợp

Tài liệu này áp dụng cho commit staging `335ce8e`. Với nhánh hiện tại, xem [hướng dẫn Alpha](ALPHA.md).

Mở thư mục giải nén và chạy `python3 -m http.server 18767 --bind 127.0.0.1`. Trang chơi ở [127.0.0.1:18767](http://127.0.0.1:18767/). Có thể xem [Visual Gallery](staging/gallery.html) và [QA Dashboard](staging/dashboard.html) từ cùng máy chủ. Trình duyệt cần HTTP để tải các mô-đun JavaScript.

## Điểm thay đổi

- Giao diện gameplay dùng bố cục đã nghiệm thu, Popup V2 và Motion V3. Dữ liệu chăm, quà, cấp và trang bị tiếp tục dùng định dạng localStorage hiện có.
- Lịch staging dùng luật quà Chủ nhật từ UI Test, thay cho luật nhận vào một trong hai ngày cuối tuần của game đang chạy. Lịch sử quà cũ vẫn được đọc. Cần duyệt thay đổi này trong UAT.
- Hai ảnh động idle Bảo Bình cấp 1 và cấp 4 được chỉnh riêng cho staging. Các ảnh động giữ kích thước, số khung, thời lượng và cấu hình lặp.

## Kiểm thử

Chạy `node tests/motion-regression.mjs` cho vòng đời Motion. Trong môi trường có Playwright, mở máy chủ staging rồi chạy `node tests/rc1-acceptance.cjs chrome` và `node tests/rc1-acceptance.cjs webkit`. Có thể đặt `MINDI_TEST_URL` nếu dùng cổng khác. Script lưu số đo và ảnh vào `tests/evidence/`.

## Điều kiện phát hành

Cần UAT người chơi mới, iPhone Safari, Android Chrome, kiểm tra vùng an toàn trên màn hình thật, rà anchor từng form và duyệt chất lượng chuyển động/biểu cảm. Bản staging chỉ lưu dữ liệu trên trình duyệt của người chơi. Tài khoản và đồng bộ đa thiết bị nằm ngoài phạm vi.

## Rollback

Giữ bản ZIP và SHA đã duyệt trước mỗi lần phát hành. Nếu có lỗi sau khi được phép phát hành, phục hồi artifact hoặc tạo commit hoàn tác từ bản production đã xác minh rồi chạy lại kiểm tra chăm, tiến trình và localStorage. Giữ nguyên khóa lưu dữ liệu và không xóa lịch sử trên trình duyệt. Lượt này chỉ chuẩn bị staging, nên chưa cần rollback production.
