import axios from 'axios';
import { API_URL } from '../config';

export interface ModelStats {
  totalModels: number;
  bestPrecision: number;
  bestRecall: number;
  modelTypeDistribution: {
    [key: string]: number;
  };
}

export interface ModelMetrics {
  id: string;
  modelId: string;
  epoch: number;
  precision: number;
  recall: number;
  trainBoxLoss: number;
  trainObjLoss: number;
  valBoxLoss: number;
  valObjLoss: number;
  valClsLoss: number;
  createdAt: string;
}

export interface ModelDetail {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  metrics: ModelMetrics;
  params: {
    imgSize: number;
    batchSize: number;
    learningRate: number;
    epochs: number;
    datasetPath: string;
    pretrainedModelPath?: string;
  };
}

export const modelStatisticsService = {
  // Lấy thống kê tổng quan
  getOverallStats: async (): Promise<ModelStats> => {
    const response = await axios.get(`${API_URL}/statistics/overall`);
    return response.data;
  },

  // Lấy danh sách mô hình với filter
  getModels: async (filters?: {
    modelType?: string;
    startDate?: string;
    endDate?: string;
    minPrecision?: number;
    minRecall?: number;
  }): Promise<ModelDetail[]> => {
    const response = await axios.get(`${API_URL}/models`, { params: filters });
    return response.data;
  },

  // Lấy metrics theo thời gian của một mô hình
  getModelMetricsHistory: async (modelId: string): Promise<ModelMetrics[]> => {
    const response = await axios.get(`${API_URL}/models/${modelId}/metrics-history`);
    return response.data;
  },

  // Lấy chi tiết một mô hình
  getModelDetail: async (modelId: string): Promise<ModelDetail> => {
    const response = await axios.get(`${API_URL}/models/${modelId}`);
    return response.data;
  }
}; 