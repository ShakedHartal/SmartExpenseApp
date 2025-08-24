from pathlib import Path

readme_content = """
# 📱 Smart Expense Manager

Smart Expense Manager is a mobile app built with React Native that helps users track, categorize, and analyze their expenses using manual inputs, receipt scanning, and AI insights. Designed for intuitive use, it supports both fixed and variable expenses, with smart visualizations and recommendations for saving money.

## ✨ Features

- 🔢 **Manual entry** for recurring (fixed) expenses  
- 📷 **Receipt scanning** with OCR to extract expense data from images  
- 🧠 **AI-powered classification and savings tips** via OpenAI API  
- 📊 **Statistics dashboard** with interactive pie charts  
- 📁 **Cloud data storage** using Firebase Firestore  
- 🔄 **Month picker** to view expenses and insights by month  
- 🌙 **Custom UI theme** with warm tones and a modern, soft visual style  

## 🛠️ Tech Stack

- **React Native** with Expo  
- **Firebase** (Firestore)  
- **OCR**: Google Vision API or Expo's built-in `TextRecognizer`  
- **AI Integration**: OpenAI API for classification and recommendations  
- **Navigation**: React Navigation (with animated transitions)  
- **Charts**: `react-native-chart-kit`  
- **Fonts & Design**: Custom fonts (Google Fonts), themed styling via a central `theme.js` file  

## 🚀 Getting Started

### 1. Clone the repo:
```bash
git clone https://github.com/yourusername/smart-expense-manager.git
cd smart-expense-manager
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Set up your environment:
Create a .env file with the following:

```env
FIREBASE_API_KEY=your_firebase_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_googleapi_key
```

### 4. Start the app:
```bash
npm expo start
```
Scan the QR code with the Expo Go app on your phone or run on an emulator.

## 📁 Folder Structure (simplified)
```bash
/components       → Reusable UI components and theme
/screens          → App screens like Home, Summary, Scan, etc.
/firebase         → Firebase config
/App.js           → App root with navigation
/theme.js         → Centralized color scheme and font styles
```

📸 Screenshots
Add screenshots here once available (Home screen, Statistics, OCR flow, etc.)

## 🧠 Future Improvements:
- Filter/search by category or amount
- Budgeting goals and limits
- Dark mode support
- Multi-language support

## 👩‍💻 Author
Shaked Hartal
B.Sc. in Computer Science
