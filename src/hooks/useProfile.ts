import { useState, useEffect } from "react";
import { auth, getCloudProfile, saveCloudProfile } from "@/lib/firebase";
import { loadProfile, saveProfile, DEFAULT_PROFILE, type Profile } from "@/lib/avatar";
import { onAuthStateChanged } from "firebase/auth";

export function useProfile() {
  const [profile, setProfileState] = useState<Profile>(loadProfile() || DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && !u.isAnonymous) {
        try {
          const cloud = await getCloudProfile(u.uid);
          if (cloud) {
            const merged = { ...profile, ...cloud };
            setProfileState(merged);
            saveProfile(merged);
          } else {
            await saveCloudProfile(u.uid, profile);
          }
        } catch (err) {
          console.error("Firebase Profile Error:", err);
        }
      }
      setLoading(false);
    });
  }, []);

  const updateProfile = async (newProfile: Profile) => {
    setProfileState(newProfile);
    saveProfile(newProfile);
    if (user && !user.isAnonymous) {
      await saveCloudProfile(user.uid, newProfile);
    }
  };

  return { profile, updateProfile, loading, user };
}
