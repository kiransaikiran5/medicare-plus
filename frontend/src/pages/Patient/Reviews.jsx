import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ===== Inline SVG Icons ===== */
const StarFilledIcon = ({ className = 'h-5 w-5 text-yellow-400' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const StarEmptyIcon = ({ className = 'h-5 w-5 text-gray-300' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 2.74l-2.2 4.46-4.92.71 3.57 3.47-.84 4.92L12 15.72l4.39 2.31-.84-4.92 3.57-3.47-4.92-.71L12 4.74z" />
  </svg>
);

const StarHalfIcon = ({ className = 'h-5 w-5 text-yellow-400' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SaveIcon = () => (
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ===== Toast Component ===== */
function Toast({ message, type, onClose }) {
  if (!message) return null;

  const bg = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
  const Icon = type === 'success' ? (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 border rounded-xl shadow-lg flex items-start gap-3 ${bg} animate-slide-in`}>
      {Icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ===== Star Rating Display ===== */
function StarRating({ rating, size = 'sm' }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  for (let i = 0; i < fullStars; i++) {
    stars.push(<StarFilledIcon key={`filled-${i}`} className={iconClass} />);
  }
  if (hasHalf) {
    stars.push(<StarHalfIcon key="half" className={iconClass} />);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<StarEmptyIcon key={`empty-${i}`} className={iconClass} />);
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function PatientReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctor_id: '', rating: 5, comment: '' });

  useEffect(() => {
    fetchReviews();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchReviews = () => {
    api.get('/reviews/my')
      .then(res => setReviews(res.data))
      .catch(err => setToast({ message: 'Failed to load reviews', type: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews/', {
        doctor_id: parseInt(form.doctor_id),
        rating: parseFloat(form.rating),
        comment: form.comment,
      });
      setToast({ message: 'Review submitted!', type: 'success' });
      setShowForm(false);
      setForm({ doctor_id: '', rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ message: typeof detail === 'string' ? detail : 'Submission failed', type: 'error' });
    }
  };

  const formatIST = (dateStr) => {
    if (!dateStr) return { date: '', time: '' };
    const date = dateStr.includes('+') || dateStr.includes('Z')
      ? new Date(dateStr)
      : new Date(dateStr + 'Z');
    return {
      date: date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 sm:px-0">
      {/* Toast */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Write Review Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID *</label>
                <input
                  type="number"
                  name="doctor_id"
                  value={form.doctor_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="Enter doctor ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                >
                  {[5,4,3,2,1].map(n => (
                    <option key={n} value={n}>{n} Star{n>1 ? 's' : ''}</option>
                  ))}
                </select>
                <div className="mt-2">
                  <StarRating rating={Number(form.rating)} size="sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                  placeholder="Share your experience"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-colors"
                >
                  <CloseIcon />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
                >
                  <SaveIcon />
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Share your feedback on doctors</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center self-start sm:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon />
          Write a Review
        </button>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-50 flex items-center justify-center mb-4">
            <StarFilledIcon className="h-10 w-10 text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Click "Write a Review" to share your experience with a doctor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map(rev => {
            const { date, time } = formatIST(rev.created_at);
            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-400 p-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StarRating rating={rev.rating} size="sm" />
                    <span className="text-sm font-semibold text-gray-600">{rev.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <CalendarIcon />
                    <span>{date}</span>
                    <ClockIcon />
                    <span>{time}</span>
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                    {rev.comment}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Doctor ID: {rev.doctor_id}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}