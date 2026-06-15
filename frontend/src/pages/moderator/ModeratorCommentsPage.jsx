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
      const matchesSearch = c.content.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeTier === 'all') return matchesSearch;
      
      const statusMap = { '1': 'rejected', '2': 'masked', '3': 'flagged' };
      return c.status === statusMap[activeTier] && matchesSearch;
    });
  }, [comments, activeTier, searchTerm]);

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

  return (
    <div className="p-4">
      <h2 className="mb-4">Quản lý bình luận</h2>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input className="form-control" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="col-md-6 d-flex gap-2">
          <button onClick={() => setActiveTier('all')} className={`btn ${activeTier === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}>Tất cả</button>
          <button onClick={() => setActiveTier('1')} className={`btn ${activeTier === '1' ? 'btn-danger' : 'btn-outline-danger'}`}>T1</button>
          <button onClick={() => setActiveTier('2')} className={`btn ${activeTier === '2' ? 'btn-warning' : 'btn-outline-warning'}`}>T2</button>
          <button onClick={() => setActiveTier('3')} className={`btn ${activeTier === '3' ? 'btn-info' : 'btn-outline-info'}`}>T3</button>
        </div>
      </div>

      <table className="table table-hover">
        <thead><tr><th>Thông tin</th><th>Nội dung</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {filteredComments.map((c) => (
            <tr key={c.id}>
              <td>{c.user_username}</td>
              <td>{c.content}</td>
              <td>{getStatusBadge(c.status)}</td>
              <td>
                <button className="btn btn-sm btn-success me-2" onClick={() => {/* logic approve */}}>Duyệt</button>
                <button className="btn btn-sm btn-danger" onClick={() => {/* logic delete */}}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ModeratorCommentsPage;