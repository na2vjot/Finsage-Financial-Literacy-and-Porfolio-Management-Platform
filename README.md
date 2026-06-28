# 🧠 FinSage - AI-Powered Financial Advisor

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Published Research:** [Finsage: A Financial Literacy and Portfolio Management Platform](https://journals.mriindia.com/index.php/mjret/article/view/2608)  
> *Multidisciplinary Journal of Research in Engineering and Technology (MJRET), Vol. 13, Issue 1, pp. 53–63 | DOI: 10.65521/mjret.v13i1.2608*

FinSage is an intelligent financial advisory chatbot that combines RAG (Retrieval-Augmented Generation) with real-time market data and personalized financial planning. It helps users understand financial concepts, track live market data, and create customized investment plans.

## ✨ Features

- 🤖 **AI-Powered Chatbot**: Conversational financial advisor using Groq's LLM
- 📊 **Real-Time Market Data**: Live stock prices, commodities, currency rates from NSE/BSE
- 📈 **Personalized Financial Planning**: Goal-based investment recommendations
- 🎯 **Portfolio Optimization**: Risk-adjusted asset allocation strategies
- 💾 **Conversation Memory**: Maintains context across multiple messages
- 🔐 **User Authentication**: Secure login/signup with JWT
- 📚 **Learning Modules**: Structured financial education content
- 💬 **Chat History**: Save and manage conversation sessions

## 🏗️ Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │────▶│   Flask API     │────▶│   RAG Engine    │
│   (Port 3000)   │◀────│   (Port 5000)   │◀────│  + Vector DB    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │                       │
                               ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │    MongoDB      │    │     FAISS       │
                       │ (Auth/History)  │    │  (Knowledge)    │
                       └─────────────────┘    └─────────────────┘
```

**Tech Stack:**
- **Backend**: Flask, Python 3.9+
- **Frontend**: React 18, Material-UI
- **AI/ML**: Groq API, Sentence Transformers, FAISS
- **Database**: MongoDB (auth/history), FAISS (vector embeddings)
- **Data Sources**: yfinance for live market data

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- MongoDB account (free tier works)
- Groq API key (free signup at [groq.com](https://groq.com))

### 1. Clone the Repository

```bash
git clone https://github.com/na2vjot/Finsage-Financial-Literacy-and-Porfolio-Management-Platform.git
cd Finsage-Financial-Literacy-and-Porfolio-Management-Platform
```

### 2. Backend Setup

**Create and Activate Virtual Environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

**Install Python Dependencies**

```bash
pip install -r requirements.txt
```

**Configure Environment Variables**

Create a `.env` file in the root directory:

```env
# MongoDB Configuration (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finsage

# JWT Secret (any strong random string)
JWT_SECRET_KEY=your-super-secret-jwt-key-here

# Groq API Key (from https://console.groq.com)
GROQ_API_KEY=gsk_your-groq-api-key-here

# Token expiry (optional)
TOKEN_EXPIRATION_HOURS=24
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run the Application

**Start Backend Server (Terminal 1)**

```bash
# From project root
python api_server.py
```

Expected output:
```
✅ Chatbot initialized successfully
🚀 Starting API server on port 5000...
✅ API server is running on http://localhost:5000
```

**Start Frontend Development Server (Terminal 2)**

```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

### 5. Test the Application

1. Sign Up for a new account
2. Login with your credentials
3. Start chatting with the AI — example prompts:
   - `"What is compound interest?"`
   - `"Show me Reliance share price"`
   - `"I'm 25, earn ₹40,000, can invest ₹15,000 monthly for 10 years to buy a house"`

## 📁 Project Structure

```
finsage-web/
├── api_server.py              # Main Flask API server
├── app.py                     # Streamlit app (alternative UI)
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (create this)
│
├── src/                       # Backend core modules
│   ├── enhanced_rag_engine.py # Main chatbot logic
│   ├── portfolio_advisor_new.py # Financial planning engine
│   ├── vector_db_manager.py   # FAISS vector database
│   ├── financial_data.py      # yfinance integration
│   ├── auth_routes.py         # Authentication endpoints
│   └── user_schema.py         # MongoDB user models
│
├── frontend/                  # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── Auth/          # Login/Signup
│       │   ├── Chat/          # Chat interface
│       │   └── Dashboard/     # User dashboard
│       ├── pages/             # Main pages
│       │   ├── Chat.jsx
│       │   ├── Learn.jsx
│       │   └── Home.jsx
│       └── services/          # API calls
│           └── authAPI.js
│
├── financial corpus/          # Educational content (markdown files)
└── faiss_db/                  # FAISS vector storage (auto-generated)
```

## 🔧 API Endpoints

**Chat**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to chatbot |
| GET | `/api/health` | Health check |

**Authentication**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |

**Syllabus & Content**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/syllabus` | Get learning modules |
| GET | `/api/content/{path}` | Get module content |

## 💡 Key Features Explained

**1. Financial Planning Engine**

The portfolio advisor extracts information from natural language queries:
- Age & Salary: For risk assessment
- Investment Amount: Monthly SIP calculation
- Time Horizon: Future value projection
- Risk Profile: Conservative, Moderate, Aggressive
- Goals: House, retirement, education, etc.

**2. Real-Time Market Data**
- Stocks: Live prices, 52-week highs/lows, market cap
- Indices: Nifty 50, Sensex, Bank Nifty
- Commodities: Gold, silver, crude oil (international + Indian prices)
- Currency: USD/INR, EUR/INR exchange rates

**3. RAG (Retrieval-Augmented Generation)**
- FAISS vector database stores 500+ financial documents
- Sentence Transformers for semantic search
- Groq's LLM for natural responses
- Conversation memory for context retention

## 🧪 Testing the Application

**Test Financial Planning**
```
User: I'm 28 years old, earn ₹50,000 monthly. I can invest ₹20,000 monthly.
      I want to buy a house in 12 years with moderate risk.

AI:   [Generates personalized portfolio with allocation, projected wealth,
      and actionable recommendations]
```

**Test Follow-up Questions**
```
User: What if I want it in 8 years instead?
AI:   [Recalculates with 8-year horizon while keeping other parameters]
```

**Test Market Data**
```
User: What's Reliance share price today?
AI:   [Returns live price, change %, and market cap]
```

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | `netstat -ano \| findstr :5000` then `taskkill /PID <PID> /F` |
| Module not found errors | Run `pip install -r requirements.txt` again |
| MongoDB connection error | Check `.env` URI and whitelist IP in MongoDB Atlas |
| Groq API key invalid | Verify API key at console.groq.com |
| FAISS database empty | Run `python src/markdown_processor.py` to process content |

**Port Conflicts**

```powershell
# Windows PowerShell
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

## 📦 Deployment

**Backend Deployment (Heroku/Railway)**

```bash
# Create Procfile
echo "web: gunicorn api_server:app" > Procfile

# Deploy to Heroku
heroku create finsage-api
git push heroku main
```

**Frontend Deployment (Vercel/Netlify)**

```bash
cd frontend
npm run build
# Deploy the build/ folder to Vercel/Netlify
```

## 📄 Research Paper

This project was published in the **Multidisciplinary Journal of Research in Engineering and Technology (MJRET)**:

> *Finsage: A Financial Literacy and Portfolio Management Platform*  
> MJRET, Vol. 13, Issue 1, pp. 53–63, 2026  
> DOI: [10.65521/mjret.v13i1.2608](https://doi.org/10.65521/mjret.v13i1.2608)  
> [Read the paper →](https://journals.mriindia.com/index.php/mjret/article/view/2608)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 🙏 Acknowledgments

- [Groq](https://groq.com) for providing fast LLM inference
- [yfinance](https://github.com/ranaroussi/yfinance) for market data
- [Sentence Transformers](https://www.sbert.net/) for embeddings
- [FAISS](https://github.com/facebookresearch/faiss) for vector search
- [Material-UI](https://mui.com/) for beautiful components

## 📞 Support

For issues and questions:
- Check [GitHub Issues](https://github.com/na2vjot/Finsage-Financial-Literacy-and-Porfolio-Management-Platform/issues)
- Review API logs in terminal
- Check browser console for frontend errors
