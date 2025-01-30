import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './ViewItems.css';

const ViewItems = () => {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserId = localStorage.getItem('userId');

  const fetchItems = async () => {
    try {
      console.log('Fetching items...');
      const response = await axios.get(`${API_BASE_URL}/api/items`);
      console.log('Items received:', response.data);
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items');
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions for user:', currentUserId);
      const response = await axios.get(`${API_BASE_URL}/api/transactions/user/${currentUserId}`);
      console.log('Transactions received:', response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchItems();
      if (currentUserId) {
        await fetchTransactions();
      }
    };
    fetchData();
  }, [currentUserId]);

  const handleBorrow = async (itemId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/transactions`, {
        itemId,
        borrowerId: currentUserId
      });
      
      await Promise.all([
        fetchTransactions(),
        fetchItems()
      ]);
      alert('Borrow request sent successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send borrow request';
      alert(errorMessage);
    }
  };

  const handleCancelRequest = async (itemId) => {
    try {
      console.log('Cancelling/Returning item:', itemId);
      const response = await axios.post(`${API_BASE_URL}/api/transactions/cancel`, {
        itemId,
        borrowerId: currentUserId
      });
      
      console.log('Cancel/Return response:', response.data);
      
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId 
          ? { ...item, status: 'available' }
          : item
      ));
      
      setTransactions(prevTransactions => 
        prevTransactions.filter(t => 
          !(t.itemId === itemId && t.borrowerId === currentUserId)
        )
      );
      
      await Promise.all([
        fetchItems(),
        fetchTransactions()
      ]);
      
      alert(response.data.message);
    } catch (error) {
      console.error('Error in cancel/return:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process request';
      alert(errorMessage);
      
      await Promise.all([
        fetchItems(),
        fetchTransactions()
      ]);
    }
  };

  const handleApproveReject = async (transactionId, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/transactions/${transactionId}`, {
        status,
        userId: currentUserId
      });
      
      await Promise.all([
        fetchTransactions(),
        fetchItems()
      ]);
      alert(`Request ${status} successfully!`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${status} request`;
      alert(errorMessage);
    }
  };

  const getItemTransaction = (itemId) => {
    console.log('Getting transaction for item:', itemId);
    console.log('Available transactions:', transactions);
    const transaction = transactions.find(t => 
      t.itemId === itemId && 
      ['pending', 'approved'].includes(t.status)
    );
    console.log('Found transaction:', transaction);
    return transaction;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available':
        return 'status-badge available';
      case 'borrowed':
        return 'status-badge borrowed';
      default:
        return 'status-badge';
    }
  };

  const getActionButton = (item) => {
    // Find active transaction (pending or approved) for this item
    const transaction = transactions.find(t => 
      t.itemId === item.id && 
      ['pending', 'approved'].includes(t.status)
    );

    console.log('Item status:', item.status);
    console.log('Transaction:', transaction);

    // If no active transaction or item is available, show borrow button
    if (!transaction && item.status !== 'borrowed') {
      return (
        <div className="action-info available">
          <button 
            className="action-button borrow"
            onClick={() => handleBorrow(item.id)}
          >
            Borrow Item
          </button>
          <span className="action-message">
            Available for borrowing from {item.owner?.name || 'Unknown User'}
          </span>
        </div>
      );
    }

    // If current user is the owner
    if (item.ownerId === currentUserId) {
      if (transaction?.status === 'pending') {
        return (
          <div className="action-info owner">
            <div className="request-info">
              <p>Request from: {transaction.borrower?.name}</p>
              <div className="action-buttons">
                <button className="action-button approve" onClick={() => handleApproveReject(transaction.id, 'approved')}>
                  Approve
                </button>
                <button className="action-button reject" onClick={() => handleApproveReject(transaction.id, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="action-info owner">
          <button className="action-button owner" disabled>Your Item</button>
          <span className="action-message">You own this item</span>
        </div>
      );
    }

    // If there's an active transaction
    if (transaction) {
      const isBorrower = transaction.borrowerId === currentUserId;

      if (transaction.status === 'approved') {
        return (
          <div className="action-info borrowed">
            <button className="action-button borrowed" disabled>
              Currently Borrowed
            </button>
            <span className="action-message">
              {isBorrower ? 'You are borrowing this item' : `Borrowed by ${transaction.borrower?.name || 'another user'}`}
            </span>
            {isBorrower && (
              <button 
                className="action-button cancel"
                onClick={() => handleCancelRequest(item.id)}
              >
                Return Item
              </button>
            )}
          </div>
        );
      }

      if (transaction.status === 'pending' && isBorrower) {
        return (
          <div className="action-info pending">
            <button 
              className="action-button cancel"
              onClick={() => handleCancelRequest(item.id)}
            >
              Cancel Request
            </button>
            <span className="action-message">Your request is pending approval</span>
          </div>
        );
      }
    }

    // Default: Available for borrowing
    return (
      <div className="action-info available">
        <button 
          className="action-button borrow"
          onClick={() => handleBorrow(item.id)}
        >
          Borrow Item
        </button>
        <span className="action-message">
          Available for borrowing from {item.owner?.name || 'Unknown User'}
        </span>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading items...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="items-container">
      <h2>Available Items</h2>
      {items.length === 0 ? (
        <div className="no-items">No items available</div>
      ) : (
        <div className="items-grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <h3>{item.name}</h3>
                <div className="status-section">
                  <span className={getStatusBadgeClass(item.status || 'available')}>
                    {item.status || 'available'}
                  </span>
                  {item.status === 'borrowed' && (
                    <span className="borrower-info">
                      {getItemTransaction(item.id)?.borrower?.name 
                        ? `Borrowed by ${getItemTransaction(item.id).borrower.name}`
                        : ''}
                    </span>
                  )}
                </div>
              </div>
              <p className="item-description">{item.description}</p>
              <div className="item-details">
                <p className="item-owner">
                  Owner: {item.ownerId === currentUserId ? 'You' : (item.owner?.name || 'Unknown User')}
                </p>
                {item.owner?.email && item.ownerId !== currentUserId && (
                  <p className="item-owner-email">
                    Contact: {item.owner.email}
                  </p>
                )}
              </div>
              <div className="item-footer">
                {getActionButton(item)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewItems;
