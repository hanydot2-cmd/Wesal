import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { FEMALE_PROFILES_DATA } from "../data/femaleProfiles";

export async function seedFemaleProfilesIfNeeded(): Promise<{
  addedCount: number;
  totalProfiles: number;
  photosCount: number;
  nationalitiesCount: number;
  approvedCount: number;
  visibleCount: number;
}> {
  let addedCount = 0;
  const uniquePhotos = new Set<string>();
  const uniqueNationalities = new Set<string>();

  for (const profile of FEMALE_PROFILES_DATA) {
    if (!profile.uid) continue;

    if (profile.photoURL) uniquePhotos.add(profile.photoURL);
    if (profile.nationality) uniqueNationalities.add(profile.nationality);

    const docRef = doc(db, "users", profile.uid);
    try {
      // نضع المستند أو نحدثه في مجموعة users
      await setDoc(docRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
        createdAt: profile.createdAt || new Date().toISOString()
      }, { merge: true });
      addedCount++;
    } catch (err) {
      console.warn(`Error seeding profile ${profile.uid}:`, err);
    }
  }

  return {
    addedCount,
    totalProfiles: FEMALE_PROFILES_DATA.length,
    photosCount: uniquePhotos.size,
    nationalitiesCount: uniqueNationalities.size,
    approvedCount: FEMALE_PROFILES_DATA.filter((p) => p.profileStatus === "approved").length,
    visibleCount: FEMALE_PROFILES_DATA.filter((p) => p.visibleInSearch === true).length
  };
}
