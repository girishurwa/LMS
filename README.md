Key Features and Requirements
User Authentication:

Login and registration for students and admin.
Use secure JWT for user sessions.

Full-Screen Enforcement:

Users must remain in full-screen mode during the exam.
If they leave full-screen, a 15-second timer is triggered. If not returned, the exam is terminated.

Anti-Tab Switching:

Monitor tab switches to ensure users don’t switch tabs for answers.
If detected multiple times, raise a flag or issue a warning.
Face Recognition and Monitoring:

Use facial recognition to detect if a different person appears on the screen.
Track suspicious behaviors, such as looking away for extended periods or presence of additional faces.

Question and Answer Management:

Integrate with HackerRank API or Compiler API to provide coding questions and compile answers.
For MCQs, design simple on-screen multiple-choice questions with automatic scoring.
UI and Admin Dashboard:

Design a dashboard using Bootstrap Admin templates.
Admin Panel should include features for viewing exam results, tracking suspicious activities, and managing users.
Real-Time Proctoring Dashboard:

Admin can monitor all active test-takers.
Dashboard shows real-time user behaviors, full-screen status, tab switches, and face recognition flags.

Automatic Exam Termination:

If suspicious behavior exceeds a threshold (like 3 tab switches or leaving full screen), automatically submit the exam.
