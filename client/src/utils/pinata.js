import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

export const uploadToIPFS = async (file) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.warn('Pinata API keys not set. Using mock IPFS hash.');
    // Return a mock hash for demo/development
    return {
      success: true,
      hash: 'QmMockHash_' + Date.now(),
      url: '#',
      mock: true
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: `MotoChain_${file.name}`,
      keyvalues: {
        app: 'MotoChain',
        type: 'maintenance_invoice'
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY
        }
      }
    );

    return {
      success: true,
      hash: response.data.IpfsHash,
      url: `${PINATA_GATEWAY}/${response.data.IpfsHash}`,
      mock: false
    };
  } catch (error) {
    console.error('IPFS upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getIPFSUrl = (hash) => {
  if (!hash) return null;
  if (hash.startsWith('QmMock')) return null;
  return `${PINATA_GATEWAY}/${hash}`;
};
