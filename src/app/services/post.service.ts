import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface UserPosts {
  meta_add: string;
  postMessage: string;
  postTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  DbRef: any;
  arrAdd: Array<string> = [];
  constructor(private db: AngularFirestore) {
    this.post();
  }

  post(): any {
    this.DbRef = this.db.collection('post', (ref) =>
      ref.orderBy('postTime', 'desc')
    );
    console.log('this.DbRef', this.DbRef);
  }

  getAll(): any {
    return this.DbRef;
  }

  create(userPost: UserPosts): any {
    return this.DbRef.add({ ...userPost });
  }
}
