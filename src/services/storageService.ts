import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * خدمة رفع الصور الشخصية إلى Firebase Storage في مسار profileImages/{uid}/
 */
export async function uploadProfilePhoto(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file) {
    throw new Error("لم يتم اختيار ملف.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("يرجى اختيار ملف صورة صحيح (JPG, PNG, WEBP).");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("حجم الصورة كبير جداً. الحد الأقصى المسموح هو 5 ميجابايت.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const path = `profileImages/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (error) => {
        console.error("Storage Upload Error:", error);
        reject(new Error("حدث خطأ أثناء رفع الصورة إلى خوادم Firebase. يرجى المحاولة لاحقاً."));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
