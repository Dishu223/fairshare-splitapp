✨ FairShare - Smart Expense Splitter

Live Demo: https://fairshare-splitapp.vercel.app/

FairShare is a modern, full-stack expense tracking application designed for the Indian context. It helps flatmates, travelers, and friends track shared expenses, split bills intelligently, and settle debts without the awkward math.

Built with a focus on Mobile-First Design, Real-Time Synchronization, and UX Simplicity.

🚀 Key Features

🇮🇳 India-First Context: Native support for Rupees (₹) and WhatsApp-based settlement summaries.

🔐 Hybrid Authentication: robust Google Sign-In with a fallback "Guest Mode" for instant access.

💸 Smart Splitting: Support for both Equal splits and Unequal (exact amount) splits for complex bills.

⚡ Real-Time Database: Powered by Firestore, updates appear instantly across all devices without refreshing.

📱 Fully Responsive: A fluid sidebar/drawer architecture that works perfectly on Desktop and Mobile.

🛡️ Safety Features: Soft-delete (Recycle Bin) and confirmation modals to prevent accidental data loss.

🛠️ Tech Stack

Frontend: React.js (Vite), Tailwind CSS

Backend / BaaS: Firebase (Auth, Firestore)

Icons: Lucide React

State Management: React Hooks (Context-free architecture for simplicity)

📸 Screenshots

Dashboard (Desktop)
<img width="1871" height="1006" alt="image" src="https://github.com/user-attachments/assets/40b45cef-09a9-40ff-9b31-22ebe8a27d1b" />

Mobile View

<img width="425" height="923" alt="image" src="https://github.com/user-attachments/assets/4197152d-fb8a-44ae-a32e-c47fa25fcc87" />

<img width="426" height="918" alt="image" src="https://github.com/user-attachments/assets/1fac5f0c-b127-47db-bd85-d61a910b2ba4" />




💡 How It Works

Create a Group: Make a space for "Apartment 404" or "Goa Trip".

Add Members: Add your friends by name.

Track Expenses: Click "+" to add a bill. Choose who paid and how to split it.

Settle Up: The app calculates the net balance. When someone pays you back, record a "Settlement" to clear the debt.

Share: Generate a WhatsApp summary to paste in your group chat.

🏃‍♂️ Running Locally

# 1. Clone the repository
git clone https://github.com/Dishu223/fairshare-splitapp.git

# 2. Install dependencies
npm install

# 3. Create a .env file with your Firebase config
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...

# 4. Run the development server
npm run dev


🔮 Future Roadmap

[ ] Spending Analytics: Visual charts to see expenses by category.

[ ] Export Data: Download expenses as CSV/PDF.

[ ] AI Receipt Scanning: Auto-fill forms by uploading an image.

Built with ❤️ by Divyanshu Sharma
