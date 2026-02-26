# 🧠 FinSage - Financial Literacy Platform

A comprehensive financial literacy platform with AI-powered chatbot and structured learning modules.

## 🏗️ Architecture

**Hybrid Approach**: Streamlit Backend + React Frontend

- **Backend**: Streamlit with Flask API server
- **Frontend**: React with Material-UI
- **Database**: FAISS/ChromaDB for vector storage
- **AI**: Groq API for intelligent responses

## 🚀 Quick Start

### 1. Setup Backend

```bash
# Navigate to project directory
cd "finsage with yfin - Copy"

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
GROQ_API_KEY=your_groq_api_key_here

# Start the backend server
python api_server.py
```

The backend will run on:
- **Streamlit**: http://localhost:8501
- **API Server**: http://localhost:5000

### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm start
```

The frontend will run on: http://localhost:3000

## 📁 Project Structure

```
finsage with yfin - Copy/
├── api_server.py              # Main backend server (Streamlit + Flask API)
├── src/                       # Chatbot engine components
│   ├── enhanced_rag_engine.py
│   ├── vector_db_manager.py
│   └── markdown_processor.py
├── financial corpus/          # Learning content
├── frontend/                  # React frontend
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Chat/
│       │   └── Layout/
│       ├── pages/
│       └── services/
└── requirements.txt
```

## 🔌 API Endpoints

### Chat API
```
POST /api/chat
{
  "message": "What is compound interest?"
}

Response:
{
  "answer": "Compound interest is...",
  "timestamp": 1234567890
}
```

### Syllabus API
```
GET /api/syllabus

Response: Complete syllabus structure with modules and lessons
```

### Health Check
```
GET /api/health

Response:
{
  "status": "healthy",
  "chatbot_ready": true
}
```

## 🎯 Features

### 📚 Learning Modules
- **Financial Basics**: Money concepts, banking fundamentals
- **Personal Finance**: Budgeting, saving, debt management
- **Investments**: Stocks, mutual funds, portfolio management
- **Life Stage Content**: Tailored for students, professionals, seniors

### 🤖 AI Chatbot
- Real-time financial assistance
- Context-aware responses
- Integration with financial knowledge base

### 🎨 Modern UI
- Material-UI components
- Responsive design
- Interactive learning progress tracking

## 🛠️ Development

### Backend Development
- The `api_server.py` runs both Streamlit and Flask API
- Chatbot components are in the `src/` directory
- Vector database stores processed financial content

### Frontend Development
- React components in `frontend/src/`
- API integration via `services/api.js`
- Material-UI for consistent styling

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
GROQ_API_KEY=your_groq_api_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
```

### Database Setup
1. Ensure financial content is in `financial corpus/`
2. Run the backend to automatically populate vector database
3. Check API health at http://localhost:5000/api/health

## 📱 Usage

1. **Start Learning**: Browse syllabus modules on the Learn page
2. **Ask Questions**: Use the AI chatbot for personalized help
3. **Track Progress**: Monitor your learning journey
4. **Explore Topics**: Navigate through different financial concepts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both backend and frontend
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
- Check Python dependencies: `pip install -r requirements.txt`
- Verify environment variables in `.env` file
- Check port availability (5000, 8501)

**Frontend not connecting:**
- Ensure backend is running on port 5000
- Check CORS configuration in `api_server.py`
- Verify React proxy settings in `package.json`

**Chatbot not responding:**
- Check Groq API key validity
- Verify vector database has documents
- Check API server logs for errors

### Port Conflicts
If ports are occupied:
```bash
# Kill processes on ports 5000 and 8501
netstat -ano | findstr :5000
netstat -ano | findstr :8501
taskkill /PID <PID> /F
```

## 📞 Support

For issues and questions:
1. Check this README
2. Review API documentation
3. Check browser console for frontend errors
4. Review backend logs for API errors
