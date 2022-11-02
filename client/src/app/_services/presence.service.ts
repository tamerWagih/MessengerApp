import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  baseUrl = environment.apiUrl;
  private hubConnection: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();
  unreadCount$ = this.getUreadMessageCount();

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.log(error));

    this.hubConnection.on('UserIsOnline', (username) => {
      this.onlineUsers$.pipe(take(1)).subscribe((usernames) => {
        this.onlineUsersSource.next([...usernames, username]);
      });
    });

    this.hubConnection.on('UserIsOffline', (username) => {
      this.onlineUsers$.pipe(take(1)).subscribe((usernames) => {
        this.onlineUsersSource.next([
          ...usernames.filter((x) => x !== username),
        ]);
      });
    });

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      this.onlineUsersSource.next(usernames);
    });

    this.hubConnection.on('NewMessageReceived', ({ username, knownAs }) => {
      this.toastr
        .info(knownAs + ' has sent you a new message!')
        .onTap.pipe(take(1))
        .subscribe(() =>
          this.router.navigateByUrl('/members/' + username + '?tab=3')
        );
      this.unreadCount$ = this.getUreadMessageCount();
    });
  }

  getUreadMessageCount() {
    let params = new HttpParams();
    console.log('called');

    params = params.append('Container', 'Unread');
    return this.http.get<number>(this.baseUrl + 'messages/unread', {
      params,
    });
  }

  stopHubConnection() {
    this.hubConnection.stop().catch((error) => console.log(error));
  }
}
