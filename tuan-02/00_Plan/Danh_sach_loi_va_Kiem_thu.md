# BÁO CÁO TÍCH HỢP & REVIEW CHÉO (DAY 3 - T6 25/09)

## 1. Xác nhận các điểm nối (Mục 6)

- **A ↔ B (Phân quyền theo kho):** Đã xác nhận `user_roles.warehouse_id` liên kết đúng với `warehouses.id`. Quyền chỉ set đến cấp kho, không xuống cấp zone.
- **A ↔ E (Người thực hiện giao dịch):** Xác nhận `stock_ledger.created_by` trỏ tới `users.id`.
- **B ↔ D (Tồn gắn với vị trí):** Đã thống nhất `inventory.location_id` chỉ gắn với các location có type là `BIN`. Các location có purpose `QC` hoặc `DAMAGED` vẫn có dòng tồn kho nhưng không được tính vào `available` cho pick/ship.
- **C ↔ D (Tồn gắn với SKU & UoM):** Tồn kho luôn được lưu theo `base_uom_id` của SKU. Các cờ `is_lot_tracked`, `is_serial_tracked` được lấy từ bảng `skus`.
- **D ↔ E (Inventory ↔ Ledger):** Cùng chung khóa ngoại `(location_id, sku_id, lot_no)`. Thống nhất: Reserve chỉ cập nhật trên `inventory` và không ghi vào `stock_ledger` vì chưa xuất khỏi vị trí vật lý.
- **E ↔ (tương lai) (Chứng từ tham chiếu):** `reference_types` đã được liệt kê các giá trị cơ bản `RECEIPT, SHIPMENT, TRANSFER, ADJUSTMENT, CYCLE_COUNT, REVERSAL`.
- **B, C ↔ D (Trạng thái vô hiệu hóa):** Không vô hiệu hóa location hoặc SKU khi vẫn còn số lượng trong `inventory`.

## 2. Danh sách lỗi/thay đổi đã xử lý

1. **Lỗi trùng lặp Entity khi gộp ERD:**
   - **Mô tả:** Trong `erd_domain_D.puml`, các bảng `warehouses`, `locations`, `skus` được tạo tạm (mock) để vẽ độc lập.
   - **Xử lý:** Đã viết script lược bỏ các bảng mock này khi gộp vào `erd_all.puml`, đồng thời giữ lại các bảng gốc chuẩn từ Domain B và C.
2. **Thiếu liên kết khóa ngoại liên domain trong ERD tổng:**
   - **Mô tả:** Các ERD con chưa thể hiện được đường nối giữa các bảng khác domain.
   - **Xử lý:** Bổ sung phần `CROSS-DOMAIN RELATIONSHIPS` vào cuối file `erd_all.puml` để vẽ đầy đủ liên kết: `warehouses` -> `user_roles`, `users` -> `stock_ledger`, `warehouses/locations` -> `inventory/stock_ledger`, `skus` -> `inventory/stock_ledger`.
3. **Thống nhất kiểu dữ liệu khóa chính/ngoại:**
   - **Xử lý:** Toàn bộ khóa chính và khóa ngoại được đảm bảo kiểu `BIGINT` nhất quán giữa 5 domain.
4. **Cập nhật Business Rules Domain D:**
   - **Mô tả:** Domain D vừa cập nhật thiết kế thêm các ràng buộc `BR-D-08` (chỉ BIN mới có inventory), `BR-D-10` (tính `qty_available` loại trừ QC/DAMAGED), và `BR-D-11` (transit location).
   - **Xử lý:** Đã tiến hành gộp lại ERD (`02_ERD/erd_all.puml`) để phản ánh nội dung mới nhất. Đã ghi nhận chờ Domain B xác nhận thêm purpose `TRANSIT`.

## 3. Kịch bản kiểm thử thiết kế trên giấy

Đã duyệt qua 8 kịch bản nghiệp vụ:

1. **Nhập 10 BOX (1 BOX = 12 EA) SKU-001 vào RECV-01:**
   - `stock_ledger`: INSERT dòng `+120 EA RECEIPT`.
   - `inventory`: `RECV-01` tăng `on_hand = 120`. (Đúng thiết kế).
2. **Putaway 120 EA lên BIN A01-R03-B05:**
   - `stock_ledger`: INSERT `-120 (PUTAWAY_OUT)` tại RECV-01, INSERT `+120 (PUTAWAY_IN)` tại BIN.
   - `inventory`: Giảm ở RECV-01, Tăng ở BIN. Tổng `on_hand` kho không đổi. (Đúng thiết kế).
3. **Đơn xuất 30 EA → giữ chỗ:**
   - `inventory`: Cập nhật `qty_reserved = 30`, `qty_available = 90`.
   - `stock_ledger`: Không INSERT (Đúng quy ước Reserve không ghi ledger).
4. **Pick 30 EA và ship:**
   - `inventory`: Giảm `qty_on_hand` đi 30, giảm `qty_reserved` đi 30.
   - `stock_ledger`: INSERT `-30 (PICK/SHIP)`. (Đúng thiết kế).
5. **Kiểm kê thiếu 2 EA:**
   - `stock_ledger`: INSERT `-2 (ADJUST_OUT)`.
   - `inventory`: Giảm `on_hand` và `available` đi 2. Yêu cầu RBAC từ Domain A kiểm tra quyền. (Đúng thiết kế).
6. **Bút toán sai SKU:**
   - `stock_ledger`: INSERT `-120 (REVERSAL)` trỏ tới ID gốc, sau đó INSERT `+120 (RECEIPT)` cho SKU đúng. Không dùng lệnh UPDATE. (Đúng thiết kế).
7. **Picker thử điều chỉnh tồn ngoài kho được gán:**
   - Check `user_roles.warehouse_id` qua Domain A từ chối giao dịch. (Đúng thiết kế).
8. **Đồng thời giữ chỗ 90 EA cuối cùng:**
   - `inventory.version` thực hiện Optimistic Locking, chỉ giao dịch UPDATE đầu tiên thành công, giao dịch sau bị văng lỗi. (Đúng thiết kế).

**Kết luận Day 3:** ERD tổng đã sẵn sàng và được cập nhật bản mới nhất của Domain D, các domain khớp nối tốt.
