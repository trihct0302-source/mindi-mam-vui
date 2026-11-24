# MINDI Mầm Vui V2.0 Alpha

## Chạy game

Chạy `python3 -m http.server 18769 --bind 127.0.0.1` trong thư mục giải nén. Mở [game Alpha](http://127.0.0.1:18769/). [Visual Gallery](staging/gallery.html) hiển thị 12 cung × 4 cấp, năm trạng thái GIF, ảnh tĩnh và phụ kiện. [Bảng QA](staging/dashboard.html) mô tả phạm vi đã kiểm tra.

Game sử dụng localStorage với khóa `mindi-mamvui-v1`, theo ngày giờ Việt Nam. Chăm một lần mỗi ngày, tiến hóa theo mốc 7/21/45 và nhận tối đa một vật phẩm vào Chủ nhật mỗi tuần. Game Alpha mới dùng địa chỉ riêng nên trình duyệt lưu tiến trình Alpha riêng với địa chỉ production. Không có tài khoản, đồng bộ đa thiết bị hoặc thao tác Supabase.

## Kiểm thử lại

- Chạy `node tests/motion-regression.mjs` cho Motion.
- Với Node và Playwright, chạy `node tests/alpha-acceptance.cjs chrome` rồi `node tests/alpha-acceptance.cjs webkit` khi máy chủ Alpha đang chạy. Có thể đặt `MINDI_TEST_URL` và `MINDI_TEST_OUTPUT`.
- Với Pillow, chạy `python3 scripts/visual_asset_audit.py` kiểm kê ảnh gốc và `python3 scripts/measure_accessory_anchors.py` để tái tạo bảng vị trí từ các GIF idle.

## Tài nguyên

Alpha sửa thêm mảnh hình rời trong các GIF idle Bảo Bình cấp 2/3 và Ma Kết cấp 3/4. Các GIF vá giữ kích thước, số khung, thời lượng và chế độ lặp.

## Giới hạn của Alpha

Các phụ kiện sử dụng vị trí riêng theo 48 form và theo loại vật phẩm. Các vị trí được đo trên GIF idle và chưa được duyệt thủ công theo từng khung GIF chuyển động. Biểu cảm nằm trong các GIF hiện có. Một số form còn có vệt cắt hoặc mảnh rời trong ảnh gốc, như Sư Tử, Thiên Bình và Xử Nữ cấp cao. Cần UAT trên iPhone Safari và Android Chrome thật, cùng duyệt các trường hợp phụ kiện che mặt hoặc nằm lệch tùy form. Alpha giữ luật quà Chủ nhật đã được nghiệm thu trên UI Test.

## Rollback

Giữ SHA của bản thử trước. Dừng máy chủ Alpha rồi phục vụ lại ZIP staging trước đó nếu cần. Giữ nguyên origin nếu cần tiếp tục dùng cùng dữ liệu trình duyệt. Bản staging trước đã được thử đọc dữ liệu cùng định dạng.
