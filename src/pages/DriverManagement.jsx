import { useEffect, useState } from 'react';
import { Eye, Check, X, Search, UploadCloud, Play, Trash2, Edit2, ToggleLeft, ToggleRight, PlusCircle } from 'lucide-react';
import api from '../services/api';
import DriverModal from '../components/DriverModal';


const mockDrivers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    autoVariant: 'Compact Auto',
    regNumber: 'TN-01-AB-1234',
    status: 'pending',
    profileImage: 'https://via.placeholder.com/150',
    licensePath: 'TN-DL-2024-001',
    aadharNumber: '1234-5678-9012',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    phone: '+91-9876543211',
    autoVariant: 'Maxima Auto',
    regNumber: 'TN-01-CD-5678',
    status: 'active',
    profileImage: 'https://via.placeholder.com/150',
    licensePath: 'TN-DL-2024-002',
    aadharNumber: '1234-5678-9013',
  },
  {
    id: 3,
    name: 'Arjun Patel',
    phone: '+91-9876543212',
    autoVariant: 'XL Auto',
    regNumber: 'TN-01-EF-9012',
    status: 'pending',
    profileImage: 'https://via.placeholder.com/150',
    licensePath: 'TN-DL-2024-003',
    aadharNumber: '1234-5678-9014',
  },
];

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apkFile, setApkFile] = useState(null);
  const [versionName, setVersionName] = useState('');
  const [releases, setReleases] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // 🎬 Tutorial Videos State
  const [tutorialVideos, setTutorialVideos] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', youtubeUrl: '', order: 0 });
  const [videoSaving, setVideoSaving] = useState(false);


  const handleApkChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setApkFile(e.target.files[0]);
    }
  };

  const handleApkUpload = async () => {
    if (!apkFile) return;
    if (!versionName.trim()) {
      alert("Please enter a version name (e.g. 1.0.1)");
      return;
    }
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('apk', apkFile);
    formData.append('versionName', versionName.trim());
    try {
      await api.post('/api/admin/upload-apk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('APK uploaded and published successfully! 🚀');
      setApkFile(null);
      setVersionName('');
      document.getElementById('apk-file-input').value = '';
      fetchReleases();
    } catch (error) {
      console.error('Failed to upload APK:', error);
      alert('Failed to upload APK');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleForceUpdateAllOutdated = async () => {
    if (!window.confirm("Are you sure you want to force app update on ALL outdated drivers? They will be blocked until they update.")) {
      return;
    }
    setUploadLoading(true);
    try {
      await api.post('/api/admin/drivers/force-update-all');
      alert('Force app update triggered for all outdated drivers! 🚀');
      fetchDrivers();
    } catch (error) {
      console.error('Failed to trigger bulk force update:', error);
      alert('Failed to trigger bulk force update');
    } finally {
      setUploadLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/api/admin/drivers');
      setDrivers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      setLoading(false);
    }
  };

  const fetchReleases = async () => {
    try {
      const response = await api.get('/api/admin/apk-releases');
      setReleases(response.data);
    } catch (error) {
      console.error('Failed to fetch APK releases:', error);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchReleases();
    fetchTutorialVideos();
  }, []);

  // 🎬 Tutorial Video Functions
  const fetchTutorialVideos = async () => {
    setVideoLoading(true);
    try {
      const response = await api.get('/api/admin/tutorial-videos');
      setTutorialVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch tutorial videos:', error);
    } finally {
      setVideoLoading(false);
    }
  };

  const extractYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleVideoSave = async () => {
    if (!videoForm.title.trim() || !videoForm.youtubeUrl.trim()) {
      alert('Title and YouTube URL are required!');
      return;
    }
    const videoId = extractYoutubeId(videoForm.youtubeUrl);
    if (!videoId) {
      alert('Invalid YouTube URL! Please enter a valid YouTube video link.');
      return;
    }
    setVideoSaving(true);
    try {
      if (editingVideo) {
        await api.put(`/api/admin/tutorial-videos/${editingVideo._id}`, videoForm);
        alert('Video updated successfully! ✅');
      } else {
        await api.post('/api/admin/tutorial-videos', videoForm);
        alert('Video added successfully! 🎬');
      }
      setShowVideoForm(false);
      setEditingVideo(null);
      setVideoForm({ title: '', description: '', youtubeUrl: '', order: 0 });
      fetchTutorialVideos();
    } catch (error) {
      console.error('Failed to save video:', error);
      alert('Failed to save video');
    } finally {
      setVideoSaving(false);
    }
  };

  const handleVideoDelete = async (video) => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/tutorial-videos/${video._id}`);
      alert('Video deleted! 🗑️');
      fetchTutorialVideos();
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video');
    }
  };

  const handleVideoToggle = async (video) => {
    try {
      await api.put(`/api/admin/tutorial-videos/${video._id}/toggle`);
      fetchTutorialVideos();
    } catch (error) {
      console.error('Failed to toggle video:', error);
      alert('Failed to toggle video visibility');
    }
  };

  const handleVideoEdit = (video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description || '',
      youtubeUrl: video.youtubeUrl,
      order: video.order || 0,
    });
    setShowVideoForm(true);
  };

  const handleViewDetails = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };


  const handleApprove = async (driverId) => {
    try {
      await api.put(`/api/admin/drivers/${driverId}/status`, { status: 'active' });
      setDrivers(drivers.map(d => d.id === driverId ? { ...d, status: 'active' } : d));
      alert('Driver approved successfully');
    } catch (error) {
      console.error('Failed to approve driver:', error);
      alert('Failed to approve driver');
    }
  };

  const handleReject = async (driverId) => {
    try {
      await api.put(`/api/admin/drivers/${driverId}/status`, { status: 'rejected' });
      setDrivers(drivers.map(d => d.id === driverId ? { ...d, status: 'rejected' } : d));
      alert('Driver rejected successfully');
    } catch (error) {
      console.error('Failed to reject driver:', error);
      alert('Failed to reject driver');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      blocked: 'bg-red-100 text-red-800 font-bold border border-red-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'Unknown'}
      </span>
    );
  };

  const [statusFilter, setStatusFilter] = useState('all');

  const totalCount = drivers.length;
  const pendingCount = drivers.filter(d => d.status === 'pending').length;
  const activeCount = drivers.filter(d => d.status === 'active').length;
  const blockedCount = drivers.filter(d => d.status === 'blocked').length;
  const rejectedCount = drivers.filter(d => d.status === 'rejected').length;
  const updatePendingCount = drivers.filter(d => d.forceUpdate === true).length;
  const outdatedCount = drivers.filter(d => (d.appVersion || '1.0.0') !== '1.0.1').length;
  const updatedCount = drivers.filter(d => (d.appVersion || '1.0.0') === '1.0.1').length;
  const goodRatingCount = drivers.filter(d => d.averageRating >= 3.0).length;
  const badRatingCount = drivers.filter(d => d.averageRating > 0 && d.averageRating < 3.0).length;

  const filteredDrivers = drivers.filter((driver) => {
    // 1. Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'update_pending') {
        if (!driver.forceUpdate) return false;
      } else if (statusFilter === 'outdated') {
        if ((driver.appVersion || '1.0.0') === '1.0.1') return false;
      } else if (statusFilter === 'updated') {
        if ((driver.appVersion || '1.0.0') !== '1.0.1') return false;
      } else if (statusFilter === 'good_rating') {
        if (!driver.averageRating || driver.averageRating < 3.0) return false;
      } else if (statusFilter === 'bad_rating') {
        if (!driver.averageRating || driver.averageRating >= 3.0) return false;
      } else if (driver.status !== statusFilter) {
        return false;
      }
    }
    // 2. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const phone = (driver.phone || '').toLowerCase();
    const regNumber = (driver.regNumber || '').toLowerCase();
    const name = (driver.name || '').toLowerCase();
    return phone.includes(query) || regNumber.includes(query) || name.includes(query);
  });

  if (loading) {
    return (
      <div className="ml-64 p-8 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600">Approve or reject pending auto-rickshaw drivers</p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by phone, vehicle no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* APK Upload Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <UploadCloud className="text-blue-600" />
          Publish App Update (.apk)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload the latest compiled version of the Driver App APK. Force-updated driver apps will automatically download this file.
        </p>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select APK File</label>
            <input 
              id="apk-file-input"
              type="file" 
              accept=".apk"
              onChange={handleApkChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-lg p-1 bg-gray-50/50"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Version Name (e.g. 1.0.1)</label>
            <input 
              type="text"
              placeholder="e.g. 1.0.1"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            />
          </div>
          <button
            onClick={handleApkUpload}
            disabled={!apkFile || !versionName.trim() || uploadLoading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm shadow-sm md:self-end"
          >
            {uploadLoading ? "Uploading..." : "Upload & Publish 📤"}
          </button>
        </div>

        {/* Release History List */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-900 mb-3">APK Upload & Version History</h4>
          {releases.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No previous APK versions uploaded yet.</p>
          ) : (
            <div className="overflow-y-auto max-h-48 border border-gray-200 rounded-lg divide-y divide-gray-150">
              {releases.map((release) => (
                <div key={release._id} className="p-3 bg-gray-50/30 flex items-center justify-between text-sm hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                      v{release.versionName}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {release.fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 font-semibold">
                      {(release.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(release.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {outdatedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-red-50/30 p-3 rounded-lg border border-red-100">
            <span className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
              ⚠️ {outdatedCount} drivers are running an outdated version of the app.
            </span>
            <button
              onClick={handleForceUpdateAllOutdated}
              disabled={uploadLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all text-xs shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50"
            >
              Force Update All Outdated Drivers 📲
            </button>
          </div>
        )}
      </div>

      {/* Driver Status Counts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'all'
              ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-gray-500">Total Drivers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'pending'
              ? 'border-yellow-500 bg-yellow-50 shadow-sm ring-1 ring-yellow-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'active'
              ? 'border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{activeCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('blocked')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'blocked'
              ? 'border-red-500 bg-red-50 shadow-sm ring-1 ring-red-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-red-600">Blocked</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{blockedCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'rejected'
              ? 'border-orange-500 bg-orange-50 shadow-sm ring-1 ring-orange-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-orange-600">Rejected</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{rejectedCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('update_pending')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'update_pending'
              ? 'border-orange-500 bg-orange-50 shadow-sm ring-1 ring-orange-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-orange-600">Update Pending</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{updatePendingCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('outdated')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'outdated'
              ? 'border-red-500 bg-red-50 shadow-sm ring-1 ring-red-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-red-600">Outdated App</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{outdatedCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('updated')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'updated'
              ? 'border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-green-600 font-bold">Updated App</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{updatedCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('good_rating')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'good_rating'
              ? 'border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-green-600 font-bold">Good Drivers</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{goodRatingCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('bad_rating')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'bad_rating'
              ? 'border-red-500 bg-red-50 shadow-sm ring-1 ring-red-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold text-red-600 font-bold">Bad Drivers</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{badRatingCount}</p>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Driver Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Auto Variant</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reg Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">App Version</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{driver.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{driver.autoVariant}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{driver.regNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {driver.averageRating ? (
                      <div className="flex items-center gap-1 font-bold text-gray-700">
                        <span className="text-amber-500">⭐</span> {driver.averageRating} <span className="text-xs text-gray-400 font-normal">({driver.totalRatings})</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No Ratings</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      driver.appVersion === '1.0.1' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-orange-100 text-orange-800 border border-orange-200 font-bold'
                    }`}>
                      v{driver.appVersion || '1.0.0'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(driver.status)}</td>
                  <td className="px-6 py-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewDetails(driver)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={16} /> View
                    </button>
                    {(driver.status === 'pending' || driver.status === 'rejected') && (
                      <button
                        onClick={() => handleApprove(driver.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                      >
                        <Check size={16} /> Approve
                      </button>
                    )}
                    {driver.status === 'pending' && (
                      <button
                        onClick={() => handleReject(driver.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        <X size={16} /> Reject
                      </button>
                    )}
                    {(driver.status === 'active' || driver.status === 'blocked') && (
                      <>
                        {driver.forceUpdate ? (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Cancel force update for ${driver.name}?`)) {
                                try {
                                  await api.post(`/api/admin/drivers/${driver.id}/remove-force-update`);
                                  alert('Force update cancelled successfully! 👍');
                                  fetchDrivers();
                                } catch (e) {
                                  alert('Failed to cancel force update');
                                }
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-2 text-xs bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors font-semibold"
                          >
                            Cancel Update 🔄
                          </button>
                        ) : (
                          (driver.appVersion || '1.0.0') !== '1.0.1' && (
                            <button
                              onClick={async () => {
                                if (window.confirm(`Force app update for ${driver.name}?`)) {
                                  try {
                                    await api.post(`/api/admin/drivers/${driver.id}/force-update`);
                                    alert('Force update triggered successfully! 📲');
                                    fetchDrivers();
                                  } catch (e) {
                                    alert('Failed to force update');
                                  }
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-2 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors font-semibold"
                            >
                              Force Update 📲
                            </button>
                          )
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <DriverModal
          driver={selectedDriver}
          onClose={() => setShowModal(false)}
          onRefresh={fetchDrivers}
        />
      )}

      {/* ============================================= */}
      {/* 🎬 TUTORIAL VIDEOS MANAGEMENT SECTION        */}
      {/* ============================================= */}
      <div className="mt-10 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Play size={20} className="text-red-600 fill-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tutorial Videos Management</h3>
              <p className="text-sm text-gray-500">App-ல் காட்டப்படும் YouTube tutorial videos இங்கே manage பண்ணலாம்</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingVideo(null);
              setVideoForm({ title: '', description: '', youtubeUrl: '', order: 0 });
              setShowVideoForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all text-sm shadow-sm active:scale-95"
          >
            <PlusCircle size={16} />
            Add Video
          </button>
        </div>

        {/* Add/Edit Form Panel */}
        {showVideoForm && (
          <div className="border-b border-gray-200 bg-red-50/40 px-6 py-5">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              {editingVideo ? <Edit2 size={14} /> : <PlusCircle size={14} />}
              {editingVideo ? 'Edit Video' : 'Add New Tutorial Video'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Video Title *</label>
                <input
                  type="text"
                  placeholder="e.g. How to use Azhai App"
                  value={videoForm.title}
                  onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">YouTube URL *</label>
                <input
                  type="text"
                  placeholder="https://youtu.be/xxxxx or https://youtube.com/watch?v=xxxxx"
                  value={videoForm.youtubeUrl}
                  onChange={e => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm text-gray-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description shown below the title"
                  value={videoForm.description}
                  onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Display Order (lower = first)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={videoForm.order}
                  onChange={e => setVideoForm({ ...videoForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm text-gray-900"
                />
              </div>
            </div>
            {/* Thumbnail Preview */}
            {extractYoutubeId(videoForm.youtubeUrl) && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={`https://img.youtube.com/vi/${extractYoutubeId(videoForm.youtubeUrl)}/mqdefault.jpg`}
                  alt="Thumbnail Preview"
                  className="w-32 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                <div>
                  <p className="text-xs font-semibold text-green-700">✅ Valid YouTube URL</p>
                  <p className="text-xs text-gray-500">Video ID: {extractYoutubeId(videoForm.youtubeUrl)}</p>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleVideoSave}
                disabled={videoSaving}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                {videoSaving ? 'Saving...' : editingVideo ? '✅ Update Video' : '🎬 Add Video'}
              </button>
              <button
                onClick={() => { setShowVideoForm(false); setEditingVideo(null); setVideoForm({ title: '', description: '', youtubeUrl: '', order: 0 }); }}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Videos List */}
        <div className="p-6">
          {videoLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
              <span className="text-gray-500 text-sm">Loading videos...</span>
            </div>
          ) : tutorialVideos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Play size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tutorial videos yet. Click "Add Video" to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutorialVideos.map((video) => {
                const videoId = extractYoutubeId(video.youtubeUrl);
                return (
                  <div key={video._id} className={`border rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md ${!video.isActive ? 'opacity-50' : ''}`}>
                    {/* Thumbnail */}
                    <div className="relative">
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                          <Play size={32} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3">
                          <Play size={20} className="text-white fill-white" />
                        </div>
                      </div>
                      {/* Order Badge */}
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        #{video.order}
                      </span>
                      {/* Status Badge */}
                      <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold ${video.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {video.isActive ? '✅ Active' : '🚫 Hidden'}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="font-bold text-gray-900 text-sm truncate">{video.title}</p>
                      {video.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{video.description}</p>
                      )}
                      <p className="text-xs text-blue-500 mt-1 truncate font-mono">{video.youtubeUrl}</p>
                    </div>
                    {/* Actions */}
                    <div className="px-3 pb-3 flex gap-2">
                      <button
                        onClick={() => handleVideoEdit(video)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold transition-all"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleVideoToggle(video)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg font-semibold transition-all ${video.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                      >
                        {video.isActive ? <><ToggleLeft size={12} /> Hide</> : <><ToggleRight size={12} /> Show</>}
                      </button>
                      <button
                        onClick={() => handleVideoDelete(video)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold transition-all"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}