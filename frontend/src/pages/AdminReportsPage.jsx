import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getReportActions,
  REPORT_ACTION_LABELS,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
} from '../constants/reportConstants';
import API from '../services/api';

const FILTERS = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED', 'ALL'];

function getTargetType(report) {
  if (report.comment_id) return 'Bình luận';
  if (report.chapter_id) return 'Chương';
  return 'Truyện';
}

function getTargetTitle(report) {
  if (report.comment_id) {
    return report.comment_author_username
      ? `Bình luận của ${report.comment_author_username}`
      : `Bình luận #${report.comment_id}`;
  }
  if (report.chapter_id) {
    return `${report.story_title || 'Truyện'} — Chương ${report.chapter_number || report.chapter_id}`;
  }
  return report.story_title || `Truyện #${report.story_id}`;
}

function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('NEW');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await API.admin.getReports(statusFilter);
      setReports(data.reports || []);
    } catch (err) {
      setError('Không thể tải danh sách báo cáo.');
      console.error('[AdminReportsPage.fetchReports] error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const statusCounts = useMemo(() => reports.reduce((counts, report) => ({
    ...counts,
    [report.status]: (counts[report.status] || 0) + 1,
  }), {}), [reports]);

  const openProcessPanel = (report) => {
    const actions = getReportActions(report);
    setSelectedReport(report);
    setSelectedAction(actions[0]);
    setResolutionNote('');
  };

  const closeProcessPanel = () => {
    if (processing) return;
    setSelectedReport(null);
    setSelectedAction('');
    setResolutionNote('');
  };

  const handleProcessReport = async (event) => {
    event.preventDefault();
    if (!selectedReport || !selectedAction) return;

    try {
      setProcessing(true);
      await API.reports.process(selectedReport.id, selectedAction, resolutionNote);
      setSelectedReport(null);
      setSelectedAction('');
      setResolutionNote('');
      await fetchReports();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xử lý báo cáo.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="management-page reports-workspace">
      <header className="management-page-header">
        <div>
          <p className="management-eyebrow">TRUNG TÂM KIỂM DUYỆT</p>
          <h2>Quản lý báo cáo</h2>
          <p>Đánh giá đúng đối tượng và chọn phương án xử lý phù hợp cho từng vi phạm.</p>
        </div>
        <button type="button" onClick={fetchReports} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </header>

      <section className="management-data-panel reports-management-panel">
        <div className="reports-filter-bar" role="tablist" aria-label="Lọc trạng thái báo cáo">
          {FILTERS.map((status) => (
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === status}
              key={status}
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? 'active' : ''}
            >
              <span>{status === 'ALL' ? 'Tất cả' : REPORT_STATUS_LABELS[status]}</span>
              {status !== 'ALL' && statusFilter === 'ALL' ? <strong>{statusCounts[status] || 0}</strong> : null}
            </button>
          ))}
        </div>

      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      {!loading && reports.length === 0 ? (
        <div className="reports-empty-state">
          <strong>Không có báo cáo trong nhóm này</strong>
          <span>Các báo cáo mới sẽ xuất hiện tại đây.</span>
        </div>
      ) : null}

      <div className="reports-list" aria-busy={loading}>
        {reports.map((report) => (
          <article className="report-card" key={report.id}>
            <div className="report-card-main">
              <div className="report-card-heading">
                <span className="report-target-badge">{getTargetType(report)}</span>
                <span className={`report-status-badge status-${report.status.toLowerCase()}`}>
                  {REPORT_STATUS_LABELS[report.status] || report.status}
                </span>
              </div>

              <h3>{REPORT_REASON_LABELS[report.reason] || report.reason}</h3>
              <p className="report-description">{report.description || 'Người báo cáo không cung cấp mô tả thêm.'}</p>

              <dl className="report-details">
                <div>
                  <dt>Đối tượng</dt>
                  <dd>
                    {report.story_slug ? (
                      <Link to={`/${report.story_slug}${report.chapter_number ? `/${report.chapter_number}` : ''}`}>
                        {getTargetTitle(report)}
                      </Link>
                    ) : getTargetTitle(report)}
                  </dd>
                </div>
                {report.comment_id ? (
                  <div>
                    <dt>Nội dung bình luận</dt>
                    <dd className="report-comment-quote">“{report.comment_content || 'Bình luận không còn tồn tại'}”</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Người báo cáo</dt>
                  <dd>{report.reporter_username || `Người dùng #${report.user_id}`}</dd>
                </div>
                <div>
                  <dt>Thời gian</dt>
                  <dd>{new Date(report.created_at).toLocaleString('vi-VN')}</dd>
                </div>
              </dl>

              {report.resolution_action ? (
                <div className="report-resolution-summary">
                  <strong>{REPORT_ACTION_LABELS[report.resolution_action] || report.resolution_action}</strong>
                  <span>
                    {report.resolved_by_username ? `Bởi ${report.resolved_by_username}` : 'Đã ghi nhận phương án'}
                    {report.resolution_note ? ` · ${report.resolution_note}` : ''}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="report-card-actions">
              <button type="button" onClick={() => openProcessPanel(report)}>
                {report.status === 'RESOLVED' || report.status === 'DISMISSED'
                  ? 'Xử lý lại'
                  : 'Chọn phương án xử lý'}
              </button>
            </div>
          </article>
        ))}
      </div>
      </section>

      {selectedReport ? (
        <div className="report-process-overlay" role="presentation" onMouseDown={closeProcessPanel}>
          <form
            className="report-process-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="process-report-title"
            onSubmit={handleProcessReport}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="report-process-heading">
              <div>
                <span>{getTargetType(selectedReport)} #{selectedReport.id}</span>
                <h3 id="process-report-title">Chọn phương án xử lý</h3>
              </div>
              <button type="button" onClick={closeProcessPanel} aria-label="Đóng">×</button>
            </div>

            <div className="report-process-context">
              <strong>{REPORT_REASON_LABELS[selectedReport.reason] || selectedReport.reason}</strong>
              <span>{getTargetTitle(selectedReport)}</span>
            </div>

            <label htmlFor="report-action">Phương án</label>
            <select
              id="report-action"
              value={selectedAction}
              onChange={(event) => setSelectedAction(event.target.value)}
              required
            >
              {getReportActions(selectedReport).map((action) => (
                <option value={action} key={action}>{REPORT_ACTION_LABELS[action]}</option>
              ))}
            </select>

            <label htmlFor="resolution-note">Ghi chú xử lý</label>
            <textarea
              id="resolution-note"
              value={resolutionNote}
              onChange={(event) => setResolutionNote(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Ghi rõ căn cứ hoặc lưu ý cho lần kiểm tra sau..."
            />
            <small>{resolutionNote.length}/500</small>

            <div className="report-process-actions">
              <button type="button" onClick={closeProcessPanel} disabled={processing}>Hủy</button>
              <button type="submit" disabled={processing || !selectedAction}>
                {processing ? 'Đang xử lý...' : 'Xác nhận xử lý'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default AdminReportsPage;
