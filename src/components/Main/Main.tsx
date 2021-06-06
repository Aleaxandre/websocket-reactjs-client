import React, { ChangeEvent, FormEvent, KeyboardEvent } from "react";
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

interface ChatMessage {
  author: string;
  date: Date;
  text: string;
}

interface ChatUser {
  username: string;
}

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
  user?: { name: string };
  connectedUsers?: ChatUser[];
};

export default class Main extends React.Component<Props, ChatState> {
  initSocket(username: string) {
    this.setState({
      messageHistory: [],
      readyState: ReadyState.UNINSTANTIATED,
      lastAction: "Connecting WebSocket...",
    } as ChatState);

    const socket = io("http://localhost:3001");

    this.setState({ socket, readyState: ReadyState.OPEN });

    socket.on("connect", () => {
      console.log(`Connected via socket : ${socket.id}`);
      this.setState({ lastAction: "Connected." });

      // Send identification to the server
      socket.emit("identify", username, (data: IdentifyMessage) => {
        this.setState({ lastAction: "Sending identification..." });
        this.setIdentity(data);
        this.setState({ lastAction: "Identified." });
      });
    });

    socket.on("events", (data: any) => {
      console.log("event", data);
    });

    socket.on("exception", (data: any) => {
      console.log("event", data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    socket.on("message", (data: any) => {
      console.log("Received message: ", data);
      this.updateMessageList(this.state.messageHistory, data);
    });

    socket.on("exception", (data: any) => {
      console.log("event", data);
    });

    return socket;
  }

  private setIdentity(data: IdentifyMessage) {
    console.log(`Identified as ${data.username} on ${data.date}`);
    this.setState({ user: { name: data.username } });
  }

  // After the component did mount, set state on each 1 second tick.
  componentDidMount() {
    const username = window.prompt("Please state your name:");
    const socket = this.initSocket(!!username ? username : uuidv4());
    socket.emit(
      "list-clients",
      "[filter not implemented]",
      (clients: { username: string }[]) => {
        this.setState({ connectedUsers: clients });
        clients.forEach((client: { username: string }) =>
          console.log(client.username)
        );
      }
    );
  }

  handleClickSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    this.sendMessage();
  };

  private sendMessage() {
    const messageToSend = {
      author: this.state?.user?.name,
      text: this.state?.currentMessageText,
      date: new Date(),
    } as ChatMessage;

    this.setState({ lastAction: "Sending message..." });

    const newMessageHistoryFromClient = this.state.messageHistory;

    this.state.socket?.emit(
      "message",
      messageToSend,
      (responseMessage: any) => {
        const newMessageHistoryFromServer = this.state.messageHistory;
        this.updateMessageList(newMessageHistoryFromServer, responseMessage);
        this.setState({ lastAction: "Message received." });
      }
    );

    this.updateMessageList(newMessageHistoryFromClient, messageToSend);
    this.setState({ lastAction: "Message sent." });

    // Reset text message input
    this.setState({ currentMessageText: "" });
  }

  private updateMessageList(messages: ChatMessage[], messageSent: ChatMessage) {
    this.setState({ lastAction: "Updating history..." });

    messages.push(messageSent);

    this.setState({
      lastAction: "History updated.",
      messageHistory: messages,
    });
  }

  handleChatTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const target = event.target;
    const value = target.value;

    this.setState({
      currentMessageText: value,
    } as ChatState);
  };

  componentWillUnmount() {
    this.state?.socket?.close();
  }

  onEnterPress = (e: KeyboardEvent) => {
    if (e.code === "Enter" && e.shiftKey === false) {
      e.preventDefault();
      this.sendMessage();
    }
  };

  render() {
    return (
      <div className="Main">
        <div id="infobloc">
          <span title={"ID" + this.state?.socket?.id}>
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
          <div id="lastAction">
            {this.state?.lastAction ? (
              <span>Last action: {this.state.lastAction}</span>
            ) : null}
          </div>
        </div>
        <div id="chatPanel">
          <div>
            <div id="messageBox">
              {this.state?.messageHistory?.map((message, idx) => (
                <div
                  key={idx}
                  className={
                    message.author === this.state?.user?.name
                      ? "message myMessage"
                      : message.author === "Server"
                      ? "message serverMessage"
                      : "message normalMessage"
                  }
                >
                  {message ? (
                    <div className="username">
                      {message.author !== this.state?.user?.name
                        ? message.author
                        : "You"}
                    </div>
                  ) : null}
                  {message ? (
                    <div className="messageText">{message.text}</div>
                  ) : null}
                </div>
              ))}
            </div>
            <div id="connectedUsers">
              <ul>
                {this.state?.connectedUsers
                  ?.sort((user1, user2) =>
                    user1.username.localeCompare(user2.username)
                  )
                  .map((connectedUser, idx) => (
                    <li key={idx}>{connectedUser.username}</li>
                  ))}
              </ul>
            </div>
          </div>
          <div id="chatInputTextarea">
            <form onSubmit={this.handleClickSendMessage}>
              <div>[{this.state?.user?.name}]</div>
              <textarea
                id="messageTextArea"
                onChange={this.handleChatTextAreaChange}
                value={this.state?.currentMessageText}
                onKeyDown={this.onEnterPress}
              />
              <button
                type="submit"
                disabled={this.state?.readyState !== ReadyState.OPEN}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
