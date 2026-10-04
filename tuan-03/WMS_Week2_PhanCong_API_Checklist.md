# WMS Week 2 — Phân công Backend, API và checklist công việc

Ngày lập: **01/10/2026**. Đối chiếu source trên nhánh **PEEP2**.

Tài liệu dành cho team Backend để phân chia công việc và theo dõi tiến độ. Trạng thái dưới đây được xác nhận bằng đọc source, **chưa phải kết quả kiểm thử runtime**. Không suy ra một API đã hoàn tất chỉ vì có controller/service.

## 1. Cơ sở và mục tiêu

Nguồn đối chiếu:

- `D:\LazTar\Tài Liệu\WMS_Sprint0_Ke_hoach.docx`: 5 domain A–E, business rules, phụ thuộc và kịch bản xuyên domain.
- `D:\LazTar\Tài Liệu\plan_week2.md`: mục tiêu và API Week 2, phân công thành viên.
- `D:\LazTar\Tài Liệu\WMS_Default_Permissions.md`: danh mục permission và role mặc định đề xuất.
- Controller, service, Prisma schema/migration, seed và README trong `warehouse_be`.

Mục tiêu Week 2 là hoàn thiện nền tảng Auth/RBAC, danh mục kho/hàng và core inventory/ledger; sửa các điểm sai trong BE hiện có, bổ sung API còn thiếu và thống nhất tài liệu bàn giao.

Không đưa FE vào bảng công việc. Các workflow receipt/shipment, task, kiểm kê, QC và adjustment có duyệt được đưa vào backlog sau Week 2. Lịch Sprint 0 tháng 9 là lịch thiết kế cũ, không sử dụng làm deadline của đợt này.

## 2. Bảng phân công chính

| Người phụ trách | Domain/phạm vi | Trách nhiệm chính | Người review |
| --- | --- | --- | --- |
| Nguyễn Hoàng Nam | A — Authentication & RBAC | Rà login/refresh/me, user/role; API permissions; cơ chế permission và scope dùng chung; contract xác thực cho B–E | Thuận Lê |
| Trung Phạm | B — Warehouse Structure | Warehouse, location, cây vị trí, trạng thái và quyền theo kho | Nguyễn Hoàng Nam |
| Trung Phạm | C — Product & Supplier | SKU, UOM, conversion, barcode, supplier và liên kết SKU–supplier | Nguyễn Hoàng Nam |
| Thuận Lê | D — Inventory Model | Tra cứu tồn, tồn khả dụng bán được, reserve/release, concurrency và ràng buộc tồn | Trung Phạm |
| Thuận Lê | E — Stock Ledger & Movement | Ghi/đảo ledger, transaction, khóa đồng thời, append-only và đối soát | Trung Phạm |
| Thuận Lê + Nguyễn Hoàng Nam | DB và seed dùng chung | Thuận phụ trách migration/DB; Nam chốt ma trận permission; phối hợp seed role, quyền và admin có thể chạy lại | Trung Phạm |
| Cả 3 người BE | Tích hợp và bàn giao | Review chéo, contract Swagger, README, checklist kiểm tra và kết quả thực tế | Cả nhóm |

### Mốc phối hợp

| Mốc | Đầu ra | Phụ thuộc |
| --- | --- | --- |
| M1 — Chốt nền tảng | Contract API, mã quyền, quy tắc scope, cách dựng DB và danh sách lỗi ưu tiên | Đối chiếu source và tài liệu |
| M2 — Sửa API hiện có | Phân quyền, validation, audit, business rules của A–E | M1 |
| M3 — Bổ sung phần còn thiếu | API Week 2 còn thiếu; Swagger và seed tương ứng | M2 và khóa/contract B–C |
| M4 — Tích hợp và bàn giao | Các kịch bản xuyên domain được kiểm tra; README/API checklist phản ánh đúng source | M3 |

Team tự điền deadline và tiến độ tại stand-up. Người phụ trách không tự xác nhận Done: người review kiểm tra đầu ra và bằng chứng trước khi đánh dấu hoàn tất.

## 3. Danh mục API

### Quy ước trạng thái

- **Có route:** controller đã khai báo; vẫn phải rà nghiệp vụ, quyền và chạy kiểm tra.
- **Có service:** đã có logic nội bộ nhưng chưa có route tương ứng.
- **Chưa có:** chưa thấy controller/route trong source đã đối chiếu.
- **Đề xuất:** endpoint bổ sung cho phạm vi domain, cần thống nhất contract trước khi code.

Tất cả đường dẫn dùng prefix `/api`. Quyền trong bảng là mục tiêu cần áp dụng; không đồng nghĩa guard hiện tại đã kiểm tra các mã đó.

### Domain A — Nam phụ trách

| Method | Endpoint | Chức năng | Policy/quyền | Hiện trạng / việc cần làm |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/login` | Login bằng username/email | Public | Có route; rà định danh mơ hồ, trạng thái tài khoản, response token |
| POST | `/api/auth/refresh` | Cấp token từ refresh token | Public; refresh token hợp lệ | Có route; rà tokenType, BIGINT userId và tài khoản ACTIVE |
| GET | `/api/auth/me` | Hồ sơ của chính user | Access token hợp lệ | Có route; chỉ trả role/assignment active, không lộ password hash |
| GET | `/api/users` | Danh sách user | ADMIN global hoặc USER.MANAGE global | Có route; rà phân trang, search và profile |
| POST | `/api/users` | Tạo user | ADMIN global hoặc USER.MANAGE global | Có route; rà xung đột định danh, validation và concurrent create |
| GET | `/api/users/{id}` | Chi tiết user | ADMIN global hoặc USER.MANAGE global | Có route; giữ profile trực tiếp, ID string |
| PUT | `/api/users/{id}` | Sửa tên/trạng thái | ADMIN global hoặc USER.MANAGE global | Có route; chặn tự khóa và ghi updatedBy |
| GET | `/api/roles` | Danh sách role active | Policy USER.MANAGE hiện tại | Có route; ghi rõ khác biệt với mã ROLE.READ trong bảng quyền đề xuất |
| GET | `/api/permissions` | Danh sách quyền | PERMISSION.READ; ADMIN global mặc định | Chưa có; bổ sung API tra cứu danh mục quyền |
| POST | `/api/users/{id}/roles` | Gán/kích hoạt lại role theo scope | Chỉ ADMIN global | Có route; rà idempotence và unique scope null/kho |

`DELETE /api/users/{id}` và `POST /api/auth/register` không có route trong source hiện tại. Khóa user qua PUT. CRUD role, gán/gỡ permission và thu hồi assignment là backlog mở rộng Domain A, không tự coi đã nằm trong Week 2.

### Domain B — Trung phụ trách

| Method | Endpoint | Chức năng | Quyền mục tiêu | Hiện trạng / việc cần làm |
| --- | --- | --- | --- | --- |
| GET | `/api/warehouses` | Danh sách kho | WAREHOUSE.READ | Có route, đang Public; bỏ public và lọc theo scope |
| POST | `/api/warehouses` | Tạo kho | WAREHOUSE.CREATE | Có route; bổ sung authorization, validation/audit |
| GET | `/api/warehouses/{id}` | Chi tiết kho | WAREHOUSE.READ | Có route, đang Public; kiểm tra quyền đúng kho |
| PUT | `/api/warehouses/{id}` | Cập nhật kho | WAREHOUSE.UPDATE | Có route; kiểm tra scope, trạng thái và mã nghiệp vụ |
| DELETE | `/api/warehouses/{id}` | Deactivate kho | WAREHOUSE.DEACTIVATE | Có route; mô tả đúng soft deactivate, chốt điều kiện tồn/phụ thuộc |
| GET | `/api/warehouses/{warehouseId}/locations` | Sơ đồ/danh sách vị trí | LOCATION.READ | Có route, đang Public; validation query và lọc đúng kho |
| POST | `/api/warehouses/{warehouseId}/locations` | Tạo vị trí | LOCATION.CREATE | Có route; kiểm tra kho, cha, thứ tự cấp và unique code |
| PUT | `/api/warehouses/{warehouseId}/locations/{id}` | Cập nhật vị trí | LOCATION.UPDATE | Có route; hiện service update theo id chưa ràng buộc warehouse trên path |
| DELETE | `/api/warehouses/{warehouseId}/locations/{id}` | Deactivate vị trí | LOCATION.DEACTIVATE | Có route; bổ sung scope, ownership và chặn còn tồn |

Giữ contract location lồng trong warehouse để khớp source; cập nhật tài liệu cũ dùng `/api/locations` nếu nhóm không chủ đích đổi route. Không thêm API detail location vào scope bắt buộc khi chưa có nhu cầu.

### Domain C — Trung phụ trách

| Method | Endpoint | Chức năng | Quyền mục tiêu | Hiện trạng / việc cần làm |
| --- | --- | --- | --- | --- |
| GET | `/api/skus` | Danh sách hàng hóa | SKU.READ | Có route, đang Public; chuẩn hóa query/quyền |
| POST | `/api/skus` | Tạo SKU | SKU.CREATE | Có route; validation, base UOM active và tracking |
| GET | `/api/skus/{id}` | Chi tiết SKU | SKU.READ | Có route, đang Public; rà thông tin conversion/barcode cần trả |
| PUT | `/api/skus/{id}` | Sửa SKU | SKU.UPDATE | Có route; chặn đổi base UOM/tracking khi có dữ liệu không tương thích |
| DELETE | `/api/skus/{id}` | Deactivate SKU | SKU.DEACTIVATE | Có route; chốt điều kiện tồn và luồng DISCONTINUED |
| GET | `/api/uoms` | Danh sách UOM | UOM.READ | Có route, đang Public; validation query/quyền |
| POST | `/api/uoms` | Tạo UOM | UOM.CREATE | Có route; unique code, validation/audit |
| GET | `/api/uoms/{id}` | Chi tiết UOM | UOM.READ | Có route, đang Public; bảo vệ theo quyền danh mục |
| PUT | `/api/uoms/{id}` | Sửa UOM | UOM.UPDATE | Có route; rà mã và bản ghi đã tham chiếu |
| DELETE | `/api/uoms/{id}` | Deactivate UOM | UOM.DEACTIVATE | Có route; kiểm tra tham chiếu trước khi ngừng sử dụng |
| GET | `/api/suppliers` | Danh sách nhà cung cấp | SUPPLIER.READ | Chưa có; có model DB |
| POST | `/api/suppliers` | Tạo nhà cung cấp | SUPPLIER.CREATE | Chưa có; nằm trong checklist chuẩn bị Week 2 |
| GET | `/api/suppliers/{id}` | Chi tiết nhà cung cấp | SUPPLIER.READ | Đề xuất bổ sung |
| PUT | `/api/suppliers/{id}` | Sửa nhà cung cấp | SUPPLIER.UPDATE | Đề xuất bổ sung |
| DELETE | `/api/suppliers/{id}` | Deactivate nhà cung cấp | SUPPLIER.DEACTIVATE | Đề xuất bổ sung; không xóa dữ liệu đã tham chiếu |
| GET | `/api/skus/{skuId}/conversions` | Quy đổi đơn vị SKU | SKU_CONVERSION.READ | Chưa có route riêng; detail SKU hiện có đọc conversion |
| POST | `/api/skus/{skuId}/conversions` | Thêm quy đổi | SKU_CONVERSION.MANAGE | Đề xuất; có model DB |
| PUT | `/api/skus/{skuId}/conversions/{id}` | Sửa quy đổi | SKU_CONVERSION.MANAGE | Đề xuất; factor dương, không làm sai dữ liệu đã phát sinh |
| DELETE | `/api/skus/{skuId}/conversions/{id}` | Gỡ quy đổi | SKU_CONVERSION.MANAGE | Đề xuất; kiểm tra tham chiếu và ownership |
| GET | `/api/skus/{skuId}/barcodes` | Danh sách barcode | SKU_BARCODE.READ | Đề xuất; có model DB |
| POST | `/api/skus/{skuId}/barcodes` | Thêm barcode | SKU_BARCODE.MANAGE | Đề xuất; unique toàn hệ thống |
| PUT | `/api/skus/{skuId}/barcodes/{id}` | Sửa barcode | SKU_BARCODE.MANAGE | Đề xuất; kiểm tra SKU/UOM và primary |
| DELETE | `/api/skus/{skuId}/barcodes/{id}` | Gỡ barcode | SKU_BARCODE.MANAGE | Đề xuất; kiểm tra ownership/tham chiếu |
| GET | `/api/skus/{skuId}/suppliers` | Nhà cung cấp của SKU | SKU_SUPPLIER.READ | Đề xuất; có model DB |
| POST | `/api/skus/{skuId}/suppliers` | Liên kết SKU–supplier | SKU_SUPPLIER.MANAGE | Đề xuất; khóa liên kết không trùng |
| PUT | `/api/skus/{skuId}/suppliers/{supplierId}` | Sửa liên kết | SKU_SUPPLIER.MANAGE | Đề xuất |
| DELETE | `/api/skus/{skuId}/suppliers/{supplierId}` | Gỡ liên kết | SKU_SUPPLIER.MANAGE | Đề xuất; kiểm tra tham chiếu |

Ưu tiên hoàn thiện SKU/UOM và supplier GET/POST trước. CRUD mở rộng conversion/barcode/supplier là phần mở rộng của domain C; chỉ nhận vào deadline Week 2 sau khi team xác nhận năng lực. SKU/UOM/supplier là danh mục chung, không giả định có ownership theo kho khi schema chưa có.

### Domain D–E — Thuận phụ trách

| Method | Endpoint | Chức năng | Quyền mục tiêu | Hiện trạng / việc cần làm |
| --- | --- | --- | --- | --- |
| GET | `/api/inventory` | Tồn chi tiết | INVENTORY.READ | Có route; chưa thấy policy permission/scope trên controller |
| GET | `/api/inventory/available` | Tồn khả dụng bán được | INVENTORY.AVAILABLE.READ | Chưa có; loại QC/DAMAGED và dữ liệu kho/vị trí không hợp lệ |
| POST | `/api/inventory/reserve` | Giữ chỗ tồn | INVENTORY.RESERVE | Chưa có; transaction/lock, không ghi ledger |
| POST | `/api/inventory/release` | Hủy giữ chỗ | INVENTORY.RELEASE | Chưa có; chặn release vượt lượng đã giữ |
| GET | `/api/stock-ledger` | Lịch sử biến động | STOCK_LEDGER.READ | Có route; bổ sung permission/scope, query hợp lệ và thứ tự ổn định |
| POST | `/api/stock-ledger/transaction` | Ghi biến động + cập nhật tồn | ADMIN global trong API core Week 2 | Có service recordMovement, chưa có route; chốt DTO/response |
| POST | `/api/stock-ledger/{id}/reversal` | Đảo giao dịch sai | STOCK_LEDGER.REVERSE; ADMIN global mặc định | Có service reverseMovement, chưa có route; chặn đảo hai lần |

Contract ghi ledger phải thống nhất trước khi nối API:

- ID dùng string. `quantity` là decimal dương; dấu lấy từ movement type, không nhận `qtyChange` có dấu theo ví dụ cũ.
- Người thực hiện lấy từ `request.user.id`; loại `actorUserId` khỏi public request body.
- Không cho client ghi `qtyAvailable`, `qtyBefore`, `qtyAfter` hoặc giả mạo audit.
- Core transaction tổng quát Week 2 chỉ dành ADMIN global; không tự cấp quyền gọi giao dịch tùy ý cho Receiver/Picker.
- Putaway/transfer gồm hai vế trong cùng transaction; pick/ship phải có luồng vị trí rõ để không trừ tồn hai lần.
- Reserve/release và lỗi tranh chấp phải có contract rõ trước khi bàn giao; không coi referenceId hiện tại tự đảm bảo idempotency.

### API hạ tầng đang có

| Method | Endpoint | Hiện trạng | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/health` | Có route public | Health check |
| POST | `/api/file/upload` | Có route | Upload Cloudinary; ngoài nghiệp vụ WMS chính |
| DELETE | `/api/file/images/{publicId}` | Có route | Xóa ảnh; rà quyền nếu sử dụng trong WMS |
| GET | `/api` | AppController template | Rà nhu cầu giữ route và mô tả |

## 4. Checklist công việc theo ưu tiên

**P0:** quyền và tính toàn vẹn dữ liệu. **P1:** hoàn thiện nghiệp vụ/API. **P2:** tài liệu/dọn code. Tất cả công việc dưới đây khởi đầu là **Chưa nghiệm thu**.

| Mã | Ưu tiên | Người làm | Review | Việc cần làm | Phụ thuộc | Điều kiện hoàn tất |
| --- | --- | --- | --- | --- | --- | --- |
| A-01 | P0 | Nam | Thuận | Chốt permission guard dùng chung và scope trên cùng assignment | Ma trận quyền | Role/assignment inactive bị loại; sai quyền/scope bị chặn |
| A-02 | P0 | Nam | Thuận | Hướng dẫn B–E kiểm tra kho từ bản ghi thực tế và lọc danh sách | A-01 | Không ghép permission kho A với scope kho B; không lộ danh sách kho ngoài quyền |
| A-03 | P1 | Nam | Thuận | Rà Auth/User đã có: tokenType, ambiguity, self-lock, audit, concurrent create/assign | Source A | Contract và các ca lỗi được ghi nhận đúng |
| A-04 | P1 | Nam | Thuận | GET permissions và đồng bộ Swagger/policy RBAC | A-01 | Danh sách quyền đúng DB; quyền quản trị global rõ ràng |
| DB-01 | P0 | Thuận | Trung | Đối chiếu schema/migration/ERD; generated qty_available, check constraints, partial unique, append-only và no-truncate | ERD và business rules | Có bảng sai khác và quyết định; dựng DB mới bằng migrations giữ đủ ràng buộc |
| DB-02 | P0 | Thuận | Trung | Rà unique inventory với lot/serial null và race tạo dòng tồn | DB-01 | Không tồn tại hai dòng cùng khóa nghiệp vụ khi request đồng thời |
| DB-03 | P1 | Thuận + Nam | Trung | Seed role/quyền/admin/movement/reference chạy lại an toàn | Ma trận quyền được chốt | Chạy lại không trùng; không reset mật khẩu hoặc xóa tùy chỉnh ngoài chủ đích |
| B-01 | P0 | Trung | Nam | Bỏ Public của danh mục và áp dụng quyền/scope | A-01 | Kho/location được bảo vệ; lỗi 401/403 đúng |
| B-02 | P0 | Trung | Nam | Ràng buộc location id với warehouseId trên path khi sửa/deactivate | B-01 | Không sửa location kho B qua path kho A |
| B-03 | P1 | Trung | Nam | Kiểm tra cây: cấp cha, cùng kho, active, chu kỳ và fullPath | Quy tắc location | Tạo/sửa không làm sai cây; không đổi loại vị trí gây dữ liệu bất hợp lệ |
| B-04 | P1 | Trung | Thuận | Chặn deactivate vị trí còn tồn; chốt deactivate kho/cây con | D-01 | Quy tắc được áp dụng, kể cả request đồng thời cần bảo vệ |
| C-01 | P0 | Trung | Nam | Bảo vệ đọc/ghi SKU/UOM, validation và audit | A-01 | Đọc/ghi đúng role; mã trùng trả lỗi rõ ràng |
| C-02 | P1 | Trung | Thuận | Bảo vệ base UOM/tracking/status đã phát sinh tồn/ledger | D/E | Không làm sai đơn vị hoặc lô/serial của dữ liệu cũ |
| C-03 | P1 | Trung | Nam | Supplier GET/POST | Schema C | DTO/response/quyền và unique code rõ |
| C-04 | P1 | Trung | Thuận | Conversion/barcode phục vụ tra cứu và quy đổi; chốt phần CRUD nhận vào Week 2 | C-02 | Factor dương, barcode unique, ownership và precision đúng |
| C-05 | P2 | Trung | Nam | CRUD supplier và liên kết SKU–supplier mở rộng | C-03, team chốt scope | Contract và quy tắc tham chiếu được duyệt trước triển khai |
| D-01 | P0 | Thuận | Nam | Lọc scope cho inventory/ledger và chuẩn hóa query ID/phân trang | A-01 | Không lộ dữ liệu kho khác; ID sai không gây 500 |
| D-02 | P1 | Thuận | Trung | API tồn khả dụng bán được | B/C | Tồn QC/DAMAGED không được tính; tổng theo filter chính xác |
| D-03 | P0 | Thuận | Trung | Reserve/release với concurrency | DB-02 | reserved không âm/không vượt on_hand; ledger không đổi |
| E-01 | P0 | Thuận | Trung | Rà recordMovement: precision, transaction, race tạo tồn và optimistic lock | DB-02, B/C | Ledger + inventory commit/rollback cùng nhau; không mất cập nhật |
| E-02 | P0 | Thuận | Trung | Rà reversal và tranh chấp đảo cùng giao dịch | E-01 | Một giao dịch chỉ đảo một lần; tồn và reserved vẫn hợp lệ |
| E-03 | P1 | Thuận | Nam | Nối route transaction/reversal; actor lấy từ token | E-01/02, A-01 | Swagger/DTO/quyền khớp; client không giả mạo người thực hiện |
| E-04 | P1 | Thuận | Trung | Chốt putaway/transfer/pick/ship và đối soát | Business Flow Sprint 0 | Không mất hàng hoặc trừ tồn hai lần; tổng ledger khớp tồn |
| X-01 | P1 | Cả nhóm | Review chéo | Dùng parser BIGINT chung, ID string, decimal chính xác, pagination ổn định và audit | Contract M1 | API thống nhất; BIGINT vượt Number không bị làm tròn |
| X-02 | P2 | Cả nhóm | Review chéo | Cập nhật README/Swagger/API checklist | M3 | Route public, method/path, ví dụ và response đúng source |
| X-03 | P2 | Cả nhóm | Review chéo | Rà DTO/template/import/comment dư; xác minh encoding thay vì kết luận từ terminal | Source từng domain | Dọn đúng file đã xác nhận; không xóa chức năng đang sử dụng |

### Các lệch đã xác nhận qua source

- README vẫn ghi register, PATCH/DELETE user và POST user public; không khớp controller hiện tại.
- README dùng `prisma db push` làm hướng dẫn dựng DB; cách này không thay thế việc áp dụng SQL migration có constraint/trigger riêng.
- Một số GET warehouse/location/SKU/UOM có `@Public()`.
- Controller B–E chưa gắn policy permission như User/Role; đăng nhập hợp lệ chưa đồng nghĩa có quyền thao tác mọi kho.
- Location PUT/DELETE có warehouseId trong route nhưng controller chỉ truyền location id xuống service; service hiện chưa đối chiếu ownership với warehouse trên path.
- Location deactivate hiện kiểm tra vị trí con, chưa thấy kiểm tra tồn kho trong service đó.
- SKU update hiện kiểm tra UOM tồn tại, chưa thấy chặn đổi base UOM khi đã phát sinh dữ liệu.
- Query inventory/ledger hỗ trợ nhiều kiểu phân trang và ID `number | string`; cần thống nhất validation/giới hạn.
- DTO record movement nhận actorUserId từ input; chưa được dùng làm public API contract an toàn.
- Core ghi/đảo movement có service nhưng controller ledger hiện chỉ khai báo GET.
- Seed hiện chỉ tạo permission USER.MANAGE cho ADMIN; bảng quyền mở rộng chưa được seed đầy đủ.

Các mục unique null inventory, concurrency, trạng thái SKU và quy đổi phải được rà sâu/kiểm chứng trước khi kết luận là bug. Không tự sửa schema chỉ theo gợi ý Sprint 0 nếu ERD chốt khác.

## 5. Điểm nối giữa domain cần xác nhận

| Điểm nối | Người xác nhận | Quyết định/đầu ra cần có |
| --- | --- | --- |
| A ↔ B | Nam + Trung | Assignment theo kho, ownership path và scope lọc danh sách |
| A ↔ D/E | Nam + Thuận | Permission tra cứu/ghi/đảo; actor từ token; lỗi 401/403 |
| B ↔ D | Trung + Thuận | Loại location được chứa tồn, QC/DAMAGED, isPickable và deactivate |
| C ↔ D/E | Trung + Thuận | Base UOM, conversion, lot/serial và trạng thái SKU |
| D ↔ E | Thuận + Trung review | Khóa dòng tồn, reserve không ghi ledger, transaction và precision |
| Business Flow ↔ ledger | Cả nhóm | Putaway/transfer hai vế; pick/ship không trừ hai lần; reference và reversal |

Giữ BIGINT cho khóa, DECIMAL(18,4) cho số lượng, audit UTC, ledger append-only. Không sửa mã nghiệp vụ đã phát sinh giao dịch nếu chưa có quy tắc bảo vệ.

## 6. Checklist nghiệm thu và bàn giao

Không yêu cầu viết/chạy unit test trong phạm vi đã thống nhất. Khi sửa code, người làm ghi bằng chứng TypeScript/build, diff check và smoke/integration phù hợp trên DB test riêng; tài liệu này không khẳng định các kiểm tra đã chạy.

- [ ] Dựng DB mới bằng migrate deploy → generate → seed, giữ đủ generated column/constraints/triggers.
- [ ] Seed chạy lại không tạo role/admin/assignment trùng.
- [ ] Token thiếu/sai/hết hạn/sai loại trả 401; thiếu quyền hoặc sai kho trả 403.
- [ ] ADMIN global được phép quản trị; ADMIN scoped không vượt quyền global.
- [ ] Role/assignment inactive không cấp quyền; user khóa không dùng access/refresh còn hạn.
- [ ] ID sai/zero/vượt BIGINT trả 400; ID hợp lệ lớn hơn Number giữ chính xác.
- [ ] ID hợp lệ không tồn tại trả 404; dữ liệu trùng trả 409 khi thích hợp.
- [ ] Tự khóa bị chặn; DELETE user không có route; password hash không xuất hiện trong response.
- [ ] GET danh sách không lộ dữ liệu kho ngoài quyền; location trên path phải thuộc đúng kho.
- [ ] Mã danh mục trùng, cây sai cấp, đổi base UOM sau giao dịch và deactivate vị trí còn tồn bị chặn.
- [ ] Nhập 10 BOX với 1 BOX = 12 EA ghi nhận chính xác 120 EA theo base UOM.
- [ ] Putaway hai vế không đổi tổng tồn và rollback toàn bộ nếu một vế lỗi.
- [ ] Giữ chỗ 30 EA chỉ đổi reserved/available, không ghi ledger.
- [ ] Hai request tranh chấp lượng tồn cuối không làm tồn âm hoặc reserved vượt on_hand.
- [ ] Pick/ship không trừ tồn hai lần theo Business Flow đã chốt.
- [ ] Điều chỉnh/đảo giao dịch có người thực hiện và reference rõ; không đảo hai lần.
- [ ] SUM(qty_change) theo đúng khóa tồn bằng qty_on_hand; ledger cấm UPDATE/DELETE/TRUNCATE theo migration.
- [ ] Swagger thể hiện Authorization đúng, ví dụ request/response đúng contract.
- [ ] README không ghi route cũ; mỗi API có owner, quyền/scope và kết quả kiểm tra thực tế.

## 7. Backlog sau Week 2

| Nhóm | Đầu mối đề xuất | Dữ liệu/bảng cần thiết | Phụ thuộc và lưu ý |
| --- | --- | --- | --- |
| RBAC mở rộng | Nam | Dùng bảng A hiện có | CRUD role, gán/gỡ permission, revoke assignment; bảo vệ ADMIN global |
| Receipt | Thuận; Trung review danh mục | Phiếu nhập và dòng hàng | Core ledger, SKU/UOM/supplier; receive phải kiểm tra người được giao |
| Shipment | Thuận; Trung review tồn | Phiếu xuất và dòng hàng | Reserve/picking/staging; chốt người confirm shipment |
| Task picking/putaway | Thuận; Nam review quyền | Task và chi tiết từng loại | Chốt TASK chung vs task chuyên biệt; nhân viên chỉ xác nhận việc được giao |
| Cycle count | Thuận; Trung review khóa tồn | Phiên kiểm kê và kết quả đếm | Assignment, read/count/submit/review và snapshot/đối soát |
| Quality | Thuận; Trung review location | Hồ sơ và kết quả QC | QC location và chính sách ảnh hưởng tồn khả dụng |
| Adjustment có duyệt | Thuận; Nam review phân tách nhiệm vụ | Đề xuất, dòng điều chỉnh và quyết định duyệt | Người tạo/gửi không tự duyệt, kể cả ADMIN; approve mới gọi ledger |
| Danh mục/API mở rộng | Trung | Dùng các bảng C hiện có | Hoàn thiện phần CRUD chưa nhận vào deadline Week 2 |

Chưa cần thêm toàn bộ bảng nghiệp vụ ngay. Permission có thể được seed sau khi chốt, nhưng chỉ có hiệu lực khi API/service kiểm tra. Nếu nhận triển khai workflow adjustment có duyệt thì phải thêm bảng đề xuất cùng đợt; stock ledger không thay thế nơi lưu nháp/chờ duyệt.

## 8. Mẫu cập nhật tiến độ cho team

| Mã việc | Người làm | Trạng thái | PR/commit hoặc đầu ra | Kết quả kiểm tra | Người review | Vướng mắc |
| --- | --- | --- | --- | --- | --- | --- |
| Điền mã từ mục 4 | Điền tên | Todo / Doing / Review / Done / Blocked | Điền link hoặc đường dẫn | Ghi kết quả thực tế | Điền tên | Ghi phụ thuộc/câu hỏi |

Trạng thái **Done** yêu cầu contract đúng, business rule được bảo vệ, bằng chứng kiểm tra phù hợp và reviewer xác nhận. Các nội dung đề xuất trong tài liệu cần được team chốt trước khi biến thành yêu cầu triển khai.
