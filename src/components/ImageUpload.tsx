interface ImageUploadProps {
  onImageChange: (file: File) => void;
  currentImageUrl?: string | null;
}

export function ImageUpload({ onImageChange, currentImageUrl }: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {currentImageUrl && (
        <img
          src={currentImageUrl}
          alt="Preview"
          className="w-48 h-48 object-cover rounded-lg"
        />
      )}
      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
        <span>Choose Image</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
} 