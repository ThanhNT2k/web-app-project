import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';

function ModeratorCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTier, setActiveTier] = useState('all'); 

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await API.moderator.getComments();
      setComments(res.comments || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadComments(); }, []);

  // Lọc theo status (T1=rejected, T2=masked, T3=flagged)
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      const content = (c.content || '').toLowerCase();
      const matchesSearch = content.includes(searchTerm.toLowerCase());

      // Prefer numeric rating written by worker; fallback to status mapping
      const statusToTier = { 'rejected': '1', 'masked': '2', 'flagged': '3' };
      const commentTier = (typeof c.rating === 'number') ? String(c.rating) : (statusToTier[c.status] || '0'); // '0' = no violation / approved

      if (activeTier === 'all') return matchesSearch;
      return commentTier === activeTier && matchesSearch;
    });
  }, [comments, activeTier, searchTerm]);

  // Counts per tier for UI buttons
  const tierCounts = useMemo(() => {
    const counts = { '1': 0, '2': 0, '3': 0, all: comments.length };
    const statusToTier = { 'rejected': '1', 'masked': '2', 'flagged': '3' };
    comments.forEach((c) => {
      const t = (typeof c.rating === 'number') ? String(c.rating) : statusToTier[c.status];
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [comments]);

  const getStatusBadge = (status) => {
    const config = {
      'rejected': { label: 'T1 (Nghiêm trọng)', class: 'bg-danger' },
      'masked':   { label: 'T2 (Nhẹ)', class: 'bg-warning text-dark' },
      'flagged':  { label: 'T3 (Spam)', class: 'bg-info' },
      'approved': { label: 'Đã duyệt', class: 'bg-success' }
    };
    const item = config[status] || { label: status, class: 'bg-secondary' };
    return <span className={`badge ${item.class}`}>{item.label}</span>;
  };

  const getTierBadge = (status, rating) => {
    // If worker populated rating, use it; otherwise infer from status
    const r = typeof rating === 'number' ? rating : (status === 'rejected' ? 1 : status === 'masked' ? 2 : status === 'flagged' ? 3 : 0);
    const map = {
      1: { tier: 'T1', text: 'Nghiêm trọng — vi phạm nặng' , className: 'bg-danger'},
      2: { tier: 'T2', text: 'Nhẹ — cần xem xét', className: 'bg-warning text-dark'},
      3: { tier: 'T3', text: 'Spam / Khả nghi', className: 'bg-info'},
      0: { tier: '—', text: 'Không vi phạm', className: 'bg-secondary'},
    };
    const item = map[r] || map[0];
    return <span className={`badge ${item.className}`} title={item.text}>{item.tier}</span>;
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await API.moderator.updateCommentStatus(id, 'approved');
      await loadComments();
    } catch (err) { console.error(err); alert('Không thể duyệt bình luận'); }
    finally { setLoading(false); }
  };

  const handleReject = async (id) => {
    if (!confirm('Xác nhận từ chối (T1) bình luận này?')) return;
    try {
      setLoading(true);
      await API.moderator.updateCommentStatus(id, 'rejected');
      await loadComments();
    } catch (err) { console.error(err); alert('Không thể từ chối bình luận'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Quản lý bình luận</h2>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input className="form-control" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="col-md-6 d-flex justify-content-end align-items-center gap-2">
          <button onClick={() => loadComments()} className={`btn btn-primary fw-bold`} disabled={loading} title="Làm mới danh sách bình luận">
            {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
            Làm mới
          </button>

          <div className="btn-group" role="group" aria-label="Tier filters">
            <button onClick={() => setActiveTier('all')} className={`btn ${activeTier === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}>Tất cả <span className="badge bg-light text-dark ms-2">{tierCounts.all}</span></button>
            <button onClick={() => setActiveTier('1')} className={`btn ${activeTier === '1' ? 'btn-danger' : 'btn-outline-danger'}`}>T1 <span className="badge bg-light text-dark ms-2">{tierCounts['1'] || 0}</span></button>
            <button onClick={() => setActiveTier('2')} className={`btn ${activeTier === '2' ? 'btn-warning' : 'btn-outline-warning'}`}>T2 <span className="badge bg-light text-dark ms-2">{tierCounts['2'] || 0}</span></button>
            <button onClick={() => setActiveTier('3')} className={`btn ${activeTier === '3' ? 'btn-info' : 'btn-outline-info'}`}>T3 <span className="badge bg-light text-dark ms-2">{tierCounts['3'] || 0}</span></button>
          </div>
        </div>
      </div>

      <table className="table table-hover">
        <thead><tr><th>Thông tin</th><th>Nội dung</th><th>Tier</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {filteredComments.map((c) => (
            <tr key={c.id}>
              <td>{c.user_username}</td>
              <td>{c.content}</td>
              <td>{getTierBadge(c.status, c.rating)}</td>
              <td>{getStatusBadge(c.status)}</td>
              <td>
                <button className="btn btn-sm btn-success me-2" onClick={() => handleApprove(c.id)}>Duyệt</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleReject(c.id)}>Từ chối (T1)</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ModeratorCommentsPage;