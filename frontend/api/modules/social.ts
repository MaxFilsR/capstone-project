/**
 * Social Module
 * 
 * Manages social features including friends, friend requests, and leaderboards.
 * Provides functionality for viewing friend profiles, sending/accepting friend
 * requests, and competing on the global leaderboard.
 */

import { apiClient } from "../client";
import { CharacterEquipment } from "./character";

// ============================================================================
// Types - Friends
// ============================================================================

/**
 * Summary information for a friend in the friends list
 */
export type FriendSummary = {
  user_id: number;
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
};

/**
 * Detailed profile information for a specific friend
 */
export type FriendProfile = {
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
  streak: number;
  equipped: CharacterEquipment;
};

/**
 * Request payload for updating the friends list
 */
export type UpdateFriendsRequest = {
  friend_ids: number[];
};

// ============================================================================
// Types - Friend Requests
// ============================================================================

/**
 * Friend request data structure
 */
export type FriendRequest = {
  request_id: number;
  sender_id: number;
  sender_username: string;
  sender_class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  sender_level: number;
  created: string;
};

/**
 * Request payload for sending a friend request
 */
export type SendFriendRequestRequest = {
  recipient_id: number;
};

/**
 * Request payload for responding to a friend request
 */
export type RespondToFriendRequestRequest = {
  request_id: number;
  accept: boolean;
};

/**
 * Request payload for deleting a friend
 */
export type DeleteFriendRequest = {
  friend_id: number;
};

// ============================================================================
// Types - Leaderboard
// ============================================================================

/**
 * Leaderboard entry showing user ranking information
 */
export type LeaderboardEntry = {
  user_id: number;
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
};

/**
 * Detailed profile for a leaderboard user
 */
export type LeaderboardProfile = {
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
  streak: number;
  equipped: CharacterEquipment;
};

// ============================================================================
// API Functions - Friends
// ============================================================================

/**
 * Fetch list of current friends
 */
export async function getFriends(): Promise<FriendSummary[]> {
  const response = await apiClient.get("/social/friends");
  return response.data;
}

/**
 * Fetch a specific friend's profile by ID
 */
export async function getFriendById(id: number): Promise<FriendProfile> {
  const response = await apiClient.get(`/social/friends/${id}`);
  return response.data;
}

/**
 * Update friends list (replace entire list)
 */
export async function updateFriends(
  payload: UpdateFriendsRequest
): Promise<void> {
  await apiClient.put("/social/friends", payload);
}

// ============================================================================
// API Functions - Friend Requests
// ============================================================================

/**
 * Send a friend request to another user
 */
export async function sendFriendRequest(
  payload: SendFriendRequestRequest
): Promise<void> {
  await apiClient.post("/social/friends/request", payload);
}

/**
 * Get incoming friend requests
 */
export async function getIncomingFriendRequests(): Promise<FriendRequest[]> {
  const response = await apiClient.get("/social/friends/requests/incoming");
  return response.data;
}

/**
 * Get outgoing friend requests
 */
export async function getOutgoingFriendRequests(): Promise<FriendRequest[]> {
  const response = await apiClient.get("/social/friends/requests/outgoing");
  return response.data;
}

/**
 * Respond to a friend request (accept or decline)
 */
export async function respondToFriendRequest(
  payload: RespondToFriendRequestRequest
): Promise<void> {
  await apiClient.post("/social/friends/request/respond", payload);
}

/**
 * Delete a friend (unfriend)
 */
export async function deleteFriend(friendId: number): Promise<void> {
  await apiClient.delete(`/social/friends/${friendId}`);
}

// ============================================================================
// API Functions - Leaderboard
// ============================================================================

/**
 * Fetch global leaderboard
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await apiClient.get("/social/leaderboard");
  return response.data;
}

/**
 * Fetch a specific user's profile from leaderboard by ID
 */
export async function getLeaderboardUserById(
  id: number
): Promise<LeaderboardProfile> {
  const response = await apiClient.get(`/social/leaderboard/${id}`);
  return response.data;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function to add a friend by sending a friend request
 */
export async function addFriend(recipientId: number): Promise<void> {
  await sendFriendRequest({ recipient_id: recipientId });
}

/**
 * Helper function to remove a friend
 */
export async function removeFriend(friendId: number): Promise<void> {
  await deleteFriend(friendId);
}