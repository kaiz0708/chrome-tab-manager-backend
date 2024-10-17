/** @format */

export interface GroupName {
   free: string;
   charge: string;
}

export const permissionNames = ["Login", "EditProfile", "Register", "CreateCollection", "UpdateCollection", "DeleteCollection", "ReadCollection", "CreateTab", "UpdateTab", "DeleteTab"] as const;

export const groupNames = {
   free: "FREE",
   charge: "CHARGE",
} as GroupName;

export type PermissionNames = (typeof permissionNames)[number];
