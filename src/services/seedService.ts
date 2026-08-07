import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { FEMALE_PROFILES_DATA } from "../data/femaleProfiles";

export async function seedFemaleProfilesIfNeeded(force: boolean = false): Promise<{
  addedCount: number;
  totalProfiles: number;
  photosCount: number;
  nationalitiesCount: number;
  approvedCount: number;
  visibleCount: number;
}> {
  const SEED_KEY = "wisal_female_profiles_seeded_v3";

  const uniquePhotos = new Set<string>();
  const uniqueNationalities = new Set<string>();
  FEMALE_PROFILES_DATA.forEach((p) => {
    if (p.photoURL) uniquePhotos.add(p.photoURL);
    if (p.nationality) uniqueNationalities.add(p.nationality);
  });

  if (!force && localStorage.getItem(SEED_KEY)) {
    return {
      addedCount: 0,
      totalProfiles: FEMALE_PROFILES_DATA.length,
      photosCount: uniquePhotos.size,
      nationalitiesCount: uniqueNationalities.size,
      approvedCount: FEMALE_PROFILES_DATA.filter((p) => p.profileStatus === "approved").length,
      visibleCount: FEMALE_PROFILES_DATA.filter((p) => p.visibleInSearch === true).length
    };
  }

  let addedCount = 0;
  const batchSize = 10;
  for (let i = 0; i < FEMALE_PROFILES_DATA.length; i += batchSize) {
    const chunk = FEMALE_PROFILES_DATA.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async (profile) => {
        if (!profile.uid) return;
        const docRef = doc(db, "users", profile.uid);
        try {
          await setDoc(
            docRef,
            {
              ...profile,
              updatedAt: new Date().toISOString(),
              createdAt: profile.createdAt || new Date().toISOString()
            },
            { merge: true }
          );
          addedCount++;
        } catch (err) {
          console.warn(`Error seeding profile ${profile.uid}:`, err);
        }
      })
    );
  }

  try {
    localStorage.setItem(SEED_KEY, "true");
  } catch (_) {}

  return {
    addedCount,
    totalProfiles: FEMALE_PROFILES_DATA.length,
    photosCount: uniquePhotos.size,
    nationalitiesCount: uniqueNationalities.size,
    approvedCount: FEMALE_PROFILES_DATA.filter((p) => p.profileStatus === "approved").length,
    visibleCount: FEMALE_PROFILES_DATA.filter((p) => p.visibleInSearch === true).length
  };
}
