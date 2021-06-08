import React from "react";
import "./Message.css";
import { ChatMessage } from "./chat-message";

type Props = {
  message: ChatMessage;
  username?: string;
};

type MessageState = { messageClassName: string; authorName: string };

export default class Message extends React.Component<Props, MessageState> {
  componentDidMount() {
    const authorName =
      this.props.message.author !== this.props.username
        ? this.props.message.author
        : "You";

    const messageClassName =
      this.props.message.author === this.props.username
        ? "message myMessage"
        : this.props.message.author === "Server"
        ? "message serverMessage"
        : "message normalMessage";

    this.setState({ messageClassName, authorName });
  }
  render() {
    return (
      <div className="Message" data-testid="Message">
        <div className={this.state?.messageClassName}>
          <div className="username">{this.state?.authorName}</div>
          <div className="messageText">{this.props.message.text}</div>
        </div>
      </div>
    );
  }
}
