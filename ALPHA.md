# MINDI Mầm Vui V2.0 Alpha

## Chạy game

Chạy `python3 -m http.server 18769 --bind 127.0.0.1` trong thư mục giải nén. Mở [game Alpha](http://127.0.0.1:18769/). [Visual Gallery](staging/gallery.html) hiển thị 12 cung × 4 cấp, năm trạng thái GIF, ảnh tĩnh và phụ kiện. [Bảng QA](staging/dashboard.html) mô tả phạm vi đã kiểm tra.

Game sử dụng localStorage với khóa `mindi-mamvui-v1`, theo ngày giờ Việt Nam. Chăm một lần mỗi ngày, tiến hóa theo mốc 7/21/45 và nhận tối đa một vật phẩm vào Chủ nhật mỗi tuần. Game Alpha mới dùng địa chỉ riêng nên trình duyệt lưu tiến trình Alpha riêng với địa chỉ production. Không có tài khoản, đồng bộ đa thiết bị hoặc thao tác Supabase.

## Kiểm thử lại

- Chạy `node tests/motion-regression.mjs` cho Motion.
- Với Node và Playwright, chạy `node tests/alpha-acceptance.cjs chrome` rồi `node tests/alpha-acceptance.cjs webkit` khi máy chủ Alpha đang chạy. Có thể đặt `MINDI_TEST_URL` và `MINDI_TEST_OUTPUT`.
- Với Pillow, chạy `python3 scripts/visual_asset_audit.py` kiểm kê ảnh gốc và `python3 scripts/measure_accessory_anchors.py` để tái tạo bảng vị trí từ các GIF idle.

## Hành trình kiểm thử đầy đủ

Regression giả lập 113 ngày chăm liên tiếp từ hồ sơ mới. Bộ kiểm tra xác nhận đủ 16 món quà khác nhau, ba lần tiến hóa, cấp tối đa, tải lại và tuần kế tiếp sau khi đủ bộ sưu tập. Có thêm ca đổi ngày khi giữ nguyên tab, đồng bộ các cửa sổ Tủ đồ/Bộ sưu tập/Tiến trình và phụ kiện đi theo khung GIF. Bộ tự động dùng Chrome và WebKit.

## Tài nguyên

Alpha sửa mảnh hình rời trong các GIF idle Bảo Bình cấp 2/3, Ma Kết cấp 3/4, Sư Tử cấp 3, Bọ Cạp cấp 3 và Xử Nữ cấp 3. Game và thư viện ẩn thêm các dải thật sự tách khỏi thân ở ảnh tĩnh và idle đã kiểm tra. Các GIF vá giữ kích thước, số khung, thời lượng và chế độ lặp.

## Giới hạn của Alpha

Các phụ kiện sử dụng vị trí riêng theo 48 form, sáu trạng thái và loại vật phẩm. Kiểm tra hình học tự động đủ 4.608 tổ hợp. Trong game, ảnh động và vị trí phụ kiện được cập nhật từ cùng khung giải mã khi có vật phẩm đang trang bị. Gallery vẫn dùng vị trí tham chiếu theo trạng thái để tải nhiều nhân vật cùng lúc. Biểu cảm nằm trong các GIF hiện có. Game giảm răng cưa ở kích thước hiển thị bằng bộ lọc nhẹ, giữ nguyên tệp ảnh và khung hình. Một số form còn có vệt cắt hoặc mảnh rời trong ảnh gốc, như Thiên Bình cấp 3/4 và Xử Nữ cấp 4. Người dùng xác nhận UAT đã đạt. Còn duyệt thẩm mỹ theo từng form và phục hồi những nét đã mất trong ảnh gốc. Alpha giữ luật quà Chủ nhật đã được nghiệm thu trên UI Test.

## Rollback

Giữ SHA của bản thử trước. Dừng máy chủ Alpha rồi phục vụ lại ZIP staging trước đó nếu cần. Giữ nguyên origin nếu cần tiếp tục dùng cùng dữ liệu trình duyệt. Bản staging trước đã được thử đọc dữ liệu cùng định dạng.
