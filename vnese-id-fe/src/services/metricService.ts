import axios from 'axios';
const API_BASE_URL = 'http://localhost:8881/api/v1';

export interface IdCardZoneMetric {
  epoch: number;
  train_box_loss: number;
  train_obj_loss: number;
  train_cls_loss: number;
  precision: number;
  recall: number;
  val_box_loss: number;
  val_obj_loss: number;
  val_cls_loss: number;
  created_at: string;
  confusion_matrix_path: string;
  results_path: string;
}

export interface CreateCardZoneMetricData {
  epoch: number;
  train_box_loss: number;
  train_obj_loss: number;
  train_cls_loss: number;
  precision: number;
  recall: number;
  val_box_loss: number;
  val_obj_loss: number;
  val_cls_loss: number;
  created_at: string;
  user_id: number;
}

export const getCardZoneMetrics = async (): Promise<IdCardZoneMetric> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/metrics/card-zone`);
    console.log("Id Card Zone Metric:", response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching card zone metrics:', error);
    throw error;
  }
};

export const createCardZoneMetrics = async (data: CreateCardZoneMetricData): Promise<IdCardZoneMetric> => {
  try {
    console.log("Data:", data);
    const response = await axios.post(`${API_BASE_URL}/metrics/card-zone`, data);
    console.log("Response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating card zone metrics:', error);
    throw error;
  }
};
