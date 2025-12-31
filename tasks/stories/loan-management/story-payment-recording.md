# LendTrack - User Story: Payment Recording and Management

## Feature: Payment Management
**As a** user of LendTrack  
**I want** to record payments received from borrowers  
**So that** I can track repayment progress and update loan balances accurately

## Acceptance Criteria

### Payment Recording Form
- [ ] User can access the payment recording form from a loan's details page
- [ ] Form includes field for payment amount (required, positive number)
- [ ] Form includes payment date field (defaults to current date)
- [ ] Form includes payment method selection (cash, check, bank transfer, etc.)
- [ ] Form includes notes field for additional information about the payment
- [ ] Form validates all required fields before submission
- [ ] Form shows real-time validation feedback
- [ ] Form displays the loan's remaining balance before and after the payment
- [ ] Upon successful recording, the loan's balance is updated automatically
- [ ] Success message is displayed after payment recording

### Payment History
- [ ] User can view all payments associated with a specific loan
- [ ] Payments are displayed in chronological order (newest first)
- [ ] Each payment shows amount, date, method, and any notes
- [ ] Running balance is shown after each payment
- [ ] Total amount paid is calculated and displayed
- [ ] Remaining balance is updated in real-time

### Payment Editing
- [ ] User can edit existing payment information
- [ ] Edit form pre-populates with existing payment data
- [ ] Form validates changes before saving
- [ ] Loan balance is recalculated after payment update
- [ ] Changes are saved to the database
- [ ] User is redirected back to loan details after saving
- [ ] Success message is displayed after update

### Payment Deletion
- [ ] User can delete a recorded payment with appropriate confirmation
- [ ] Confirmation dialog warns about impact on loan balance
- [ ] Loan balance is recalculated after payment deletion
- [ ] Payment is removed from the database
- [ ] User is redirected back to loan details page
- [ ] Success message is displayed after deletion

## Technical Implementation Notes
- Use Supabase to interact with the payments database table
- Implement Zod schemas for form validation
- Use React Hook Form for form state management
- Create API connection functions in /connections/loan.api.ts
- Implement proper error handling and user feedback
- Include loading states during API operations
- Ensure responsive design for all payment management components
- Calculate and update loan balances automatically when payments are recorded
- Implement proper authorization to ensure users can only access their own payment data