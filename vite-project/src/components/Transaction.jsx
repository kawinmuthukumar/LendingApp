import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './Transaction.css';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Please sign in to view transactions');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions`, {
        headers: {
          'userId': userId
        }
      });
      setTransactions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Please sign in to update transactions');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/transactions/${transactionId}`, {
        status: newStatus
      }, {
        headers: {
          'userId': userId
        }
      });
      fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error('Error updating transaction:', err);
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
      {transactions.length === 0 ? (
        <div className="no-transactions">No transactions found</div>
      ) : (
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-card">
              <div className="transaction-header">
                <h3>Transaction ID: {transaction._id}</h3>
                <span className={`status ${transaction.status.toLowerCase()}`}>
                  {transaction.status}
                </span>
              </div>
              <div className="transaction-details">
                <p><strong>Item:</strong> {transaction.itemName}</p>
                <p><strong>Lender:</strong> {transaction.lenderName}</p>
                <p><strong>Borrower:</strong> {transaction.borrowerName}</p>
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
                      onClick={() => updateTransactionStatus(transaction._id, 'Approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => updateTransactionStatus(transaction._id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </>
                )}
                {transaction.status === 'Approved' && (
                  <button
                    className="complete-btn"
                    onClick={() => updateTransactionStatus(transaction._id, 'Completed')}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transaction;
