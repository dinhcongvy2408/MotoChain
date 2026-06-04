import { useState } from 'react';
import { getContract } from '../utils/contract';
import { QRCodeSVG } from 'qrcode.react';

export default function RegisterMoto() {
  const [form, setForm] = useState({ plateNumber: '', brand: '', model: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const contract = await getContract();
      const tx = await contract.registerMotorcycle(
        form.plateNumber,
        form.brand,
        form.model,
        Number(form.year)
      );
      const receipt = await tx.wait();
      
      // Get motorcycle ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'MotorcycleRegistered';
        } catch { return false; }
      });
      
      let motoId = null;
      if (event) {
        const parsed = contract.interface.parseLog(event);
        motoId = Number(parsed.args[0]);
      }

      setResult({
        id: motoId,
        plateNumber: form.plateNumber,
        txHash: receipt.hash
      });
      setForm({ plateNumber: '', brand: '', model: '', year: '' });
    } catch (err) {
      setError(err.reason || err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const qrUrl = result ? `${window.location.origin}/lookup/${result.id}` : '';

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">📝 Đăng ký xe máy</h1>
        <p className="page-subtitle">Ghi nhận thông tin xe máy lên blockchain</p>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}

      {result ? (
        <div className="card" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
          <div className="alert alert-success">✅ Đăng ký thành công!</div>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Biển số:</strong> {result.plateNumber} | <strong>ID:</strong> #{result.id}
          </p>
          <div className="qr-container" style={{ margin: '1rem auto' }}>
            <QRCodeSVG value={qrUrl} size={200} level="H" />
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.5rem', wordBreak: 'break-all' }}>
            {qrUrl}
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setResult(null)}>
              Đăng ký xe khác
            </button>
            <a href={`/vehicle/${result.id}`} className="btn btn-secondary">
              Xem chi tiết
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Biển số xe *</label>
              <input className="form-input" name="plateNumber" value={form.plateNumber}
                onChange={handleChange} placeholder="VD: 29-B1 123.45" required />
            </div>
            <div className="form-group">
              <label className="form-label">Hãng xe *</label>
              <input className="form-input" name="brand" value={form.brand}
                onChange={handleChange} placeholder="VD: Honda, Yamaha, SYM..." required />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input className="form-input" name="model" value={form.model}
                onChange={handleChange} placeholder="VD: Wave Alpha, Exciter 150..." />
            </div>
            <div className="form-group">
              <label className="form-label">Năm sản xuất</label>
              <input className="form-input" name="year" type="number" value={form.year}
                onChange={handleChange} placeholder="VD: 2023" min="1990" max="2030" />
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? '⏳ Đang ghi lên blockchain...' : '🔗 Đăng ký lên Blockchain'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
