import React, { ChangeEvent, FormEvent } from "react";
import "./Main.css";

import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

enum ReadyState {
  UNINSTANTIATED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

type Props = {
  name: string;
};

type ChatMessage = {
  author: string;
  date: Date;
  text: string;
};

type IdentifyMessage = {
  username: string;
  date: Date;
};

type ChatState = {
  socket?: Socket;
  readyState: ReadyState;
  messageHistory: ChatMessage[];
  lastAction: string;
  currentMessageText?: string;
  username?: string;
};

export default class Main extends React.Component<Props, ChatState> {
  initSocket() {
    this.setState({ lastAction: "Connecting WebSocket..." });
    const socket = io("http://localhost:3001");

    this.setState({ socket, readyState: ReadyState.OPEN });

    socket.on("connect", () => {
      console.log("Connected");

      socket.emit(
        "identify",
        { username: `User_${uuidv4()}` },
        (data: IdentifyMessage) => {
          this.setIdentity(data);
        }
      );
    });

    socket.on("events", function (data: any) {
      console.log("event", data);
    });

    socket.on("exception", function (data: any) {
      console.log("event", data);
    });

    socket.on("disconnect", function () {
      console.log("Disconnected");
    });

    socket.on("message", function (data: any) {
      console.log("response received to message", data);
    });

    socket.on("exception", function (data: any) {
      console.log("event", data);
    });
  }

  private setIdentity(data: IdentifyMessage) {
    console.log(`Identified as ${data.username}`);
    this.setState({ username: data.username });
  }

  // After the component did mount, set state on each 1 second tick.
  componentDidMount() {
    this.setState({
      // socket: undefined,
      messageHistory: [],
      readyState: ReadyState.UNINSTANTIATED,
      lastAction: "Connecting to socket...",
      // username: undefined,
    } as ChatState);

    this.initSocket();
  }

  handleClickSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const messageSent = {
      author: this.state?.username,
      text: this.state?.currentMessageText,
      date: new Date(),
    } as ChatMessage;

    this.setState({ lastAction: "Sending message..." });

    const newMessageHistoryFromClient = this.state.messageHistory;

    this.state.socket?.emit("message", messageSent, (responseMessage: any) => {
      const newMessageHistoryFromServer = this.state.messageHistory;
      newMessageHistoryFromServer.push(responseMessage);
      this.setState({
        lastAction: "Message received.",
        messageHistory: newMessageHistoryFromServer,
      });
    });
    newMessageHistoryFromClient.push(messageSent);

    this.setState({
      lastAction: "Message sent.",
      messageHistory: newMessageHistoryFromClient,
    });
  };

  componentWillUnmount() {
    this.state?.socket?.close();
  }

  render() {
    return (
      <div>
        <span>
          The WebSocket is currently{" "}
          {
            {
              [ReadyState.CONNECTING]: "Connecting",
              [ReadyState.OPEN]: "Open",
              [ReadyState.CLOSING]: "Closing",
              [ReadyState.CLOSED]: "Closed",
              [ReadyState.UNINSTANTIATED]: "Uninstantiated",
            }[this.state?.readyState]
          }
        </span>
        <form onSubmit={this.handleClickSendMessage}>
          <p>
            [{this.state?.username}]
            <input
              type="text"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                this.setState({ currentMessageText: event.target.value })
              }
            />
            <button
              type="submit"
              disabled={this.state?.readyState !== ReadyState.OPEN}
            >
              Send
            </button>
          </p>
        </form>
        {this.state?.lastAction ? (
          <span>Last action: {this.state.lastAction}</span>
        ) : null}{" "}
        <ul>
          {this.state?.messageHistory?.map((message, idx) => (
            <li key={idx}>
              {message ? `${message.author} - ${message.text}` : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
