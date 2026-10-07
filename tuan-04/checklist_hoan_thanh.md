# BẢNG TỔNG HỢP CHECKLIST BÁO CÁO CÔNG VIỆC

Dưới đây là bảng tổng hợp các chức năng của toàn bộ hệ thống WMS, được phân rã theo từng **Role (Vai trò)** và chia rõ tiến độ của **Backend (BE)** / **Frontend (FE)**. 
*(Bạn có thể thay đổi đánh dấu `[x]` thành `[ ]` tùy theo tiến độ thực tế của team trước khi mang đi báo cáo).*

### 1. Nhóm Quản trị (Admin & Manager)

| Vai trò | Phân hệ / Chức năng | Chi tiết nghiệp vụ | Backend | Frontend | Ghi chú |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Admin** | **Hệ thống & User** | Quản lý Tài khoản, Vai trò, Phân quyền RBAC động | [x] | [x] | Khung phân quyền đã chốt cứng |
| **Admin** | **Nhà cung cấp** | CRUD Suppliers, Map SKU với Nhà cung cấp | [x] | [ ] | API đã hoàn thiện ở Tuần 3 |
| **Admin** | **Bút toán đảo** | Xem minh chứng và Duyệt Yêu cầu Bút toán đảo | [ ] | [ ] | Task của Tuần 4 |
| **Manager**| **Master Data** | Quản lý Kho, Sơ đồ Vị trí (Location), Danh mục SKU, UOM | [x] | [x] | API hoàn thiện từ Tuần 2 |
| **Manager**| **Tồn kho & Sổ cái** | Xem bảng `inventory`, lịch sử `stock_ledger` | [x] | [ ] | Giao diện hiển thị FE |
| **Manager**| **Điều chỉnh nhanh** | Xem Tồn kho -> Click điều chỉnh -> Tạo phiếu & Tự duyệt | [ ] | [ ] | Giao diện Popup Quick Adjust |
| **Manager**| **Chuyển kho** | Kho Nguồn: Tạo phiếu Transit & Chọn NV xuất | [ ] | [ ] | Task của Tuần 4 |
| **Manager**| **Chuyển kho** | Kho Đích: Duyệt phiếu Transit & Chọn NV nhận | [ ] | [ ] | Task của Tuần 4 |
| **Manager**| **Bút toán đảo** | Xem lịch sử -> Phát hiện sai -> Tạo Yêu cầu đảo giao dịch | [ ] | [ ] | Cần upload minh chứng/lý do |

---

### 2. Nhóm Điều phối (Supervisor)

| Vai trò | Phân hệ / Chức năng | Chi tiết nghiệp vụ | Backend | Frontend | Ghi chú |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Supervisor** | **Nhập hàng** | Lập Phiếu nhập (Receipt), Gán việc cho Receiver | [x] | [ ] | Đã chốt luồng API Tuần 3 |
| **Supervisor** | **Xuất hàng** | Lập Phiếu xuất (Shipment), Gán việc cho Picker | [ ] | [ ] | Task Tuần 4 |
| **Supervisor** | **Phân bổ FEFO** | Gọi API lấy Gợi ý FEFO -> Chỉ định lô hàng thủ công | [ ] | [ ] | Khóa lô hàng (Reserve) |
| **Supervisor** | **Kiểm kê** | Lập Đợt kiểm kê (Cycle Count) theo vùng/SKU, Gán việc | [ ] | [ ] | |
| **Supervisor** | **Xử lý Ngoại lệ** | Nhận cảnh báo Picker báo thiếu hàng -> Quyết định chốt | [ ] | [ ] | Task Tuần 4 |

---

### 3. Nhóm Vận hành Kho (Receiver, Picker, Packer, Inspector)

| Vai trò | Phân hệ / Chức năng | Chi tiết nghiệp vụ | Backend | Frontend | Ghi chú |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Receiver** | **Nhận / Cất hàng** | Điền SL thực nhận, Lot, Expiry Date, Chọn Vị trí cất kệ | [x] | [ ] | API Transaction chặt chẽ |
| **Receiver** | **Mã QR** | Quét/In mã QR dán lên kiện hàng vừa nhận | [x] | [ ] | UI hiển thị Modal QR Code |
| **Picker** | **Soạn hàng** | Nhìn gợi ý FEFO -> Đến đúng Bin lấy hàng -> Điền SL thực | [ ] | [ ] | Task Tuần 4 |
| **Picker** | **Báo thiếu hàng** | Lấy không đủ -> Điền lý do thiếu -> Trạng thái PARTIAL | [ ] | [ ] | Ghi vào `dispatch_lines` |
| **Packer** | **Đóng gói (Dispatch)**| Quét mã kiện, Cân kiện hàng thực tế, Xác nhận Dispatch | [ ] | [ ] | Bước cuối của Xuất kho |
| **Inspector**| **Đếm kiểm kê** | Quét QR kệ -> Đếm số lượng thực tế từng Lô/Serial | [ ] | [ ] | |

---

### 4. Tổng kết Core Kỹ thuật (Technical Tasks)

| Hạng mục | Chi tiết | Tình trạng |
| :--- | :--- | :---: |
| **Database Design** | Sơ đồ ERD, thiết kế bảng `inventory`, `stock_ledger` | [x] Đã chốt |
| **Prisma Setup** | Setup Schema, Migration, Seed Data (`movement`, `reference`) | [x] Hoàn thành |
| **Authentication** | Đăng nhập JWT, Phân quyền RBAC (Role/Permission) | [x] Hoàn thành |
| **DB Transaction** | Đảm bảo tính toàn vẹn dữ liệu khi thao tác Tồn kho/Sổ cái | [ ] Đang làm |
| **Concurrency Lock** | Xử lý Race Condition khi nhiều người cùng lúc Pick/Receive | [ ] Tuần 4 |
