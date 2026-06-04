import { ethers } from 'ethers';

// These will be set after deploy - create placeholder files for build
let contractAddress = null;
let contractABI = null;

// Attempt to load contract config (populated by deploy script)
async function loadContractConfig() {
  try {
    const resp = await fetch('/contract-config.json');
    if (resp.ok) {
      const config = await resp.json();
      contractAddress = config.address;
      contractABI = config.abi;
      return true;
    }
  } catch {
    // Config not available yet
  }
  return false;
}

// Initialize on load
let initialized = false;
const initPromise = loadContractConfig().then(ok => { initialized = ok; });

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask chưa được cài! Vui lòng cài MetaMask.');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

export const getContract = async (readOnly = false) => {
  await initPromise;

  if (!contractAddress || !contractABI) {
    throw new Error(
      'Contract chưa được deploy. Chạy: npx hardhat run scripts/deploy.js --network localhost'
    );
  }

  if (readOnly) {
    const provider = getProvider();
    return new ethers.Contract(contractAddress, contractABI, provider);
  }

  const signer = await getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask chưa được cài!');
  }
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  return accounts[0];
};

export const getCurrentAccount = async () => {
  if (!window.ethereum) return null;
  const accounts = await window.ethereum.request({
    method: 'eth_accounts'
  });
  return accounts.length > 0 ? accounts[0] : null;
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimestamp = (timestamp) => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatCost = (cost) => {
  return new Intl.NumberFormat('vi-VN').format(Number(cost)) + ' VNĐ';
};
