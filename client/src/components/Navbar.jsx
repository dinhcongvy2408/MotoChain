import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { connectWallet, getCurrentAccount, formatAddress } from '../utils/contract';

export default function Navbar() {
  const [account, setAccount] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    checkWallet();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  const checkWallet = async () => {
    const acc = await getCurrentAccount();
    setAccount(acc);
  };

  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          🏍️ Moto<span>Chain</span>
        </NavLink>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Dashboard</NavLink></li>
          <li><NavLink to="/register-moto" onClick={() => setMenuOpen(false)}>Đăng ký xe</NavLink></li>
          <li><NavLink to="/add-service" onClick={() => setMenuOpen(false)}>Bảo dưỡng</NavLink></li>
          <li><NavLink to="/qr-lookup" onClick={() => setMenuOpen(false)}>QR Lookup</NavLink></li>
          <li><NavLink to="/register-garage" onClick={() => setMenuOpen(false)}>Garage</NavLink></li>
          <li><NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink></li>
          <li>
            {account ? (
              <span className="wallet-btn wallet-connected">
                🟢 {formatAddress(account)}
              </span>
            ) : (
              <button className="wallet-btn" onClick={handleConnect}>
                🔗 Connect Wallet
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
