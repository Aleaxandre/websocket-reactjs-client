import React from "react";
import { ChatUser } from "./chat-user";
import "./User.css";

type Props = {
  user: ChatUser;
};

type UserState = {};

export default class User extends React.Component<Props, UserState> {
  render() {
    return <div className="User">{this.props.user.username}</div>;
  }
}
