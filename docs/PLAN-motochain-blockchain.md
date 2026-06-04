# MotoChain — Blockchain Motorcycle Maintenance Management

> See full implementation plan in the conversation artifacts.
> This is a reference copy for project documentation.

## Quick Summary

- **Project**: Ứng dụng quản lý bảo dưỡng xe máy trên blockchain
- **Tech**: Solidity + Hardhat + React/Vite + ethers.js + IPFS/Pinata + QR Code
- **Type**: University project (đồ án đại học)
- **Blockchain**: Ethereum (Ganache local)

## Key Features

1. **Đăng ký xe máy** → Lưu on-chain (biển số, hãng, model, năm)
2. **Ghi nhận bảo dưỡng** → Smart contract + upload hóa đơn lên IPFS
3. **QR Code** → Mỗi xe có QR, scan → xem lịch sử bảo dưỡng
4. **Roles** → Admin / Garage / Anyone
5. **Phi tập trung** → Data on Ethereum, files on IPFS

## Commands

```bash
# Smart Contract
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network localhost

# Frontend
cd client
npm install
npm run dev
```
