# Digital Health Agency - HR Management System

A comprehensive HR management system for job applications built with React, TypeScript, Tailwind CSS, and Firebase. This system handles the complete job application workflow from job creation to applicant management.

## 🚀 Features

### For Job Applicants
- **Public Job Board**: Browse all active job opportunities without authentication
- **Advanced Search & Filtering**: Filter jobs by department, location, job type, and keywords
- **Detailed Job Descriptions**: View comprehensive job details including requirements, responsibilities, and benefits
- **Easy Application Process**: Apply for jobs with a user-friendly application form
- **File Upload Support**: Upload resumes, cover letters, and supporting documents
- **Application Tracking**: Track the status of submitted applications
- **Email Notifications**: Receive automatic email confirmations and status updates
- **User Dashboard**: Personalized dashboard for registered applicants

### For HR Personnel
- **Admin Dashboard**: Comprehensive dashboard with analytics and overview
- **Job Management**: Create, edit, delete, and manage job postings
- **Application Management**: View, filter, and manage all job applications
- **Status Tracking**: Update application statuses with automatic email notifications
- **Applicant Communication**: Built-in email notification system
- **Analytics & Reporting**: View application metrics and hiring statistics
- **Real-time Updates**: Live updates when new applications are submitted
- **Document Management**: Access uploaded applicant documents

### Technical Features
- **Real-time Database**: Firebase Firestore for live data synchronization
- **Authentication System**: Secure user authentication with role-based access
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Email Notifications**: Automated email system for application confirmations and updates
- **File Upload System**: Secure document upload with validation
- **Search & Filtering**: Advanced search capabilities across jobs and applications
- **Data Validation**: Comprehensive form validation and error handling
- **Performance Optimized**: Efficient data loading and caching

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Form Handling**: Controlled components with validation
- **File Upload**: Custom file upload service with progress tracking

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Firebase project with Firestore and Authentication enabled

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dha-applications
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Authentication
3. Enable Email/Password authentication method
4. Update the Firebase configuration in `src/firebase/config.ts` with your project credentials

### 4. Environment Setup
The Firebase configuration is already set up in the project. For production deployment, consider using environment variables for sensitive configuration.

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Firebase Security Rules
Set up the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Jobs are readable by all, writable by admin/hr
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr']);
    }
    
    // Applications are readable by applicant and admin/hr, writable by applicant
    match /applications/{applicationId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.applicantId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr']);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr'];
    }
    
    // Email notifications are writable by authenticated users
    match /email_notifications/{notificationId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'hr'];
    }
  }
}
```

## 👥 User Roles & Demo Accounts

### Demo Accounts
The system includes demo accounts for testing:

**Admin Account:**
- Email: `hr@dha.go.ke`
- Password: `hr123456`
- Role: Admin (full access to HR dashboard)

**Applicant Account:**
- Email: `applicant@email.com`
- Password: `applicant123`
- Role: Applicant (access to applicant dashboard)

### User Roles
1. **Admin/HR**: Full access to job management, application review, and analytics
2. **Applicant**: Can browse jobs, submit applications, and track application status

## 📱 Usage Guide

### For Job Applicants

1. **Browse Jobs**: Visit the homepage and click "Browse Jobs" to see all available positions
2. **Search & Filter**: Use the search bar and filters to find relevant opportunities
3. **View Job Details**: Click "View Details" to see comprehensive job information
4. **Apply for Jobs**: Click "Apply Now" and fill out the application form
5. **Upload Documents**: Add your resume and supporting documents
6. **Track Applications**: Register an account to track your application status

### For HR Personnel

1. **Login**: Use admin credentials to access the HR dashboard
2. **Post Jobs**: Click "Post New Job" to create job listings
3. **Manage Applications**: Review applications in the Applications tab
4. **Update Status**: Change application statuses to notify candidates
5. **View Analytics**: Monitor hiring metrics in the Analytics tab
6. **Communicate**: Use the built-in email system to contact applicants

## 🔧 Development

### Project Structure
```
src/
├── components/           # React components
│   ├── AdminDashboard.tsx       # HR dashboard
│   ├── ApplicantDashboard.tsx   # Applicant dashboard
│   ├── JobBoard.tsx             # Public job board
│   ├── Login.tsx                # Login component
│   ├── Register.tsx             # Registration component
│   ├── EmailNotificationService.tsx  # Email service
│   └── FileUploadService.tsx    # File upload component
├── contexts/            # React contexts
│   └── AuthContext.tsx          # Authentication context
├── firebase/            # Firebase configuration
│   └── config.ts               # Firebase setup
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### Key Components

1. **AuthContext**: Manages user authentication and profile data
2. **AdminDashboard**: Complete HR management interface
3. **ApplicantDashboard**: User interface for job applicants
4. **JobBoard**: Public job listing interface
5. **EmailNotificationService**: Handles automated email notifications
6. **FileUploadService**: Manages document uploads with validation

### Adding New Features

1. **New Job Fields**: Update the `JobListing` interface and forms
2. **Additional User Roles**: Modify the authentication context and security rules
3. **Custom Email Templates**: Update the email notification service
4. **New Analytics**: Add charts and metrics to the admin dashboard

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables if needed

## 🔒 Security Considerations

1. **Authentication**: All sensitive operations require authentication
2. **Authorization**: Role-based access control for different user types
3. **Data Validation**: Client and server-side validation for all inputs
4. **File Upload Security**: File type and size validation
5. **Firebase Security Rules**: Proper database access controls

## 📧 Email Integration

The system includes a comprehensive email notification service that sends:
- Application confirmation emails
- Status update notifications
- Interview scheduling emails
- Job posting announcements

For production, integrate with services like:
- SendGrid
- AWS SES
- Mailgun
- Firebase Functions with Nodemailer

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection**: Ensure Firebase configuration is correct
2. **Authentication Errors**: Check Firebase Authentication settings
3. **Permission Denied**: Verify Firestore security rules
4. **File Upload Issues**: Check file size and type restrictions

### Debug Mode
Enable debug logging by adding to your environment:
```javascript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Updates & Maintenance

Regular updates include:
- Security patches
- Feature enhancements
- Bug fixes
- Performance improvements
- UI/UX improvements

---

**Digital Health Agency - Transforming Healthcare Through Technology**

This HR management system is designed to streamline the recruitment process and help the Digital Health Agency find the best talent to advance Kenya's digital health initiatives.