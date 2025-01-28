import { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewItems.css';

const ViewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserId = localStorage.getItem('userId');

  const fetchItems = async () => {
    try {
      console.log('Fetching items...');
      const response = await axios.get('http://localhost:3000/api/items');
      console.log('Items received:', response.data);
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleBorrow = async (itemId) => {
    try {
      const response = await axios.post('http://localhost:3000/api/transactions', {
        itemId,
        borrowerId: currentUserId
      });
      
      setItems(items.map(item => 
        item._id === itemId 
          ? { ...item, status: 'borrowed' }
          : item
      ));
      
      alert('Item borrowed successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to borrow item';
      alert(errorMessage);
    }
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
    // If current user is the owner
    if (item.ownerId === currentUserId) {
      return (
        <div className="action-info owner">
          <button className="action-button owner" disabled>
            Your Item
          </button>
          <span className="action-message">You own this item</span>
        </div>
      );
    }

    // If item is borrowed
    if (item.status === 'borrowed') {
      return (
        <div className="action-info borrowed">
          <button className="action-button borrowed" disabled>
            Currently Borrowed
          </button>
          <span className="action-message">
            This item is currently borrowed
          </span>
        </div>
      );
    }

    // If item is available and user is not the owner
    return (
      <div className="action-info available">
        <button 
          className="action-button borrow"
          onClick={() => handleBorrow(item._id)}
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
            <div key={item._id} className="item-card">
              <div className="item-header">
                <h3>{item.name}</h3>
                <span className={getStatusBadgeClass(item.status || 'available')}>
                  {item.status || 'available'}
                </span>
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
