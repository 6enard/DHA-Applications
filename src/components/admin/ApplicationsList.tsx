import React from 'react';
import { Building, Mail, Phone, Briefcase } from 'lucide-react';
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

interface ApplicationsListProps {
  applications: Application[];
  onUpdateStatus: (applicationId: string, newStatus: string) => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({ applications, onUpdateStatus }) => {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
        <p className="text-gray-600">Applications will appear here when candidates apply for jobs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.applicantName}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {application.jobTitle}
                </div>
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  {application.department}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {application.applicantEmail}
                </div>
                {application.applicantPhone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {application.applicantPhone}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-6">
              <StatusBadge status={application.status} />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
            <p className="text-gray-700 text-sm">{application.coverLetter}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Applied: {application.submittedAt.toLocaleDateString()} | 
              Updated: {application.lastUpdated.toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <select
                className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={application.status}
                onChange={(e) => onUpdateStatus(application.id, e.target.value)}
              >
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview-scheduled">Interview Scheduled</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationsList;