import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface UserComments {
  p_id: string;
  meta_add: string;
  commentMessage: string;
  commentTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  DbRef: any;
  arrAdd: Array<string> = [];
  constructor(private db: AngularFirestore) {}

  comment(token_id: number): any {
    this.DbRef = this.db.collection('comments', (ref) =>
      ref.where('token_id', '==', token_id).orderBy('commentTime', 'desc')
    );
  }

  getAll(): any {
    return this.DbRef;
  }

  create(userComment: UserComments): any {
    return this.DbRef.add({ ...userComment });
  }
}
