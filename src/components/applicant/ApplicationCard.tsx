import React from 'react';
import { Building, Calendar, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  jobId: string;
  jobTitle: string;
  department: string;
  status: 'submitted' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'rejected' | 'hired';
  stage: 'initial-review' | 'technical-review' | 'interview' | 'final-decision';
  submittedAt: Date;
  lastUpdated: Date;
  coverLetter: string;
  notes: string;
  createdBy: string;
}

interface ApplicationCardProps {
  application: Application;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.jobTitle}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Building className="w-4 h-4 mr-1" />
              {application.department}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Applied: {application.submittedAt.toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Updated: {application.lastUpdated.toLocaleDateString()}
            </div>
          </div>
        </div>
        <StatusBadge status={application.status} showIcon />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
        <p className="text-gray-700 text-sm line-clamp-3">{application.coverLetter}</p>
      </div>
      
      {application.notes && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">HR Notes</h4>
          <p className="text-blue-800 text-sm">{application.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;