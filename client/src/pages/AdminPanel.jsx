import { useState, useEffect } from 'react';
import { getContract, formatAddress, formatTimestamp } from '../utils/contract';

export default function AdminPanel() {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadGarages();
  }, []);

  const loadGarages = async () => {
    try {
      const contract = await getContract(true);
      const count = await contract.getAllGarageCount();
      const list = [];
      for (let i = 1; i <= Number(count); i++) {
        const g = await contract.getGarage(i);
        list.push({
          id: Number(g[0]), name: g[1], location: g[2],
          walletAddress: g[3], isApproved: g[4], registeredAt: g[5]
        });
      }
      setGarages(list);
    } catch (err) {
      setError('Không thể tải danh sách garage');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (garageId) => {
    setActionLoading(garageId);
    setError(null);
    setSuccess(null);
    try {
      const contract = await getContract();
      const tx = await contract.approveGarage(garageId);
      await tx.wait();
      setSuccess(`Đã phê duyệt Garage #${garageId}`);
      loadGarages();
    } catch (err) {
      setError(err.reason || 'Chỉ Admin (contract owner) mới được phê duyệt');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Admin Panel</h1>
        <p className="page-subtitle">Quản lý và phê duyệt Garage (chỉ contract owner)</p>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {loading ? (
        <div className="loading-spinner"></div>
      ) : garages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <p className="empty-state-title">Chưa có Garage nào</p>
          <p className="empty-state-text">Các garage sẽ xuất hiện ở đây sau khi đăng ký</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Garage</th>
                <th>Địa chỉ</th>
                <th>Wallet</th>
                <th>Ngày ĐK</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {garages.map(g => (
                <tr key={g.id}>
                  <td>#{g.id}</td>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td>{g.location || '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    {formatAddress(g.walletAddress)}
                  </td>
                  <td>{formatTimestamp(g.registeredAt)}</td>
                  <td>
                    <span className={`badge ${g.isApproved ? 'badge-success' : 'badge-warning'}`}>
                      <span className={`status-dot ${g.isApproved ? 'active' : 'pending'}`}></span>
                      {g.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td>
                    {!g.isApproved && (
                      <button className="btn btn-success btn-sm"
                        onClick={() => handleApprove(g.id)}
                        disabled={actionLoading === g.id}>
                        {actionLoading === g.id ? '⏳' : '✅ Duyệt'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
