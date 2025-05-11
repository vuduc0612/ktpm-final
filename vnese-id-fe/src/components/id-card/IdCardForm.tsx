import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IdCard } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

interface IdCardFormProps {
  initialData?: Partial<IdCard>;
  onSubmit: (values: FormData) => Promise<void>;
  isLoading?: boolean;
}

const IdCardForm = ({ initialData, onSubmit, isLoading = false }: IdCardFormProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.imagePath || null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validationSchema = Yup.object({
    idNumber: Yup.string().required('Số CCCD là bắt buộc'),
    fullName: Yup.string().required('Họ tên là bắt buộc'),
    dateOfBirth: Yup.string().required('Ngày sinh là bắt buộc'),
    gender: Yup.string().required('Giới tính là bắt buộc'),
    nationality: Yup.string().required('Quốc tịch là bắt buộc'),
    placeOfOrigin: Yup.string().required('Quê quán là bắt buộc'),
    placeOfResidence: Yup.string().required('Nơi cư trú là bắt buộc'),
    expiryDate: Yup.string().required('Ngày hết hạn là bắt buộc'),
    issueDate: Yup.string().required('Ngày cấp là bắt buộc'),
    issuePlace: Yup.string().required('Nơi cấp là bắt buộc'),
  });

  const formik = useFormik({
    initialValues: {
      idNumber: initialData?.idNumber || '',
      fullName: initialData?.fullName || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      gender: initialData?.gender || '',
      nationality: initialData?.nationality || 'Việt Nam',
      placeOfOrigin: initialData?.placeOfOrigin || '',
      placeOfResidence: initialData?.placeOfResidence || '',
      expiryDate: initialData?.expiryDate || '',
      issueDate: initialData?.issueDate || '',
      issuePlace: initialData?.issuePlace || '',
      image: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        
        const formData = new FormData();
        
        // Thêm tất cả các trường vào FormData
        Object.keys(values).forEach(key => {
          const value = values[key as keyof typeof values];
          if (value !== null && value !== undefined) {
            formData.append(key, value instanceof File ? value : String(value));
          }
        });
        
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
        setSubmitError('Đã xảy ra lỗi khi lưu thông tin CCCD. Vui lòng thử lại.');
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('image', file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {submitError && (
        <Alert type="error" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Số CCCD"
          name="idNumber"
          value={formik.values.idNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.idNumber && formik.errors.idNumber}
          disabled={isLoading}
        />

        <Input
          label="Họ và tên"
          name="fullName"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fullName && formik.errors.fullName}
          disabled={isLoading}
        />

        <Input
          label="Ngày sinh"
          name="dateOfBirth"
          type="date"
          value={formik.values.dateOfBirth}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
          disabled={isLoading}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giới tính
          </label>
          <select
            name="gender"
            value={formik.values.gender}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            disabled={isLoading}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
          {formik.touched.gender && formik.errors.gender && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.gender}</p>
          )}
        </div>

        <Input
          label="Quốc tịch"
          name="nationality"
          value={formik.values.nationality}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.nationality && formik.errors.nationality}
          disabled={isLoading}
        />

        <Input
          label="Quê quán"
          name="placeOfOrigin"
          value={formik.values.placeOfOrigin}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.placeOfOrigin && formik.errors.placeOfOrigin}
          disabled={isLoading}
        />

        <Input
          label="Nơi cư trú"
          name="placeOfResidence"
          value={formik.values.placeOfResidence}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.placeOfResidence && formik.errors.placeOfResidence}
          disabled={isLoading}
        />

        <Input
          label="Ngày cấp"
          name="issueDate"
          type="date"
          value={formik.values.issueDate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.issueDate && formik.errors.issueDate}
          disabled={isLoading}
        />

        <Input
          label="Ngày hết hạn"
          name="expiryDate"
          type="date"
          value={formik.values.expiryDate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.expiryDate && formik.errors.expiryDate}
          disabled={isLoading}
        />

        <Input
          label="Nơi cấp"
          name="issuePlace"
          value={formik.values.issuePlace}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.issuePlace && formik.errors.issuePlace}
          disabled={isLoading}
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ảnh căn cước công dân
        </label>
        <div className="flex items-center space-x-6">
          <div className="w-40 h-48 border-2 border-gray-300 border-dashed rounded-md overflow-hidden flex items-center justify-center">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-sm text-center px-2">
                Chưa có ảnh
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label className="btn btn-secondary inline-block cursor-pointer">
              <span>Chọn ảnh</span>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG hoặc GIF
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!formik.isValid || !formik.dirty}
        >
          {initialData?.id ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};

export default IdCardForm; 