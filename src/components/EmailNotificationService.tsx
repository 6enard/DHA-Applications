import React, { createContext, useContext, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: 'application-received' | 'status-update' | 'interview-scheduled' | 'job-posted';
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  metadata?: Record<string, any>;
}

interface EmailNotificationContextType {
  sendApplicationReceivedEmail: (applicantEmail: string, jobTitle: string, applicantName: string) => Promise<void>;
  sendStatusUpdateEmail: (applicantEmail: string, jobTitle: string, applicantName: string, newStatus: string) => Promise<void>;
  sendInterviewScheduledEmail: (applicantEmail: string, jobTitle: string, applicantName: string, interviewDate: string) => Promise<void>;
  sendJobPostedNotification: (jobTitle: string, department: string) => Promise<void>;
}

const EmailNotificationContext = createContext<EmailNotificationContextType | undefined>(undefined);

export const useEmailNotifications = () => {
  const context = useContext(EmailNotificationContext);
  if (context === undefined) {
    throw new Error('useEmailNotifications must be used within an EmailNotificationProvider');
  }
  return context;
};

export const EmailNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  useEffect(() => {
    // Listen for pending email notifications and process them
    const emailsRef = collection(db, 'email_notifications');
    const q = query(emailsRef, where('status', '==', 'pending'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.docs.forEach(async (doc) => {
        const emailData = doc.data() as EmailNotification;
        
        // In a real implementation, you would integrate with an email service like:
        // - SendGrid
        // - AWS SES
        // - Mailgun
        // - Firebase Functions with Nodemailer
        
        // For demo purposes, we'll just log the email and mark it as sent
        console.log('📧 Email Notification:', {
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          type: emailData.type
        });
        
        // Simulate email sending delay
        setTimeout(async () => {
          try {
            // Update email status to sent
            // In real implementation: await updateDoc(doc.ref, { status: 'sent', sentAt: serverTimestamp() });
            console.log('✅ Email sent successfully to:', emailData.to);
          } catch (error) {
            console.error('❌ Failed to send email:', error);
            // In real implementation: await updateDoc(doc.ref, { status: 'failed' });
          }
        }, 1000);
      });
    });

    return unsubscribe;
  }, []);

  const sendApplicationReceivedEmail = async (applicantEmail: string, jobTitle: string, applicantName: string) => {
    const emailData: Omit<EmailNotification, 'id'> = {
      to: applicantEmail,
      subject: `Application Received - ${jobTitle}`,
      body: `
        Dear ${applicantName},

        Thank you for your interest in the ${jobTitle} position at the Digital Health Agency.

        We have successfully received your application and our HR team will review it carefully. We will contact you within the next 2-3 business days regarding the next steps in our selection process.

        Application Details:
        - Position: ${jobTitle}
        - Submitted: ${new Date().toLocaleDateString()}
        - Application ID: ${Date.now()}

        If you have any questions about your application or the position, please don't hesitate to contact us at careers@dha.go.ke.

        Thank you for considering a career with the Digital Health Agency.

        Best regards,
        Human Resources Team
        Digital Health Agency
        Republic of Kenya
      `,
      type: 'application-received',
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        jobTitle,
        applicantName
      }
    };

    try {
      await addDoc(collection(db, 'email_notifications'), {
        ...emailData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error queuing application received email:', error);
    }
  };

  const sendStatusUpdateEmail = async (applicantEmail: string, jobTitle: string, applicantName: string, newStatus: string) => {
    const statusMessages = {
      'under-review': 'Your application is currently under review by our HR team.',
      'shortlisted': 'Congratulations! You have been shortlisted for the next round of our selection process.',
      'interview-scheduled': 'We would like to invite you for an interview. Please check your email for interview details.',
      'rejected': 'Thank you for your interest. While your qualifications are impressive, we have decided to move forward with other candidates.',
      'hired': 'Congratulations! We are pleased to offer you the position. Please check your email for next steps.'
    };

    const emailData: Omit<EmailNotification, 'id'> = {
      to: applicantEmail,
      subject: `Application Status Update - ${jobTitle}`,
      body: `
        Dear ${applicantName},

        We wanted to update you on the status of your application for the ${jobTitle} position at the Digital Health Agency.

        Status Update: ${newStatus.replace('-', ' ').toUpperCase()}

        ${statusMessages[newStatus as keyof typeof statusMessages] || 'Your application status has been updated.'}

        ${newStatus === 'shortlisted' ? `
        Next Steps:
        - You will receive a separate email with interview details within 24 hours
        - Please prepare for a technical and behavioral interview
        - Bring copies of your certificates and references
        ` : ''}

        ${newStatus === 'hired' ? `
        Next Steps:
        - You will receive an offer letter within 2 business days
        - Please review the terms and conditions carefully
        - Contact us if you have any questions about the offer
        ` : ''}

        If you have any questions, please contact us at careers@dha.go.ke.

        Best regards,
        Human Resources Team
        Digital Health Agency
        Republic of Kenya
      `,
      type: 'status-update',
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        jobTitle,
        applicantName,
        newStatus
      }
    };

    try {
      await addDoc(collection(db, 'email_notifications'), {
        ...emailData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error queuing status update email:', error);
    }
  };

  const sendInterviewScheduledEmail = async (applicantEmail: string, jobTitle: string, applicantName: string, interviewDate: string) => {
    const emailData: Omit<EmailNotification, 'id'> = {
      to: applicantEmail,
      subject: `Interview Scheduled - ${jobTitle}`,
      body: `
        Dear ${applicantName},

        We are pleased to invite you for an interview for the ${jobTitle} position at the Digital Health Agency.

        Interview Details:
        - Date: ${interviewDate}
        - Time: 10:00 AM - 11:00 AM (EAT)
        - Location: Digital Health Agency Offices, Nairobi
        - Format: In-person interview (Virtual option available upon request)

        Interview Panel:
        - HR Representative
        - Department Head
        - Technical Lead (if applicable)

        What to Bring:
        - Original and copies of your academic certificates
        - Professional references (at least 2)
        - Valid identification document
        - Portfolio of your work (if applicable)

        Interview Format:
        - Technical assessment (30 minutes)
        - Behavioral interview (20 minutes)
        - Q&A session (10 minutes)

        Please confirm your attendance by replying to this email at least 24 hours before the interview date.

        If you need to reschedule or have any questions, please contact us at careers@dha.go.ke or call +254 20 123 4567.

        We look forward to meeting you!

        Best regards,
        Human Resources Team
        Digital Health Agency
        Republic of Kenya
      `,
      type: 'interview-scheduled',
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        jobTitle,
        applicantName,
        interviewDate
      }
    };

    try {
      await addDoc(collection(db, 'email_notifications'), {
        ...emailData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error queuing interview scheduled email:', error);
    }
  };

  const sendJobPostedNotification = async (jobTitle: string, department: string) => {
    // This would typically be sent to a mailing list of interested candidates
    // For demo purposes, we'll just log it
    console.log('📢 Job Posted Notification:', {
      jobTitle,
      department,
      message: `New job opportunity: ${jobTitle} in ${department} department`
    });
  };

  const value: EmailNotificationContextType = {
    sendApplicationReceivedEmail,
    sendStatusUpdateEmail,
    sendInterviewScheduledEmail,
    sendJobPostedNotification
  };

  return (
    <EmailNotificationContext.Provider value={value}>
      {children}
    </EmailNotificationContext.Provider>
  );
};

export default EmailNotificationProvider;