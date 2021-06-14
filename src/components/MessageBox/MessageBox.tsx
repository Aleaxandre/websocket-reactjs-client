import React from "react";
import { ChatMessage } from "../Message/chat-message";
import Message from "../Message/Message";
import "./UserList.css";

type Props = {
  username: string;
  messages: ChatMessage[];
};

export default class MessageBox extends React.Component<Props> {
  componentDidMount() {
    this.setState({});
  }
  render() {
    return (
      <div className="MessageBox">
        {this.props.messages?.map((message, idx) => (
          <Message username={this.props.username} message={message} key={idx} />
        ))}
      </div>
    );
  }
}
