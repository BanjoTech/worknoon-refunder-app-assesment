import React, { useState, useEffect } from 'react';
import {
  getAdminStats,
  getAdminRequests,
  updateRequestDecision,
} from '../services/api';

function AdminPage() {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    denied: 0,
    escalated: 0,
    approvalRate: '0%',
  });
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  // Override Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('approved');
  const [overrideNotes, setOverrideNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqsRes] = await Promise.all([
        getAdminStats(),
        getAdminRequests(statusFilter),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (reqsRes.data.success) setRequests(reqsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await updateRequestDecision(selectedRequest._id, {
        status: overrideStatus,
        reviewNotes: overrideNotes,
        reviewedBy: 'Support Supervisor (Manual Review)',
      });

      setSelectedRequest(null);
      setOverrideNotes('');
      loadData(); // Refresh list
    } catch (err) {
      alert(
        'Failed to update decision: ' +
          (err.response?.data?.error || err.message),
      );
    }
  };

  return (
    <div>
      <div className='page-header'>
        <h2>Support & Operations Dashboard</h2>
        <p>
          Audit AI decisions, inspect reasoning trails, and perform manual
          overrides on customer refund claims.
        </p>
      </div>

      {/* Stats KPI Overview */}
      <div className='stats-grid'>
        <div className='stat-card'>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Total Claims
          </div>
          <div className='stat-value'>{stats.total}</div>
        </div>
        <div className='stat-card'>
          <div style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
            Approved Claims
          </div>
          <div className='stat-value' style={{ color: 'var(--success)' }}>
            {stats.approved}
          </div>
        </div>
        <div className='stat-card'>
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
            Denied Claims
          </div>
          <div className='stat-value' style={{ color: 'var(--danger)' }}>
            {stats.denied}
          </div>
        </div>
        <div className='stat-card'>
          <div style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
            Escalated (Needs Human)
          </div>
          <div className='stat-value' style={{ color: 'var(--warning)' }}>
            {stats.escalated}
          </div>
        </div>
        <div className='stat-card'>
          <div style={{ color: 'var(--info)', fontSize: '0.85rem' }}>
            AI Auto-Approval Rate
          </div>
          <div className='stat-value' style={{ color: 'var(--info)' }}>
            {stats.approvalRate}
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className='card'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <h3>Recent Refund Claims Audit Log</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Filter Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
            >
              <option value=''>All Claims</option>
              <option value='approved'>Approved</option>
              <option value='denied'>Denied</option>
              <option value='escalated'>Escalated</option>
            </select>
            <button className='btn-primary btn-sm' onClick={loadData}>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-muted)',
            }}
          >
            Loading audit records...
          </p>
        ) : requests.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-muted)',
            }}
          >
            No refund requests found in this view. Submit one from the Customer
            Portal!
          </p>
        ) : (
          <div className='table-wrapper'>
            <table>
              <thead>
                <tr>
                  <th>Order / Date</th>
                  <th>Customer</th>
                  <th>Claim Reason</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <React.Fragment key={req._id}>
                    <tr>
                      <td>
                        <strong>{req.orderNumber}</strong>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        {req.customerId?.name || 'Unknown'}
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Tier: {req.customerId?.loyaltyTier || 'bronze'} |
                          Refunds: {req.customerId?.totalRefundCount || 0}
                        </div>
                      </td>
                      <td>
                        {req.reason}
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          "{req.customerMessage}"
                        </div>
                      </td>
                      <td>
                        <strong>${req.requestedAmount?.toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`badge badge-${req.status}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>
                          {req.reviewedBy}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className='btn-primary btn-sm'
                            style={{ background: 'var(--surface-light)' }}
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === req._id ? null : req._id,
                              )
                            }
                          >
                            {expandedRow === req._id ? 'Hide Log' : 'Inspect'}
                          </button>
                          <button
                            className='btn-primary btn-sm'
                            onClick={() => {
                              setSelectedRequest(req);
                              setOverrideStatus(req.status);
                            }}
                          >
                            Override
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Detailed AI Reasoning & Guardrail Inspection Drawer */}
                    {expandedRow === req._id && (
                      <tr>
                        <td colSpan='7'>
                          <div className='audit-details'>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                                marginBottom: '0.75rem',
                              }}
                            >
                              <div>
                                <strong>Deterministic Pre-Check:</strong>{' '}
                                {req.policyResult}
                              </div>
                              <div>
                                <strong>AI Decision Confidence:</strong>{' '}
                                {req.aiConfidence
                                  ? `${(req.aiConfidence * 100).toFixed(0)}%`
                                  : '100%'}
                              </div>
                              <div>
                                <strong>Full Customer Message:</strong> "
                                {req.customerMessage}"
                              </div>
                            </div>
                            <div>
                              <strong>🧠 Full System Reasoning Log:</strong>
                              <p
                                style={{
                                  marginTop: '0.25rem',
                                  color: '#cbd5e1',
                                }}
                              >
                                {req.aiReasoning}
                              </p>
                            </div>
                            {req.reviewNotes && (
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  color: '#fbbf24',
                                }}
                              >
                                <strong>Human Reviewer Notes:</strong>{' '}
                                {req.reviewNotes}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Decision Override Modal */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div className='card' style={{ width: '500px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1rem' }}>Manual Decision Override</h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
              }}
            >
              Override AI system decision for Order #
              {selectedRequest.orderNumber} ({selectedRequest.customerId?.name})
            </p>

            <form onSubmit={handleOverrideSubmit}>
              <div className='form-group'>
                <label>Update Status To:</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                >
                  <option value='approved'>Approve Refund</option>
                  <option value='denied'>Deny Refund</option>
                  <option value='escalated'>Escalate to Executive Team</option>
                </select>
              </div>

              <div className='form-group'>
                <label>
                  Supervisor Review Notes (Mandatory for Audit Trail):
                </label>
                <textarea
                  rows='3'
                  placeholder='Explain why this decision was manually overridden...'
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  required
                ></textarea>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end',
                  marginTop: '1.5rem',
                }}
              >
                <button
                  type='button'
                  style={{ background: 'var(--surface-light)', color: 'white' }}
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
