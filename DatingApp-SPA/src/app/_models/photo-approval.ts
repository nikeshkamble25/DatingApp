export interface AdminApprovalPhotoUser {
  userId: number;
  userName: string;
  knownAs: string;
  photoUrl: string;
  photos: AdminApprovalPhoto[];
}
export interface AdminApprovalPhoto {
    id: number;
    url: string;
  }
