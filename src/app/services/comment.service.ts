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
  constructor(private db: AngularFirestore) {
    this.comment();
  }

  comment(): any {
      this.DbRef = this.db.collection('comments', (ref) =>
      ref.orderBy('commentTime', 'desc')
    );
  }

  getAll(): any {
    return this.DbRef;
  }

  create(userComment: UserComments): any {
    return this.DbRef.add({ ...userComment });
  }
}
