import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, MapPin, Building, Clock, Briefcase } from 'lucide-react';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

    const debouncedSearch = useRef(null);

  useEffect(() => {
        fetchJobs();    
  }, [page]);

  useEffect(() => {
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    debouncedSearch.current = setTimeout(() => {
      setPage(1);
      fetchJobs();
    }, 700);
    return () => clearTimeout(debouncedSearch.current);
  }, [searchLocation]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const url = `https://backendpadaku.onrender.com/api/jobs?page=${page}&limit=10${
        searchLocation ? `&location=${encodeURIComponent(searchLocation)}` : ''
      }`;

      const response = await fetch(url);
      const data = await response.json();
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen p-2 md:p-4 gap-2 md:gap-4">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-2 right-2 z-50 p-2 bg-white rounded-full shadow"
      >
        {showSidebar ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        ${showSidebar ? 'flex' : 'hidden'}
        md:flex flex-col gap-4
        w-full md:w-1/3 lg:w-1/4
        fixed md:relative
        top-0 left-0
        h-screen
        bg-white md:bg-transparent
        z-40 md:z-auto
        p-4
        overflow-hidden
      `}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="searchinput w-full pl-10 border border-gray-300 rounded-lg py-2"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {jobs.map((job) => (
            <div
              key={job.jobId}
              onClick={() => {
                setSelectedJob(job);
                if (window.innerWidth < 768) {
                  setShowSidebar(false);
                }
              }}
              className={`flex gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                selectedJob?.jobId === job.jobId
                  ? 'bg-blue-100 hover:bg-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <img
                src={job.companyImageUrl || '/api/placeholder/48/48'}
                alt={job.company}
                className="w-12 h-12 rounded-lg object-contain"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
          {/* next and previous */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="py-2">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:w-2/3 lg:w-3/4 overflow-y-auto">
        {selectedJob ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-6 mb-6">
              <img
                src={selectedJob.companyImageUrl || '/api/placeholder/80/80'}
                alt={selectedJob.company}
                className="w-20 h-20 rounded-lg object-contain bg-gray-50"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{selectedJob.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <a href={selectedJob.company_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      {selectedJob.company}
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Posted {formatDate(selectedJob.postedDateTime)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDialogOpen(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Employment Type</p>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <p className="text-gray-900">{selectedJob.employment_type}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Experience</p>
                <p className="text-gray-900">{selectedJob.experience}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Seniority Level</p>
                <p className="text-gray-900">{selectedJob.seniority_level}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Company Type</p>
                <p className="text-gray-900">{selectedJob.companytype}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <a
                href={selectedJob.job_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                View Original Job Posting
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a job to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;