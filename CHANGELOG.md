# Changelog

## [1.2.0] - 2025-07-28

### Added
- **User Profile Page**:
  - Created a new page at `/profile` for users to view their profile information.
  - Added a link to the profile page in the user dropdown menu in the header.

### Fixed
- **Product Loading Issue**:
  - Fixed a bug that prevented products from being displayed on the homepage and admin dashboard.
  - Updated the Supabase RLS policies for the `products` table to allow public read access.
  - Implemented product fetching and display on the admin dashboard's "Products" tab.

## [1.1.0] - 2025-01-22

### Added
- **Authentication System**: Complete user authentication with signup/login
  - Created `/auth/login` and `/auth/signup` pages with form validation
  - Added `AuthModal` component for modal-based authentication
  - Implemented `useAuth` hook for session management
  - Added automatic login prompt after 1 minute for unauthenticated users

- **Enhanced User Experience**:
  - Login requirement for cart and wishlist operations
  - User profile dropdown in header with account management
  - Toast notifications for user feedback
  - Session-based navigation and redirects

- **Admin Product Management**:
  - Created `AddProductModal` component for comprehensive product creation
  - Support for multiple product addition in single operation
  - Product image upload with drag-and-drop interface
  - Delivery options configuration (Lagos/Outside Lagos, Pickup/Door delivery)
  - Discount percentage calculation with real-time price preview
  - Dynamic size and color variant management

### Changed
- **Header Component**: 
  - Integrated authentication state management
  - Added login requirement checks for cart/wishlist access
  - Implemented user dropdown menu with account options
  - Added automatic login prompt modal

- **ProductCard Component**:
  - Added authentication checks for add-to-cart and wishlist actions
  - Enhanced user feedback with toast notifications
  - Improved error handling for unauthenticated users

- **Admin Dashboard**:
  - Connected "Add Product" button to functional modal
  - Enhanced product management capabilities
  - Improved admin workflow with bulk product operations

### Technical Improvements
- **Authentication Flow**: Supabase Auth integration with proper session management
- **Form Validation**: Comprehensive client-side validation for all forms
- **File Uploads**: Integrated Supabase Storage for product images
- **State Management**: Enhanced user state management across components
- **Error Handling**: Improved error handling with user-friendly messages
- **Type Safety**: Added proper TypeScript types for authentication

### Security Enhancements
- **Protected Routes**: Authentication requirements for sensitive operations
- **Session Management**: Proper session handling and cleanup
- **User Permissions**: Basic admin/user role differentiation
- **Secure File Uploads**: Validated file uploads with proper storage policies

### User Interface Improvements
- **Modal System**: Consistent modal design across authentication flows
- **Loading States**: Proper loading indicators for async operations
- **Form UX**: Enhanced form experience with validation feedback
- **Responsive Design**: Mobile-optimized authentication flows
- **Toast System**: Integrated toast notifications for user feedback

### Database Integration
- **User Profiles**: Automatic user profile creation on signup
- **Product Management**: Full CRUD operations for products
- **File Storage**: Product image storage with Supabase Storage
- **Session Tracking**: User session management with Supabase Auth

## [1.0.0] - 2025-01-22

### Added
- **Supabase Integration**: Connected the application to Supabase database
  - Added environment variables for Supabase URL and API key
  - Enhanced `lib/supabase.ts` with proper TypeScript types and error handling
  - Added new database helper functions: `getOrderById`, `searchProducts`, `getProductsByCategory`

### Changed
- **Homepage (`app/page.tsx`)**:
  - Replaced mock data with real Supabase data fetching
  - Added error handling and loading states
  - Implemented proper error recovery with retry functionality

- **Products Page (`app/products/page.tsx`)**:
  - Integrated with Supabase `getProducts()` function
  - Removed hardcoded mock product data
  - Added comprehensive error handling and loading states

- **Admin Dashboard (`app/admin/page.tsx`)**:
  - Connected to real order data from Supabase
  - Implemented proper order status updates
  - Added error handling for failed operations
  - Removed mock order data

- **Order Details Page (`app/orders/[id]/page.tsx`)**:
  - Integrated with `getOrderById()` function
  - Added proper error handling for missing orders
  - Implemented loading states and error recovery

- **Checkout Page (`app/checkout/page.tsx`)**:
  - Fixed order creation flow to use proper Supabase functions
  - Improved error handling during order submission
  - Enhanced payment receipt upload process

### Technical Improvements
- **Type Safety**: Added proper TypeScript return types to all Supabase functions
- **Error Handling**: Implemented comprehensive error handling across all database operations
- **Performance**: Added proper loading states and error recovery mechanisms
- **Database Queries**: Optimized queries with proper filtering and ordering

### Database Schema
- Utilizing existing migration `20250722072838_old_breeze.sql` with:
  - Products table with categories, pricing, and inventory
  - Orders table with customer information and status tracking
  - Categories table for product organization
  - Storage buckets for file uploads (receipts, product images)
  - Row Level Security (RLS) policies for data protection

### Environment Configuration
- **`.env.local`**: Added Supabase configuration
  - `NEXT_PUBLIC_SUPABASE_URL`: Database connection URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key for client-side operations

### Notes
- All mock data has been replaced with real database connections
- The application now requires a properly configured Supabase instance
- Error boundaries and loading states provide better user experience
- Database operations are now type-safe and properly validated