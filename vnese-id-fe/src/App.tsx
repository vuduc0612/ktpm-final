import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { TrainingProvider } from './contexts/TrainingContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TrainingPage from './pages/TrainingPage';
import TrainingResultsPage from './pages/TrainingResultsPage';
import ExtractionPage from './pages/ExtractionPage';
import TextRecognitionTrainingPage from './pages/TextRecognitionTrainingPage';
import TextRecognitionResultsPage from './pages/TextRecognitionResultsPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TrainingProvider>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/training/results" element={<TrainingResultsPage />} />
                <Route path="/training/text-recognition" element={<TextRecognitionTrainingPage />} />
                <Route path="/training/text-recognition/results" element={<TextRecognitionResultsPage />} />
                <Route path="/extraction" element={<ExtractionPage />} />
              </Route>
            </Routes>
          </Layout>
        </TrainingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
