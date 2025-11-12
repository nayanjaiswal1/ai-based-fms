# GDPR Quick Start Guide

## For Developers

### Testing the Implementation

#### 1. Start the Backend
```bash
cd backend
npm run start:dev
```

#### 2. Run Migration (First Time)
```bash
npm run migration:run
```

#### 3. Start the Frontend
```bash
cd frontend
npm run dev
```

### Testing Data Export

1. Login to the application
2. Navigate to Settings > Privacy tab
3. Click "Export Data" button
4. A JSON file will download with all your data
5. Try exporting again immediately - should see rate limit message

### Testing Account Deletion

1. Login to the application
2. Navigate to Settings > Privacy tab
3. Scroll to "Delete Account" section
4. Click "Delete My Account" button
5. Follow the 3-step process:
   - Step 1: Review warnings, click Continue
   - Step 2: Enter password, click Continue
   - Step 3: Type "DELETE", click Delete My Account
6. Should redirect to /goodbye page
7. All data should be deleted from database
8. Check deleted_users table for audit record

### Verification Queries

```sql
-- Check deleted_users table
SELECT * FROM deleted_users ORDER BY "deletedAt" DESC;

-- Verify user is deleted (should return 0)
SELECT COUNT(*) FROM users WHERE id = 'deleted-user-id';

-- Check all related data is deleted
SELECT COUNT(*) FROM transactions WHERE "userId" = 'deleted-user-id';
SELECT COUNT(*) FROM accounts WHERE "userId" = 'deleted-user-id';
```

## For Product Managers

### Feature Access

**Settings > Privacy Tab includes:**
- Data Export button (with rate limiting)
- Account Deletion button (with multi-step confirmation)
- GDPR compliance information

### User Experience

**Data Export:**
- One-click download
- Rate limited to 1 per hour
- All data in JSON format
- ~2-5 MB file size

**Account Deletion:**
- 3-step confirmation process
- Password verification required
- Must type "DELETE" to confirm
- Shows what will be deleted
- Irreversible action
- Redirects to goodbye page

## For QA

### Test Cases

#### Export Data
- [ ] Can export data successfully
- [ ] Export includes all entities
- [ ] Rate limit prevents second export within hour
- [ ] JSON file is valid and complete
- [ ] Metadata includes correct date and version

#### Delete Account
- [ ] Step 1: Can view warnings and continue
- [ ] Step 2: Password validation works
- [ ] Step 3: Must type "DELETE" exactly
- [ ] Can cancel at any step
- [ ] Wrong password shows error
- [ ] Successful deletion redirects to goodbye
- [ ] All user data is deleted
- [ ] Record exists in deleted_users table
- [ ] Can create new account with same email

#### Security
- [ ] Requires authentication
- [ ] Cannot delete other user's account
- [ ] Rate limiting works on export
- [ ] Session cleared after deletion
- [ ] Cannot access app after deletion

#### UI/UX
- [ ] Modal styling is correct (danger colors)
- [ ] Loading states work
- [ ] Error messages are clear
- [ ] Goodbye page displays correctly
- [ ] Links work on goodbye page
- [ ] Mobile responsive

## For Support Team

### Common Issues

**"I can't export my data"**
- Check if they tried within the last hour (rate limit)
- Verify they're logged in
- Check browser console for errors

**"I accidentally deleted my account"**
- Inform them deletion is permanent
- Data cannot be recovered
- They can create a new account
- If they exported data before deletion, they still have that file

**"What data is exported?"**
- User profile
- All transactions
- All accounts
- All budgets
- All investments
- All groups (they're a member of)
- All custom categories and tags
- All notifications and reminders
- All sessions
- Email connections
- Import logs

**"What happens to my group data?"**
- If they're group owner and only member: Group is deleted
- If they're group owner with other members: Ownership transferred
- If they're just a member: They're removed from group

## Environment Variables

None required - uses existing configuration.

## Dependencies

### Backend
- TypeORM (for database operations)
- bcrypt (for password verification)
- @nestjs/throttler (for rate limiting)

### Frontend
- react-router-dom (for navigation)
- react-hot-toast (for notifications)
- lucide-react (for icons)

## Monitoring

### Metrics to Track
- Number of data exports per day
- Number of account deletions per day
- Average export file size
- Rate limit hits
- Deletion failures

### Logs to Monitor
- Failed deletion attempts
- Export errors
- Rate limit violations
- Large export requests

## Compliance

This implementation helps comply with:
- GDPR Article 20 (Right to Data Portability)
- GDPR Article 17 (Right to Erasure)

Consult with legal team for complete compliance review.
