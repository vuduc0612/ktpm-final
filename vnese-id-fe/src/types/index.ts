export interface IdCard {
  id: string;
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ';
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string;
  issueDate: string;
  issuePlace: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
}


export interface TrainingParams {
  batchSize?: number;
  epochs?: number;
  learningRate?: number;
  modelName?: string;
  pretrainedWeights?: string;
  datasetPath?: string;
  validationSplit?: number;
  augmentation?: boolean;
}

export interface TrainingConfig {
  batchSize: number;
  epochs: number;
  learningRate: number;
  modelName: string;
  datasetPath: string;
  pretrainedWeightPath?: string;
}

export interface TrainingStatus {
  status: 'idle' | 'training' | 'completed' | 'failed';
  progress: number;
  message: string;
  modelId?: string;
  startTime?: string;
  endTime?: string;
}

export interface ExtractionResult {
  idNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  placeOfOrigin?: string;
  placeOfResidence?: string;
  expiryDate?: string;
  issueDate?: string;
  issuePlace?: string;
  confidence: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface TextRecogniteMetrics {
  accuracy: number;
  wordRecognized: number;
  wordMissed: number;
  confidenceScore: number;
  falsePositive: number;
  falseNegative: number;
  user: User;
} 