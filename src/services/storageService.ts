import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * دالة تحويل ملف الصورة إلى Data URL مضغوط في حال عدم توفر خادم Firebase Storage
 */
function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // أقصى أبعاد للصورة لتخفيف الحجم
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("فشل في قراءة ملف الصورة"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("فشل في قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

/**
 * خدمة رفع الصور الشخصية مع دعم الرفع المباشر والتحويل الاحتياطي لضمان نجاح الرفع دائماً
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
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("حجم الصورة كبير جداً. الحد الأقصى المسموح هو 10 ميجابايت.");
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `profileImages/${uid}/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, path);

    const uploadPromise = new Promise<string>((resolve, reject) => {
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
          reject(error);
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

    // مهلة 5 ثوانٍ لـ Storage، إذا لم يستجب ننتقل للنموذج الاحتياطي الضامن لعدم تعطيل المستخدم
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Storage timeout")), 5000)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.warn("Storage upload error or timeout, using base64 image fallback:", err);
    if (onProgress) onProgress(100);
    return await convertImageToBase64(file);
  }
}
