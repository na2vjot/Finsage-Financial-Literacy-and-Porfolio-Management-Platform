import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  AccessTime,
  Bookmark,
  BookmarkBorder,
  CheckCircle,
  NavigateNext,
  Translate,
} from '@mui/icons-material';
import { syllabusAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import ReactMarkdown from 'react-markdown';

const ContentViewer = ({ moduleId, onBack, onNextModule }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextModule, setNextModule] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Translation state
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(false);
  const translateCalledRef = useRef(false); // prevent double calls

  const { isHindi } = useLanguage();

  const loadCompletionStatus = (id) => {
    const completed = JSON.parse(localStorage.getItem('completedModules') || '[]');
    setIsCompleted(completed.includes(id));
  };

  const findNextModuleInSyllabus = (currentModuleId, syllabus) => {
    const allModules = [];
    Object.keys(syllabus).forEach(sectionKey => {
      const section = syllabus[sectionKey];
      if (section.modules) {
        section.modules.forEach(module => {
          if (module.submodules) {
            module.submodules.forEach(sub => {
              allModules.push({ id: sub.id, title: sub.title, file: sub.file, section: sectionKey });
            });
          } else {
            allModules.push({ id: module.id, title: module.title, file: module.file, section: sectionKey });
          }
        });
      }
    });
    const idx = allModules.findIndex(m => m.file === currentModuleId || m.id === currentModuleId);
    return idx !== -1 && idx < allModules.length - 1 ? allModules[idx + 1] : null;
  };

  const findNextModule = useCallback(async (id) => {
    try {
      const syllabus = await syllabusAPI.getSyllabus();
      setNextModule(findNextModuleInSyllabus(id, syllabus));
    } catch (err) {
      console.error('Failed to find next module:', err);
    }
  }, []);

  const translateContent = useCallback(async (rawContent) => {
    setTranslating(true);
    setTranslationError(false);
    setTranslatedContent(null);
    console.log('🌐 Starting translation, content length:', rawContent.length);

    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawContent }),
      });

      const data = await response.json();
      console.log('✅ Translation response:', data);

      if (data.translated) {
        setTranslatedContent(data.translated);
        console.log('✅ Translation set, length:', data.translated.length);
      } else {
        throw new Error(data.error || 'No translated field in response');
      }
    } catch (err) {
      console.error('❌ Translation failed:', err);
      setTranslationError(true);
      setSnackbar({ open: true, message: 'अनुवाद विफल हुआ। मूल सामग्री दिखाई जा रही है।' });
    } finally {
      setTranslating(false);
    }
  }, []);

  const loadContent = useCallback(async (id) => {
    setLoading(true);
    setTranslatedContent(null);
    setTranslationError(false);
    translateCalledRef.current = false;

    try {
      const data = await syllabusAPI.getContent(id);
      setContent(data);
      loadCompletionStatus(id);
      findNextModule(id);
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [findNextModule]);

  useEffect(() => {
    if (moduleId) loadContent(moduleId);
  }, [moduleId, loadContent]);

  // Trigger translation when: Hindi is ON AND content is loaded AND not already translated/translating
  useEffect(() => {
    if (
      isHindi &&
      content?.content &&
      !translatedContent &&
      !translating &&
      !translateCalledRef.current
    ) {
      translateCalledRef.current = true;
      translateContent(content.content);
    }

    if (!isHindi) {
      setTranslatedContent(null);
      setTranslationError(false);
      translateCalledRef.current = false;
    }
  }, [isHindi, content, translatedContent, translating, translateContent]);

  const toggleBookmark = () => setBookmarked(!bookmarked);

  const handleMarkAsComplete = () => {
    const completed = JSON.parse(localStorage.getItem('completedModules') || '[]');
    if (!completed.includes(moduleId)) {
      completed.push(moduleId);
      localStorage.setItem('completedModules', JSON.stringify(completed));
      setIsCompleted(true);
      setSnackbar({ open: true, message: isHindi ? '✅ मॉड्यूल पूर्ण हो गया!' : '✅ Module marked as complete!' });
      window.dispatchEvent(new CustomEvent('moduleCompleted', { detail: { type: 'MODULE_COMPLETED', moduleId } }));
    } else {
      setSnackbar({ open: true, message: isHindi ? 'मॉड्यूल पहले ही पूर्ण हो चुका है!' : 'Module already completed!' });
    }
  };

  const handleNextLesson = () => {
    if (nextModule && onNextModule) {
      onNextModule(nextModule.file, nextModule);
    } else {
      setSnackbar({ open: true, message: isHindi ? 'कोई अगला मॉड्यूल उपलब्ध नहीं!' : 'No next module available!' });
    }
  };

  // Decide what content to render
  const displayContent = isHindi && translatedContent
    ? translatedContent          // Hindi translated version
    : content?.content;          // Original English

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">{isHindi ? 'सामग्री लोड हो रही है...' : 'Loading content...'}</Typography>
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!content) return <Alert severity="info" sx={{ m: 2 }}>{isHindi ? 'कोई सामग्री उपलब्ध नहीं' : 'No content available'}</Alert>;

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={onBack}><ArrowBack /></IconButton>
            <Typography variant="h6" sx={{ ml: 1 }}>
              {content.file_path.split('/').pop().replace('.md', '').replace(/-/g, ' ').toUpperCase()}
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={toggleBookmark}>
            {bookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>
      </Paper>

      {/* Content */}
      <Paper sx={{ p: 3 }}>
        {/* Status chips */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={isHindi ? 'पढ़ाई' : 'Reading'} size="small" color="primary" />
          <Chip label="10 min read" size="small" icon={<AccessTime sx={{ fontSize: 14 }} />} variant="outlined" />
          {isHindi && translating && (
            <Chip
              icon={<Translate sx={{ fontSize: 14 }} />}
              label="हिंदी में अनुवाद हो रहा है..."
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          {isHindi && translatedContent && !translating && (
            <Chip
              icon={<Translate sx={{ fontSize: 14 }} />}
              label="हिंदी में अनुवादित ✓"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {isHindi && translationError && !translating && (
            <Chip label="अनुवाद विफल - मूल सामग्री" size="small" color="error" variant="outlined" />
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Translation loading overlay */}
        {translating ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress size={48} />
            <Typography variant="h6" color="text.secondary">🌐 हिंदी में अनुवाद हो रहा है...</Typography>
            <Typography variant="body2" color="text.secondary">कृपया प्रतीक्षा करें</Typography>
          </Box>
        ) : (
          <Box sx={{
            '& h1': { color: 'primary.main', mb: 2, mt: 3 },
            '& h2': { color: 'secondary.main', mb: 2, mt: 3 },
            '& h3': { color: 'text.primary', mb: 1, mt: 2 },
            '& p': { mb: 2, lineHeight: 1.6 },
            '& ul, & ol': { mb: 2, pl: 3 },
            '& li': { mb: 1 },
            '& blockquote': { borderLeft: '4px solid', borderColor: 'primary.main', pl: 2, ml: 0, bgcolor: 'grey.50', py: 1, fontStyle: 'italic' },
            '& code': { bgcolor: 'grey.200', px: 1, py: 0.5, borderRadius: 1, fontFamily: 'monospace' },
            '& pre': { bgcolor: 'grey.900', color: 'white', p: 2, borderRadius: 1, overflow: 'auto', '& code': { bgcolor: 'transparent', p: 0 } }
          }}>
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant={isCompleted ? 'outlined' : 'contained'}
            startIcon={isCompleted ? <CheckCircle /> : <PlayArrow />}
            onClick={handleMarkAsComplete}
            color={isCompleted ? 'success' : 'primary'}
          >
            {isCompleted
              ? (isHindi ? 'पूर्ण हो गया ✓' : 'Completed ✓')
              : (isHindi ? 'पूर्ण के रूप में चिह्नित करें' : 'Mark as Complete')}
          </Button>
          <Button variant="outlined" endIcon={<NavigateNext />} onClick={handleNextLesson} disabled={!nextModule}>
            {nextModule
              ? (isHindi ? `अगला: ${nextModule.title}` : `Next: ${nextModule.title}`)
              : (isHindi ? 'अंतिम मॉड्यूल' : 'Last Module')}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ContentViewer;
