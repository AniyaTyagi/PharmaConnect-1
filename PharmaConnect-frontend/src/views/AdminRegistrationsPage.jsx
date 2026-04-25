import React, { useState, useEffect } from 'react';
import { RegistrationController } from '../controllers/RegistrationController';
import AdminHeader from '../admin/components/AdminHeader';
import AdminSidebar from '../admin/components/AdminSidebar';
import '../styles/admin-registrations.css';

const AdminRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    const [pending, approved] = await Promise.all([
      RegistrationController.getAllRegistrations(),
      RegistrationController.getApprovedRegistrations(),
    ]);
    const approvedWithStatus = approved.map(r => ({ ...r, status: 'approved' }));
    setRegistrations([...pending, ...approvedWithStatus]);
  };

  const handleApprove = async (id) => {
    await RegistrationController.approveRegistration(id);
    loadRegistrations();
    alert('Registration approved! Email sent to user.');
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      await RegistrationController.rejectRegistration(id, reason);
      loadRegistrations();
      alert('Registration rejected!');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this registration?')) {
      await RegistrationController.deleteRegistration(id);
      loadRegistrations();
    }
  };

  const filteredRegs = registrations.filter(r => 
    filter === 'all' || r.status === filter
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader title="Registration Approvals" />
        
        <div className="admin-content">
          <div className="filter-bar">
            <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
              All ({registrations.length})
            </button>
            <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>
              Pending ({registrations.filter(r => r.status === 'pending').length})
            </button>
            <button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'active' : ''}>
              Approved ({registrations.filter(r => r.status === 'approved').length})
            </button>
            <button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'active' : ''}>
              Rejected ({registrations.filter(r => r.status === 'rejected').length})
            </button>
          </div>

          <div className="registrations-grid">
            {filteredRegs.map(reg => (
              <div key={reg._id} className={`registration-card ${reg.status}`}>
                <div className="card-header">
                  <h3>{reg.businessName}</h3>
                  <span className={`status-badge ${reg.status}`}>{reg.status}</span>
                </div>
                
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">Type:</span>
                    <span className="value">{reg.role}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Contact:</span>
                    <span className="value">{reg.contactPerson}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{reg.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{reg.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">License:</span>
                    <span className="value">{reg.licenseNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">GST:</span>
                    <span className="value">{reg.gstNumber}</span>
                  </div>
                  {(reg.role === 'manufacturer') && (
                    <>
                      <div className="info-row">
                        <span className="label">Drug License:</span>
                        <span className="value">{reg.drugLicense}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Mfg License:</span>
                        <span className="value">{reg.manufacturingLicense}</span>
                      </div>
                    </>
                  )}
                  <div className="info-row">
                    <span className="label">Location:</span>
                    <span className="value">{reg.city}, {reg.state} - {reg.pincode}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className="value">{reg.status || 'approved'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{reg.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Submitted:</span>
                    <span className="value">{new Date(reg.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button onClick={() => setSelectedReg(reg)} className="btn-view">View Details</button>
                  {reg.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(reg._id)} className="btn-approve">Approve</button>
                      <button onClick={() => handleReject(reg._id)} className="btn-reject">Reject</button>
                    </>
                  )}
                  <button onClick={() => handleDelete(reg._id)} className="btn-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {filteredRegs.length === 0 && (
            <div className="empty-state">
              <p>No registrations found</p>
            </div>
          )}
        </div>
      </div>

      {selectedReg && (
        <div className="modal-overlay" onClick={() => setSelectedReg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Registration Details</h2>
            <div className="details-grid">
              <div><strong>Business Name:</strong> {selectedReg.businessName}</div>
              <div><strong>Type:</strong> {selectedReg.role}</div>
              <div><strong>Contact Person:</strong> {selectedReg.contactPerson}</div>
              <div><strong>Email:</strong> {selectedReg.email}</div>
              <div><strong>Phone:</strong> {selectedReg.phone}</div>
              <div><strong>License Number:</strong> {selectedReg.licenseNumber}</div>
              <div><strong>GST Number:</strong> {selectedReg.gstNumber}</div>
              {selectedReg.role === 'manufacturer' && (
                <>
                  <div><strong>Drug License:</strong> {selectedReg.drugLicense}</div>
                  <div><strong>Manufacturing License:</strong> {selectedReg.manufacturingLicense}</div>
                </>
              )}
              <div><strong>Address:</strong> {selectedReg.address}</div>
              <div><strong>City:</strong> {selectedReg.city}</div>
              <div><strong>State:</strong> {selectedReg.state}</div>
              <div><strong>Pincode:</strong> {selectedReg.pincode}</div>
              <div><strong>Status:</strong> {selectedReg.status}</div>
              <div><strong>Submitted:</strong> {new Date(selectedReg.createdAt).toLocaleString()}</div>
            </div>
            <button onClick={() => setSelectedReg(null)} className="btn-close">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrationsPage;
