import React from 'react';
import { Building, MapPin, Briefcase, DollarSign } from 'lucide-react';

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

interface JobCardProps {
  job: JobListing;
  hasApplied: boolean;
  onViewDetails: () => void;
  onApply: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, hasApplied, onViewDetails, onApply }) => {
  const daysLeft = Math.ceil((job.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft <= 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${isExpired ? 'opacity-75' : ''}`}>
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
              {job.type.replace('-', ' ')}
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              {job.salary}
            </div>
          </div>
          <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
        </div>
        <div className="ml-6 text-right">
          <div className={`text-sm font-medium mb-2 ${
            isExpired ? 'text-red-600' : 
            daysLeft <= 7 ? 'text-orange-600' : 
            'text-gray-600'
          }`}>
            {isExpired ? 'Application Closed' : 
             daysLeft === 1 ? '1 day left' : 
             `${daysLeft} days left`}
          </div>
          {hasApplied && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Applied
            </span>
          )}
          {isExpired && !hasApplied && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
              Expired
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Posted: {job.postedAt.toLocaleDateString()} | Deadline: {job.deadline.toLocaleDateString()}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            View Details
          </button>
          {!hasApplied && !isExpired && (
            <button
              onClick={onApply}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply Now
            </button>
          )}
          {isExpired && (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Application Closed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;