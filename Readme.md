# MotoChain: Hệ Thống Quản Lý Bảo Dưỡng Xe Máy Trên Nền Tảng Blockchain
**MotoChain** là một ứng dụng phi tập trung (dApp) hỗ trợ quản lý và truy xuất nguồn gốc lịch sử sửa chữa, bảo dưỡng xe máy. Hệ thống sử dụng hợp đồng thông minh (**Smart Contract**) trên mạng lưới Blockchain Ethereum (thử nghiệm cục bộ qua Hardhat/Ganache) kết hợp với hệ thống lưu trữ tệp phi tập trung **IPFS (Pinata API)** để đảm bảo tính minh bạch, bất biến và tính xác thực của thông tin dịch vụ.
---
![Poster](DinCongVyPoster.jpg)
## 📋 Mục lục
- [Tổng quan dự án](#-tổng-quan-dự-án)
- [Các tính năng nổi bật](#-các-tính-năng-nổi-bật)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc mã nguồn](#-cấu-trúc-mã-nguồn)
- [Hướng dẫn cài đặt & Chạy cục bộ](#-hướng-dẫn-cài-đặt--chạy-cục-bộ)
- [Cấu hình MetaMask & Local Blockchain](#-cấu-hình-metamask--local-blockchain)
- [Luồng nghiệp vụ chi tiết (Workflow)](#-luồng-nghiệp-vụ-chi-tiết-workflow)
- [Đặc tả Smart Contract](#-đặc-tả-smart-contract)
- [Giấy phép (License)](#-giấy-phép-license)
---
## 🌟 Tổng quan dự án
Trong thị trường mua bán và sử dụng xe máy, việc thiếu minh bạch về lịch sử sửa chữa, thay thế phụ tùng, hoặc tình trạng gian lận số kilomet (`odo-tuning`) là những thách thức lớn. **MotoChain** giải quyết vấn đề này bằng cách:
*   **Số hóa lịch sử bảo dưỡng:** Ghi nhận mọi thông tin bảo dưỡng trực tiếp lên Blockchain, không thể tẩy xóa hay sửa đổi đơn phương.
*   **Lưu trữ hóa đơn thông minh:** Lưu hóa đơn/biên nhận sửa chữa dạng ảnh lên **IPFS**, giúp tiết kiệm tối đa chi phí lưu trữ trên chuỗi (gas fee) nhưng vẫn đảm bảo chứng từ không bị giả mạo.
*   **Quy trình phân quyền chặt chẽ:** Chỉ những tác nhân có vai trò phù hợp (được xác thực bằng địa chỉ ví) mới có thể thực hiện các bước tương ứng trong vòng đời bảo dưỡng xe.
---
## ⚡ Các tính năng nổi bật
1.  **Phân quyền dựa trên Ví (Role-Based Access Control):**
    *   *Contract Owner:* Admin tối cao có quyền deploy contract và phê duyệt/đăng ký quyền cho các tài khoản ví khác.
    *   *Part Supplier:* Nhà cung cấp phụ tùng, ký nhận cung cấp linh kiện.
    *   *Admin:* Nhân viên hãng xe tiếp nhận xe và đưa xe vào chuỗi bảo dưỡng.
    *   *Authorized Garage:* Kỹ thuật viên sửa chữa trực tiếp và xác nhận hoàn tất dịch vụ.
    *   *Vehicle Owner:* Chủ sở hữu xe, kiểm tra và ký nghiệm thu xe.
2.  **Đăng ký xe & Tải tài liệu lên IPFS:**
    *   Tích hợp trực tiếp với **Pinata SDK/API** cho phép kéo thả ảnh hóa đơn sửa chữa lên IPFS và lưu trữ mã Hash (`ipfsHash`) vĩnh viễn trên blockchain.
3.  **Vận hành quy trình tự động (Interactive Workflow):**
    *   Giao diện tương tác tự động nhận diện địa chỉ ví MetaMask hiện tại để hiển thị các nút chức năng phù hợp với quyền hạn của ví đó.
4.  **Tra cứu lịch sử công khai (Timeline Tracking):**
    *   Cho phép bất kỳ ai (không cần đăng nhập) nhập ID của xe để tra cứu toàn bộ lịch sử từ lúc đăng ký đến lúc bàn giao, hiển thị chi tiết địa chỉ ví đã ký ở từng bước và xem trực tiếp hóa đơn gốc từ IPFS.
---
## 🏗️ Kiến trúc hệ thống
```
                                 [ Người Dùng / Trình Duyệt ]
                                               │
                                               ▼
     ┌───────────────────────────────────────────────────────────────────┐
     │                     Giao diện Next.js Web App                     │
     │                 (React, Tailwind CSS, Web3.js)                    │
     └───────────────────────────────────────────────────────────────────┘
               │                                         │
     (MetaMask / Web3 Link)                       (Pinata IPFS Gateway)
               ▼                                         ▼
     ┌──────────────────────┐                  ┌───────────────────┐
     │  Mạng lưới Blockchain│                  │ Pinata IPFS Cloud │
     │  (Smart Contract)    │                  │  (Lưu ảnh hóa đơn)│
     └──────────────────────┘                  └───────────────────┘
```
---
## 🛠️ Công nghệ sử dụng
### Frontend (Ứng dụng Web)
*   **Next.js 14 (App Router):** Framework React tối ưu hiệu năng và định tuyến.
*   **TypeScript:** Tăng tính an toàn dữ liệu và giảm thiểu lỗi logic.
*   **Tailwind CSS:** Thiết kế giao diện hiện đại, responsive cao.
*   **Web3.js:** Giao tiếp trực tiếp với các nút Blockchain và Smart Contract.
*   **MetaMask:** Ví điện tử đóng vai trò trình ký giao dịch và định danh người dùng.
*   **qrcode.react:** Tạo mã QR Code để tra cứu nhanh thông tin xe bảo dưỡng.
### Backend & Blockchain
*   **Solidity (^0.8.19):** Viết hợp đồng thông minh quản lý nghiệp vụ MotoChain.
*   **Hardhat:** Môi trường biên dịch, kiểm thử, và triển khai cục bộ (Local Development Network).
*   **Pinata IPFS API:** Cung cấp giải pháp lưu trữ tệp tin phi tập trung.
---
## 📂 Cấu trúc mã nguồn
```
Supply-Chain-Blockchain/
├── backend/                   # Phần dự án Hardhat (Smart Contract)
│   ├── contracts/             # Chứa mã nguồn Smart Contract Solidity (*.sol)
│   │   └── MotoChain.sol      # Hợp đồng thông minh MotoChain
│   ├── scripts/               # Scripts biên dịch và deploy
│   │   └── deploy.ts          # Script deploy contract lên mạng thử nghiệm
│   ├── hardhat.config.ts      # File cấu hình mạng Hardhat & Ganache
│   └── package.json
└── client/                    # Phần dự án Next.js (Frontend)
    ├── src/
    │   ├── app/               # Next.js App Router (Các trang giao diện)
    │   │   ├── addmed/        # Trang đăng ký xe (đăng tải tệp hóa đơn lên IPFS)
    │   │   ├── roles/         # Trang quản lý/cấp quyền vai trò tài khoản
    │   │   ├── supply/        # Trang thực hiện workflow (5 bước)
    │   │   ├── track/         # Trang tra cứu dòng thời gian (Timeline) xe máy
    │   │   └── page.tsx       # Trang chủ hệ thống
    │   ├── components/        # Các React components dùng chung
    │   └── lib/               # Thư viện hỗ trợ (Cấu hình Web3, gọi ví, contract)
    └── package.json
```
---
## 🚀 Hướng dẫn cài đặt & Chạy cục bộ
### Yêu cầu hệ thống
*   Đã cài đặt **Node.js** (Phiên bản v18 trở lên).
*   Đã cài đặt trình duyệt Chrome/Edge có tích hợp tiện ích mở rộng **MetaMask**.
### Bước 1: Clone dự án
```bash
git clone https://github.com/vydin/Supply-Chain-Blockchain.git
cd Supply-Chain-Blockchain
```
### Bước 2: Cài đặt và cấu hình phần Backend (Smart Contract)
1. Di chuyển vào thư mục `backend` và cài đặt dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Chạy mạng thử nghiệm Blockchain cục bộ bằng Hardhat:
   ```bash
   npx hardhat node
   ```
   *(Lệnh này sẽ khởi chạy một Blockchain ảo chạy tại cổng `http://127.0.0.1:8545` và cung cấp 20 tài khoản ví có sẵn 10000 ETH ảo để thử nghiệm. Hãy giữ terminal này chạy liên tục).*
3. Deploy Smart Contract lên Blockchain ảo ở terminal mới:
   ```bash
   cd backend
   npx hardhat run scripts/deploy.ts --network localhost
   ```
   Sau khi chạy thành công, địa chỉ của Smart Contract sẽ tự động được ghi nhận vào file `client/src/deployments.json`.
### Bước 3: Cài đặt và cấu hình phần Frontend (Client)
1. Di chuyển vào thư mục `client` và cài đặt dependencies:
   ```bash
   cd ../client
   npm install
   ```
2. Cấu hình biến môi trường kết nối **Pinata IPFS API**:
   Tạo file `.env.local` tại thư mục gốc của thư mục `client` và nhập thông tin API Key của bạn (Đăng ký miễn phí tại [pinata.cloud](https://www.pinata.cloud/)):
   ```env
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
   NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_key
   NEXT_PUBLIC_PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
   ```
3. Khởi động máy chủ phát triển cục bộ:
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập vào địa chỉ: [http://localhost:3000](http://localhost:3000)
---
## 🦊 Cấu hình MetaMask & Local Blockchain
Để tương tác được với ứng dụng, bạn cần cấu hình ví MetaMask của mình kết nối với mạng Blockchain Hardhat/Ganache cục bộ:
1.  **Thêm mạng mới vào MetaMask (Add Network Manually):**
    *   *Tên mạng:* Hardhat Local (hoặc Ganache Local)
    *   *RPC URL:* `http://127.0.0.1:8545` (hoặc `http://127.0.0.1:7545` nếu dùng Ganache)
    *   *Mã chuỗi (Chain ID):* `31337` (nếu dùng Hardhat Node) hoặc `1337` (nếu dùng Ganache)
    *   *Ký hiệu tiền tệ:* `ETH`
2.  **Nhập tài khoản ví thử nghiệm:**
    *   Copy **Private Key** (Khóa riêng tư) của tài khoản ví thứ nhất (Account #0) được hiển thị ở terminal khi bạn chạy lệnh `npx hardhat node`.
    *   Mở MetaMask ➔ Chọn biểu tượng tài khoản ➔ Chọn **Import Account (Nhập tài khoản)** ➔ Dán mã Private Key vừa copy vào.
    *   Đây sẽ là tài khoản **Contract Owner** tối cao của hệ thống.
    *   Thực hiện tương tự để nhập thêm 4 tài khoản ví ảo khác (Ví dụ: Account #1 làm Part Supplier, Account #2 làm Admin, Account #3 làm Garage, Account #4 làm Vehicle Owner).
---
## 🔄 Luồng nghiệp vụ chi tiết (Workflow)
Để thực hiện chạy kiểm thử luồng nghiệp vụ bảo dưỡng của xe, hãy tiến hành chuyển đổi tài khoản ví MetaMask tương ứng ở từng giai đoạn:
1.  **Giai đoạn 1: Đăng ký vai trò (Register Roles)**
    *   *Ví yêu cầu:* Ví **Contract Owner** (Account #0).
    *   *Hành động:* Truy cập trang `/roles`. Copy địa chỉ ví MetaMask của các tài khoản ví khác (Account #1, #2, #3, #4) dán vào các mục tương ứng: **Part Supplier**, **Admin**, **Authorized Garage**, và **Vehicle Owner** rồi ký duyệt trên ví để kích hoạt quyền.
2.  **Giai đoạn 2: Đăng ký Xe & Hóa đơn gốc (Register Motorcycle)**
    *   *Ví yêu cầu:* Ví **Contract Owner** (Account #0).
    *   *Hành động:* Truy cập trang `/addmed`. Điền thông tin xe máy (Biển số xe, tên xe, mô tả tình trạng tiếp nhận), kéo thả ảnh hóa đơn/biên nhận dịch vụ. Bấm chọn tải lên IPFS để lưu trữ, sau đó bấm nút đăng ký xe lên chuỗi khối. Trạng thái xe lúc này sẽ là: **`Registered`**.
3.  **Giai đoạn 3: Cung ứng phụ tùng (Part Sourced)**
    *   *Ví yêu cầu:* Ví **Part Supplier** (Account #1).
    *   *Hành động:* Truy cập trang `/supply`. Tìm đúng ID xe vừa tạo, bấm nút **"Source Parts"** để xác nhận đã phân bổ đầy đủ phụ tùng chính hãng cho xe. Trạng thái xe chuyển thành: **`Part Sourced`**.
4.  **Giai đoạn 4: Tiến hành và hoàn tất sửa chữa (Maintenance & Completed)**
    *   *Ví yêu cầu:* Ví **Admin** (Account #2) và ví **Authorized Garage** (Account #3).
    *   *Hành động:*
        *   Kết nối ví **Admin** ➔ Bấm nút **"Start Maintenance"** để đưa xe vào khu vực sửa chữa. Trạng thái xe: **`Under Maintenance`**.
        *   Kết nối ví **Authorized Garage** ➔ Sau khi kỹ thuật viên sửa chữa xong, bấm nút **"Complete Service"**. Trạng thái xe: **`Service Completed`**.
5.  **Giai đoạn 5: Nghiệm thu và bàn giao (Owner Verified)**
    *   *Ví yêu cầu:* Ví **Vehicle Owner** (Account #4).
    *   *Hành động:* Chủ xe kiểm tra tình trạng thực tế của xe sau sửa chữa, truy cập trang `/supply` và bấm chọn nút **"Verify Owner"** để ký giao dịch đồng ý nhận xe và thanh toán dịch vụ. Trạng thái xe kết thúc tại: **`Owner Verified`**.
---
## 📄 Đặc tả Smart Contract
Mã nguồn Smart Contract `MotoChain.sol` lưu trữ thông tin bằng các cấu trúc dữ liệu sau:
```solidity
// Các trạng thái của xe máy trong chuỗi bảo dưỡng
enum STAGE {
    Registered,         // 0 - Đã đăng ký tiếp nhận
    PartSourced,        // 1 - Đã chuẩn bị linh kiện
    UnderMaintenance,   // 2 - Đang tiến hành sửa chữa
    ServiceCompleted,   // 3 - Đã sửa xong
    OwnerVerified       // 4 - Chủ xe ký nghiệm thu bàn giao
}
struct motorcycle {
    uint256 id;             // ID định danh duy nhất của xe
    string name;           // Tên dòng xe/Model
    string description;    // Chi tiết lỗi/yêu cầu sửa chữa
    string ipfsHash;       // Hash ảnh hóa đơn trên mạng IPFS
    uint256 PSid;          // ID của Part Supplier xử lý
    uint256 ADMINid;       // ID của Admin xử lý
    uint256 AGid;          // ID của Authorized Garage thực hiện
    uint256 VOid;          // ID của Vehicle Owner ký nhận
    STAGE stage;           // Trạng thái hiện tại của xe
}
```
Các hàm kiểm soát dữ liệu chính:
*   `addPartSupplier()`, `addAdmin()`, `addAuthorizedGarage()`, `addVehicleOwner()`: Thêm các ví người dùng hợp lệ vào hệ thống (chỉ Contract Owner có quyền).
*   `addMotorcycle()`: Thêm xe máy mới vào chuỗi khối.
*   `sourceParts()`, `startMaintenance()`, `completeService()`, `verifyOwner()`: Thay đổi trạng thái xe qua từng khâu (chỉ tài khoản ví được cấp quyền tương ứng mới chạy được hàm).
*   `showStage()`: Trả về chuỗi ký tự hiển thị trạng thái hiện tại của xe.
---
## 📄 Giấy phép (License)
Dự án này được phân phối dưới giấy phép sử dụng mã nguồn mở **MIT License**. Chi tiết vui lòng xem tại file [LICENSE](LICENSE).
---
<div align="center">
  <b>Phát triển bởi nhóm sinh viên Đại học Đại Nam 🏍️🔗</b>
</div>