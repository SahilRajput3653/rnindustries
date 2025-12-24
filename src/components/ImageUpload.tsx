import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type ImageUploadProps = {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
};

export function ImageUpload({ images, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Create unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        toast.success(`${newUrls.length} image(s) uploaded`);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = async (urlToRemove: string) => {
    try {
      // Extract filename from URL
      const urlParts = urlToRemove.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error } = await supabase.storage
        .from("product-images")
        .remove([fileName]);

      if (error) {
        console.error("Delete error:", error);
      }

      // Update local state
      onChange(images.filter((url) => url !== urlToRemove));
      toast.success("Image removed");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  return (
    <div className="space-y-4">
      <Label>Product Images ({images.length}/{maxImages})</Label>
      
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(url)}
              >
                <X className="h-4 w-4" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <Label htmlFor="image-upload">
            <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-2 text-center">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload images</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP up to 5MB each
                    </p>
                  </>
                )}
              </div>
            </div>
          </Label>
        </div>
      )}
    </div>
  );
}
