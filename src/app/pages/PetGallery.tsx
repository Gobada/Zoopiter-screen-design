import { TopBar } from "../components/TopBar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useParams, useSearchParams } from "react-router";
import { useState } from "react";
import { X } from "lucide-react";

export default function PetGallery() {
  const { petId } = useParams();
  const [searchParams] = useSearchParams();
  const petName = searchParams.get("name") || "펫";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const petsPhotos: Record<string, string[]> = {
    buddy: [
      "https://images.unsplash.com/photo-1637076941297-403290f6d028?w=800",
      "https://images.unsplash.com/photo-1604659554766-e22cd9c7c61f?w=800",
      "https://images.unsplash.com/photo-1625279138836-e7311d5c863a?w=800",
      "https://images.unsplash.com/photo-1688092807693-fd1c1a30c6c1?w=800",
      "https://images.unsplash.com/photo-1714068691210-073dc52c6c1d?w=800",
      "https://images.unsplash.com/photo-1760970901951-92b4d3abaefc?w=800",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800",
    ],
    bappe: [
      "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800",
      "https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800",
      "https://images.unsplash.com/photo-1544568104-5b7eb8189dd4?w=800",
      "https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800",
      "https://images.unsplash.com/photo-1628408891097-f67b8b5c4e31?w=800",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
      "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800",
      "https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800",
      "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800",
    ],
  };

  const photos = petsPhotos[petId as keyof typeof petsPhotos] || petsPhotos.buddy;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pt-14">
      <TopBar type="back" title={`${petName}의 사진 앨범`} />

      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-[20px] font-bold mb-1" style={{ color: "var(--text-1)" }}>
            사진 앨범
          </h2>
          <p className="text-[14px]" style={{ color: "var(--text-2)" }}>
            총 {photos.length}장
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(photo)}
              className="relative aspect-square overflow-hidden rounded-[12px] hover:opacity-90 transition-opacity"
            >
              <ImageWithFallback
                src={photo}
                alt={`${petName} photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Full Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-4xl w-full max-h-[80vh] flex items-center justify-center">
            <ImageWithFallback
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-[12px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
