# Giới thiệu Dự án PEEP WMS - Slide Content

Dưới đây là cấu trúc nội dung chi tiết được thiết kế sẵn để đưa lên slide thuyết trình.

---

## Slide 1: Giới thiệu Dự án (Project Overview)
**Tiêu đề:** Hệ thống Quản lý Kho Thông minh (WMS - Warehouse Management System)

*   **Mục tiêu:** Số hóa và tự động hóa toàn bộ quy trình vận hành kho bãi (Nhập - Xuất - Chuyển - Kiểm kê).
*   **Định hướng:** Đảm bảo tính toàn vẹn dữ liệu (Data Integrity) tuyệt đối, truy xuất nguồn gốc tồn kho minh bạch.


---

## Slide 2: Ngăn xếp Công nghệ (Tech Stack)
**Tiêu đề:** Công nghệ & Kiến trúc Hệ thống

*   **Backend:** NestJS, TypeScript, Prisma ORM.
*   **Frontend:** ReactJS / Next.js, React Query, TailwindCSS.
*   **Cơ sở dữ liệu:** Hệ quản trị CSDL quan hệ (PostgreSQL/MySQL), tối ưu hóa Transaction.
*   **Kiến trúc:** 
    *   API-First & Modular Design.
    *   Centralized Ledger (Phễu tính toán tồn kho tập trung).

---

## Slide 3: Điểm nhấn Kỹ thuật (Technical Highlights)
**Tiêu đề:** Giải pháp Kỹ thuật Cốt lõi

*   **Optimistic Locking (Khóa lạc quan):** Xử lý triệt để bài toán đồng thời (Concurrency) - chặn đứng việc 2 nhân viên cùng xuất 1 món hàng gây âm kho (Lỗi 409 Conflict).
*   **Ledger-Driven Inventory:** Mọi biến động tồn kho không sửa trực tiếp (No direct update) mà phải chạy qua 1 Phễu trung tâm (`InventoryLedgerService`) để ghi nhận lịch sử (Sổ cái) cực kỳ minh bạch.
*   **Strict RBAC Matrix:** Hệ thống phân quyền động, check quyền (Permissions) cực chi tiết trên từng API Endpoint.


---

## Slide 4: Hệ thống Phân quyền (Roles & Responsibilities)
**Tiêu đề:** 7 Vai trò vận hành (RBAC)

1.  **ADMIN:** Toàn quyền hệ thống, quản lý User & Role.
2.  **WH_MANAGER (Quản lý kho):** Quản trị kho tổng, Master Data, phê duyệt xuất/nhập/điều chỉnh/chuyển kho.
3.  **SUPERVISOR (Giám sát ca):** Điều phối task, giao việc cho nhân viên, tạo đợt kiểm kê.
4.  **RECEIVER (NV Nhận hàng):** Nghiệp vụ Inbound, nhận hàng từ NCC và cất lên kệ (Putaway).
5.  **PICKER (NV Soạn hàng):** Nghiệp vụ Outbound, nhặt hàng theo phiếu xuất (Pick task).
6.  **INSPECTOR (NV Kiểm kê):** Thực thi đếm số lượng thực tế, đề xuất điều chỉnh chênh lệch.
7.  **VIEWER (Kế toán/Sale):** Chỉ xem (Read-only) để báo giá và kiểm tra lượng tồn.

---

## Slide 5: Các Luồng Nghiệp Vụ Cốt Lõi (Phần 1)
**Tiêu đề:** Luồng Nhập - Xuất Cơ Bản

*   📥 **Luồng Nhập kho (Inbound):**
    *   *Quy trình:* Tạo Phiếu Nhập -> Supervisor phân công -> Receiver xác nhận nhận hàng -> Cất lên kệ (Putaway).
*   📤 **Luồng Xuất kho (Outbound - Shipment):**
    *   *Quy trình:* Tạo Yêu cầu -> Giữ chỗ (Reserve) -> Phân công Picker -> Nhặt hàng sang khu vực Chờ (STAGING) -> Chốt Giao bưu (Dispatch).
    *   *Tính năng:* Chống xuất lố hàng, gợi ý FEFO (Hết hạn trước xuất trước).

---

## Slide 6: Các Luồng Nghiệp Vụ Chuyên Sâu (Phần 2)
**Tiêu đề:** Vận hành Nội bộ & Xử lý Ngoại lệ

*   🔄 **Luồng Chuyển kho (Transfer):**
    *   Chuyển hàng giữa các kho vật lý.
    *   Gồm 2 vế độc lập: Kho A chốt gửi -> Kho B duyệt và chốt nhận.
*   📝 **Kiểm kê & Điều chỉnh (Cycle Count & Adjustment):**
    *   Thực hiện kiểm kê định kỳ, so khớp Tồn kho thực tế (Actual) vs Hệ thống (System).
    *   Phải qua quy trình 2 bước: Inspector đề xuất -> Manager phê duyệt
*   ⏪ **Bút toán đảo (Reversal Request):**
    *   Tính năng "Undo": Chỉ cho phép Admin/Manager đảo chứng từ khi phát hiện sai sót.
