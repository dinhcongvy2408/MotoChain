import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getContract, formatAddress, formatTimestamp, formatCost } from '../utils/contract';
import { getIPFSUrl } from '../utils/pinata';

export default function VehicleHistory() {
  const { id } = useParams();
  const [moto, setMoto] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const contract = await getContract(true);
      
      // Get motorcycle info
      const m = await contract.getMotorcycle(Number(id));
      setMoto({
        id: Number(m[0]), plateNumber: m[1], brand: m[2], model: m[3],
        year: Number(m[4]), owner: m[5], registeredAt: m[6], isActive: m[7]
      });

      // Get maintenance history
      const recordIds = await contract.getMaintenanceHistory(Number(id));
      const recordsData = [];
      for (const rid of recordIds) {
        const r = await contract.getMaintenanceRecord(Number(rid));
        recordsData.push({
          id: Number(r[0]), motorcycleId: Number(r[1]), garage: r[2],
          serviceType: r[3], description: r[4], mileage: Number(r[5]),
          ipfsHash: r[6], cost: Number(r[7]), timestamp: r[8]
        });
      }
      setRecords(recordsData.reverse());
    } catch (err) {
      setError(err.reason || err.message || 'Không tìm thấy xe');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Đang tải dữ liệu từ blockchain...</p>
    </div>
  );

  if (error) return (
    <div className="page-container">
      <div className="alert alert-error">❌ {error}</div>
    </div>
  );

  const qrUrl = `${window.location.origin}/lookup/${id}`;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">🏍️ Chi tiết xe #{id}</h1>
      </div>

      {moto && (
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Thông tin xe</h3>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr><td style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0' }}>Biển số</td>
                  <td style={{ fontWeight: 600, padding: '0.5rem 0' }}>{moto.plateNumber}</td></tr>
                <tr><td style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0' }}>Hãng</td>
                  <td style={{ padding: '0.5rem 0' }}>{moto.brand}</td></tr>
                <tr><td style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0' }}>Model</td>
                  <td style={{ padding: '0.5rem 0' }}>{moto.model || '—'}</td></tr>
                <tr><td style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0' }}>Năm SX</td>
                  <td style={{ padding: '0.5rem 0' }}>{moto.year || '—'}</td></tr>
                <tr><td style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0' }}>Chủ xe</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', padding: '0.5rem 0' }}>
                    {formatAddress(moto.owner)}</td></tr>
                <tr><td style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0' }}>Ngày ĐK</td>
                  <td style={{ padding: '0.5rem 0' }}>{formatTimestamp(moto.registeredAt)}</td></tr>
                <tr><td style={{ color: 'var(--color-text-secondary)', padding: '0.5rem 0' }}>Trạng thái</td>
                  <td style={{ padding: '0.5rem 0' }}>
                    <span className={`badge ${moto.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {moto.isActive ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td></tr>
              </tbody>
            </table>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>QR Code tra cứu</h3>
            <div className="qr-container">
              <QRCodeSVG value={qrUrl} size={180} level="H" />
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              Scan để xem lịch sử bảo dưỡng
            </p>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '1.5rem', fontSize: 'var(--text-xl)' }}>
        🔧 Lịch sử bảo dưỡng ({records.length} lượt)
      </h2>

      {records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">Chưa có bản ghi bảo dưỡng</p>
          <p className="empty-state-text">Xe này chưa được bảo dưỡng lần nào</p>
        </div>
      ) : (
        <div className="timeline">
          {records.map(record => (
            <div key={record.id} className="timeline-item">
              <div className="card">
                <div className="card-header">
                  <span className="badge badge-info">{record.serviceType}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {formatTimestamp(record.timestamp)}
                  </span>
                </div>
                {record.description && (
                  <p style={{ margin: '0.5rem 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {record.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: 'var(--text-sm)' }}>
                  {record.mileage > 0 && (
                    <span>📏 {record.mileage.toLocaleString()} km</span>
                  )}
                  {record.cost > 0 && (
                    <span>💰 {formatCost(record.cost)}</span>
                  )}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    🏪 {formatAddress(record.garage)}
                  </span>
                  {record.ipfsHash && (
                    <a href={getIPFSUrl(record.ipfsHash) || '#'} target="_blank" rel="noreferrer"
                      style={{ color: 'var(--color-accent)' }}>
                      📎 Hóa đơn IPFS
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
