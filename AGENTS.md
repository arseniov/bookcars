# BookCars Codebase Analysis

## Tech Stack

### Backend
- **Runtime:** Node.js with ES Modules
- **Framework:** Express.js 5.x
- **Language:** TypeScript 5.x
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JOSE library) with bcrypt password hashing
- **Payments:** Stripe and PayPal SDKs
- **Email:** Nodemailer with SMTP
- **Monitoring:** Sentry for error tracking
- **Logging:** Winston logger

### Frontend (Web)
- **Framework:** React 19 with React Router 7
- **Build Tool:** Vite 7
- **UI Library:** Material-UI (MUI) 7.x
- **Forms:** React Hook Form with Zod validation
- **Maps:** Leaflet with React bindings
- **Payment:** Stripe Elements, PayPal React SDK
- **Social Auth:** Custom reactjs-social-login package
- **Styling:** Emotion CSS-in-JS

### Mobile (Native)
- **Framework:** React Native 0.81 with Expo 54
- **Navigation:** React Navigation 7 (Native Stack, Drawer, Stack)
- **UI:** React Native Paper 5
- **Payments:** Stripe React Native SDK
- **Push Notifications:** Expo Notifications
- **Storage:** AsyncStorage

### Shared Packages
- **bookcars-types:** TypeScript interfaces and enums
- **bookcars-helper:** Utility functions
- **currency-converter:** Currency conversion utilities
- **reactjs-social-login:** Social authentication provider

## Project Structure

```
bookcars/
├── admin/                 # Admin panel (React/MUI)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Admin pages (Cars, Users, Bookings, etc.)
│   │   ├── models/        # Zod form schemas
│   │   └── utils/         # Helper functions
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── config/        # Route configurations, env config
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Mongoose schemas (Car, Booking, User, etc.)
│   │   ├── routes/        # Express routes
│   │   ├── middlewares/   # Auth, CORS, etc.
│   │   ├── utils/         # Helper utilities
│   │   ├── payment/       # Stripe/PayPal wrappers
│   │   ├── lang/          # i18n translations
│   │   └── setup/         # Database setup/reset scripts
│   └── __tests__/         # Jest tests
├── frontend/              # Customer-facing web app
│   ├── src/
│   │   ├── components/    # UI components (CarList, SearchForm, etc.)
│   │   ├── pages/         # Pages (Home, Search, Checkout, Booking, etc.)
│   │   ├── services/      # API client functions
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── lang/          # i18n translations
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── components/    # Native UI components
│   │   ├── screens/       # App screens
│   │   ├── services/      # API client
│   │   ├── context/       # React contexts
│   │   └── types/         # TypeScript types
├── packages/              # Shared npm packages
│   ├── bookcars-types/    # Shared TypeScript interfaces
│   ├── bookcars-helper/   # Shared utilities
│   └── reactjs-social-login/
├── docker-compose.yml     # Docker orchestration
└── package.json           # Root workspace config
```

## Implemented Features

### 1. DocuSeal Electronic Signature

The platform includes a self-hosted digital signature solution using DocuSeal for signing rental agreements.

**Backend:**
- `backend/src/utils/docusealHelper.ts` - DocuSeal API wrapper
- `backend/src/controllers/signatureController.ts` - Signature request endpoints
- `backend/src/routes/signatureRoutes.ts` - Signature API routes
- `backend/src/models/Booking.ts` - Signature status tracking

**Frontend:**
- `frontend/src/services/SignatureService.ts` - Frontend API client
- `frontend/src/components/SignatureDialog.tsx` - Signature dialog component
- Supports accepting terms and initiating signature requests

**Mobile:**
- `mobile/services/SignatureService.ts` - Mobile API client
- `mobile/screens/SignatureScreen.tsx` - Native signature screen

### 2. Car Categories

Cars can be browsed by category using the existing `CarRange` enum:
- Mini (Small Cars)
- Midi (Medium Cars/SUVs)
- Maxi (Large Cars/Vans)
- Scooter
- Bus
- Truck
- Caravan

**Frontend:**
- `frontend/src/utils/categoryHelper.ts` - Category definitions
- `frontend/src/components/CategoryCard.tsx` - Category card UI
- `frontend/src/pages/Categories.tsx` - All categories listing
- `frontend/src/pages/Category.tsx` - Category page with search
- Routes: `/categories` and `/category/:id`

### 3. Delivery Option

Customers can choose between:
- **Pickup:** Collect car at the rental location (Free)
- **Delivery:** Have car delivered to an address (Dynamic pricing)

**Backend:**
- `backend/src/controllers/deliveryController.ts` - Price calculation
- `backend/src/routes/deliveryRoutes.ts` - Delivery API
- `backend/src/utils/helper.ts` - Distance calculation (Haversine formula)

**Frontend:**
- `frontend/src/components/DeliveryOption.tsx` - Delivery option UI
- `frontend/src/services/PaymentService.ts` - Price calculation service

### 4. Rental Terms Agreement

Rental terms acceptance is tracked in bookings with:
- Terms acceptance flag
- Acceptance timestamp
- Signature requirement status

## Environment Variables

### Backend (.env)

```bash
# DocuSeal Electronic Signature
BC_DOCUSEAL_URL=http://localhost:3000
BC_DOCUSEAL_API_KEY=
BC_CDN_SIGNED_DOCUMENTS=/var/www/cdn/bookcars/signed-documents
BC_CDN_TEMP_SIGNED_DOCUMENTS=/var/www/cdn/bookcars/temp-signed-documents

# Delivery Service
BC_DELIVERY_BASE_RATE=2
BC_DELIVERY_MIN_FEE=10
```

### Docker Environment (.env.docker)

```bash
# DocuSeal Electronic Signature
BC_DOCUSEAL_URL=http://docuseal:3000
BC_DOCUSEAL_API_KEY=
BC_CDN_SIGNED_DOCUMENTS=/var/www/cdn/bookcars/signed-documents
BC_CDN_TEMP_SIGNED_DOCUMENTS=/var/www/cdn/bookcars/temp-signed-documents
```

### Mobile (.env)

```bash
API_HOST=http://localhost:4002
ACCESS_TOKEN=
```

## Adding New Integrations

### Backend Integrations

#### Payment Gateways
1. Create wrapper in `backend/src/payment/` (参照 `stripe.ts`, `paypal.ts`)
2. Add routes in `backend/src/routes/` following existing patterns
3. Add controller methods in `backend/src/controllers/`
4. Register routes in `backend/src/app.ts`
5. Update `bookcars-types` with new payment interfaces if needed

**Pattern:**
```typescript
// backend/src/payment/newgateway.ts
import NewGateway from 'newgateway-sdk'
import * as env from '../config/env.config'

const gateway = new NewGateway(env.NEWGATEWAY_API_KEY)
export default gateway
```

#### External APIs (Maps, Weather, Insurance, etc.)
1. Add configuration to `backend/src/config/env.config.ts`
2. Create utility wrapper in `backend/src/utils/` if complex logic needed
3. Add controller endpoints for frontend consumption
4. Example:参照 `ipinfoHelper.ts` for IP geolocation integration

### Frontend (Web) Integrations

#### New UI Components
1. Create component in `frontend/src/components/`
2. Follow existing component patterns (CarList, SearchForm, etc.)
3. Export from component index if applicable
4. Add styles using Emotion (MUI's styled API)

#### New API Services
1. Add service function in `frontend/src/services/`
2. Follow pattern from existing services (`CarService`, `BookingService`, etc.)
3. Use Axios with interceptors for auth tokens

**Pattern:**
```typescript
// frontend/src/services/NewService.ts
import * as env from '@/config/env.config'
import axios from 'axios'

const api = axios.create({ baseURL: env.API_HOST })

export const newEndpoint = async (params: any): Promise<any> => {
  const response = await api.post('/api/new-endpoint', params)
  return response.data
}
```

#### New Pages/Routes
1. Create page in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/Header.tsx` if public
4. Add language strings in `frontend/src/lang/`

### Mobile (React Native) Integrations

#### New Screens
1. Create screen in `mobile/screens/`
2. Add to navigation stack in `mobile/components/DrawerNavigator.tsx`
3. Add localization strings in `mobile/lang/`
4. Follow existing screen patterns (SearchScreen, CheckoutScreen, etc.)

#### Native Module Integration
1. Use Expo modules for most integrations
2. Create native module if needed following Expo documentation
3. Add to `mobile/app.json` if permissions required

**Pattern:**
```typescript
// mobile/services/NewService.ts
import { API_HOST } from 'react-native-dotenv'
import axios from 'axios'

const api = axios.create({ baseURL: API_HOST })

export const newMobileEndpoint = async (data: any): Promise<any> => {
  const response = await api.post('/api/new-endpoint', data)
  return response.data
}
```

### Cross-Platform Considerations

1. **Shared Types:** Update `packages/bookcars-types/index.ts` for cross-app interfaces
2. **Shared Utils:** Add to `packages/bookcars-helper/index.ts` for reusable logic
3. **API Changes:** Ensure backend API serves both web and mobile (JSON responses)
4. **Features:** Test both platforms after changes
5. **Localization:** Add strings to all 3 apps (backend/lang/, frontend/lang/, mobile/lang/)

### Configuration Management

- **Environment Variables:** Add to respective `.env` files
- **Docker:** Update `docker-compose.yml` if new services needed
- **Build Scripts:** Check `package.json` scripts for each app

### Testing

- Backend: `cd backend && npm run test`
- Frontend: `cd frontend && npm run lint`
- Mobile: `cd mobile && npm run lint`
