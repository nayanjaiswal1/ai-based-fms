# Enhanced Multi-Provider Document Processing Implementation Plan

## Overview
Add provider selection (OpenAI/Gemini/Free OCR) to chatbot document upload with complete request/response database tracking, **user editing capability, save edited data, and retry/reprocess with different provider** features.

## Architecture Decisions (Based on Your Preferences)
- **Free OCR**: OCR.space API (25k requests/month free tier)
- **Provider Selection**: Hybrid - Auto-select by tier, allow PREMIUM users to override
- **Data Storage**: Full request/response JSON + extracted data + original file + metadata
- **UI**: Inline dropdown in upload zone before processing
- **NEW: User Edits**: Allow users to correct extracted data before saving
- **NEW: Retry/Reprocess**: Allow users to reprocess same document with different provider

---

## NEW FEATURES ADDED

### 1. Edit Extracted Data Feature
**User Flow:**
1. Document processed → AI extracts data
2. Show extracted data card (already exists)
3. User can edit ANY field (merchant, amount, date, category, items)
4. User clicks "Save Changes" → Update extractedData in database
5. Store original AI extraction + user corrections separately
6. Track which fields were edited for ML training

**Database Changes:**
- Add `userEditedData` JSONB field to DocumentProcessingResponse
- Add `wasEdited` boolean flag
- Add `editedFields` array to track which fields changed
- Add `editedAt` timestamp

### 2. Retry/Reprocess Feature
**User Flow:**
1. Document processed with OpenAI → Result shown
2. User clicks "Retry with Different Provider" button
3. Dropdown shows: "Reprocess with: [Gemini/Free OCR]"
4. User selects new provider → Reprocesses same file
5. Show comparison view: "Previous (OpenAI)" vs "New (Gemini)"
6. User picks which result to use OR merge fields from both

**Database Changes:**
- Add `originalRequestId` field (self-referencing FK)
- Track retry chain: Request 1 → Request 2 → Request 3
- Store retry count and provider history
- Link all attempts to same uploaded file

**Benefits for ML Training:**
- Compare provider accuracy on same document
- Identify which provider works best for specific document types
- User corrections show ground truth data
- Build training dataset with multi-provider responses

---

## Implementation Steps

### 1. Database Schema (Enhanced)

**Update `DocumentProcessingRequest` Entity:**
```typescript
// NEW FIELDS
@Column({ nullable: true })
originalRequestId: string; // Link to original request if this is a retry

@Column({ default: 0 })
retryCount: number; // How many times this document was reprocessed

@Column({ type: 'simple-array', nullable: true })
providerHistory: string[]; // ['openai', 'gemini', 'ocr_space']

@ManyToOne(() => DocumentProcessingRequest)
@JoinColumn({ name: 'originalRequestId' })
originalRequest: DocumentProcessingRequest;
```

**Update `DocumentProcessingResponse` Entity:**
```typescript
// NEW FIELDS FOR USER EDITS
@Column({ type: 'jsonb', nullable: true })
userEditedData: Record<string, any>; // User corrections

@Column({ default: false })
wasEdited: boolean; // Flag if user made changes

@Column({ type: 'simple-array', nullable: true })
editedFields: string[]; // ['amount', 'merchantName']

@Column({ type: 'timestamp', nullable: true })
editedAt: Date; // When user edited

@Column({ nullable: true })
editedByUserId: string; // Track who edited (for multi-user scenarios)
```

**Migration:**
- Add `GEMINI`, `OCR_SPACE` to provider enums
- Create document_processing_requests table with retry fields
- Create document_processing_responses table with edit tracking
- Add self-referencing FK for retry chain
- Add indexes on originalRequestId, wasEdited

---

### 2. Backend Implementation

**A. Enhanced Provider Services**

**`gemini.service.ts`** (~200 lines)
- Implement Gemini Vision API for document processing
- Extract transaction data in same format as OpenAI
- Return confidence scores and processing metadata

**`ocr-space.service.ts`** (~150 lines)
- Implement OCR.space API integration
- Parse extracted text for transaction data
- Pattern matching fallback for structured data extraction

**`ai-provider.service.ts`** updates (~50 lines)
- Add Gemini and OCR.space provider cases
- Standardize response format across all providers

**B. Document Processing Service** (Enhanced)

**`document-processing.service.ts`** (~500 lines - expanded)

**Core Methods:**

1. **`processDocument(userId, file, provider?)`**
   - Check user tier and provider permissions
   - Create DocumentProcessingRequest
   - Call provider service
   - Store complete request/response
   - Return extracted data

2. **`reprocessDocument(userId, originalRequestId, newProvider)`** ✨ NEW
   - Fetch original DocumentProcessingRequest
   - Validate user owns the document
   - Check provider permissions
   - Create new request with originalRequestId link
   - Increment retryCount
   - Append to providerHistory
   - Call new provider with same file
   - Store new response
   - Return comparison data: { original: {...}, new: {...} }

3. **`saveEditedData(userId, responseId, editedData)`** ✨ NEW
   - Fetch DocumentProcessingResponse
   - Validate user permissions
   - Compare editedData with extractedData
   - Calculate which fields changed
   - Update userEditedData JSONB field
   - Set wasEdited = true
   - Set editedFields array
   - Set editedAt timestamp
   - Return updated response

4. **`getProcessingHistory(userId, requestId)`** ✨ NEW
   - Fetch all retry attempts for original request
   - Return chain: [Request1(OpenAI), Request2(Gemini), Request3(OCR)]
   - Include all responses and user edits
   - Show comparison metrics (confidence, cost, time)

5. **`mergeProviderResults(responseIds[])`** ✨ NEW (BONUS)
   - Take multiple responses from different providers
   - Merge fields with highest confidence
   - User can pick best field from each provider
   - Example: Amount from OpenAI + Merchant from Gemini
   - Create final merged result

**C. Document Processing Controller** (Enhanced)

**`document-processing.controller.ts`** (~200 lines)

**Endpoints:**

```typescript
// Existing
POST   /api/document-processing/process
GET    /api/document-processing/history
GET    /api/document-processing/:id

// NEW ENDPOINTS
POST   /api/document-processing/:id/reprocess
       Body: { provider: 'gemini' | 'openai' | 'ocr_space' }
       Returns: { original: Response, new: Response }

PATCH  /api/document-processing/response/:id/edit
       Body: { editedData: {...}, editedFields: [...] }
       Returns: Updated DocumentProcessingResponse

GET    /api/document-processing/:id/retry-history
       Returns: All retry attempts with comparisons

POST   /api/document-processing/merge
       Body: { responseIds: ['id1', 'id2'] }
       Returns: Merged result from multiple providers
```

**D. Update Chat Service** (~150 lines modified)

**`chat.service.ts`** updates:
- Inject DocumentProcessingService
- Replace direct OpenAI calls with `documentProcessingService.processDocument()`
- Add retry handler in conversation context
- Track documentProcessingId in conversation

---

### 3. Frontend Implementation

**A. Enhanced Extracted Data Card Component**

**`ExtractedDataCard.tsx`** updates (~150 lines added)

**NEW UI ELEMENTS:**

1. **Edit State Tracking:**
   - Track original AI data vs edited data
   - Highlight edited fields in different color
   - Show "Edited" badge on changed fields

2. **Retry Button:**
   ```tsx
   <button onClick={handleRetry}>
     🔄 Retry with Different Provider
   </button>
   ```

3. **Provider Comparison View:** ✨ NEW Component
   - Split view showing two results side-by-side
   - Highlight differences between providers
   - Allow field-by-field selection
   ```tsx
   <ComparisonView>
     <Column label="OpenAI Result">
       Amount: $45.99 ✓
       Merchant: Walmart
     </Column>
     <Column label="Gemini Result">
       Amount: $45.00
       Merchant: Walmart Supercenter ✓
     </Column>
   </ComparisonView>
   ```

4. **Save Edited Data:**
   - "Save Changes" button
   - API call to update DocumentProcessingResponse
   - Visual confirmation of save

**B. New Components**

**`ProviderComparisonModal.tsx`** ✨ NEW (~250 lines)
- Modal showing side-by-side provider results
- Field-by-field comparison with visual diff
- Click field to select from either provider
- Confidence scores per field
- Cost and time comparison
- "Use This Result" button for each provider
- "Merge Best Fields" button

**`RetryProviderSelector.tsx`** ✨ NEW (~100 lines)
- Dropdown with providers NOT yet tried
- Show provider benefits: "Faster", "More accurate", "Free"
- Disable already-used providers
- "Reprocess" button with loading state

**`ProviderSelector.tsx`** (~150 lines - from original plan)
- Inline dropdown in upload zone
- Show available providers based on tier
- Default selection based on tier

**C. Update Existing Components**

**`DocumentUploadZone.tsx`** updates (~50 lines):
- Add ProviderSelector component
- Pass selected provider to parent

**`AIChatbot.tsx`** updates (~200 lines):
- State for retry flow
- Handle reprocess requests
- Show comparison modal
- Display provider history
- Track edited vs original data
- API calls for save edits and retry

**`ExtractedDataCard.tsx`** updates (~100 lines):
- Add edit state management
- Add "Retry" button
- Add "Save Changes" button
- Highlight edited fields
- Show provider badge

**D. Update API Service**

**`api.ts`** updates (~50 lines):
```typescript
export const documentProcessingApi = {
  uploadDocument: (file, provider) => {...},
  reprocessDocument: (requestId, newProvider) => {...},
  saveEditedData: (responseId, editedData) => {...},
  getRetryHistory: (requestId) => {...},
  mergeResults: (responseIds) => {...},
};
```

---

### 4. User Experience Flows

**Flow 1: Initial Upload → Edit → Save**
```
1. User uploads receipt, selects "Gemini"
2. Processing... → Data extracted
3. Shows: Merchant: "Starbucks Coffee" | Amount: $5.50 | Date: 2024-01-15
4. User edits: Amount → $5.75 (AI read it wrong)
5. Click "Save Changes"
6. Database stores: extractedData (original) + userEditedData (corrected)
7. Transaction created with corrected data
```

**Flow 2: Retry with Different Provider**
```
1. Document processed with OpenAI → Amount: $45.00 (low confidence)
2. User clicks "🔄 Retry with Different Provider"
3. Selects "Gemini" from dropdown
4. Reprocesses same file with Gemini
5. Shows comparison modal:
   - OpenAI: Amount $45.00 (60% confidence)
   - Gemini: Amount $45.99 (95% confidence) ✓
6. User selects Gemini result
7. Database links: Request1(OpenAI) ← Request2(Gemini)
```

**Flow 3: Multi-Provider Merge (Advanced)**
```
1. Processed with OpenAI, Gemini, Free OCR
2. Click "Compare All Results"
3. Shows 3-column comparison
4. User picks best field from each:
   - Amount from Gemini (highest confidence)
   - Merchant from OpenAI (most detailed)
   - Date from OCR (matches receipt format)
5. Creates merged result
6. Saves as final extraction
```

---

### 5. ML Training Data Benefits

**Data Collection for Future Model Training:**

1. **Multi-Provider Comparison:**
   - Same document → 3 different AI responses
   - Compare accuracy, confidence, speed, cost
   - Identify which provider excels at what document types

2. **User Corrections as Ground Truth:**
   - AI extracted: Amount $45.00
   - User corrected: Amount $45.99
   - Ground truth established: $45.99 ✓
   - Train custom model on corrections

3. **Confidence Calibration:**
   - Track: Predicted confidence vs actual accuracy
   - If AI says 95% confidence but user corrects it → recalibrate
   - Build confidence-accuracy correlation dataset

4. **Document Type Classification:**
   - Store: Document → Best Provider
   - Receipts → Gemini performs best
   - Invoices → OpenAI performs best
   - Handwritten → OCR.space performs best
   - Auto-select provider based on document type

5. **Cost Optimization:**
   - Track: Provider cost vs user satisfaction (edits)
   - Find sweet spot: Gemini = 90% accuracy at 25% cost of OpenAI
   - Recommend provider based on cost/accuracy tradeoff

---

### 6. Database Schema Summary

**document_processing_requests:**
```sql
- id, userId, fileName, filePath, fileSize, mimeType
- provider (openai/gemini/ocr_space)
- status (pending/processing/completed/failed)
- subscriptionTier
- requestPayload (JSONB - full API request)
- originalRequestId (FK - for retry chain) ✨ NEW
- retryCount ✨ NEW
- providerHistory (array) ✨ NEW
- errorMessage
- createdAt, updatedAt
```

**document_processing_responses:**
```sql
- id, requestId (FK)
- provider
- responsePayload (JSONB - full API response)
- extractedData (JSONB - AI extraction)
- userEditedData (JSONB - user corrections) ✨ NEW
- wasEdited (boolean) ✨ NEW
- editedFields (array) ✨ NEW
- editedAt (timestamp) ✨ NEW
- editedByUserId ✨ NEW
- confidence, processingTimeMs, tokensUsed, cost
- completedAt
```

---

### 7. API Endpoints Summary

**Document Processing:**
```
POST   /api/document-processing/process
       - Upload and process with selected provider

POST   /api/document-processing/:id/reprocess ✨ NEW
       - Retry same document with different provider

PATCH  /api/document-processing/response/:id/edit ✨ NEW
       - Save user-edited data

GET    /api/document-processing/:id/retry-history ✨ NEW
       - Get all retry attempts for comparison

POST   /api/document-processing/merge ✨ NEW
       - Merge results from multiple providers

GET    /api/document-processing/history
       - User's processing history

GET    /api/document-processing/:id
       - Get specific processing result
```

---

### 8. File Structure (Updated)

```
backend/src/
├── modules/
│   ├── ai/
│   │   ├── gemini.service.ts ✨ NEW
│   │   ├── ocr-space.service.ts ✨ NEW
│   │   ├── ai-provider.service.ts 🔄 MODIFIED
│   │   └── ai.module.ts 🔄 MODIFIED
│   ├── document-processing/ ✨ NEW MODULE
│   │   ├── document-processing.module.ts
│   │   ├── document-processing.service.ts (ENHANCED with retry/edit)
│   │   ├── document-processing.controller.ts (ENHANCED with new endpoints)
│   │   └── entities/
│   │       ├── document-processing-request.entity.ts (ENHANCED with retry fields)
│   │       └── document-processing-response.entity.ts (ENHANCED with edit tracking)
│   └── chat/
│       ├── chat.controller.ts 🔄 MODIFIED
│       └── chat.service.ts 🔄 MODIFIED
└── database/
    └── migrations/
        └── [timestamp]-AddEnhancedDocumentProcessing.ts ✨ NEW

frontend/src/
├── components/ai-chatbot/
│   ├── AIChatbot.tsx 🔄 ENHANCED (retry + edit handling)
│   ├── DocumentUploadZone.tsx 🔄 MODIFIED
│   ├── ExtractedDataCard.tsx 🔄 ENHANCED (edit + retry buttons)
│   ├── ProviderSelector.tsx ✨ NEW
│   ├── ProviderComparisonModal.tsx ✨ NEW
│   └── RetryProviderSelector.tsx ✨ NEW
└── services/
    └── api.ts 🔄 ENHANCED (new endpoints)
```

---

### 9. Testing Plan (Enhanced)

**Provider Testing:**
1. Upload same receipt to all 3 providers
2. Compare extracted data accuracy
3. Verify cost and time tracking

**Edit Feature Testing:**
1. Extract data with AI
2. Edit multiple fields
3. Verify database stores both original + edited
4. Check editedFields array is correct

**Retry Feature Testing:**
1. Process with OpenAI
2. Retry with Gemini
3. Verify retry chain links correctly
4. Check providerHistory array
5. Verify comparison modal shows differences

**Merge Feature Testing:**
1. Process with all 3 providers
2. Merge best fields from each
3. Verify merged result is accurate
4. Check user can pick individual fields

---

### 10. Estimated Effort (Updated)

**Phase 1: Core Multi-Provider (Original Plan)**
- Database entities & migration: 2 hours
- Gemini + OCR.space services: 5 hours
- Document processing module: 4 hours
- Frontend provider selector: 2 hours
- Subtotal: **13 hours**

**Phase 2: Edit Feature** ✨ NEW
- Backend edit endpoint: 2 hours
- Database edit tracking fields: 1 hour
- Frontend edit UI enhancements: 3 hours
- Testing edit flow: 1 hour
- Subtotal: **7 hours**

**Phase 3: Retry/Reprocess Feature** ✨ NEW
- Backend retry logic: 3 hours
- Retry chain database structure: 2 hours
- Frontend comparison modal: 4 hours
- Retry selector component: 2 hours
- Testing retry flow: 2 hours
- Subtotal: **13 hours**

**Phase 4: Advanced Merge Feature** ✨ NEW (OPTIONAL)
- Backend merge logic: 2 hours
- Frontend merge UI: 3 hours
- Testing: 1 hour
- Subtotal: **6 hours**

**TOTAL EFFORT: 33-39 hours (4-5 days)**

---

## Rollout Strategy

**Phase 1** (Day 1-2): Backend foundation
- Database entities with edit/retry fields
- Gemini + OCR.space provider services
- Document processing module with all endpoints

**Phase 2** (Day 2-3): Frontend core
- Provider selector
- Enhanced extracted data card with edit
- Save changes functionality

**Phase 3** (Day 3-4): Retry & Comparison
- Retry button and flow
- Comparison modal
- Provider history display

**Phase 4** (Day 4-5): Testing & Polish
- End-to-end testing all flows
- ML data collection validation
- Performance optimization

---

## Success Metrics

**User Experience:**
- % of users who edit AI extractions → Shows AI accuracy
- % of users who retry with different provider → Provider satisfaction
- Most edited fields → Identify AI weaknesses

**ML Training Data:**
- # of document-response pairs collected
- # of user corrections (ground truth data)
- # of multi-provider comparisons per document

**Cost Optimization:**
- Average cost per document by tier
- Provider accuracy vs cost analysis
- Optimal provider recommendation per document type
