import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContract } from '../utils/contract';

export default function QRLookup() {
  const [manualId, setManualId] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const handleIdLookup = (e) => {
    e.preventDefault();
    if (manualId) navigate(`/vehicle/${manualId}`);
  };

  const handlePlateLookup = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const contract = await getContract(true);
      const id = await contract.getMotorcycleByPlate(plateNumber);
      navigate(`/vehicle/${Number(id)}`);
    } catch (err) {
      setError('Không tìm thấy xe với biển số này');
    }
  };

  const startScanner = async () => {
    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      html5QrRef.current = new Html5Qrcode('qr-reader');
      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract ID from URL
          const match = decodedText.match(/\/lookup\/(\d+)/);
          if (match) {
            stopScanner();
            navigate(`/vehicle/${match[1]}`);
          } else if (/^\d+$/.test(decodedText)) {
            stopScanner();
            navigate(`/vehicle/${decodedText}`);
          } else {
            setError('QR code không hợp lệ: ' + decodedText);
          }
        },
        () => {} // ignore errors during scanning
      );
    } catch (err) {
      setError('Không thể truy cập camera: ' + err.message);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">📱 Tra cứu xe</h1>
        <p className="page-subtitle">Scan QR code hoặc nhập thông tin để xem lịch sử bảo dưỡng</p>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}

      <div className="grid-2" style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* QR Scanner */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>📷 Scan QR Code</h3>
          {scanning ? (
            <>
              <div id="qr-reader" ref={scannerRef} className="qr-scanner-box"></div>
              <button className="btn btn-danger btn-block" onClick={stopScanner}
                style={{ marginTop: '1rem' }}>
                ⏹ Dừng scan
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <button className="btn btn-primary btn-lg" onClick={startScanner}>
                🔍 Mở Camera Scan
              </button>
            </div>
          )}
        </div>

        {/* Manual Lookup */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>🔍 Tra cứu thủ công</h3>
          
          <form onSubmit={handleIdLookup} style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Theo ID xe</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="form-input" type="number" value={manualId}
                  onChange={(e) => setManualId(e.target.value)} placeholder="VD: 1" min="1" />
                <button className="btn btn-primary" type="submit">Tìm</button>
              </div>
            </div>
          </form>

          <form onSubmit={handlePlateLookup}>
            <div className="form-group">
              <label className="form-label">Theo biển số</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="form-input" value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)} placeholder="VD: 29-B1 123.45" />
                <button className="btn btn-primary" type="submit">Tìm</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
