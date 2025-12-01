/**
 * API Endpoints index file
 * 
 * Central export point for all API modules. Import any endpoint function
 * or type from this file to maintain clean and consistent imports throughout
 * the application.
 * 
 * Usage:
 * import { signUp, getCharacter, createQuest } from '@/api/endpoints';
 * import type { Quest, WorkoutSession } from '@/api/endpoints';
 */

export * from "./modules/auth";
export * from "./modules/onboarding";
export * from "./modules/character";
export * from "./modules/workouts";
export * from "./modules/routines";
export * from "./modules/social";
export * from "./modules/quests";
export * from "./modules/stats";