import React, { useState } from 'react';
import { Briefcase, MapPin, Building, DollarSign, Search } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  deadline: string;
}

const SimpleJobBoard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  // Sample job data
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Senior Software Developer',
      department: 'Technology',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KES 150,000 - 200,000',
      description: 'We are looking for a Senior Software Developer to join our digital health platform team.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '5+ years of software development experience',
        'Experience with React, Node.js, and cloud platforms',
        'Strong problem-solving skills'
      ],
      deadline: '2024-02-15'
    },
    {
      id: '2',
      title: 'Health Data Analyst',
      department: 'Data & Analytics',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KES 120,000 - 160,000',
      description: 'Join our team to analyze health data and provide insights for better healthcare delivery.',
      requirements: [
        'Bachelor\'s degree in Statistics, Mathematics, or related field',
        '3+ years of data analysis experience',
        'Proficiency in SQL, Python, or R',
        'Experience with healthcare data preferred'
      ],
      deadline: '2024-02-20'
    },
    {
      id: '3',
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KES 100,000 - 140,000',
      description: 'Design user-friendly interfaces for our digital health applications.',
      requirements: [
        'Bachelor\'s degree in Design or related field',
        '3+ years of UX/UI design experience',
        'Proficiency in Figma, Adobe Creative Suite',
        'Portfolio demonstrating mobile and web design'
      ],
      deadline: '2024-02-25'
    }
  ];

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
      alert('Application submitted successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Digital Health Agency</h1>
            <p className="text-xl text-gray-600">Career Opportunities Portal</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {job.department}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{job.description}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Deadline: {job.deadline}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    View Details
                  </button>
                  {appliedJobs.includes(job.id) ? (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{selectedJob.department}</span>
                  <span>{selectedJob.location}</span>
                  <span>{selectedJob.type}</span>
                  <span>{selectedJob.salary}</span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
                  <p className="text-gray-700">{selectedJob.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">Application Deadline</p>
                  <p className="text-gray-600">{selectedJob.deadline}</p>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {!appliedJobs.includes(selectedJob.id) && (
                    <button
                      onClick={() => {
                        handleApply(selectedJob.id);
                        setSelectedJob(null);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Apply for this Job
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleJobBoard;