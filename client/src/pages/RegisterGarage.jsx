import { useState } from 'react';
import { getContract } from '../utils/contract';

export default function RegisterGarage() {
  const [form, setForm] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contract = await getContract();
      const tx = await contract.registerGarage(form.name, form.location);
      await tx.wait();
      setSuccess('Đăng ký Garage thành công! Chờ Admin phê duyệt để có thể thêm bảo dưỡng.');
      setForm({ name: '', location: '' });
    } catch (err) {
      setError(err.reason || err.message || 'Giao dịch thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">🏪 Đăng ký Garage</h1>
        <p className="page-subtitle">Đăng ký cửa hàng sửa chữa xe máy vào hệ thống</p>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Tên Garage *</label>
            <input className="form-input" name="name" value={form.name}
              onChange={handleChange} placeholder="VD: Garage Minh Phát" required />
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input className="form-input" name="location" value={form.location}
              onChange={handleChange} placeholder="VD: 123 Nguyễn Trãi, Q.5, TP.HCM" />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? '⏳ Đang đăng ký...' : '🏪 Đăng ký Garage'}
          </button>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '1rem', textAlign: 'center' }}>
            Sau khi đăng ký, Admin sẽ phê duyệt garage trước khi bạn có thể ghi nhận bảo dưỡng
          </p>
        </div>
      </form>
    </div>
  );
}
