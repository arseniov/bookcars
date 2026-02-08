# BookCars Customization Guide

This document describes how to implement key customizations to the BookCars car rental platform.

## Overview

The BookCars platform is a monorepo with three main client applications (admin panel, customer web frontend, and mobile app) that share a common backend API and type definitions. This guide covers implementing new features across the entire stack.

## 1. Implement Car Categories

### Current State

The codebase already has a `CarRange` enum in `packages/bookcars-types/index.ts` that includes:
- `Mini` - Small cars
- `Midi` - Medium cars/SUVs  
- `Maxi` - Vans
- `Scooter`
- `Bus`
- `Truck`
- `Caravan`

This can serve as the basis for "Categories" without needing to modify the database schema.

### Implementation Steps

#### Backend Changes

**No database changes required** - The existing `Car.range` field in the Car model stores the category.

1. **Car Model** (`backend/src/models/Car.ts`)
   - Already has `range` field with `CarRange` enum
   - Index exists: `carSchema.index({ range: 1 })`

2. **GetCarsPayload** (`packages/bookcars-types/index.ts`)
   - Already has `ranges?: string[]` field for filtering

3. **Backend Filtering** (`backend/src/controllers/carController.ts`)
   - `getFrontendCars` already filters by ranges:
   ```typescript
   if (ranges) {
     $match.$and!.push({ range: { $in: ranges } })
   }
   ```

#### Frontend Changes

1. **Category Helper** (`frontend/src/utils/categoryHelper.ts`)
   ```typescript
   export const categories: Category[] = [
     { id: 'mini', name: 'Small Cars', carRange: CarRange.Mini },
     { id: 'midi', name: 'Medium Cars', carRange: CarRange.Midi },
     // ...
   ]
   ```

2. **Category Card Component** (`frontend/src/components/CategoryCard.tsx`)
   - Displays category image, name, and description
   - Links to `/category/:id`

3. **Categories Page** (`frontend/src/pages/Categories.tsx`)
   - Grid layout showing all categories
   - Route: `/categories`

4. **Category Page** (`frontend/src/pages/Category.tsx`)
   - Pre-filters cars by category range
   - Includes search form for location/date filtering
   - Route: `/category/:id`

5. **App Routes** (`frontend/src/App.tsx`)
   ```typescript
   { path: 'categories', element: <Categories /> },
   { path: 'category/:id', element: <Category /> },
   ```

6. **Home Page** (`frontend/src/pages/Home.tsx`)
   - Added "Browse by Category" section linking to categories page

#### Mobile Changes

1. **Category Screens**
   - `mobile/screens/CategoriesScreen.tsx` - Grid of categories
   - `mobile/screens/CategoryScreen.tsx` - Cars filtered by category

2. **Navigation** (`mobile/components/DrawerNavigator.tsx`)
   - Add category screens to navigation stack

### Simplified Approach

Use existing `CarRange` field to avoid database changes:

1. Create helper function to map ranges to friendly names
2. Create category cards on Home page using ranges
3. Create Category.tsx page that filters cars by range parameter
4. No backend changes needed - reuse existing filtering

## 2. Implement Category Cards on Main Page

### Frontend Implementation

#### Create Category Card Component

```typescript
// frontend/src/components/CategoryCard.tsx
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'

interface CategoryCardProps {
  id: string
  name: string
  image: string
  description: string
}

const CategoryCard = ({ id, name, image, description }: CategoryCardProps) => {
  const navigate = useNavigate()
  
  return (
    <Card onClick={() => navigate(`/category/${id}`)}>
      <img src={image} alt={name} />
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2">{description}</Typography>
      </CardContent>
    </Card>
  )
}
```

#### Add to Home Page

```typescript
// frontend/src/pages/Home.tsx
// Add category section after car-size section
<div className="car-categories">
  <h1>Browse by Category</h1>
  <Button onClick={() => navigate('/categories')}>
    View All Categories
  </Button>
</div>
```

#### Mobile Implementation

```typescript
// mobile/components/CategoryCard.tsx
import { TouchableOpacity, Text, Image } from 'react-native'

const CategoryCard = ({ id, name, image, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Image source={{ uri: image }} />
    <Text>{name}</Text>
  </TouchableOpacity>
)
```

## 3. Dual Booking Flow Support

### Flow 1: Traditional Search Flow (Existing)

User searches from Home → Results on Search page → Car details → Checkout

### Flow 2: Category-Based Flow (New)

User clicks category → Sees category landing page with search form → Filters results → Car details → Checkout

### Implementation

#### Backend Changes

1. **Update `getFrontendCars` to accept category parameter:**
   ```typescript
   // Add to GetCarsPayload interface
   category?: string
   ```

2. **Modify aggregation to filter by category:**
   ```typescript
   if (category) {
     $match.$and!.push({ range: category })
   }
   ```

#### Frontend Changes

1. **Create Category Page with Search Form:**
   ```typescript
   // frontend/src/pages/Category.tsx
   import SearchForm from '@/components/SearchForm'
   
   const Category = () => {
     const { id } = useParams() // category ID (e.g., 'mini')
     const [filter, setFilter] = useState<CarFilter>()
     
     return (
       <>
         <SearchForm onSubmit={setFilter} />
         <CarList filter={filter} category={id} />
       </>
     )
   }
   ```

2. **Update CarList to accept category:**
   ```typescript
   interface CarListProps {
     filter?: CarFilter
     category?: string // New parameter
   }
   ```

3. **Pass category to API call in CarList:**
   ```typescript
   const cars = await CarService.getFrontendCars(filter, page, size, category)
   ```

#### Mobile Changes

```typescript
// mobile/screens/CategoryScreen.tsx
const CategoryScreen = ({ route }) => {
  const { category } = route.params
  const [filter, setFilter] = useState<CarFilter>()
  
  return (
    <>
      <SearchFormFilter onFilterChange={setFilter} />
      <CarList category={category} filter={filter} />
    </>
  )
}
```

### Key Points

- Both flows use the same `CarList` component
- Category flow pre-filters by category ID
- User can still change dates/locations on category page
- Both flows converge at checkout

## 4. Rental Terms and General Agreement

### Current State

The system has supplier contracts (`User.contracts` field) for supplier-specific agreements. A global rental terms feature has been added.

### Implementation

#### Backend Changes

1. **Booking Model** (`backend/src/models/Booking.ts`)
   ```typescript
   termsAccepted: {
     type: Boolean,
     default: false,
   },
   termsAcceptedAt: {
     type: Date,
   }
   ```

2. **Booking Interface** (`backend/src/config/env.config.ts`)
   ```typescript
   termsAccepted?: boolean
   termsAcceptedAt?: Date
   ```

3. **Types Package** (`packages/bookcars-types/index.ts`)
   ```typescript
   termsAccepted?: boolean
   termsAcceptedAt?: Date
   ```

4. **Accept Terms Endpoint** (`backend/src/routes/signatureRoutes.ts`)
   ```typescript
   router.post('/accept-terms/:bookingId', authJwt, acceptTerms)
   ```

#### Frontend Changes

1. **Signature Dialog Component** (`frontend/src/components/SignatureDialog.tsx`)
   - Shows rental terms content
   - Checkbox for acceptance
   - Creates DocuSeal signature request

2. **Language Strings** (`frontend/src/lang/common.ts`)
   ```typescript
   TERMS_AND_CONDITIONS: 'Rental Terms and Conditions',
   TERMS_CONTENT: '...',
   TERMS_ACCEPT: 'I have read and agree...',
   ```

#### Mobile Changes

1. **Signature Screen** (`mobile/screens/SignatureScreen.tsx`)
   - Shows terms content
   - Checkbox for acceptance
   - Integration with DocuSeal

## 5. Electronic Signature with DocuSeal

### Overview

DocuSeal is integrated as a self-hosted electronic signature solution. It allows customers to sign rental agreements digitally and remotely.

### Docker Setup

```yaml
# docker-compose.yml
docuseal:
  image: docuseal/docuseal:latest
  ports:
    - "3000:3000"
  volumes:
    - ./docuseal:/data/docuseal
  environment:
    - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/docuseb
    - SECRET_KEY_BASE=your-secret-key
  depends_on:
    postgres:
      condition: service_healthy

postgres:
  image: postgres:16-alpine
  # ...
```

### Backend Implementation

1. **DocuSeal Service** (`backend/src/utils/docusealHelper.ts`)
   ```typescript
   class DocuSealService {
     async createSignatureRequest(request: DocuSealRequest): Promise<DocuSealResponse>
     async getSignatureRequest(requestId: string)
     async downloadSignedDocument(documentId: string): Promise<Buffer>
     generateEmbeddedSignUrl(requestId: string, accessToken: string): string
   }
   ```

2. **Signature Controller** (`backend/src/controllers/signatureController.ts`)
   - `createSignatureRequest` - Creates DocuSeal request for booking
   - `getSignatureRequestStatus` - Checks signature status
   - `downloadSignedDocument` - Retrieves signed PDF
   - `acceptTerms` - Records terms acceptance

3. **Signature Routes** (`backend/src/routes/signatureRoutes.ts`)
   ```typescript
   POST /api/create-signature-request/:bookingId
   GET /api/signature-request-status/:bookingId
   GET /api/signed-document/:bookingId
   POST /api/accept-terms/:bookingId
   POST /api/check-signature-required/:bookingId
   ```

4. **Booking Model Updates** (`backend/src/models/Booking.ts`)
   ```typescript
   signatureRequestId: String
   signatureStatus: { pending, signed, declined, expired }
   signedDocumentPath: String
   signedAt: Date
   signatureAccessToken: String
   ```

### Frontend Implementation

1. **Signature Service** (`frontend/src/services/SignatureService.ts`)
   ```typescript
   createSignatureRequest(bookingId, language)
   getSignatureRequestStatus(bookingId, language)
   downloadSignedDocument(bookingId)
   acceptTerms(bookingId, accepted)
   ```

2. **Signature Dialog** (`frontend/src/components/SignatureDialog.tsx`)
   - Modal dialog for signing
   - Terms display
   - Acceptance checkbox
   - Status tracking

### Mobile Implementation

1. **Signature Service** (`mobile/services/SignatureService.ts`)
   - Same API calls as web

2. **Signature Screen** (`mobile/screens/SignatureScreen.tsx`)
   - Native screen for signing
   - Terms display
   - Checkbox for acceptance

### Environment Variables

```bash
# Backend (.env)
BC_DOCUSEAL_URL=http://localhost:3000
BC_DOCUSEAL_API_KEY=
BC_CDN_SIGNED_DOCUMENTS=/var/www/cdn/bookcars/signed-documents
BC_CDN_TEMP_SIGNED_DOCUMENTS=/var/www/cdn/bookcars/temp-signed-documents

# Docker (.env.docker)
BC_DOCUSEAL_URL=http://docuseal:3000
BC_DOCUSEAL_API_KEY=
BC_CDN_SIGNED_DOCUMENTS=/var/www/cdn/bookcars/signed-documents
BC_CDN_TEMP_SIGNED_DOCUMENTS=/var/www/cdn/bookcars/temp-signed-documents
```

## 6. Delivery vs Collection Option

### Overview

Customers can choose between picking up the car at the rental location or having it delivered to an address (with additional fee).

### Implementation

#### Backend Changes

1. **Booking Model** (`backend/src/models/Booking.ts`)
   ```typescript
   deliveryOption: { type: String, enum: ['pickup', 'delivery'] }
   deliveryAddress: {
     street: String
     city: String
     zipCode: String
     country: String
     latitude: Number
     longitude: Number
   }
   deliveryPrice: { type: Number, default: 0 }
   ```

2. **Delivery Controller** (`backend/src/controllers/deliveryController.ts`)
   ```typescript
   export const calculateDeliveryPrice = async (req, res) => {
     // Calculate distance using Haversine formula
     // Apply pricing formula: max(distance * BASE_RATE, MIN_FEE)
   }
   ```

3. **Delivery Routes** (`backend/src/routes/deliveryRoutes.ts`)
   ```typescript
   POST /api/calculate-delivery-price
   ```

4. **Helper Utilities** (`backend/src/utils/helper.ts`)
   ```typescript
   export const distance = (lat1, lon1, lat2, lon2, unit) => {
     // Haversine formula implementation
   }
   ```

#### Frontend Changes

1. **Delivery Option Component** (`frontend/src/components/DeliveryOption.tsx`)
   ```typescript
   interface DeliveryOptionProps {
     value: 'pickup' | 'delivery'
     onChange: (value, address?, price?) => void
     pickupLocationId: string
   }
   ```

2. **Payment Service** (`frontend/src/services/PaymentService.ts`)
   ```typescript
   export const calculateDeliveryPrice = async (
     pickupLocationId: string,
     address: DeliveryAddress
   ): Promise<number>
   ```

3. **Checkout Integration**
   - Add DeliveryOption component to checkout flow
   - Update price calculation to include delivery fee
   - Pass delivery info to booking creation

### Pricing Formula

```typescript
// backend/src/controllers/deliveryController.ts
const DELIVERY_BASE_RATE = 2 // Price per km
const DELIVERY_MIN_FEE = 10 // Minimum delivery fee

const distance = helper.distance(pickupLat, pickupLon, deliveryLat, deliveryLon, 'K')
const price = Math.max(distance * DELIVERY_BASE_RATE, DELIVERY_MIN_FEE)
```

### User Experience

1. User selects "Deliver to address" option
2. Enters delivery address (with optional map picker)
3. System calculates delivery fee based on distance
4. Fee added to booking total
5. Supplier receives delivery address with booking details
6. Confirmation email includes delivery instructions

### Key Features

- Dynamic pricing based on distance
- Minimum fee to ensure profitability
- Coordinates stored for supplier navigation
- Clear communication of delivery costs

## Implementation Order

Recommended implementation sequence:

1. **Categories** - Foundation for category pages
2. **Category Cards** - UI enhancement on Home
3. **Dual Booking Flow** - Connects categories to checkout
4. **Rental Terms** - Legal requirement before checkout
5. **Electronic Signature** - Contract signing with DocuSeal
6. **Delivery Option** - Value-add feature with upsell

## Testing Checklist

- [ ] Category cards navigate correctly
- [ ] Category pages filter cars properly
- [ ] Search from category page works with filters
- [ ] Terms display in all languages
- [ ] Terms acceptance is recorded
- [ ] DocuSeal integration creates signature requests
- [ ] Signature captures and embeds correctly
- [ ] Signed PDF is retrievable
- [ ] Delivery option appears in checkout
- [ ] Address validation works
- [ ] Delivery fee calculates correctly
- [ ] Booking total includes delivery fee
- [ ] Admin can view signed contracts
- [ ] Supplier receives delivery instructions
