import { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import api from '../services/api';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function DriverModal({ driver, onClose, onRefresh }) {
  if (!driver) return null;

  const [localStatus, setLocalStatus] = useState(driver.status || 'pending');
  const [localForceUpdate, setLocalForceUpdate] = useState(driver.forceUpdate || false);
  const [actionLoading, setActionLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.put(`/api/admin/drivers/${driver.id}/status`, { status: 'active' });
      setLocalStatus('active');
      alert('Driver approved and activated successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to approve driver:', error);
      alert('Failed to approve driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await api.put(`/api/admin/drivers/${driver.id}/status`, { status: 'rejected' });
      setLocalStatus('rejected');
      alert('Driver rejected successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to reject driver:', error);
      alert('Failed to reject driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/api/admin/drivers/${driver.id}/block`);
      setLocalStatus('blocked');
      alert('Driver account blocked successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to block driver:', error);
      alert('Failed to block driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/api/admin/drivers/${driver.id}/unblock`);
      setLocalStatus('active');
      alert('Driver account unblocked successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to unblock driver:', error);
      alert('Failed to unblock driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceUpdate = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/api/admin/drivers/${driver.id}/force-update`);
      setLocalForceUpdate(true);
      alert('Force app update triggered successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to trigger force update:', error);
      alert('Failed to trigger force update');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelForceUpdate = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/api/admin/drivers/${driver.id}/remove-force-update`);
      setLocalForceUpdate(false);
      alert('Force app update cancelled successfully!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to cancel force update:', error);
      alert('Failed to cancel force update');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Driver Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {driver.duplicates && (driver.duplicates.vehicleNumber || driver.duplicates.dlNumber || driver.duplicates.idNumber) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-red-800">same number document uploaded</p>
                <p className="text-xs text-red-700 mt-1">
                  One or more document numbers submitted by this driver are already uploaded by another registered profile. Please review highlighted fields carefully.
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image & Rating */}
            <div className="flex flex-col items-center">
              <img
                src={driver.profileImage}
                alt={driver.name}
                className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setZoomedImage(driver.profileImage)}
              />
              {driver.averageRating > 0 && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <span className="text-amber-500 text-xl">⭐</span>
                    <span className="text-xl font-bold text-gray-900">{driver.averageRating}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{driver.totalRatings} Customer Ratings</p>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{driver.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="text-lg font-semibold text-gray-900">{driver.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  localStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  localStatus === 'active' ? 'bg-green-100 text-green-800' :
                  localStatus === 'blocked' ? 'bg-red-100 text-red-800 font-bold' :
                  'bg-red-100 text-red-800'
                }`}>
                  {localStatus.toUpperCase()}
                </span>
                {localForceUpdate && (
                  <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 animate-pulse">
                    Force Update Active 📲
                  </span>
                )}
              </div>
              
              {/* Auto Clicker Details */}
              {driver.clickerId && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-1">
                    <span className="text-lg">⚡</span> Auto Clicker Stats
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-blue-600 uppercase font-semibold">Clicker ID</p>
                      <p className="font-mono text-sm font-bold text-gray-900">{driver.clickerId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 uppercase font-semibold">Accepted Trips</p>
                      <p className="font-mono text-sm font-bold text-gray-900">
                        {driver.clickerTrips} / 100 
                        {driver.isClickerBlocked && <span className="ml-1 text-red-600 text-xs bg-red-100 px-1 rounded">BLOCKED</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Auto Variant</p>
                <p className="text-lg font-semibold text-gray-900">{driver.autoVariant}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle Registration Number</p>
                <p className="text-lg font-semibold text-gray-900">{driver.regNumber}</p>
                {driver.duplicates?.vehicleNumber && (
                  <p className="text-xs text-red-600 font-bold mt-1">⚠️ This Vehicle Number is already uploaded by another driver!</p>
                )}
              </div>
            </div>

            {/* License & Aadhar */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Driving License Number</p>
                <p className="text-lg font-semibold text-gray-900">{driver.licensePath}</p>
                {driver.duplicates?.dlNumber && (
                  <p className="text-xs text-red-600 font-bold mt-1">⚠️ This DL Number is already uploaded by another driver!</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Aadhar Card Number</p>
                <p className="text-lg font-semibold text-gray-900">{driver.aadharNumber}</p>
                {driver.duplicates?.idNumber && (
                  <p className="text-xs text-red-600 font-bold mt-1">⚠️ This Aadhar/PAN Number is already uploaded by another driver!</p>
                )}
              </div>
            </div>

            {/* Customer Feedback */}
            {(driver.goodReasons?.length > 0 || driver.badReasons?.length > 0) && (
              <div className="col-span-1 md:col-span-2 mt-4 border-t border-gray-200 pt-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Customer Feedback Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Positive Feedback */}
                  {driver.goodReasons?.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-green-800 font-bold mb-3 flex items-center gap-2">
                        <span>✅</span> What Customers Loved
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {driver.goodReasons.map((reasonObj, idx) => (
                          <span key={idx} className="bg-white border border-green-300 text-green-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                            {reasonObj.reason} <span className="ml-1 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs font-bold">{reasonObj.count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Negative Feedback */}
                  {driver.badReasons?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-red-800 font-bold mb-3 flex items-center gap-2">
                        <span>⚠️</span> Areas of Concern
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {driver.badReasons.map((reasonObj, idx) => (
                          <span key={idx} className="bg-white border border-red-300 text-red-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                            {reasonObj.reason} <span className="ml-1 bg-red-100 text-red-800 py-0.5 px-2 rounded-full text-xs font-bold">{reasonObj.count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Uploaded Documents Images */}
            {(driver.dlFront || driver.dlBack || driver.rcFront || driver.rcBack || driver.idFront || driver.idBack) && (
              <div className="col-span-1 md:col-span-2 mt-4 border-t border-gray-200 pt-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Uploaded Document Verification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {driver.dlFront && (
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Driving License (Front)</p>
                      <img src={driver.dlFront} alt="DL Front" className="w-full h-40 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setZoomedImage(driver.dlFront)} />
                    </div>
                  )}
                  {driver.dlBack && (
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Driving License (Back)</p>
                      <img src={driver.dlBack} alt="DL Back" className="w-full h-40 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setZoomedImage(driver.dlBack)} />
                    </div>
                  )}
                  {driver.rcFront && (
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-1">RC Book (Front)</p>
                      <img src={driver.rcFront} alt="RC Front" className="w-full h-40 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setZoomedImage(driver.rcFront)} />
                    </div>
                  )}
                  {driver.rcBack && (
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-1">RC Book (Back)</p>
                      <img src={driver.rcBack} alt="RC Back" className="w-full h-40 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setZoomedImage(driver.rcBack)} />
                    </div>
                  )}
                  {driver.idFront && (
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-1">ID Card (Front)</p>
                      <img src={driver.idFront} alt="ID Front" className="w-full h-40 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setZoomedImage(driver.idFront)} />
                    </div>
                  )}
                  {driver.idBack && (
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-1">ID Card (Back)</p>
                      <img src={driver.idBack} alt="ID Back" className="w-full h-40 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setZoomedImage(driver.idBack)} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Administrative Actions */}
            <div className="col-span-1 md:col-span-2 mt-4 border-t border-gray-200 pt-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">Administrative Actions</h3>
              <div className="flex flex-wrap gap-3">
                {localStatus === 'pending' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Approve Driver ✅
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Reject Driver ❌
                    </button>
                  </>
                )}

                {localStatus === 'rejected' && (
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Activate Driver ✅
                  </button>
                )}

                {localStatus === 'active' && (
                  <button
                    onClick={handleBlock}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Block Driver 🚫
                  </button>
                )}

                {localStatus === 'blocked' && (
                  <button
                    onClick={handleUnblock}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Unblock Driver ✅
                  </button>
                )}

                {(localStatus === 'active' || localStatus === 'blocked') && (
                  <>
                    {localForceUpdate ? (
                      <button
                        onClick={handleCancelForceUpdate}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Cancel Force Update 🔄
                      </button>
                    ) : (
                      <button
                        onClick={handleForceUpdate}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        Force App Update 📲
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Zoom Overlay */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4"
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors z-[70]"
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
          >
            <X size={32} />
          </button>
          
          <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full z-[70]">
            Scroll to zoom, drag to move
          </div>

          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={8}
            centerOnInit={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[70] bg-black/50 p-2 rounded-full backdrop-blur-sm border border-white/20">
                  <button onClick={() => zoomOut()} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                    <ZoomOut size={24} />
                  </button>
                  <button onClick={() => resetTransform()} className="text-white hover:bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium transition-colors">
                    Reset
                  </button>
                  <button onClick={() => zoomIn()} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                    <ZoomIn size={24} />
                  </button>
                </div>
                <TransformComponent wrapperStyle={{ width: '100vw', height: '100vh' }}>
                  <img 
                    src={zoomedImage} 
                    alt="Zoomed" 
                    className="max-w-full max-h-screen object-contain select-none cursor-grab active:cursor-grabbing"
                    draggable={false}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}
    </div>
  );
}