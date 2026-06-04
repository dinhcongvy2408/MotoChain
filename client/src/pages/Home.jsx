import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContract } from '../utils/contract';

export default function Home() {
  const [stats, setStats] = useState({ motos: 0, garages: 0, records: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const contract = await getContract(true);
      const [motos, garages, records] = await Promise.all([
        contract.getAllMotorcycleCount(),
        contract.getAllGarageCount(),
        contract.getAllMaintenanceCount()
      ]);
      setStats({
        motos: Number(motos),
        garages: Number(garages),
        records: Number(records)
      });
    } catch (err) {
      setError('Chưa kết nối được blockchain. Hãy deploy contract trước.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          🏍️ Moto<span style={{ color: 'var(--color-accent)' }}>Chain</span>
        </h1>
        <p className="page-subtitle" style={{ maxWidth: 600, margin: '0 auto' }}>
          Quản lý bảo dưỡng xe máy trên Blockchain — Minh bạch, không thể giả mạo, tra cứu bằng QR code
        </p>
      </div>

      {error && <div className="alert alert-info">ℹ️ {error}</div>}

      <div className="grid-3" style={{ marginBottom: '3rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🏍️</div>
          <div className="stat-value">{loading ? '...' : stats.motos}</div>
          <div className="stat-label">Xe đã đăng ký</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-value">{loading ? '...' : stats.records}</div>
          <div className="stat-label">Lượt bảo dưỡng</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-value">{loading ? '...' : stats.garages}</div>
          <div className="stat-label">Garage đăng ký</div>
        </div>
      </div>

      <div className="grid-3">
        <Link to="/register-moto" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="card-title">📝 Đăng ký xe máy</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            Ghi nhận xe máy lên blockchain, tạo QR code tra cứu
          </p>
        </Link>

        <Link to="/add-service" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="card-title">🔧 Thêm bảo dưỡng</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            Ghi nhận lịch sử bảo dưỡng, upload hóa đơn lên IPFS
          </p>
        </Link>

        <Link to="/qr-lookup" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="card-title">📱 Tra cứu QR</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            Scan QR code để xem lịch sử bảo dưỡng xe
          </p>
        </Link>
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>⚡ Cách hoạt động</h3>
        <div className="grid-4" style={{ gap: '1rem' }}>
          {[
            { step: '1', icon: '📝', text: 'Đăng ký xe máy lên blockchain' },
            { step: '2', icon: '🔧', text: 'Garage ghi nhận bảo dưỡng' },
            { step: '3', icon: '📦', text: 'Hóa đơn lưu trên IPFS' },
            { step: '4', icon: '📱', text: 'Scan QR xem lịch sử' }
          ].map(item => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Bước {item.step}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
