import { IdCard, TrainingData, TrainingStatus, ExtractionResult } from '../types';

// Mock data cho thẻ căn cước
export const mockIdCards: IdCard[] = [
  {
    id: '1',
    idNumber: '001098012345',
    fullName: 'Nguyễn Văn An',
    dateOfBirth: '1990-05-15',
    gender: 'Nam',
    nationality: 'Việt Nam',
    placeOfOrigin: 'Hà Nội',
    placeOfResidence: 'Số 123 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
    expiryDate: '2030-05-15',
    issueDate: '2020-05-15',
    issuePlace: 'Cục Cảnh sát ĐKQL Cư trú và DLQG về Dân cư',
    imagePath: 'https://plus.unsplash.com/premium_photo-1681426564971-5d2b13ccc305?q=80&w=870&auto=format&fit=crop',
    createdAt: '2023-01-15T08:30:00Z',
    updatedAt: '2023-01-15T08:30:00Z',
  },
  {
    id: '2',
    idNumber: '001200012345',
    fullName: 'Trần Thị Bình',
    dateOfBirth: '1992-07-22',
    gender: 'Nữ',
    nationality: 'Việt Nam',
    placeOfOrigin: 'Thành phố Hồ Chí Minh',
    placeOfResidence: 'Số 456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    expiryDate: '2032-07-22',
    issueDate: '2022-07-22',
    issuePlace: 'Cục Cảnh sát ĐKQL Cư trú và DLQG về Dân cư',
    imagePath: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=761&auto=format&fit=crop',
    createdAt: '2023-02-20T10:15:00Z',
    updatedAt: '2023-02-20T10:15:00Z',
  },
  {
    id: '3',
    idNumber: '001299012345',
    fullName: 'Lê Văn Cường',
    dateOfBirth: '1985-12-10',
    gender: 'Nam',
    nationality: 'Việt Nam',
    placeOfOrigin: 'Đà Nẵng',
    placeOfResidence: 'Số 789 Đường Bạch Đằng, Quận Hải Châu, Đà Nẵng',
    expiryDate: '2033-12-10',
    issueDate: '2023-01-10',
    issuePlace: 'Cục Cảnh sát ĐKQL Cư trú và DLQG về Dân cư',
    imagePath: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=774&auto=format&fit=crop',
    createdAt: '2023-03-05T14:45:00Z',
    updatedAt: '2023-03-05T14:45:00Z',
  },
];

// Mock data cho dữ liệu huấn luyện
export const mockTrainingData: TrainingData[] = [
  {
    id: '1',
    imagePath: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=774&auto=format&fit=crop',
    boundingBox: {
      x: 50,
      y: 100,
      width: 300,
      height: 200
    },
    corners: {
      topLeft: { x: 50, y: 100 },
      topRight: { x: 350, y: 100 },
      bottomLeft: { x: 50, y: 300 },
      bottomRight: { x: 350, y: 300 }
    },
    isLabeled: true,
    createdAt: '2023-04-10T09:20:00Z'
  },
  {
    id: '2',
    imagePath: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=774&auto=format&fit=crop',
    boundingBox: {
      x: 75,
      y: 120,
      width: 280,
      height: 180
    },
    corners: {
      topLeft: { x: 75, y: 120 },
      topRight: { x: 355, y: 120 },
      bottomLeft: { x: 75, y: 300 },
      bottomRight: { x: 355, y: 300 }
    },
    isLabeled: true,
    createdAt: '2023-04-12T11:30:00Z'
  },
  {
    id: '3',
    imagePath: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=880&auto=format&fit=crop',
    boundingBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    isLabeled: false,
    createdAt: '2023-04-15T14:45:00Z'
  },
  {
    id: '4',
    imagePath: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=774&auto=format&fit=crop',
    boundingBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    isLabeled: false,
    createdAt: '2023-04-18T16:20:00Z'
  },
];

// Mock data cho trạng thái huấn luyện
export const mockTrainingStatus: TrainingStatus = {
  status: 'completed',
  progress: 100,
  message: 'Huấn luyện hoàn tất',
  modelId: 'model-2023-05-01',
  startTime: '2023-05-01T08:00:00Z',
  endTime: '2023-05-01T09:30:00Z'
};

// Mock data cho các mô hình có sẵn
export const mockAvailableModels: string[] = [
  'model-2023-04-15',
  'model-2023-05-01',
  'model-2023-05-20'
];

// Mock data cho kết quả trích xuất
export const mockExtractionResult: ExtractionResult = {
  idNumber: '001098012345',
  fullName: 'Nguyễn Văn An',
  dateOfBirth: '1990-05-15',
  gender: 'Nam',
  nationality: 'Việt Nam',
  placeOfOrigin: 'Hà Nội',
  placeOfResidence: 'Số 123 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
  expiryDate: '2030-05-15',
  issueDate: '2020-05-15',
  issuePlace: 'Cục Cảnh sát ĐKQL Cư trú và DLQG về Dân cư',
  confidence: 0.92
}; 