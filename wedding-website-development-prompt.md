# Wedding Website Platform - Complete Development Prompt

## Project Overview
Build a comprehensive wedding invitation and guest management platform using Next.js and MongoDB. The platform allows couples to create personalized digital wedding invitations, manage guest lists, send WhatsApp messages, track RSVPs, arrange seating, and receive gifts.

---

## Tech Stack Requirements

### Core Technologies
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (supporting Email and Google OAuth)
- **Language**: Hebrew (RTL support required)
- **Styling**: Tailwind CSS with elegant, modern design
- **File Storage**: Free solution (Cloudinary free tier or similar)

### Key Integrations
- **WhatsApp**: Free/low-cost solution using WhatsApp links (wa.me links) with pre-filled messages
- **Maps**: Google Maps / Waze deep links for event location
- **Payments**: Direct Bit/Paybox links (phone number-based, no API needed)

---

## User Roles & Authentication

### 1. Super Admin (Platform Owner)
- View all weddings and statistics
- Monitor platform usage
- Access analytics dashboard

### 2. Couple Admin
- Register with email or Google
- Create and manage their wedding event
- Upload guest lists (Excel import + manual entry)
- Send WhatsApp invitations and reminders
- View real-time RSVP status
- Manage table seating arrangements
- View gift tracking
- Customize wedding page theme/colors

### 3. Guest (No Login Required)
- Access via unique link (UUID-based)
- View wedding details
- Submit RSVP with details:
  - Number of adults attending
  - Number of children attending
  - Special meal requests
  - Additional notes
- View event location with map links
- Send gifts via Bit/Paybox

---

## Core Features Breakdown

### Feature 1: Digital Wedding Invitation
**Requirements:**
- Couple uploads a photo or video (max 10MB)
- Store media on free hosting (Cloudinary free tier)
- Display elegant invitation page with:
  - Couple's names
  - Event date, time, location
  - Photo/video gallery
  - Event description
  - Map integration (Google Maps + Waze buttons)
  - RSVP button

**Technical Implementation:**
- Create responsive invitation template
- Support RTL (Hebrew)
- Allow couples to customize colors/theme
- Generate unique URL per wedding: `/wedding/[weddingId]`
- Guest unique link: `/rsvp/[guestToken]`

---

### Feature 2: Guest Management System

**Guest Upload Options:**
1. **Excel Import**
   - Template provided for download
   - Columns: Full Name, Phone Number, Family Group, Number of Invitees, Email (optional)
   - Bulk import with validation

2. **Manual Entry**
   - Add individual guests
   - Create family groups
   - Assign number of invites per guest/family

**Guest Data Model:**
```javascript
{
  guestId: UUID,
  weddingId: ObjectId,
  name: String,
  phone: String (with country code),
  familyGroup: String (optional),
  invitedCount: Number,
  uniqueToken: UUID,
  rsvpStatus: 'pending' | 'confirmed' | 'declined',
  adultsAttending: Number,
  childrenAttending: Number,
  specialMealRequests: String,
  notes: String,
  tableAssignment: String,
  tableNumber: Number,
  giftAmount: Number,
  giftMethod: 'bit' | 'paybox' | 'none',
  messageSent: [{ type: String, sentAt: Date }],
  createdAt: Date,
  updatedAt: Date
}
```

---

### Feature 3: WhatsApp Messaging System

**Message Types:**
1. **Initial Invitation** - Sent when couple is ready
2. **RSVP Reminder** - Sent to guests who haven't responded
3. **Day Before Reminder** - Includes table number
4. **Thank You Message** - Day after event

**Technical Implementation:**
- Use `wa.me` links for free WhatsApp messaging
- Generate message with:
  - Personalized greeting
  - Embedded image/video (using media URL)
  - Unique RSVP link
  - Event details

**WhatsApp Link Format:**
```
https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}
```

**Message Flow:**
1. Couple triggers send from admin panel
2. System generates unique links for each guest
3. Opens WhatsApp web/app with pre-filled message
4. Couple sends manually (or automate with browser extension for bulk - optional enhancement)

**Message Templates:**
- **Invitation**: "היי [שם], אנחנו מתחתנים! 💍 מוזמן/ת לחתונה שלנו. לצפייה בהזמנה ואישור הגעה: [link]"
- **Reminder**: "היי [שם], עדיין לא קיבלנו אישור הגעה ממך. נשמח אם תאשר/י כאן: [link]"
- **Day Before**: "היי [שם], מחר מתחתנים! 🎉 מספר השולחן שלך: [tableNumber]. מחכים לראותך!"
- **Thank You**: "תודה שהייתם חלק מהיום המיוחד שלנו! ❤️"

---

### Feature 4: RSVP System

**Guest RSVP Page (`/rsvp/[guestToken]`):**
- Display wedding invitation details
- RSVP Form:
  - Attending: Yes/No buttons
  - If Yes:
    - Number of adults attending (dropdown/input)
    - Number of children attending (dropdown/input)
    - Special meal requests (textarea)
    - Additional notes (textarea)
  - Submit button
- Show confirmation message after submission
- Allow guests to update RSVP until event date
- Map links (Google Maps & Waze) to event location

**Validation:**
- Cannot exceed invited count
- Required fields validation
- Phone number validation (Israeli format)

---

### Feature 5: Real-Time Guest Tracking Dashboard

**Couple Admin Dashboard:**
- Statistics cards:
  - Total guests invited
  - Confirmed attending
  - Declined
  - Pending responses
  - Total adults
  - Total children
  - Response rate percentage

**Guest List Table:**
- Searchable and filterable
- Columns:
  - Guest name
  - Phone number
  - Family group
  - Status (pending/confirmed/declined)
  - Adults attending
  - Children attending
  - Special requests
  - Table assignment
  - Gift status
  - Actions (edit, resend message, delete)

**Filters:**
- By status
- By family group
- By table assignment
- By response date

---

### Feature 6: Gift Management

**Gift Tracking:**
- When guest wants to give a gift, show two options:
  1. **Bit**: Opens Bit app with couple's phone number pre-filled
  2. **Paybox**: Opens Paybox app/web with couple's phone number

**Implementation:**
- Bit deep link: `https://bit.app/[phoneNumber]`
- Paybox link: `https://payboxapp.page.link/?link=https://payboxapp.com/payment?phone=[phoneNumber]`
- Guest can optionally log gift amount (honor system)
- Track which guests sent gifts in admin dashboard

**Gift Dashboard for Couple:**
- Total gifts received (based on logged amounts)
- List of guests who sent gifts
- Export gift list

---

### Feature 7: Table Seating Arrangement

**Simple Seating System:**
- Create tables with:
  - Table name/number
  - Capacity (number of seats)
  - Table type (adults/kids/mixed)

**Guest Assignment:**
- Drag guests to tables OR
- Select table from dropdown per guest
- Visual capacity indicator per table
- Warning if table is over capacity

**Seating Dashboard:**
- List of all tables
- Guests assigned to each table
- Unassigned guests list
- Export seating chart

**Auto-Assignment Helper (Optional Enhancement):**
- Suggest seating based on family groups
- Keep families together

---

### Feature 8: Automated Messaging Schedule

**Message Automation:**
1. **Initial Invitations**: Couple triggers manually
2. **RSVP Reminder** (2 rounds):
   - First reminder: 2 weeks before event (to non-responders)
   - Second reminder: 1 week before event (to non-responders)
3. **Day Before Reminder**: Automatic, includes table number
4. **Thank You Message**: Day after event

**Implementation:**
- Use MongoDB scheduled jobs or Next.js cron jobs
- Track message history per guest
- Allow couple to preview messages before sending
- Manual override option for any message

---

### Feature 9: Post-Event Cleanup

**Automatic Data Cleanup:**
- After event date + 7 days:
  - Archive wedding data
  - Delete guest unique links
  - Keep statistics for couple
  - Free up database space

**Data Retention:**
- Couple can download full guest list and statistics before cleanup
- Export formats: Excel, PDF

---

## Database Schema

### Collections:

**1. Users (Couples)**
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  googleId: String (optional),
  password: String (hashed),
  role: 'couple' | 'admin',
  createdAt: Date
}
```

**2. Weddings**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  groomName: String,
  brideName: String,
  eventDate: Date,
  eventTime: String,
  venue: String,
  venueAddress: String,
  venueCoordinates: { lat: Number, lng: Number },
  description: String,
  mediaUrl: String, // Photo or video
  mediaType: 'image' | 'video',
  theme: {
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String
  },
  bitPhone: String,
  payboxPhone: String,
  uniqueUrl: String,
  status: 'draft' | 'active' | 'completed' | 'archived',
  createdAt: Date,
  updatedAt: Date
}
```

**3. Guests** (schema provided above)

**4. Tables**
```javascript
{
  _id: ObjectId,
  weddingId: ObjectId (ref: Weddings),
  tableName: String,
  tableNumber: Number,
  capacity: Number,
  tableType: 'adults' | 'kids' | 'mixed',
  assignedGuests: [ObjectId] (ref: Guests),
  createdAt: Date
}
```

**5. Messages**
```javascript
{
  _id: ObjectId,
  weddingId: ObjectId,
  guestId: ObjectId,
  messageType: 'invitation' | 'rsvp_reminder' | 'day_before' | 'thank_you',
  messageContent: String,
  sentAt: Date,
  status: 'pending' | 'sent' | 'failed'
}
```

**6. AdminLogs** (for super admin)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  action: String,
  details: Object,
  timestamp: Date
}
```

---

## Page Structure

### Public Pages
- `/` - Landing page (marketing site)
- `/wedding/[weddingId]` - Public wedding invitation view
- `/rsvp/[guestToken]` - Guest RSVP form

### Authentication Pages
- `/login` - Email/Google login
- `/register` - New couple registration
- `/forgot-password` - Password reset

### Couple Dashboard (`/dashboard`)
- `/dashboard` - Overview & statistics
- `/dashboard/guests` - Guest management
- `/dashboard/guests/import` - Excel import
- `/dashboard/messages` - Send/schedule messages
- `/dashboard/seating` - Table arrangements
- `/dashboard/gifts` - Gift tracking
- `/dashboard/settings` - Wedding details & theme customization

### Super Admin Dashboard (`/admin`)
- `/admin` - Platform statistics
- `/admin/weddings` - All weddings list
- `/admin/users` - User management
- `/admin/analytics` - Usage analytics

---

## UI/UX Requirements

### Design Style
- **Elegant and Modern**: Clean, minimalist design with elegant typography
- **RTL Support**: Full Hebrew language support
- **Responsive**: Mobile-first design
- **Color Customization**: Couples can choose their color scheme
- **Animations**: Subtle, smooth transitions

### Key Components
1. **Invitation Card Component**: Beautiful card design with image/video
2. **RSVP Form**: User-friendly form with clear CTAs
3. **Guest Table Component**: Sortable, filterable data table
4. **Statistics Cards**: Visual cards showing key metrics
5. **Table Seating Grid**: Visual representation of tables
6. **Message Preview Modal**: Preview messages before sending
7. **Theme Customizer**: Color picker and preview

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode option

---

## Technical Implementation Details

### Next.js App Structure
```
/app
  /(auth)
    /login
    /register
  /(public)
    /wedding/[weddingId]
    /rsvp/[guestToken]
  /dashboard
    /guests
    /messages
    /seating
    /gifts
    /settings
  /admin
  /api
    /auth
    /weddings
    /guests
    /messages
    /tables
    /gifts
/components
  /ui (shadcn/ui components)
  /dashboard
  /invitation
  /forms
/lib
  /db (MongoDB connection)
  /auth (NextAuth config)
  /utils
  /validators
/public
  /templates (Excel template for guest import)
```

### API Routes

**Wedding Management:**
- `POST /api/weddings` - Create wedding
- `GET /api/weddings/:id` - Get wedding details
- `PUT /api/weddings/:id` - Update wedding
- `DELETE /api/weddings/:id` - Delete wedding

**Guest Management:**
- `POST /api/guests` - Add guest
- `POST /api/guests/import` - Bulk import from Excel
- `GET /api/guests?weddingId=:id` - Get all guests for wedding
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest
- `POST /api/guests/:id/rsvp` - Submit RSVP

**Messaging:**
- `POST /api/messages/send` - Trigger message sending
- `GET /api/messages?weddingId=:id` - Get message history
- `POST /api/messages/preview` - Preview message content

**Tables:**
- `POST /api/tables` - Create table
- `GET /api/tables?weddingId=:id` - Get all tables
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table
- `POST /api/tables/:id/assign` - Assign guests to table

**Gifts:**
- `POST /api/gifts/log` - Log gift received
- `GET /api/gifts?weddingId=:id` - Get gift summary

---

## Security Considerations

1. **Authentication**:
   - Secure password hashing (bcrypt)
   - JWT tokens with expiration
   - CSRF protection

2. **Authorization**:
   - Couples can only access their own weddings
   - Guests can only access their own RSVP link
   - Super admin can view all data

3. **Data Validation**:
   - Input sanitization
   - Phone number validation
   - File upload restrictions (type, size)

4. **Rate Limiting**:
   - API rate limiting to prevent abuse
   - Message sending limits

5. **Data Privacy**:
   - GDPR compliance
   - Guest data encryption
   - Automatic data cleanup post-event

---

## Free/Low-Cost Service Recommendations

### File Storage
- **Cloudinary**: Free tier (25 GB storage, 25 GB bandwidth/month)
- Alternative: **Vercel Blob Storage** (free tier available)

### Database Hosting
- **MongoDB Atlas**: Free tier (512 MB storage)
- Upgrade path available as needed

### Deployment
- **Vercel**: Free tier for Next.js hosting
- Automatic deployments from Git

### Email Service (for auth)
- **Resend**: Free tier (100 emails/day)
- Alternative: **SendGrid** (100 emails/day free)

---

## Development Phases

### Phase 1: Core Setup (Week 1)
- Project initialization
- Database setup
- Authentication system
- Basic UI components

### Phase 2: Wedding Management (Week 2)
- Wedding creation
- Media upload
- Theme customization
- Public invitation page

### Phase 3: Guest Management (Week 3)
- Guest CRUD operations
- Excel import
- Family grouping
- RSVP system

### Phase 4: WhatsApp Integration (Week 4)
- Message generation
- WhatsApp link creation
- Message history tracking
- Bulk sending interface

### Phase 5: Dashboard & Analytics (Week 5)
- Statistics dashboard
- Guest tracking
- Filters and search
- Export functionality

### Phase 6: Seating & Gifts (Week 6)
- Table management
- Guest assignment
- Gift tracking
- Bit/Paybox integration

### Phase 7: Automation & Polish (Week 7)
- Scheduled messages
- Automatic reminders
- Post-event cleanup
- UI/UX refinements

### Phase 8: Testing & Launch (Week 8)
- End-to-end testing
- Bug fixes
- Performance optimization
- Deployment

---

## Success Metrics

1. **User Registration**: Track couples signing up
2. **Weddings Created**: Number of active weddings
3. **RSVP Response Rate**: Percentage of guests responding
4. **Message Delivery**: Success rate of message sends
5. **Gift Tracking**: Number of gifts logged
6. **User Satisfaction**: Feedback and ratings

---

## Future Enhancements (Post-MVP)

1. **Advanced Analytics**: Charts and graphs for insights
2. **Multi-Event Support**: Engagement party, bachelor party tracking
3. **Guest App**: Mobile app for guests
4. **Vendor Management**: Track vendors, payments, tasks
5. **Budget Tracker**: Wedding budget management
6. **Photo Sharing**: Guests can upload photos from event
7. **Live Streaming**: Integration for virtual guests
8. **Multilingual Support**: English, Arabic, Russian
9. **Premium Themes**: Paid theme marketplace
10. **API for WhatsApp Business**: Upgrade to official API for automation

---

## Testing Checklist

### Functional Testing
- [ ] User registration and login
- [ ] Wedding creation and editing
- [ ] Guest list import (Excel)
- [ ] Manual guest addition
- [ ] RSVP submission
- [ ] WhatsApp link generation
- [ ] Table assignment
- [ ] Gift tracking
- [ ] Message scheduling
- [ ] Data export
- [ ] Post-event cleanup

### Security Testing
- [ ] Authentication flows
- [ ] Authorization checks
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting

### Performance Testing
- [ ] Page load times
- [ ] Database query optimization
- [ ] Image optimization
- [ ] Mobile performance

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Documentation Requirements

1. **User Guide**: How to use the platform (for couples)
2. **Guest Guide**: How to RSVP (simple, visual)
3. **API Documentation**: For future integrations
4. **Admin Guide**: Platform management
5. **Developer Documentation**: Code structure, setup instructions

---

## Support & Maintenance

1. **Bug Tracking**: Use GitHub Issues or similar
2. **User Support**: Email support system
3. **Updates**: Regular feature updates and bug fixes
4. **Backups**: Automated daily database backups
5. **Monitoring**: Uptime monitoring and error tracking

---

## Conclusion

This platform will provide couples with a comprehensive, elegant, and affordable solution for managing their wedding invitations and guest communications. The use of free WhatsApp links instead of expensive APIs keeps costs minimal while still providing excellent functionality.

The system is designed to be scalable, maintainable, and user-friendly, with a clear development path and room for future enhancements.

**Key Differentiators:**
- ✅ Free WhatsApp messaging using wa.me links
- ✅ No payment API needed (direct Bit/Paybox links)
- ✅ Elegant Hebrew RTL design
- ✅ Complete guest lifecycle management
- ✅ Automatic post-event cleanup
- ✅ Family grouping support
- ✅ Real-time RSVP tracking
- ✅ Customizable themes

Start with the MVP features and iterate based on user feedback. Good luck with your development! 🎉
