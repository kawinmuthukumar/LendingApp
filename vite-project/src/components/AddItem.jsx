import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddItem.css';

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Please log in to add items');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/items', {
        ...formData,
        ownerId: userId
      });

      console.log('Item created:', response.data);
      navigate('/view-items');
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error.response?.data?.message || 'Failed to add item');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="add-item-container">
      <div className="add-item-box">
        <h2>Add New Item</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter item name"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter item description"
            />
          </div>
          <button type="submit" className="add-button">
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
