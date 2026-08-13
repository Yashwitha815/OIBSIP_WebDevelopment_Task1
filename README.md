# 🍕 PizzaVerse

## Full-Stack Pizza Ordering & Inventory Management System

PizzaVerse is a full-stack pizza ordering and management web application developed as part of the **OIB-SIP Web Development & Designing Internship**.

The application provides a complete pizza ordering experience for customers and an administrative system for managing orders, pizza recipes, and inventory.

One of the key features of the project is the integration between **customer orders, pizza recipes, and inventory management**. When an order is marked as **Delivered**, the ingredients required for the ordered pizzas are automatically deducted from the available inventory according to their configured recipes.

---

## 📌 Project Overview

PizzaVerse allows customers to browse pizzas, create an account, verify their email, log in securely, add pizzas to their cart, place orders, manage their profile, and track their orders.

The application also provides an Admin Dashboard where administrators can manage customer orders, update order statuses, manage inventory items, and configure recipes for individual pizzas.

The inventory system is connected with the pizza recipe system so that the required ingredients can be deducted automatically after an order is successfully delivered.

---

## 🎯 Project Objectives

The main objectives of PizzaVerse are:

- To develop a complete full-stack pizza ordering web application.
- To implement secure customer authentication.
- To provide email verification during registration.
- To implement JWT-based authorization.
- To provide cart and checkout functionality.
- To allow customers to manage their profiles and addresses.
- To provide order tracking.
- To provide an administrative dashboard.
- To manage pizza recipes and their ingredients.
- To manage inventory items and stock levels.
- To automatically deduct ingredient stock after an order is delivered.

---

# ✨ Features

## 👤 Customer Features

### Authentication

- Customer registration
- Email verification
- Customer login
- JWT-based authentication
- Protected customer routes
- Role-based access
- Forgot password functionality
- Password reset functionality

### Profile Management

Customers can:

- View their profile
- View their registered email
- Check email verification status
- Update their name
- Update their phone number
- Update their address
- Save profile changes
- View updated information after refreshing the page

### Pizza Menu

Customers can:

- Browse available pizzas
- View pizza names
- View pizza descriptions
- View prices
- View pizza categories
- Add pizzas to the cart

### Cart

Customers can:

- Add pizzas
- Increase item quantity
- Decrease item quantity
- Remove items
- View cart contents
- View total amount
- Proceed to checkout

### Checkout

Customers can:

- Review their order
- Provide delivery information
- Confirm their order
- Place an order successfully

### Orders

Customers can:

- View their previous orders
- View order details
- Track order status

---

# 👨‍💼 Admin Features

The Admin Dashboard provides administrative functionality for managing the pizza ordering system.

## Admin Authentication

- Admin login
- Protected admin routes
- Admin authorization

## Order Management

Administrators can:

- View customer orders
- View order details
- Update order status
- Manage the order workflow

The order workflow is:

Order Received
      ↓
Preparing
      ↓
Out for Delivery
      ↓
Delivered

🍕 Pizza Recipe Management

PizzaVerse provides a dedicated pizza recipe management system for administrators.

Each pizza can have a recipe containing the inventory ingredients required to prepare that pizza.

For example, the Margherita pizza recipe can contain:

Pizza Bases   → 1 piece
Cheese        → 1 unit
Tomatoes      → 0.1 kg
Oregano       → 0.005 kg
Pizza Boxes   → 1 piece

The administrator can:

View pizza recipes
Create a recipe
Select inventory ingredients
Specify ingredient quantities
Update recipes
Delete recipes

Each pizza is connected to its corresponding recipe through its Pizza ID.

📦 Inventory Management

The Admin Dashboard contains an inventory management section.

Administrators can:

View inventory items
Add inventory items
Edit inventory items
Delete inventory items
View current stock quantity
Set low-stock thresholds
Monitor stock status

Example inventory items include:

BBQ Chicken
BBQ Sauce
Black Olives
Capsicum
Cheddar Cheese
Cheese
Cheese Sauce
Chicken
Chicken Sausage
Chicken Tikka
Chilli Flakes
Chilli Sauce
Jalapenos
Large Pizza Boxes
Mayonnaise
Mushrooms
Olives
Onions
Oregano
Paneer
Parmesan Cheese
Pepperoni
Pineapple
Pizza Bases
Pizza Boxes
Pizza Packaging Bags
Sauces
Small Pizza Boxes
Sweet Corn
Tomatoes
Vegetables

🔄 Pizza Recipe & Inventory Integration

One of the major features of PizzaVerse is the connection between:

Pizza
   ↓
Pizza Recipe
   ↓
Ingredients
   ↓
Customer Order
   ↓
Order Delivered
   ↓
Inventory Deduction

When a customer orders a pizza, the system can identify the recipe associated with that pizza.

The recipe contains the inventory items and the quantity of each ingredient required for one pizza.

When the order reaches the Delivered status, the required quantities are deducted from the corresponding inventory items.

For example:

Margherita Recipe

Pizza Bases → 1 piece
Cheese      → 1 unit
Tomatoes    → 0.1 kg
Oregano     → 0.005 kg
Pizza Boxes → 1 piece

If one Margherita pizza is delivered, the corresponding stock is reduced by the configured quantities.

If two Margherita pizzas are delivered:

Pizza Bases → -2 pieces
Cheese      → -2 units
Tomatoes    → -0.2 kg
Oregano     → -0.01 kg
Pizza Boxes → -2 pieces

This creates an integration between the customer ordering system and the administrative inventory system.

🚚 Order-to-Inventory Workflow

The complete workflow is:

Customer
   │
   ▼
Browse Menu
   │
   ▼
Add Pizza to Cart
   │
   ▼
Checkout
   │
   ▼
Place Order
   │
   ▼
Admin Receives Order
   │
   ▼
Preparing
   │
   ▼
Out for Delivery
   │
   ▼
Delivered
   │
   ▼
Find Pizza Recipe
   │
   ▼
Find Required Ingredients
   │
   ▼
Calculate Required Quantities
   │
   ▼
Deduct Inventory Stock

Inventory is therefore updated based on the actual pizzas delivered.

🔐 Authentication & Security

The application uses authentication and authorization mechanisms to protect user and administrator functionality.

The authentication system includes:

JWT-based authentication
Password hashing
Protected routes
Role-based authorization
Customer authentication
Admin authentication
Email verification
Password reset functionality

Customer-only pages are protected from unauthenticated access.

Administrative functionality is protected separately using administrator authorization.

📧 Email Verification

New customers are required to verify their email address during registration.

The verification workflow is:

Register Account
       ↓
Verification Email
       ↓
Open Verification Link
       ↓
Verify Email
       ↓
Account Verified
       ↓
Login

The verification system uses a verification token associated with the user account.

🔑 Forgot Password

PizzaVerse also provides a password recovery workflow.

Forgot Password
       ↓
Enter Registered Email
       ↓
Receive Reset Link
       ↓
Open Reset Link
       ↓
Create New Password
       ↓
Login

Password reset tokens are handled by the backend and have an expiration mechanism.

🛒 Cart & Checkout Workflow

The customer ordering workflow is:

Menu
 ↓
Select Pizza
 ↓
Add to Cart
 ↓
Review Cart
 ↓
Checkout
 ↓
Confirm Order
 ↓
Order Created

The customer can review the order before confirming the purchase.

👤 Customer Profile Workflow

The profile functionality works as follows:

Login as Customer
      ↓
Open My Profile
      ↓
Profile Data Loaded
      ↓
View Name / Email / Verification
      ↓
Edit Profile
      ↓
Change Name / Phone / Address
      ↓
Save Changes
      ↓
Refresh Page
      ↓
Updated Information Remains

Profile information is stored in MongoDB and retrieved again when the profile is loaded.

🛠️ Technology Stack
Frontend
React.js
JavaScript
HTML5
CSS3
React Router
Axios
Backend
Node.js
Express.js
JavaScript
Database
MongoDB
Mongoose
Authentication
JSON Web Token (JWT)
Password hashing
Email verification
Role-based authorization
Development Tools
Visual Studio Code
Git
GitHub
npm
MongoDB
🏗️ Application Architecture

PizzaVerse follows a client-server architecture.

                    ┌──────────────────────┐
                    │       CUSTOMER       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    REACT FRONTEND    │
                    │       CLIENT         │
                    └──────────┬───────────┘
                               │
                         HTTP / REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │   NODE + EXPRESS     │
                    │      BACKEND         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MONGODB        │
                    │       DATABASE       │
                    └──────────────────────┘


                    ┌──────────────────────┐
                    │        ADMIN         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   ADMIN DASHBOARD    │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
              ORDERS        RECIPES       INVENTORY
                               │
                               └──────► STOCK DEDUCTION
📁 Project Structure
OIBSIP_WebDevelopment_Task1/
│
├── client/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   │
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── ...
│   └── package.json
│
├── .gitignore
└── README.md

⚙️ Installation & Setup
1. Clone the Repository
git clone https://github.com/Yashwitha815/OIBSIP_WebDevelopment_Task1.git

Move into the project directory:

cd OIBSIP_WebDevelopment_Task1
2. Install Frontend Dependencies
cd client
npm install
3. Install Backend Dependencies

Open another terminal and navigate to the server:

cd server
npm install
🔧 Environment Variables

Create the required environment configuration for the backend.

Example:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password

Use the actual variable names required by the project configuration.

⚠️ Security

Do not upload:

MongoDB credentials
JWT secrets
Email passwords
API keys
Other private credentials

to GitHub.

Use a .env file and make sure it is included in .gitignore.

▶️ Running the Application
Start Backend

Navigate to the server directory:

cd server

Then run the backend using the project's configured development command.

For example:

npm run dev
Start Frontend

Open another terminal:

cd client

Then run:

npm run dev

The frontend will be available at the local development URL provided by Vite.

🧪 Testing

The following major application workflows were tested during development.

Customer Authentication
 Customer registration
 Email verification
 Customer login
 JWT authentication
 Protected routes
 Forgot password
 Password reset
Customer Functionality
 Home page
 Menu
 Pizza browsing
 Cart
 Checkout
 Order placement
 Customer profile
 Profile editing
 Order history
 Order tracking
 Admin Functionality
 Admin login
 Admin dashboard
 Order management
 Order status updates
 Inventory management
 Pizza recipe management
 Inventory Integration
 Pizza recipe creation
 Ingredient selection
 Ingredient quantity configuration
 Pizza-to-recipe connection
 Order-to-recipe connection
 Inventory deduction after delivery
 Updated inventory quantities
 
📸 Screenshots

Screenshots of the application can be added to this section to demonstrate the implemented features.
