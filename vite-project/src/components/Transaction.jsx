import { useState, useEffect } from 'react';
import axios from 'axios';
import './Transaction.css';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/transactions');
      setTransactions(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch transactions');
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/transactions/${transactionId}`, {
        status: newStatus
      });
      fetchTransactions(); // Refresh the list
    } catch (err) {
      setError('Failed to update transaction status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="transaction-container">
      <h2>Transaction History</h2>
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transaction-card">
            <div className="transaction-header">
              <h3>Transaction ID: {transaction.id}</h3>
              <span className={`status ${transaction.status.toLowerCase()}`}>
                {transaction.status}
              </span>
            </div>
            <div className="transaction-details">
              <p><strong>Item ID:</strong> {transaction.itemId}</p>
              <p><strong>Lender ID:</strong> {transaction.lenderId}</p>
              <p><strong>Borrower ID:</strong> {transaction.borrowerId}</p>
              <p><strong>Start Date:</strong> {formatDate(transaction.startDate)}</p>
              {transaction.endDate && (
                <p><strong>End Date:</strong> {formatDate(transaction.endDate)}</p>
              )}
            </div>
            <div className="transaction-actions">
              {transaction.status === 'Pending' && (
                <>
                  <button
                    className="approve-btn"
                    onClick={() => updateTransactionStatus(transaction.id, 'Approved')}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => updateTransactionStatus(transaction.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
              {transaction.status === 'Approved' && (
                <button
                  className="complete-btn"
                  onClick={() => updateTransactionStatus(transaction.id, 'Completed')}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transaction;
