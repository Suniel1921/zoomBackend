const defaultSteps = {
  applicationStep: [
    { name: 'Document Received', status: 'pending', updatedAt: new Date() },
    { name: 'Embassy Document Checking', status: 'pending', updatedAt: new Date() },
    { name: 'Visa Application Submitted', status: 'pending', updatedAt: new Date() },
  ],
  japanVisitApplicationStep: [
    { name: 'Initial Consultation', status: 'pending', updatedAt: new Date() },
    { name: 'Document Review', status: 'pending', updatedAt: new Date() },
    { name: 'Submission to Embassy', status: 'pending', updatedAt: new Date() },
    { name: 'Approval Status Pending', status: 'pending', updatedAt: new Date() },
  ],
  documentTranslationStep: [
    { name: 'Document Collection', status: 'pending', updatedAt: new Date() },
    { name: 'Translation In Progress', status: 'pending', updatedAt: new Date() },
    { name: 'Quality Review', status: 'pending', updatedAt: new Date() },
    { name: 'Translated Document Delivered', status: 'pending', updatedAt: new Date() },
  ],
  ePassportStep: [
    { name: 'Passport Submission', status: 'pending', updatedAt: new Date() },
    { name: 'Identity Verification', status: 'pending', updatedAt: new Date() },
    { name: 'Approval Pending', status: 'pending', updatedAt: new Date() },
    { name: 'Passport Issued', status: 'pending', updatedAt: new Date() },
  ],
  otherServiceStep: [
    { name: 'Service Inquiry', status: 'pending', updatedAt: new Date() },
    { name: 'Quotation Shared', status: 'pending', updatedAt: new Date() },
    { name: 'Service Scheduled', status: 'pending', updatedAt: new Date() },
    { name: 'Service Completed', status: 'pending', updatedAt: new Date() },
  ],
  graphicDesignStep: [
    { name: 'Requirement Collection', status: 'pending', updatedAt: new Date() },
    { name: 'Design Work In Progress', status: 'pending', updatedAt: new Date() },
    { name: 'Client Feedback', status: 'pending', updatedAt: new Date() },
    { name: 'Final Design Delivered', status: 'pending', updatedAt: new Date() },
  ],
  appointmentStep: [
    { name: 'Appointment Scheduled', status: 'pending', updatedAt: new Date() },
    { name: 'Confirmation Pending', status: 'pending', updatedAt: new Date() },
    { name: 'Appointment In Progress', status: 'pending', updatedAt: new Date() },
    { name: 'Follow-up Scheduled', status: 'pending', updatedAt: new Date() },
  ],
};

module.exports = defaultSteps;
