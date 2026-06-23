import { useEffect, useState } from 'react';
import API from '../../services/api';

function ModeratorReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.admin.getReports(statusFilter, 1);
      setReports(res.reports || res.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await API.reports.updateStatus(id, newStatus);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  return (
    <div>
      <h2 className="mb-3">Xử lý báo cáo</h2>
      <div className="mb-3 d-flex gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select w-auto">
          <option value="ALL">Tất cả</option>
          <option value="NEW">NEW</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
        <button className="btn btn-primary" onClick={load}>Lọc</button>
      </div>

      {loading && <div>Đang tải...</div>}

      <div className="list-group">
        {reports.map((r) => (
          <div key={r.id} className="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <div className="small text-muted">Bởi: {r.reporter_username || r.user_id} • {new Date(r.created_at).toLocaleString('vi-VN')}</div>
              <div>{r.reason}</div>
              <div className="text-muted small mb-2">{r.description}</div>
              {(r.story_title || r.story_slug) ? (
                <div className="small">
                  Báo cáo: <a href={r.story_slug ? `/${r.story_slug}${r.chapter_number ? `/${r.chapter_number}` : ''}` : '#'}>
                    {r.story_title || r.chapter_title || r.story_slug}{r.chapter_number ? ` — Chương ${r.chapter_number}` : ''}
                  </a>
                </div>
              ) : null}
            </div>
            <div className="text-end">
              <select className="form-select form-select-sm mb-2" value={r.status} onChange={(e) => handleChangeStatus(r.id, e.target.value)}>
                <option value="NEW">NEW</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModeratorReportsPage;
