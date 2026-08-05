import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem, faMoneyBillWave, faHistory, faClock, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './UploaderRevenuePage.css';

const MIN_CRYSTAL_PAYOUT = 5000;
const CRYSTAL_TO_VND_RATE = 250;

function UploaderRevenuePage() {
  const { user, refreshCurrentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    crystalAmount: MIN_CRYSTAL_PAYOUT,
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });

  const fetchRequests = async () => {
    try {
      const res = await API.payouts.getMyRequests();
      setRequests(res.requests || res.data?.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Làm mới thông tin user (crystal_earned) để đảm bảo số dư là mới nhất
    refreshCurrentUser();
    fetchRequests();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await API.payouts.request(formData);
      setSuccess('Yêu cầu rút tiền đã được tạo thành công.');
      setFormData({
        ...formData,
        crystalAmount: MIN_CRYSTAL_PAYOUT
      });
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge bg-warning text-dark"><FontAwesomeIcon icon={faClock} /> Chờ duyệt</span>;
      case 'COMPLETED':
        return <span className="badge bg-success"><FontAwesomeIcon icon={faCheckCircle} /> Đã thanh toán</span>;
      case 'REJECTED':
        return <span className="badge bg-danger"><FontAwesomeIcon icon={faTimesCircle} /> Từ chối</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const currentEarned = Number(user?.crystal_earned || 0);

  return (
    <div className="container-cmc mt-4 uploader-revenue-page">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="page-title">Doanh Thu Của Tôi</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-md-5 mb-4">
          <div className="cmc-card summary-card">
            <div className="card-body text-center">
              <h5 className="text-muted mb-3">Số dư Tinh thạch khả dụng</h5>
              <div className="crystal-balance-display">
                <FontAwesomeIcon icon={faGem} className="me-2" />
                <span>{currentEarned.toLocaleString()}</span>
              </div>
              <p className="text-muted mt-2">
                Tương đương: <strong>{(currentEarned * CRYSTAL_TO_VND_RATE).toLocaleString()} VNĐ</strong>
              </p>
            </div>
          </div>

          <div className="cmc-card request-form-card mt-4">
            <div className="card-body">
              <h5 className="card-title mb-4">
                <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-success" />
                Tạo yêu cầu rút tiền
              </h5>

              {error && <div className="alert-cmc alert-cmc-warning mb-3">{error}</div>}
              {success && <div className="alert-cmc alert-cmc-success mb-3">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label" style={{ fontWeight: '500' }}>Số Tinh thạch muốn rút</label>
                  <input
                    type="number"
                    className="form-control-cmc"
                    name="crystalAmount"
                    min={MIN_CRYSTAL_PAYOUT}
                    max={currentEarned > 0 ? currentEarned : MIN_CRYSTAL_PAYOUT}
                    value={formData.crystalAmount}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="form-text mt-2" style={{ color: 'var(--cmc-text-secondary)', fontSize: '0.85rem' }}>
                    Tối thiểu: {MIN_CRYSTAL_PAYOUT.toLocaleString()} TT. Thực nhận: {(formData.crystalAmount * CRYSTAL_TO_VND_RATE).toLocaleString()} VNĐ
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label" style={{ fontWeight: '500' }}>Ngân hàng</label>
                  <input
                    type="text"
                    className="form-control-cmc"
                    name="bankName"
                    placeholder="VD: MB Bank, Vietcombank..."
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label" style={{ fontWeight: '500' }}>Số tài khoản</label>
                  <input
                    type="text"
                    className="form-control-cmc"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label" style={{ fontWeight: '500' }}>Tên chủ tài khoản</label>
                  <input
                    type="text"
                    className="form-control-cmc"
                    name="accountHolder"
                    placeholder="Viết hoa không dấu"
                    value={formData.accountHolder}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-cmc btn-cmc-primary w-100"
                  disabled={submitting || currentEarned < MIN_CRYSTAL_PAYOUT || formData.crystalAmount > currentEarned}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="cmc-card history-card">
            <div className="card-body">
              <h5 className="card-title mb-4">
                <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
                Lịch sử rút tiền
              </h5>

              {loading ? (
                <div className="text-center py-4">Đang tải...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-4 text-muted">Bạn chưa có yêu cầu rút tiền nào.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Mã YC</th>
                        <th>Số lượng</th>
                        <th>Thực nhận</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(req => (
                        <tr key={req.id}>
                          <td>#{req.id}</td>
                          <td>
                            <FontAwesomeIcon icon={faGem} className="crystal-icon me-1" />
                            {Number(req.crystal_amount).toLocaleString()}
                          </td>
                          <td>{Number(req.vnd_amount).toLocaleString()} VNĐ</td>
                          <td>{getStatusBadge(req.status)}</td>
                          <td>{new Date(req.created_at).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploaderRevenuePage;
