import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  sendFriendRequest,
  respondToFriendRequest,
  deleteFriend,
  FriendSummary,
  FriendRequest,
} from "@/api/endpoints";

type FriendsContextType = {
  friends: FriendSummary[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
  refreshFriends: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  sendRequest: (recipientId: number) => Promise<void>;
  acceptRequest: (requestId: number) => Promise<void>;
  declineRequest: (requestId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
};

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch friends list
  const refreshFriends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFriends();
      setFriends(data);
    } catch (err) {
      console.error("❌ Failed to load friends:", err);
      setError("Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch friend requests (incoming and outgoing)
  const refreshRequests = useCallback(async () => {
    try {
      setError(null);
      const [incoming, outgoing] = await Promise.all([
        getIncomingFriendRequests(),
        getOutgoingFriendRequests(),
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (err) {
      console.error("❌ Failed to load friend requests:", err);
      setError("Failed to load friend requests");
    }
  }, []);

  // Send a friend request
  const sendRequest = useCallback(
    async (recipientId: number) => {
      try {
        await sendFriendRequest({ recipient_id: recipientId });
        await refreshRequests(); // Refresh to show new outgoing request
      } catch (err) {
        console.error("❌ Failed to send friend request:", err);
        throw err;
      }
    },
    [refreshRequests]
  );

  // Accept a friend request
  const acceptRequest = useCallback(
    async (requestId: number) => {
      try {
        await respondToFriendRequest({ request_id: requestId, accept: true });
        await Promise.all([refreshFriends(), refreshRequests()]);
      } catch (err) {
        console.error("❌ Failed to accept friend request:", err);
        throw err;
      }
    },
    [refreshFriends, refreshRequests]
  );

  // Decline a friend request
  const declineRequest = useCallback(
    async (requestId: number) => {
      try {
        await respondToFriendRequest({ request_id: requestId, accept: false });
        await refreshRequests();
      } catch (err) {
        console.error("❌ Failed to decline friend request:", err);
        throw err;
      }
    },
    [refreshRequests]
  );

  // Remove a friend
  const removeFriend = useCallback(
    async (friendId: number) => {
      try {
        await deleteFriend(friendId);
        await refreshFriends();
      } catch (err) {
        console.error("❌ Failed to remove friend:", err);
        throw err;
      }
    },
    [refreshFriends]
  );

  // Load friends and requests on mount
  useEffect(() => {
    refreshFriends();
    refreshRequests();
  }, [refreshFriends, refreshRequests]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        incomingRequests,
        outgoingRequests,
        loading,
        error,
        refreshFriends,
        refreshRequests,
        sendRequest,
        acceptRequest,
        declineRequest,
        removeFriend,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};