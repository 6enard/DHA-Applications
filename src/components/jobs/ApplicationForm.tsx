import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FileUploadService from '../FileUploadService';

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

interface ApplicationFormProps {
  job: JobListing;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ 
  job, 
  onSubmit, 
  onCancel, 
  submitting 
}) => {
  const { currentUser, userProfile } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });

  // Pre-fill form with user data if signed in
  useEffect(() => {
    if (currentUser && userProfile) {
      setApplicationForm(prev => ({
        ...prev,
        fullName: prev.fullName || userProfile.displayName || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser, userProfile]);

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...applicationForm, files: uploadedFiles });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={applicationForm.fullName}
            onChange={(e) => setApplicationForm(prev => ({ ...prev, fullName: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={applicationForm.email}
            onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={applicationForm.phone}
          onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter *
        </label>
        <textarea
          rows={8}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Tell us why you're interested in this position and how your skills and experience make you a great fit..."
          value={applicationForm.coverLetter}
          onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
        />
        <p className="text-sm text-gray-500 mt-2">
          {applicationForm.coverLetter.length}/1000 characters
        </p>
      </div>
      
      <FileUploadService
        onFileUpload={handleFileUpload}
        acceptedTypes={['.pdf', '.doc', '.docx']}
        maxFileSize={5}
        maxFiles={3}
        label="Supporting Documents"
        description="Upload your resume, cover letter, certificates, and other relevant documents"
      />
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Application Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>Position: {job.title}</p>
          <p>Department: {job.department}</p>
          <p>Location: {job.location}</p>
          <p>Application Deadline: {job.deadline.toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !applicationForm.fullName || !applicationForm.email || !applicationForm.coverLetter}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;