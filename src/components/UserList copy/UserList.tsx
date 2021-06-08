import React from "react";
import User from "../User/User";
import { ChatUser } from "./chat-user";
import "./UserList.css";

type Props = {
  connectedUsers: ChatUser[];
};

type UserListState = {};

type MessageState = { messageClassName: string; authorName: string };

export default class UserList extends React.Component<Props, UserListState> {
  componentDidMount() {
    this.setState({});
  }
  render() {
    return (
      <div className="UserList">
        {this.props.connectedUsers
          ?.sort((user1, user2) => user1.username.localeCompare(user2.username))
          .map((connectedUser, idx) => (
            <User key={idx} user={connectedUser} />
          ))}
      </div>
    );
  }
}
