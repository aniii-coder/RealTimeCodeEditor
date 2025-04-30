import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyHash } from '../utils/api';

const EnterHashPage = () => {
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await verifyHash(hash);
    if (response.success) {
      navigate('/editor'); // route to your CodeEditor
    } else {
      setError('Invalid hash. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Enter Access Hash</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="Enter access hash"
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default EnterHashPage;
