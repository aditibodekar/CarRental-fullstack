import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Documents = () => {
  const { axios, user } = useAppContext();
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null); // Track which doc to view

  useEffect(() => {
    console.log('User in context:', user);
    console.log('Attempting to fetch documents...');
    console.log("Aadhar document URL:", documents?.aadhar);

    axios.get('/api/user/documents')
      .then(res => {
        console.log('API response:', res.data);
        if (res.data.success) {
          setDocuments(res.data.documents);
          console.log('Fetched documents:', res.data.documents);
        } else {
          console.error('API error:', res.data.message);
          setError(res.data.message || 'Failed to fetch documents');
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Error fetching documents');
      })
      .finally(() => setLoading(false));
  }, [axios]);

  console.log('Rendering Documents, documents:', documents, 'loading:', loading, 'error:', error);

  const handleView = (docType) => {
    setViewing(docType); // Open modal for this doc
  };

  if (loading) return <div>Loading documents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Uploaded Documents</h1>

      <div className="mb-4">
        <strong>Aadhaar Card:</strong> {documents?.aadhar ? (
          <button onClick={() => handleView('aadhar')} className="text-blue-600 underline">
            View Document
          </button>
        ) : (
          <span className="text-red-500">Not uploaded</span>
        )}
      </div>

      <div className="mb-4">
        <strong>Driving License:</strong> {documents?.license ? (
          <button onClick={() => handleView('license')} className="text-blue-600 underline">
            View Document
          </button>
        ) : (
          <span className="text-red-500">Not uploaded</span>
        )}
      </div>

      {/* Modal for viewing JPG */}
      {viewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-4xl max-h-full overflow-auto">
            <button onClick={() => setViewing(null)} className="mb-2 text-red-500">Close</button>
            <img 
               src={documents[viewing]} 
              alt={`${viewing} document`} 
              className="max-w-full max-h-full" 
              onError={() => alert('Failed to load image')} // Optional error handling
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;