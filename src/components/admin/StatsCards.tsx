import React from 'react';
import { Briefcase, CheckCircle, FileText, Clock } from 'lucide-react';

interface StatsCardsProps {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalJobs,
  activeJobs,
  totalApplications,
  pendingApplications
}) => {
  const stats = [
    {
      label: 'Total Jobs',
      value: totalJobs,
      icon: Briefcase,
      color: 'blue'
    },
    {
      label: 'Active Jobs',
      value: activeJobs,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Total Applications',
      value: totalApplications,
      icon: FileText,
      color: 'purple'
    },
    {
      label: 'Pending Review',
      value: pendingApplications,
      icon: Clock,
      color: 'yellow'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;