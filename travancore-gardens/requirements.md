You are a senior full-stack engineer and UI architect.

Build a **modern full-stack ecommerce platform for a plant brand called “Travancore Gardens.”**

The brand sells indoor plants, outdoor plants, rare tropical plants, pots, and gardening accessories across India.

The product should feel like a **premium modern D2C brand website**, similar to high-quality ecommerce stores.

The system must include **customer storefront + admin dashboard**.

---

PROJECT TECH STACK

Framework

* Next.js 15
* App Router
* Server Components
* TypeScript

Styling

* Tailwind CSS
* shadcn/ui
* Radix UI

Libraries

* Framer Motion (animations)
* React Hook Form
* Zod validation
* TanStack Query
* TanStack Table
* Zustand (state management)
* Lucide React icons

Backend

* Supabase
* PostgreSQL
* Supabase Auth

Authentication

* Mobile OTP login using Supabase Auth

Image Storage

* Cloudinary

Images should be uploaded through Cloudinary and stored as URLs in the database.

Image requirements:

* automatic optimization
* responsive images
* WebP format
* lazy loading
* transformation support

---

DATABASE

Use Supabase PostgreSQL.

Tables:

users (managed by Supabase auth)

profiles
addresses
categories
products
product_images
product_variants
carts
cart_items
orders
order_items
payments
shipments
reviews
coupons
invoices

Images stored in:

product_images table

Fields:

* id
* product_id
* image_url (cloudinary url)
* public_id
* is_primary

---

CLOUDINARY IMAGE SYSTEM

Images uploaded via Cloudinary upload widget or API.

Admin dashboard should support:

* drag and drop upload
* multiple images
* automatic compression
* preview before upload

Cloudinary folder structure:

travancore-gardens/
products/
categories/
blog/
banners/

Store Cloudinary public_id for transformations.

---

CUSTOMER WEBSITE PAGES

Home (/)

Sections:

hero section
featured plants
categories grid
new arrivals
best sellers
plant care tips preview
testimonials
newsletter
instagram feed
footer

Shop (/shop)

Features:

product grid
filters
price filter
plant type filter
search
sorting
pagination

Product Page (/product/[slug])

image gallery
variant selector
quantity selector
add to cart
buy now
delivery estimate
plant care instructions
reviews
related plants

Cart (/cart)

cart items
update quantity
remove item
coupon code
order summary
checkout button

Checkout (/checkout)

address selection
add address
shipping method
payment method
order summary

Order Success (/order-success)

order confirmation
invoice download
tracking

User Dashboard (/profile)

tabs:
profile
addresses
orders
wishlist

Orders

/orders
/orders/[id]

Wishlist

/wishlist

Authentication

/login

Mobile OTP login using Supabase.

Blog

/blog
/blog/[slug]

Extra pages

/about
/contact
/faq
/track-order
/plant-care

---

ADMIN DASHBOARD

Admin panel located at:

/admin

Admin Layout

sidebar navigation
topbar
content area

Dashboard

/admin/dashboard

metrics:
revenue
orders
customers
top products
low stock alerts
sales charts

Products

/admin/products

features:
create product
edit product
delete product
variant management
inventory management
upload images to Cloudinary

Categories

/admin/categories

Orders

/admin/orders

features:

order list
filters
order details
update status
assign courier
generate invoice
print packing slip

Bulk Order Processing

/admin/orders/bulk

features:

select multiple orders
bulk print invoices
bulk shipping labels

Customers

/admin/customers

Coupons

/admin/coupons

Inventory

/admin/inventory

Shipping

/admin/shipping

Blog CMS

/admin/blog

Media Library

/admin/media

Reports

/admin/reports

Settings

/admin/settings

sections:

general settings
payment settings
shipping configuration
email templates

---

UI DESIGN SYSTEM

Brand Name:
Travancore Gardens

Primary Color
#2E5E3E

Secondary Color
#3F7D4F

Accent Color
#A6D9B2

Background
#F5FAF6

Typography

Headings:
Inter or Geist

Body:
Inter

Design Style

minimal
nature inspired
soft shadows
rounded cards
clean whitespace
smooth animations

---

REUSABLE COMPONENTS

Navbar
Footer
ProductCard
CategoryCard
CartItem
OrderCard
AddressCard
ReviewCard
AdminSidebar
AdminTopbar
AdminTable
ProductGallery
VariantSelector
QuantitySelector
RatingStars

Use shadcn/ui components where possible.

---

FOLDER STRUCTURE

app
admin
dashboard
products
orders
customers
inventory
shipping
settings

shop
product
cart
checkout
profile
orders
blog

components
lib
hooks
store
styles

---

PERFORMANCE

Use:

server components
optimized images
suspense boundaries
lazy loading
SEO metadata

---

DELIVERABLE

Generate:

full page structure
reusable components
admin dashboard
cloudinary image upload integration
supabase backend integration
responsive design
production ready UI
