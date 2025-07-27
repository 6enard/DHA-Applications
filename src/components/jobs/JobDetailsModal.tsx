import React from 'react';
import Modal from '../common/Modal';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  deadline: Date;
  status: 'active' | 'closed' | 'draft';
  postedAt: Date;
  createdBy: string;
}

interface JobDetailsModalProps {
  job: JobListing | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  hasApplied?: boolean;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ 
  job, 
  isOpen, 
  onClose, 
  onApply, 
  hasApplied = false 
}) => {
  if (!job) return null;

  const isExpired = job.deadline <= new Date();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job.title}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{job.department}</span>
          <span>{job.location}</span>
          <span className="capitalize">{job.type}</span>
          <span>{job.salary}</span>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
          <p className="text-gray-700">{job.description}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Responsibilities</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {job.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {job.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">Application Deadline</p>
              <p className="text-gray-600">{job.deadline.toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">Posted</p>
              <p className="text-gray-600">{job.postedAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {onApply && !hasApplied && !isExpired && (
            <button
              onClick={() => {
                onClose();
                onApply();
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply for this Job
            </button>
          )}
          {isExpired && (
            <button
              disabled
              className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Application Closed
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default JobDetailsModal;