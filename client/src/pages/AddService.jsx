import { useState } from 'react';
import { getContract } from '../utils/contract';
import { uploadToIPFS } from '../utils/pinata';

export default function AddService() {
  const [form, setForm] = useState({
    motorcycleId: '', serviceType: '', description: '',
    mileage: '', cost: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
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
      // Upload invoice to IPFS if file exists
      let ipfsHash = '';
      if (file) {
        setStatus('Đang upload hóa đơn lên IPFS...');
        const ipfsResult = await uploadToIPFS(file);
        if (ipfsResult.success) {
          ipfsHash = ipfsResult.hash;
          setStatus('Upload IPFS thành công! Đang ghi blockchain...');
        } else {
          throw new Error('Upload IPFS thất bại: ' + ipfsResult.error);
        }
      } else {
        setStatus('Đang ghi lên blockchain...');
      }

      const contract = await getContract();
      const tx = await contract.addMaintenanceRecord(
        Number(form.motorcycleId),
        form.serviceType,
        form.description,
        Number(form.mileage),
        ipfsHash,
        Number(form.cost)
      );
      await tx.wait();

      setSuccess(`Ghi nhận bảo dưỡng thành công! TX: ${tx.hash.slice(0, 20)}...`);
      setForm({ motorcycleId: '', serviceType: '', description: '', mileage: '', cost: '' });
      setFile(null);
      setStatus('');
    } catch (err) {
      setError(err.reason || err.message || 'Giao dịch thất bại');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">🔧 Thêm bảo dưỡng</h1>
        <p className="page-subtitle">Ghi nhận lịch sử bảo dưỡng lên blockchain (chỉ Garage được phê duyệt)</p>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">ID xe máy *</label>
              <input className="form-input" name="motorcycleId" type="number" value={form.motorcycleId}
                onChange={handleChange} placeholder="VD: 1" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Loại dịch vụ *</label>
              <select className="form-select" name="serviceType" value={form.serviceType}
                onChange={handleChange} required>
                <option value="">-- Chọn --</option>
                <option value="Thay nhớt">Thay nhớt</option>
                <option value="Thay lốp">Thay lốp</option>
                <option value="Sửa phanh">Sửa phanh</option>
                <option value="Thay bugi">Thay bugi</option>
                <option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</option>
                <option value="Sửa chữa lớn">Sửa chữa lớn</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chi tiết</label>
            <textarea className="form-textarea" name="description" value={form.description}
              onChange={handleChange} placeholder="Mô tả công việc bảo dưỡng đã thực hiện..." />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Số km</label>
              <input className="form-input" name="mileage" type="number" value={form.mileage}
                onChange={handleChange} placeholder="VD: 15000" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Chi phí (VNĐ)</label>
              <input className="form-input" name="cost" type="number" value={form.cost}
                onChange={handleChange} placeholder="VD: 150000" min="0" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hóa đơn / Ảnh (upload lên IPFS)</label>
            <div className="file-upload" onClick={() => document.getElementById('file-input').click()}>
              <input id="file-input" type="file" accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files[0])} />
              <div className="file-upload-icon">📎</div>
              <p>{file ? `📄 ${file.name}` : 'Click để chọn file hóa đơn (ảnh hoặc PDF)'}</p>
            </div>
          </div>

          {status && (
            <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
              ⏳ {status}
            </div>
          )}

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? '⏳ Đang xử lý...' : '🔗 Ghi nhận bảo dưỡng'}
          </button>
        </div>
      </form>
    </div>
  );
}
