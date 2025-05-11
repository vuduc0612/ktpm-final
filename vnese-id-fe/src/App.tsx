import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { TrainingProvider } from './contexts/TrainingContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TrainingPage from './pages/TrainingPage';
import TrainingResultsPage from './pages/TrainingResultsPage';
import ExtractionPage from './pages/ExtractionPage';
import TextRecognitionTrainingPage from './pages/TextRecognitionTrainingPage';
import TextRecognitionResultsPage from './pages/TextRecognitionResultsPage';

function App() {
  return (
    <BrowserRouter>
        <TrainingProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
             
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/training/results" element={<TrainingResultsPage />} />
              <Route path="/training/text-recognition" element={<TextRecognitionTrainingPage />} />
              <Route path="/training/text-recognition/results" element={<TextRecognitionResultsPage />} />
              <Route path="/extraction" element={<ExtractionPage />} />
              
            </Routes>
          </Layout>
        </TrainingProvider>
    </BrowserRouter>
  );
}

export default App;
