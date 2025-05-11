import React, { useState, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { extractIdCardInfo, saveIdCardInfo } from '../services/api';

interface ExtractedData {
  id?: string;
  name?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  place_of_birth?: string;
  expire_date?: string;
  image_avt?: string;
}

const EmptyExtractedData: ExtractedData = {
  id: '',
  name: '',
  dob: '',
  gender: '',
  nationality: '',
  address: '',
  place_of_birth: '',
  expire_date: '',
  image_avt: ''
};

const ExtractionPage: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>(EmptyExtractedData);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Chỉ chấp nhận hình ảnh
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh');
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setSuccess(false);
    setExtractedData(EmptyExtractedData);
  };

  const handleExtract = async () => {
    if (!imageFile) {
      setError('Vui lòng chọn hình ảnh CCCD để trích xuất');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Gọi API trích xuất thông tin
      try {
        const extractedInfo = await extractIdCardInfo(imageFile);
        setExtractedData(extractedInfo);
        setSuccess(true);
      } catch (apiError) {
        // Nếu API chưa hoạt động, dùng dữ liệu mẫu cho demo
        console.log('Sử dụng dữ liệu mẫu cho demo', apiError);
        
        // Giả lập delay
        // await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dữ liệu mẫu
        const sampleData: ExtractedData = {
          id: '030203007050',
          name: 'VŨ HỮU ĐỨCccccc',
          dob: '12/06/2003',
          gender: 'Nam',
          nationality: 'Việt Nam',
          address: 'Minh Hòa, Kinh Môn, Hải Dương',
          place_of_birth: 'Thôn Nội, Minh Hòa, Kinh Môn, Hải Dương',
          expire_date: '12/06/2028',
          image_avt: 'http://127.0.0.1:5000/avatar/030203007050_avt.jpg'
        };
        
        setExtractedData(sampleData);
        setSuccess(true);
      }
    } catch (err) {
      console.error('Lỗi khi trích xuất thông tin:', err);
      setError('Có lỗi xảy ra khi trích xuất thông tin. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setExtractedData(EmptyExtractedData);
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyToClipboard = () => {
    try {
      const textToCopy = `
Số CCCD: ${extractedData.id || 'N/A'}
Họ và tên: ${extractedData.name || 'N/A'}
Ngày sinh: ${extractedData.dob || 'N/A'}
Giới tính: ${extractedData.gender || 'N/A'}
Quốc tịch: ${extractedData.nationality || 'N/A'}
Quê quán: ${extractedData.address || 'N/A'}
Nơi thường trú: ${extractedData.place_of_birth || 'N/A'}
Có giá trị đến: ${extractedData.expire_date || 'N/A'}
      `.trim();
      
      navigator.clipboard.writeText(textToCopy);
      alert('Đã sao chép thông tin vào clipboard!');
    } catch (err) {
      console.error('Lỗi khi sao chép vào clipboard:', err);
      setError('Không thể sao chép vào clipboard. Vui lòng thử lại sau.');
    }
  };

  const handleSaveIdCard = async () => {
    if (!extractedData.id) {
      setError('Không có thông tin CCCD để lưu. Vui lòng trích xuất thông tin trước.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // In dữ liệu để kiểm tra trước khi gửi
      console.log('Dữ liệu sẽ gửi đi:', extractedData);

      // Gọi API lưu thông tin CCCD
      await saveIdCardInfo(extractedData);
      
      // Hiển thị thông báo thành công
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Ẩn thông báo sau 3 giây
      
    } catch (error) {
      console.error('Lỗi khi lưu thông tin CCCD:', error);
      setError('Có lỗi xảy ra khi lưu thông tin CCCD. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Trích xuất thông tin CCCD</h1>
        
        {error && (
          <Alert 
            type="error" 
            title="Lỗi" 
            onClose={() => setError(null)}
            className="mb-6"
          >
            {error}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert 
            type="success" 
            title="Đã lưu" 
            onClose={() => setSaveSuccess(false)}
            className="mb-6"
          >
            Thông tin CCCD đã được lưu thành công!
          </Alert>
        )}
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Phần upload ảnh */}
          <Card title="Ảnh CCCD">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex justify-between">
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    Chọn ảnh CCCD
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  
                  {previewUrl && (
                    <Button
                      variant="danger"
                      onClick={handleClearImage}
                      disabled={isLoading}
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              </div>
              
              {previewUrl ? (
                <div className="mt-4 relative border border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="CCCD Preview" 
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '400px' }} 
                  />
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <div className="text-gray-500">
                    Chưa có ảnh nào được chọn
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Hỗ trợ các định dạng JPG, PNG
                  </p>
                </div>
              )}
              
              {previewUrl && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={handleExtract}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Đang trích xuất...' : 'Trích xuất thông tin'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
          
          {/* Phần kết quả trích xuất */}
          <Card title="Kết quả trích xuất">
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ảnh chân dung</label>
                  {extractedData.image_avt ? (
                    <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
                      <img 
                        src={extractedData.image_avt} 
                        alt="Ảnh chân dung" 
                        className="w-full h-auto object-contain max-h-48"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 p-2 bg-gray-50 rounded-md text-center">
                      Chưa có ảnh chân dung
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Số CCCD</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {extractedData.id || 'Chưa có thông tin'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {extractedData.name || 'Chưa có thông tin'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded-md">
                      {extractedData.dob || 'Chưa có thông tin'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded-md">
                      {extractedData.gender || 'Chưa có thông tin'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quốc tịch</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {extractedData.nationality || 'Chưa có thông tin'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quê quán</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {extractedData.address || 'Chưa có thông tin'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nơi thường trú</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {extractedData.place_of_birth || 'Chưa có thông tin'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Có giá trị đến</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {extractedData.expire_date || 'Chưa có thông tin'}
                  </div>
                </div>
              </div>
              
              {/* Các nút hành động */}
              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  disabled={!success}
                  onClick={handleCopyToClipboard}
                >
                  Sao chép
                </Button>
                <Button
                  variant="primary"
                  disabled={!success || isSaving}
                  onClick={handleSaveIdCard}
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExtractionPage; 