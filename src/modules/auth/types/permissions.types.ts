export type Permission =
  | 'music.view'
  | 'music.plans.view'
  | 'music.plans.edit'
  | 'music.plans.send'
  | 'music.songs.view'
  | 'music.songs.pick'
  | 'music.songs.request'
  | 'music.songs.manage'
  | 'music.band.view'
  | 'music.band.manage'
  | 'music.rotation.manage'
  | 'music.people.manage'
  | 'music.intake.manage';

export type PermissionHierarchy = 'choir' | 'band';

export type HierarchyPermissionRule = {
  kind: 'hierarchy';
  hierarchy: PermissionHierarchy;
  minRole: string;
};

export type MusicAnyPermissionRule = {
  kind: 'music_any';
};

export type PastorViewPermissionRule = {
  kind: 'pastor_view';
};

export type PermissionRule =
  | HierarchyPermissionRule
  | MusicAnyPermissionRule
  | PastorViewPermissionRule;

export type MusicAccess = {
  canView: boolean;
  canViewPlans: boolean;
  canEditPlans: boolean;
  canPickSongs: boolean;
  canRequestSongs: boolean;
  canManageSongs: boolean;
  canSendPlans: boolean;
  canViewBand: boolean;
  canManageBand: boolean;
  canManageRotation: boolean;
  canManagePeople: boolean;
  canManageIntake: boolean;
};
