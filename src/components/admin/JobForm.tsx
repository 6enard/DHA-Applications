import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

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

interface JobFormProps {
  job?: JobListing;
  onSubmit: (jobData: any) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSubmit, onCancel, submitting }) => {
  const [jobForm, setJobForm] = useState({
    title: job?.title || '',
    department: job?.department || '',
    location: job?.location || '',
    type: job?.type || 'full-time' as 'full-time' | 'part-time' | 'contract',
    salary: job?.salary || '',
    description: job?.description || '',
    requirements: job?.requirements.length > 0 ? job.requirements : [''],
    responsibilities: job?.responsibilities.length > 0 ? job.responsibilities : [''],
    benefits: job?.benefits.length > 0 ? job.benefits : [''],
    deadline: job?.deadline ? job.deadline.toISOString().split('T')[0] : '',
    status: job?.status || 'active' as 'active' | 'closed' | 'draft'
  });

  const addArrayField = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setJobForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    setJobForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setJobForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(jobForm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={jobForm.title}
            onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={jobForm.department}
            onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={jobForm.location}
            onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type *
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={jobForm.type}
            onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value as any }))}
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary Range *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., KES 80,000 - 120,000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={jobForm.salary}
            onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Deadline *
          </label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={jobForm.deadline}
            onChange={(e) => setJobForm(prev => ({ ...prev, deadline: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description *
        </label>
        <textarea
          rows={6}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={jobForm.description}
          onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      
      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requirements
        </label>
        {jobForm.requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={req}
              onChange={(e) => updateArrayField('requirements', index, e.target.value)}
              placeholder="Enter requirement"
            />
            <button
              type="button"
              onClick={() => removeArrayField('requirements', index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField('requirements')}
          className="text-green-600 hover:text-green-700 text-sm"
        >
          + Add Requirement
        </button>
      </div>
      
      {/* Responsibilities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Responsibilities
        </label>
        {jobForm.responsibilities.map((resp, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={resp}
              onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
              placeholder="Enter responsibility"
            />
            <button
              type="button"
              onClick={() => removeArrayField('responsibilities', index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField('responsibilities')}
          className="text-green-600 hover:text-green-700 text-sm"
        >
          + Add Responsibility
        </button>
      </div>
      
      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Benefits
        </label>
        {jobForm.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={benefit}
              onChange={(e) => updateArrayField('benefits', index, e.target.value)}
              placeholder="Enter benefit"
            />
            <button
              type="button"
              onClick={() => removeArrayField('benefits', index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayField('benefits')}
          className="text-green-600 hover:text-green-700 text-sm"
        >
          + Add Benefit
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={jobForm.status}
          onChange={(e) => setJobForm(prev => ({ ...prev, status: e.target.value as any }))}
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
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
          disabled={submitting}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {job ? 'Update Job' : 'Post Job'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default JobForm;