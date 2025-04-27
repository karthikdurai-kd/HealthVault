# 🏥 HealthVault - Personal Healthcare Management System

HealthVault is a comprehensive healthcare management application that helps users track their medical records, manage doctor appointments, monitor health metrics, and get AI-powered health assistance in one centralized platform.

## 🌟 Features

### 👨‍⚕️ Doctor Management
- Add and manage healthcare providers
- Track doctor specialties and contact information
- View doctor visit history
- Delete doctors with associated appointments

### 📅 Appointment Tracking
- Schedule and manage medical appointments
- View upcoming appointments
- Track appointment status
- Automatic appointment cleanup when doctor is removed

### 📊 Health Metrics
- Log and monitor vital health parameters
- Support for multiple metric types:
  - Blood Pressure
  - Blood Sugar
  - Weight
  - Cholesterol
  - Hemoglobin
  - Creatinine
  - Heart Rate
  - Oxygen Saturation
- Export health metrics data

### 🤖 AI Health Assistant
- Interactive chat interface for health-related queries
- Real-time AI responses powered by OpenAI GPT-4
- Intelligent health topic validation system:
  - Comprehensive medical terminology detection
  - Automatic non-health topic filtering
  - Context-aware follow-up handling
- Rich text formatting with Markdown support:
  - Structured medical information
  - Emphasis for important details
  - Headers for organized responses
- User-friendly interface:
  - Error handling and recovery
  - Auto-scroll to latest messages

## 📊 Data Visualization

### Charts and Metrics Tracking
Used D3.js for powerful and interactive data visualization, particularly in the Health Metrics section.

#### Health Metrics Chart Features
- **Interactive Charts**
  - Smooth animations and transitions
  - Interactive tooltips showing detailed data points
  - Responsive design that adapts to container size

- **Time Range Filtering**
  - Week view 
  - Month view 
  - Year view
  - All-time view

- **Data Processing**
  - Automatic date normalization
  - Timezone handling
  - Value aggregation for longer time periods

## 🛠 Technology Stack

### Frontend
- **React** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Lucide Icons** - Icon System
- **D3.js** - Chart library

### Backend & Database
- **Supabase** 
  - Database
  - Authentication
  - Real-time Updates
  - Row Level Security

### AI Integration
- **OpenAI** - GPT-4 API for intelligent health responses
- **Supabase Edge Functions** - Secure API key handling and request processing

### State Management
- **TanStack Query**
   - Server State Management
   - Manages data fetching and caching
   - Automatic background refetching


## 📦 Project Structure

```text
src/
├── components/
│   ├── doctors/
│   ├── forms/
│   ├── layout/
│   ├── metrics/
│   └── ui/
├── hooks/
├── integrations/
│   └── supabase/
├── pages/
└── styles/
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI account with API access


### Installation

1. Clone the repository
```bash
git clone git@github.com:karthikdurai-kd/HealthVault.git
cd HealthVault
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Add your Supabase and OpenAI credentials to the `.env` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```



