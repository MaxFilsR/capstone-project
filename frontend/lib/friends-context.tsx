import React, { createContext, useContext, useState, useEffect } from "react";
import { getFriends, updateFriends, FriendSummary } from "@/api/endpoints";
import { useAuth } from "@/lib/auth-context";

type FriendsContextType = {
  friends: FriendSummary[];
  loading: boolean;
  error: string | null;
  refreshFriends: () => Promise<void>;
  addFriend: (friendId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
};

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    if (!user) {
      setFriends([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getFriends();
      setFriends(data);
    } catch (err: any) {
      console.error("Error fetching friends:", err);
      setError(err?.response?.data?.message || "Failed to fetch friends");
    } finally {
      setLoading(false);
    }
  };

  // Add a friend and refresh the list
  const addFriend = async (friendId: number) => {
    try {
      setError(null);
      const currentFriendIds = friends.map((f) => f.user_id);

      // Don't add if already a friend
      if (currentFriendIds.includes(friendId)) {
        return;
      }

      const newFriendIds = [...currentFriendIds, friendId];
      await updateFriends({ friend_ids: newFriendIds });

      // Refresh to get the full friend data
      await fetchFriends();
    } catch (err: any) {
      console.error("Error adding friend:", err);
      setError(err?.response?.data?.message || "Failed to add friend");
      throw err;
    }
  };

  // Remove a friend and refresh the list
  const removeFriend = async (friendId: number) => {
    try {
      setError(null);
      const currentFriendIds = friends.map((f) => f.user_id);
      const newFriendIds = currentFriendIds.filter((id) => id !== friendId);

      await updateFriends({ friend_ids: newFriendIds });

      // Refresh to update the list
      await fetchFriends();
    } catch (err: any) {
      console.error("Error removing friend:", err);
      setError(err?.response?.data?.message || "Failed to remove friend");
      throw err;
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [user]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        loading,
        error,
        refreshFriends: fetchFriends,
        addFriend,
        removeFriend,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};
