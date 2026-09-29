import React, { useState, useEffect } from 'react';
import { submitRefundRequest, getSampleOrders, lookupOrder } from '../services/api';

function CustomerPage() {
  const [sampleOrders, setSampleOrders] = useState([]);
  const [selectedOrderNo, setSelectedOrderNo] = useState('');
  
  // Form State
  const [orderNumber, setOrderNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [reason, setReason] = useState('damaged');
  const [customerMessage, setCustomerMessage] = useState('');
  
  // Active Order Info
  const [loadedOrder, setLoadedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Result from AI / Policy System
  const [result, setResult] = useState(null);

  // Load sample orders for easy assessment review
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await getSampleOrders();
        if (res.data.success) {
          setSampleOrders(res.data.data);
        }
      } catch (err) {
        console.error('Could not load sample orders:', err);
      }
    };
    fetchSamples();
  }, []);

  // When a sample scenario is chosen from the dropdown, autofill the form
  const handleSelectScenario = async (e) => {
    const orderNo = e.target.value;
    setSelectedOrderNo(orderNo);
    setError('');
    setResult(null);

    if (!orderNo) {
      setLoadedOrder(null);
      return;
    }

    try {
      const res = await lookupOrder(orderNo);
      if (res.data.success) {
        const ord = res.data.data;
        setLoadedOrder(ord);
        setOrderNumber(ord.orderNumber);
        setCustomerEmail(ord.customerId?.email || '');
        setRequestedAmount(ord.totalAmount);
        
        // Contextual smart default message
        if (ord.items[0]?.isFinalSale) {
          setReason('changed_mind');
          setCustomerMessage('I bought this item on sale but realized it does not fit my needs.');
        } else if (ord.totalAmount > 500) {
          setReason('defective');
          setCustomerMessage('The monitor screen flickers intermittently and shows dead pixels.');
        } else {
          setReason('damaged');
          setCustomerMessage('The package arrived torn and the product inside is scratched and unusable.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to lookup order');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await submitRefundRequest({
        orderNumber,
        customerEmail,
        requestedAmount: parseFloat(requestedAmount),
        reason,
        customerMessage
      });

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process refund request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Customer Support & Refund Request</h2>
        <p>Submit an automated refund claim evaluated by WORKNOON's Policy Engine and AI Support Agent.</p>
      </div>

      {/* Quick Test Picker for Evaluators */}
      <div className="scenarios-box">
        <strong>⚡ Evaluator Quick-Test: Load Preset Customer Scenario</strong>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0.5rem' }}>
          Select any of the 15 synthetic seed profiles to immediately test edge cases (Final Sale, Expired >30 days, High Value &gt;$500, Prompt Injections).
        </p>
        <select value={selectedOrderNo} onChange={handleSelectScenario}>
          <option value="">-- Choose a test scenario --</option>
          {sampleOrders.map((ord) => (
            <option key={ord.orderNumber} value={ord.orderNumber}>
              {ord.orderNumber} - {ord.customerId?.name} (${ord.totalAmount}) [{ord.items[0]?.productName}]
            </option>
          ))}
        </select>
      </div>

      <div className="customer-grid">
        {/* Left Column: Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Submit Refund Claim</h3>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Order Number</label>
              <input
                type="text"
                placeholder="e.g. ORD-2024-1001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Customer Account Email</label>
              <input
                type="email"
                placeholder="sarah.johnson@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            {loadedOrder && (
              <div className="order-preview">
                <strong>📦 Order Details:</strong>
                <div className="order-preview-grid">
                  <div><strong>Customer:</strong> {loadedOrder.customerId?.name} ({loadedOrder.customerId?.loyaltyTier} tier)</div>
                  <div><strong>Order Date:</strong> {new Date(loadedOrder.orderDate).toLocaleDateString()}</div>
                  <div><strong>Items:</strong> {loadedOrder.items?.map(i => `${i.productName} (${i.isFinalSale ? 'Final Sale' : 'Standard'})`).join(', ')}</div>
                  <div><strong>Total Value:</strong> ${loadedOrder.totalAmount}</div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Requested Refund Amount ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="89.99"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Claim Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="damaged">Damaged during shipping</option>
                <option value="wrong_item">Received incorrect item</option>
                <option value="defective">Item is defective / not functioning</option>
                <option value="not_as_described">Not as described</option>
                <option value="changed_mind">Changed mind / No longer needed</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div className="form-group">
              <label>Customer Explanation / Message</label>
              <textarea
                rows="4"
                placeholder="Explain the issue in detail (or test prompt injection safeguards here)..."
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Evaluating Request with AI Agent...' : 'Submit Claim'}
            </button>
          </form>
        </div>

        {/* Right Column: AI Live Result & Policy Feedback */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <h3 style={{ marginBottom: '1rem' }}>AI Decision & Support Response</h3>

            {!result && !loading && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Fill out the claim on the left and submit. The system will run the deterministic policy check, inspect for prompt injection, consult the Groq AI Reasoning Engine, and display the official decision outcome here.
              </p>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🤖</div>
                <p>Analyzing order history against policy rules...</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Running Groq Llama-3.3 Reasoning Layer</span>
              </div>
            )}

            {result && (
              <div className={`response-box ${result.status}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Decision Status:</span>
                  <span className={`badge badge-${result.status}`}>{result.status}</span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer Facing Message:</strong>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>"{result.customerResponse}"</p>
                </div>

                <div className="reasoning-text">
                  <strong>🧠 Internal System Reasoning:</strong>
                  <p style={{ marginTop: '0.25rem' }}>{result.reasoning}</p>

                  {result.policyViolations && result.policyViolations.length > 0 && (
                    <div style={{ marginTop: '0.5rem', color: '#f87171' }}>
                      <strong>⚠️ Policy Violations Flagged:</strong>
                      <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                        {result.policyViolations.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerPage;