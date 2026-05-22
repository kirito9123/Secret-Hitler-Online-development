import React, { Component } from "react";
import ReactGA from "react-ga";
import "./App.css";
import "./Lobby.css";
import "./fonts.css";
import MaxLengthTextField from "./util/MaxLengthTextField";
import CustomAlert from "./custom-alert/CustomAlert";
import RoleAlert from "./custom-alert/RoleAlert";
import EventBar from "./event-bar/EventBar";

// TODO: replace constants with enums from types
import {
  PAGE,
  MAX_FAILED_CONNECTIONS,
  SERVER_ADDRESS_HTTP,
  NEW_LOBBY,
  CHECK_LOGIN,
  SERVER_ADDRESS,
  WEBSOCKET,
  PARAM_USERNAMES,
  LOBBY_CODE_LENGTH,
  PARAM_STATE,
  STATE_CHANCELLOR_NOMINATION,
  STATE_CHANCELLOR_VOTING,
  PARAM_PRESIDENT,
  STATE_LEGISLATIVE_PRESIDENT,
  STATE_LEGISLATIVE_CHANCELLOR,
  PARAM_PACKET_TYPE,
  PACKET_LOBBY,
  PACKET_GAME_STATE,
  PACKET_INVESTIGATION,
  PACKET_OK,
  STATE_SETUP,
  STATE_POST_LEGISLATIVE,
  STATE_LEGISLATIVE_PRESIDENT_VETO,
  STATE_PP_INVESTIGATE,
  STATE_PP_EXECUTION,
  STATE_PP_ELECTION,
  STATE_PP_PEEK,
  PLAYER_IS_ALIVE,
  PARAM_TARGET,
  STATE_FASCIST_VICTORY_ELECTION,
  STATE_FASCIST_VICTORY_POLICY,
  STATE_LIBERAL_VICTORY_EXECUTION,
  STATE_LIBERAL_VICTORY_POLICY,
  WEBSOCKET_HEADER,
  DEBUG,
  PACKET_PONG,
  PING_INTERVAL,
  SERVER_PING,
  PARAM_ICON,
  PARAM_INVESTIGATION,
  MIN_PLAYERS,
} from "./constants";

import PlayerDisplay, {
  DISABLE_EXECUTED_PLAYERS,
  DISABLE_NONE,
} from "./player/PlayerDisplay";
import StatusBar from "./status-bar/StatusBar";
import Board from "./board/Board";
import VotingPrompt from "./custom-alert/VotingPrompt";
import PresidentLegislativePrompt from "./custom-alert/PresidentLegislativePrompt";
import ChancellorLegislativePrompt from "./custom-alert/ChancellorLegislativePrompt";
import VetoPrompt from "./custom-alert/VetoPrompt";
import ElectionTrackerAlert from "./custom-alert/ElectionTrackerAlert";
import PolicyEnactedAlert from "./custom-alert/PolicyEnactedAlert";
import {
  SelectExecutionPrompt,
  SelectInvestigationPrompt,
  SelectNominationPrompt,
  SelectSpecialElectionPrompt,
} from "./custom-alert/SelectPlayerPrompt";
import ButtonPrompt from "./custom-alert/ButtonPrompt";
import PeekPrompt from "./custom-alert/PeekPrompt";
import InvestigationAlert from "./custom-alert/InvestigationAlert";
import Deck from "./board/Deck";
import PlayerPolicyStatus from "./util/PlayerPolicyStatus";

import VictoryFascistHeader from "./assets/victory-fascist-header.png";
import VictoryLiberalHeader from "./assets/victory-liberal-header.png";
import RulesPanel from "./RulesPanel";
import IconSelection from "./custom-alert/IconSelection";
import HelmetMetaData from "./util/HelmetMetaData";
import { defaultPortrait } from "./assets";
import Player from "./player/Player";
import LoginPageContent from "./LoginPageContent";
import Cookies from "js-cookie";
import AnnouncementBox from "./util/AnnouncementBox";
import {
  GameState,
  LobbyState,
  Role,
  ServerRequestPayload,
  WSCommand,
  WSCommandType,
} from "./types";

const EVENT_BAR_FADE_OUT_DURATION = 500;
const CUSTOM_ALERT_FADE_DURATION = 1000;

const DEFAULT_GAME_STATE: GameState = {
  liberalPolicies: 0,
  fascistPolicies: 0,
  discardSize: 0,
  drawSize: 17,
  players: {},
  playerOrder: [],
  state: LobbyState.SETUP,
  president: "",
  chancellor: "",
  electionTracker: 0,
  vetoOccurred: false,
  lastState: LobbyState.SETUP,
  lastChancellor: "",
  lastPresident: "",
  electionTrackerAdvanced: false,
  userVotes: {},
  presidentChoices: [],
  chancellorChoices: [],
  targetUser: "",
  lastPolicy: "",
  peek: [],
  icon: {},
};

const COOKIE_NAME = "name";
const COOKIE_LOBBY = "lobby";

if (DEBUG) {
  console.warn("Running in debug mode.");
}

// TODO: Turn App into a functional component
// TODO: Refactor out pages into separate components
// TODO: Refactor out AnimationQueue

// TODO: Remove this type and replace with actual state variables.
type AppState = {
  page: PAGE;
  joinName: string;
  joinLobby: string;
  joinError: string;
  createLobbyName: string;
  createLobbyError: string;
  name: string;
  lobby: string;
  lobbyFromURL: boolean;
  usernames: string[];
  icons: { [key: string]: string };
  gameState: GameState;
  /* Stores the last gameState[PARAM_STATE] value to check for changes. */
  lastState: any;
  liberalPolicies: number;
  fascistPolicies: number;
  /*The position of the election tracker, ranging from 0 to 3.*/
  electionTracker: number;
  showVotes: boolean;
  drawDeckSize: number;
  discardDeckSize: number;
  snackbarMessage: string;
  showAlert: boolean;
  alertContent: JSX.Element;
  showEventBar: boolean;
  eventBarMessage: string;
  statusBarText: string;
  allAnimationsFinished: boolean;
  botsEnabled: boolean;
  targetLobbySize: number;
};

const defaultAppState: AppState = {
  page: PAGE.LOGIN,
  joinName: "",
  joinLobby: "",
  joinError: "",
  createLobbyName: "",
  createLobbyError: "",
  name: "P1",
  lobby: "AAAAAA",
  lobbyFromURL: false,
  usernames: [],
  icons: {},
  gameState: DEFAULT_GAME_STATE,
  lastState: {},
  liberalPolicies: 0,
  fascistPolicies: 0,
  electionTracker: 0,
  showVotes: false,
  drawDeckSize: 17,
  discardDeckSize: 0,
  snackbarMessage: "",
  showAlert: false,
  alertContent: <div />,
  showEventBar: false,
  eventBarMessage: "",
  statusBarText: "---",
  allAnimationsFinished: true,
  botsEnabled: true,
  targetLobbySize: 5,
};

class App extends Component<{}, AppState> {
  websocket?: WebSocket = undefined;
  failedConnections: number = 0;
  pingInterval?: NodeJS.Timeout = undefined;
  reconnectOnConnectionClosed: boolean = true;
  snackbarMessages: number = 0;
  animationQueue: (() => void)[] = [];
  okMessageListeners: (() => void)[] = [];
  allAnimationsFinished: boolean = true;
  gameOver: boolean = false;

  // noinspection DuplicatedCode
  constructor(props: any) {
    super(props);

    let name = Cookies.get(COOKIE_NAME) ? Cookies.get(COOKIE_NAME) : "";
    let lobby = Cookies.get(COOKIE_LOBBY) ? Cookies.get(COOKIE_LOBBY) : "";

    this.state = {
      ...defaultAppState,
      joinName: name || "",
      joinLobby: lobby || "",
      createLobbyName: name || "",
    };

    // The website uses Google Analytics!
    ReactGA.initialize("UA-166327773-1");
    ReactGA.pageview("/");

    // These are necessary for handling class fields safely (ex: websocket)
    this.onWebSocketClose = this.onWebSocketClose.bind(this);
    this.tryOpenWebSocket = this.tryOpenWebSocket.bind(this);
    this.onClickLeaveLobby = this.onClickLeaveLobby.bind(this);
    this.onClickCopy = this.onClickCopy.bind(this);
    this.onClickStartGame = this.onClickStartGame.bind(this);
    this.sendWSCommand = this.sendWSCommand.bind(this);
    this.showSnackBar = this.showSnackBar.bind(this);
    this.onAnimationFinish = this.onAnimationFinish.bind(this);
    this.onGameStateChanged = this.onGameStateChanged.bind(this);
    this.hideAlertAndFinish = this.hideAlertAndFinish.bind(this);
    this.addAnimationToQueue = this.addAnimationToQueue.bind(this);
    this.clearAnimationQueue = this.clearAnimationQueue.bind(this);
    this.queueAlert = this.queueAlert.bind(this);
    this.showChangeIconAlert = this.showChangeIconAlert.bind(this);
    this.updateChangeIconAlert = this.updateChangeIconAlert.bind(this);
    this.onClickChangeIcon = this.onClickChangeIcon.bind(this);

    // Ping the server to wake it up if it's not currently being used
    // This reduces the delay users experience when starting lobbies
    fetch(SERVER_ADDRESS_HTTP + SERVER_PING);
  }

  /////////// Server Communication
  // <editor-fold desc="Server Communication">

  /**
   * Attempts to request the server to create a new lobby and returns the response.
   * @return {Promise<Response>}
   */
  async tryCreateLobby() {
    return fetch(SERVER_ADDRESS_HTTP + NEW_LOBBY);
  }

  /**
   * Checks if the login is valid.
   * @param name the name of the user.
   * @param lobby the lobby code.
   * @return {Promise<Response>} The response from the server.
   */
  async tryLogin(name: string, lobby: string) {
    ReactGA.event({
      category: "Login Attempt",
      action: "User attempted to provide login credentials to the server.",
    });
    return await fetch(
      SERVER_ADDRESS_HTTP +
      CHECK_LOGIN +
      "?name=" +
      encodeURI(name) +
      "&lobby=" +
      encodeURI(lobby)
    );
  }

  /**
   * Attempts to open a WebSocket with the server.
   * @param name the name of the user to connect with.
   * @param lobby the lobby to connect with.
   * @effects If a connection was successfully established, sets the state with the {@code name}, {@code lobby},
   *          and {@code ws} parameters. The WebSocket has a message callback to this.onWebSocketMessage().
   * @return {boolean} true if the connection was opened successfully. Otherwise, returns false.
   */
  tryOpenWebSocket(name: string, lobby: string) {
    if (DEBUG) {
      console.log("Opening connection with lobby: " + lobby);
      console.log("Failed connections: " + this.failedConnections);
    }
    let url =
      WEBSOCKET_HEADER +
      SERVER_ADDRESS +
      WEBSOCKET +
      "?name=" +
      encodeURIComponent(name) +
      "&lobby=" +
      encodeURIComponent(lobby);
    if (DEBUG) {
      console.trace("TryOpenWebsocket URL: " + url);
    }

    // Close existing websocket
    if (this.websocket) {
      // Clear onClose event to prevent reconnection
      this.websocket.onclose = () => { };
      this.websocket.close();
      this.websocket = undefined;
    }

    let ws = new WebSocket(url);
    if (ws.OPEN) {
      console.log("Websocket opened successfully to " + url);
      this.websocket = ws;
      this.reconnectOnConnectionClosed = true;
      // Only move the player to the lobby page if they were logging in.
      // This is to prevent the bug where players flash in/out of the lobby page
      // at random points in the game.
      if (this.state.page === PAGE.LOGIN) {
        this.setState({ page: PAGE.LOBBY });
      }
      this.setState({
        name: name,
        lobby: lobby,
        usernames: [],
        joinName: "",
        joinLobby: "",
        joinError: "",
        createLobbyName: "",
        createLobbyError: "",
      });
      ws.onmessage = (msg) => this.onWebSocketMessage(msg);
      ws.onclose = () => this.onWebSocketClose();

      // Ping the web server at a set interval.
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
      this.pingInterval = setInterval(() => {
        this.sendWSCommand({ command: WSCommandType.PING });
      }, PING_INTERVAL);

      return true;
    } else {
      return false;
    }
  }

  /**
   * Called when the websocket closes.
   * @effects attempts to reopen the websocket connection.
   *          If the user pressed the "Leave Lobby" button or a maximum number of attempts has been reached
   *          ({@code MAX_FAILED_CONNECTIONS}), does not reopen the websocket connection and returns the user to the
   *          login screen with a relevant error message.
   */
  onWebSocketClose() {
    // Clear the server ping interval when the socket is closed.
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    console.log(
      "A websocket closed: " +
      this.websocket?.url +
      ". Reopening to current lobby " +
      this.state.lobby
    );
    //

    if (
      this.reconnectOnConnectionClosed &&
      this.failedConnections < MAX_FAILED_CONNECTIONS
    ) {
      if (this.failedConnections >= 1) {
        // Only show the error bar if the first attempt has failed.
        this.showSnackBar("Mất kết nối với máy chủ: đang kết nối lại...");
        ReactGA.event({
          category: "Lost Server Connection",
          action: "User lost connection to the server. (>1 attempts)",
        });
      }
      this.failedConnections += 1;
      this.tryOpenWebSocket(this.state.name, this.state.lobby);
    } else if (this.reconnectOnConnectionClosed) {
      if (DEBUG) {
        console.log("Disconnecting from lobby.");
      }
      this.setState({
        joinName: this.state.name,
        joinLobby: this.state.lobby,
        joinError: "Mất kết nối với phòng chơi.",
        page: PAGE.LOGIN,
      });
      ReactGA.event({
        category: "Lost Server Connection (Terminal)",
        action:
          "User was unable to reconnect to the server. (max attempts reached)",
      });
      this.clearAnimationQueue();
    } else {
      // User purposefully closed the connection.
      if (this.gameOver) {
        // Do not reopen if the game is over, since disconnecting is intentional.
      } else {
        this.setState({
          page: PAGE.LOGIN,
          joinName: this.state.name,
          joinLobby: this.state.lobby,
          joinError: "",
        });
        this.clearAnimationQueue();
      }
    }
  }

  async onWebSocketMessage(msg: MessageEvent) {
    this.failedConnections = 0;
    let message = JSON.parse(msg.data);
    // Decode message contents as communication is encoded
    if (DEBUG) {
      console.log(message);
    }
    switch (message[PARAM_PACKET_TYPE]) {
      case PACKET_LOBBY:
        this.setState({
          usernames: message[PARAM_USERNAMES],
          icons: message[PARAM_ICON],
          botsEnabled: message.botsEnabled !== undefined ? message.botsEnabled : true,
          targetLobbySize: message.targetLobbySize !== undefined ? message.targetLobbySize : 5,
          page: PAGE.LOBBY,
        });
        if (message[PARAM_ICON][this.state.name] === defaultPortrait) {
          this.showChangeIconAlert();
        }
        this.updateChangeIconAlert();
        break;

      case PACKET_GAME_STATE:
        if (message !== this.state.gameState) {
          this.onGameStateChanged(message);
        }
        this.setState({ gameState: message, page: PAGE.GAME });
        break;

      case PACKET_OK: // Traverse all listeners and call the functions.
        let i = 0;
        for (i; i < this.okMessageListeners.length && i < 1; i++) {
          this.okMessageListeners[i]();
        }
        this.okMessageListeners = []; // clear all listeners.
        break;

      case PACKET_INVESTIGATION:
        // Trigger investigation screen when the server responds.
        console.log(
          "Investigated player role: " + message[PARAM_INVESTIGATION]
        );
        // Set party to liberal/fascist using sent packet
        const party = message[PARAM_INVESTIGATION];

        this.queueAlert(
          <InvestigationAlert
            party={party}
            target={message[PARAM_TARGET]}
            hideAlert={this.hideAlertAndFinish}
          />,
          false
        );
        break;
      case PACKET_PONG:
      default:
      // No action
    }
  }

  /**
   * Sends a specified command to the server.
   * @param command the String command label.
   * @param params a dictionary of any parameters that need to be provided with the command.
   * @effects sends a message to the server with the following parameters:
   *          {@code PARAM_COMMAND}: {@code command}
   *          {@code PARAM_LOBBY}: {@code this.state.lobby}
   *          {@code PARAM_NAME}: {@code this.state.name}
   *          and each (key, value) pair in {@code params}.
   */
  sendWSCommand(request: ServerRequestPayload) {
    // Do not need to encode name + lobby because this is sent through websocket
    const data: WSCommand = {
      ...request,
      name: this.state.name,
      lobby: this.state.lobby,
    };

    if (DEBUG) {
      console.log(JSON.stringify(data));
    }
    if (this.websocket !== undefined) {
      this.websocket.send(JSON.stringify(data));
    } else {
      this.showSnackBar(
        "Không thể kết nối tới máy chủ. Hãy thử tải lại trang nếu vẫn gặp lỗi."
      );
    }
  }

  //</editor-fold>

  /////////////////// Login Page
  // <editor-fold desc="Login Page">

  /**
   * Updates the "Name" field under Join Game.
   * @param text the text to update the text field to.
   */
  updateJoinName = (text: string) => {
    this.setState({
      joinName: text,
    });
  };

  /**
   * Updates the Lobby field under Join Game.
   * @param text the text to update the text field to.
   */
  updateJoinLobby = (text: string) => {
    this.setState({
      joinLobby: text,
    });
  };

  /**
   * Updates the Name field under Create Lobby.
   * @param text the text to update the text field to.
   */
  updateCreateLobbyName = (text: string) => {
    this.setState({
      createLobbyName: text,
    });
  };

  shouldJoinButtonBeEnabled() {
    return (
      this.state.joinLobby.length === LOBBY_CODE_LENGTH &&
      this.state.joinName.length !== 0
    );
  }

  shouldCreateLobbyButtonBeEnabled() {
    return this.state.createLobbyName.length !== 0;
  }

  /**
   * Attempts to connect to the lobby via websocket.
   */
  onClickJoin = () => {
    this.setState({ joinError: "Đang kết nối..." });
    this.tryLogin(this.state.joinName, this.state.joinLobby)
      .then((response) => {
        if (!response.ok) {
          if (DEBUG) {
            console.log("Response is not ok");
          }
          if (response.status === 404) {
            this.setState({ joinError: "Không tìm thấy phòng chơi." });
            ReactGA.event({
              category: "Login Failed",
              action: "Lobby not found - User unable to connect.",
            });
          } else if (response.status === 403) {
            this.setState({
              joinError:
                "Đã có người dùng tên '" +
                this.state.joinName +
                "' trong phòng.",
            });
            ReactGA.event({
              category: "Login Failed",
              action: "Duplicate name - User unable to connect.",
            });
          } else if (response.status === 488) {
            this.setState({ joinError: "Phòng đang trong ván chơi." });
            ReactGA.event({
              category: "Login Failed",
              action: "Ongoing game - User unable to connect.",
            });
          } else if (response.status === 489) {
            this.setState({ joinError: "Phòng đã đầy." });
            ReactGA.event({
              category: "Login Failed",
              action: "Lobby full - User unable to connect.",
            });
          } else {
            this.setState({
              joinError:
                "Có lỗi kết nối máy chủ. Vui lòng thử lại.",
            });
            ReactGA.event({
              category: "Login Failed",
              action: "Misc - User was unable to connect.",
            });
          }
        } else {
          // Username and lobby were verified. Try to open websocket.
          if (
            !this.tryOpenWebSocket(this.state.joinName, this.state.joinLobby)
          ) {
            this.setState({
              joinError:
                "Có lỗi kết nối máy chủ. Vui lòng thử lại.",
            });
          } else {
            // Save the username and lobby login
            Cookies.set(COOKIE_NAME, this.state.name, { expires: 7 });
            Cookies.set(COOKIE_LOBBY, this.state.joinLobby);
          }
        }
      })
      .catch(() => {
        this.setState({
          joinError:
            "Không thể liên hệ máy chủ. Vui lòng chờ và thử lại.",
        });
      });
  };

  /**
   * Attempts to connect to the server and create a new lobby, and then opens a connection to the lobby.
   */
  onClickCreateLobby = () => {
    this.setState({ createLobbyError: "Đang kết nối..." });
    this.tryCreateLobby()
      .then((response) => {
        if (response.ok) {
          response.text().then((lobbyCode) => {
            if (!this.tryOpenWebSocket(this.state.createLobbyName, lobbyCode)) {
              // if the connection failed
              this.setState({
                createLobbyError:
                  "Có lỗi kết nối máy chủ. Vui lòng thử lại.",
              });
              ReactGA.event({
                category: "Lobby Creation Failed",
                action: "Failed to create a new lobby.",
              });
            } else {
              ReactGA.event({
                category: "Lobby Created",
                action: "Successfully created new lobby.",
              });
              // Save the username and lobby login
              Cookies.set(COOKIE_NAME, this.state.name, { expires: 7 });
              Cookies.set(COOKIE_LOBBY, lobbyCode);
            }
          });
        } else {
          this.setState({
            createLobbyError:
              "Có lỗi kết nối máy chủ. Vui lòng thử lại.",
          });
          ReactGA.event({
            category: "Lobby Creation Failed",
            action: "Failed to create a new lobby.",
          });
        }
      })
      .catch(() => {
        this.setState({
          createLobbyError:
            "Có lỗi kết nối máy chủ. Vui lòng thử lại.",
        });
        ReactGA.event({
          category: "Lobby Creation Failed",
          action: "Failed to create a new lobby.",
        });
      });
  };

  renderLoginPage() {
    return (
      <div className="App">
        <header className="App-header">BÍ MẬT HITLER - Nguyễn Minh Trí Edition</header>
        <br />
        <div style={{ textAlign: "center" }}>
          {/** TODO: Add reusable announcement component. 
                    <div style={{backgroundColor: "#222222", width: "50vmin", margin: "0 auto", padding: "20px"}}>
                        <p>
                            Hello! Secret Hitler Online is currently undergoing some maintenance.
                            Sorry for the interruption and please check back in in a few hours! -Shrimp
                        </p>
                        <p style={{fontStyle: "italic", fontSize: "calc(8px + 1vmin)"}}>(DATE TIME PM PT)</p>

                    </div>
                    */}
          <h2>THAM GIA VÁN CHƠI</h2>
          <MaxLengthTextField
            label={"Mã Phòng"}
            onChange={this.updateJoinLobby}
            value={this.state.joinLobby}
            maxLength={LOBBY_CODE_LENGTH}
            showCharCount={false}
            forceUpperCase={true}
          />

          <MaxLengthTextField
            label={"Tên Của Bạn"}
            onChange={this.updateJoinName}
            value={this.state.joinName}
            maxLength={12}
          />
          <p id={"errormessage"}>{this.state.joinError}</p>
          <button
            onClick={this.onClickJoin}
            disabled={!this.shouldJoinButtonBeEnabled()}
          >
            THAM GIA
          </button>
        </div>
        <br />
        <div>
          <h2>TẠO PHÒNG</h2>
          <MaxLengthTextField
            label={"Tên Của Bạn"}
            onChange={this.updateCreateLobbyName}
            value={this.state.createLobbyName}
            maxLength={12}
          />
          <p id={"errormessage"}>{this.state.createLobbyError}</p>
          <button
            onClick={this.onClickCreateLobby}
            disabled={!this.shouldCreateLobbyButtonBeEnabled()}
          >
            TẠO PHÒNG
          </button>
        </div>
        <br />
        <LoginPageContent />
      </div>
    );
  }

  //</editor-fold>

  /////////////////// Lobby Page
  //<editor-fold desc="Lobby Page">

  /**
   * Renders the playerlist as a sequence of paragraph tags.
   * Written as "{@literal <p>} - {@code username} {@literal </p>}".
   */
  renderPlayerList() {
    return this.state.usernames.map((name: string, i: number) => {
      return (
        <Player
          key={i}
          name={i === 0 ? name + " [Chủ phòng]" : name}
          showRole={false}
          icon={this.state.icons[name]}
          isBusy={this.state.icons[name] === defaultPortrait}
          highlight={name === this.state.name}
        />
      );
    });
  }

  onClickChangeIcon() {
    this.showChangeIconAlert();
  }

  updateChangeIconAlert() {
    this.setState({
      alertContent: (
        <IconSelection
          onConfirm={() => {
            this.clearAnimationQueue();
            this.hideAlertAndFinish();
          }}
          sendWSCommand={this.sendWSCommand}
          playerToIcon={this.state.icons}
          players={this.state.usernames}
          user={this.state.name}
          onClickTweet={() => {
            ReactGA.event({ category: "Sharing", action: "User shared tweet" });
          }}
        />
      ),
    });
  }

  showChangeIconAlert() {
    this.queueAlert(<div />, false); // false here prevents dialog from closing when server confirms selection
    this.updateChangeIconAlert();
  }

  /**
   * Determines whether the 'Start Game' button in the lobby should be enabled.
   */
  shouldStartGameBeEnabled() {
    // Verify that all players have icons
    for (let i = 0; i < this.state.usernames.length; i++) {
      if (this.state.icons[this.state.usernames[i]] === defaultPortrait) {
        return false;
      }
    }
    // Check minimum players if bots are disabled
    if (!this.state.botsEnabled && this.state.usernames.length < MIN_PLAYERS) {
      return false;
    }
    return true;
  }

  /**
   * Contacts the server and requests to start the game.
   */
  onClickStartGame() {
    ReactGA.event({
      category: "Starting Game",
      action: this.state.usernames.length + " players started game.",
    });
    this.sendWSCommand({ command: WSCommandType.START_GAME });
  }

  onClickLeaveLobby() {
    this.websocket?.close();
    this.reconnectOnConnectionClosed = false;
  }

  onClickCopy() {
    const text = document.getElementById("linkText");
    if (text === null) {
      return;
    }
    (text as HTMLTextAreaElement).select();
    (text as HTMLTextAreaElement).setSelectionRange(0, 999999);
    document.execCommand("copy");
    this.showSnackBar("Đã sao chép!");
  }

  showSnackBar(message: string) {
    this.setState({ snackbarMessage: message });
    let snackbar = document.getElementById("snackbar");
    if (snackbar === null) {
      return;
    }
    snackbar.className = "show";
    this.snackbarMessages++;
    setTimeout(() => {
      this.snackbarMessages--;
      if (this.snackbarMessages === 0) {
        snackbar!.className = snackbar!.className.replace("show", "");
      }
    }, 3000);
  }

  renderLobbyPage() {
    // The first player in the lobby is counted as the VIP.
    let isVIP =
      this.state.usernames.length > 0 &&
      this.state.usernames[0] === this.state.name;
    return (
      <div className="App">
        <header className="App-header">BÍ MẬT HITLER - Nguyễn Minh Trí Edition</header>

        <CustomAlert show={this.state.showAlert}>
          {this.state.alertContent}
        </CustomAlert>

        <div
          style={{ textAlign: "left", marginLeft: "20px", marginRight: "20px" }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <h2>MÃ PHÒNG: </h2>
            <h2
              style={{ marginLeft: "5px", color: "var(--textColorHighlight)" }}
            >
              {this.state.lobby}
            </h2>
          </div>

          <p style={{ marginBottom: "2px" }}>
            Sao chép và chia sẻ liên kết này để mời người chơi khác.
          </p>
          <div
            style={{
              textAlign: "left",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <textarea
              id="linkText"
              readOnly={true}
              value={window.location.origin + "/?lobby=" + this.state.lobby}
            />
            <button onClick={this.onClickCopy}>SAO CHÉP</button>
          </div>

          <div id={"lobby-lower-container"}>
            <div id={"lobby-player-area-container"}>
              <div id={"lobby-player-text-choose-container"}>
                <p id={"lobby-player-count-text"}>
                  Người chơi ({this.state.usernames.length}/10)
                </p>
                <button
                  id={"lobby-change-icon-button"}
                  onClick={this.onClickChangeIcon}
                >
                  ĐỔI BIỂU TƯỢNG
                </button>
              </div>
              <div id={"lobby-player-container"}>{this.renderPlayerList()}</div>
            </div>

            <div id={"lobby-button-container"}>
              {!isVIP && (
                <p id={"lobby-vip-text"}>Chỉ Chủ phòng mới có thể bắt đầu trò chơi.</p>
              )}
              {isVIP && (
                <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      id="bots-toggle"
                      checked={this.state.botsEnabled}
                      onChange={(e) => {
                        this.sendWSCommand({
                          command: WSCommandType.SET_BOTS_ENABLED,
                          botsEnabled: e.target.checked,
                        } as any);
                      }}
                      style={{ transform: "scale(1.5)" }}
                    />
                    <label htmlFor="bots-toggle" style={{ fontSize: "1.1rem", cursor: "pointer" }}>
                      Tự động thêm Bot (nếu chưa đủ người)
                    </label>
                  </div>
                  {this.state.botsEnabled && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <label htmlFor="target-size" style={{ fontSize: "1.1rem" }}>
                        Tổng số người chơi (kể cả Bot):
                      </label>
                      <select
                        id="target-size"
                        value={this.state.targetLobbySize}
                        onChange={(e) => {
                          this.sendWSCommand({
                            command: WSCommandType.SET_LOBBY_SIZE,
                            size: parseInt(e.target.value),
                          } as any);
                        }}
                        style={{ fontSize: "1.1rem", padding: "2px 5px", borderRadius: "4px" }}
                      >
                        {[5, 6, 7, 8, 9, 10].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
              {!this.state.botsEnabled && this.state.usernames.length < MIN_PLAYERS && (
                <p style={{ color: "var(--textColorHighlight)", marginTop: 0 }}>Cần ít nhất 5 người chơi để bắt đầu (khi tắt bot).</p>
              )}
              <button
                onClick={this.onClickStartGame}
                disabled={!isVIP || !this.shouldStartGameBeEnabled()}
              >
                BẮT ĐẦU TRÒ CHƠI
              </button>
              <button onClick={this.onClickLeaveLobby}>RỜI PHÒNG</button>
            </div>
            <div id={"lobby-text-container"}>
              <p id={"lobby-about-text"}>
                <a
                  href={
                    "https://github.com/kirito9123/Secret-Hitler-Online-development/blob/main/README.md"
                  }
                  target={"_blank"}
                  rel="noopener noreferrer"
                >
                  Về dự án này
                </a>
              </p>
              <br />
              <p id={"lobby-warning-text"}>
                Bạn có thể báo cáo lỗi trên{" "}
                <a
                  href={
                    "https://github.com/kirito9123/Secret-Hitler-Online-development/issues"
                  }
                  rel="noopener noreferrer"
                  target={"_blank"}
                >
                  trang Issues.
                </a>
              </p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div id="snackbar">{this.state.snackbarMessage}</div>
        </div>
      </div>
    );
  }

  //</editor-fold>

  /////////////////// Game Page
  //<editor-fold desc="Game Page">

  showExecutionResults(name: string, newState: GameState): void {
    if (name === newState.targetUser) {
      this.queueAlert(
        <ButtonPrompt
          label={"BẠN ĐÃ BỊ HÀNH QUYẾT"}
          headerText={
            "Người chơi bị hành quyết không thể nói chuyện, bỏ phiếu hoặc tham gia tranh cử. Bạn không được tiết lộ danh tính của mình."
          }
          buttonOnClick={this.hideAlertAndFinish}
        />,
        false
      );
    } else {
      this.queueAlert(
        <ButtonPrompt
          label={"KẾT QUẢ HÀNH QUYẾT"}
          footerText={
            newState.targetUser +
            " đã bị hành quyết. Họ không còn có thể nói chuyện, bỏ phiếu hoặc tham gia tranh cử."
          }
          buttonOnClick={this.hideAlertAndFinish}
          buttonText={"HIỂU RỒI"}
        >
          <PlayerDisplay
            user={name}
            gameState={newState}
            showRoles={false}
            playerDisabledFilter={DISABLE_EXECUTED_PLAYERS}
            players={[newState.targetUser!]}
          />
        </ButtonPrompt>,
        false
      );
    }
  }

  /**
   * Queues animations for when the game state has changed.
   * @param newState {Object} the new game state sent from the server.
   */
  onGameStateChanged(newState: GameState) {
    let oldState = this.state.gameState;
    let name = this.state.name;
    let isPresident = this.state.name === newState.president;
    let isChancellor = this.state.name === newState.chancellor;
    let state = newState.state;

    // If last state was setup, which indicates that the client is re-entering the game or starting the game, then
    // we set the card count, liberal/fascist policy count, and the tracker.
    if (
      oldState.hasOwnProperty(PARAM_STATE) &&
      oldState[PARAM_STATE] === STATE_SETUP
    ) {
      this.setState({
        liberalPolicies: newState.liberalPolicies,
        fascistPolicies: newState.fascistPolicies,
        electionTracker: newState.electionTracker,
        drawDeckSize: newState.drawSize,
        discardDeckSize: newState.discardSize,
      });
    }

    // Check for changes in enacted policies and election tracker.
    const statesToShowPolicyFor = [
      LobbyState.POST_LEGISLATIVE,
      LobbyState.PP_INVESTIGATE,
      LobbyState.PP_EXECUTION,
      LobbyState.PP_ELECTION,
      LobbyState.PP_PEEK,
      LobbyState.FASCIST_VICTORY_POLICY,
      LobbyState.LIBERAL_VICTORY_POLICY,
    ];
    if (statesToShowPolicyFor.includes(state)) {
      // Check if the election tracker changed positions.
      if (newState.electionTracker !== this.state.gameState.electionTracker) {
        let newPos = newState.electionTracker;
        let advancedToThree = newPos === 0 && newState.electionTrackerAdvanced;
        // We ignore all resets to 0, unless that reset was caused by the election tracker reaching 3.
        if (newPos !== 0 || advancedToThree) {
          // If the last phase was voting, we failed due to voting. Therefore, show votes.
          if (oldState[PARAM_STATE] === STATE_CHANCELLOR_VOTING) {
            //this.queueAlert(<RoleAlert onClick={this.hideAlertAndFinish} />);
            this.addAnimationToQueue(() => this.showVotes(newState));
          }

          let trackerPosition = newPos;
          if (advancedToThree) {
            // If the tracker was reset because it advanced to 3, show it moving to 3 in the dialog box.
            trackerPosition = 3;
          }
          this.queueAlert(
            <ElectionTrackerAlert
              trackerPosition={trackerPosition}
              closeAlert={this.hideAlertAndFinish}
            />
          );
        }
      }

      let liberalChanged =
        newState.liberalPolicies !== oldState.liberalPolicies;
      let fascistChanged =
        newState.fascistPolicies !== oldState.fascistPolicies;

      if (liberalChanged || fascistChanged) {
        // Show an alert with the new policy
        this.queueAlert(
          <PolicyEnactedAlert
            hideAlert={this.hideAlertAndFinish}
            policyType={newState.lastPolicy}
          />
        );
      }

      // Update the decks, board with the new policies / election tracker.
      this.addAnimationToQueue(() => {
        this.setState({
          liberalPolicies: newState.liberalPolicies,
          fascistPolicies: newState.fascistPolicies,
          electionTracker: newState.electionTracker,
        });
        setTimeout(() => this.onAnimationFinish(), 500);
      });
    }

    // Check for state change
    if (newState[PARAM_STATE] !== this.state.gameState[PARAM_STATE]) {
      // state has changed
      switch (newState[PARAM_STATE]) {
        case STATE_CHANCELLOR_NOMINATION:
          if (
            newState.electionTracker === 0 &&
            newState.liberalPolicies === 0 &&
            newState.fascistPolicies === 0
          ) {
            // If the game has just started (everything in default state), show the player's role.
            this.queueAlert(
              <RoleAlert
                role={newState.players[this.state.name].id}
                gameState={newState}
                name={name}
                onClick={() => {
                  this.hideAlertAndFinish();
                }}
              />,
              false
            );
          }

          this.queueEventUpdate("ĐỀ CỬ THỦ TƯỚNG");
          this.queueStatusMessage(
            "Đang chờ tổng thống đề cử thủ tướng."
          );

          if (isPresident) {
            //Show the chancellor nomination window.
            this.queueAlert(
              SelectNominationPrompt(name, newState, this.sendWSCommand)
            );
          }

          break;

        case STATE_CHANCELLOR_VOTING:
          this.setState({ statusBarText: "" });
          this.queueEventUpdate("BỎ PHIẾU");
          this.queueStatusMessage("Đang chờ tất cả người chơi bỏ phiếu.");
          // Check if the player is dead or has already voted-- if so, do not show the voting prompt.
          if (
            newState.players[name][PLAYER_IS_ALIVE] &&
            !Object.keys(newState.userVotes).includes(name)
          ) {
            this.queueAlert(
              <VotingPrompt
                gameState={newState}
                sendWSCommand={this.sendWSCommand}
                user={this.state.name}
              />,
              true
            );
          }

          break;

        case STATE_LEGISLATIVE_PRESIDENT:
          // The vote completed, so show the votes.
          this.addAnimationToQueue(() => this.showVotes(newState));
          this.queueEventUpdate("PHIÊN LẬP PHÁP");

          // TODO: Animate cards being pulled from the draw deck for all users.

          this.queueStatusMessage(
            "Đang chờ tổng thống chọn chính sách để loại bỏ."
          );

          if (isPresident) {
            if (!newState.presidentChoices) {
              throw new Error("President choices not found.");
            }
            this.queueAlert(
              <PresidentLegislativePrompt
                policyOptions={newState.presidentChoices}
                sendWSCommand={this.sendWSCommand}
              />
            );
          }

          break;

        case STATE_LEGISLATIVE_CHANCELLOR:
          this.queueStatusMessage(
            "Đang chờ thủ tướng chọn chính sách để thông qua."
          );
          if (isChancellor) {
            if (!newState.chancellorChoices) {
              throw new Error("Chancellor choices not found.");
            }
            this.queueAlert(
              <ChancellorLegislativePrompt
                fascistPolicies={newState.fascistPolicies}
                showError={(message: string) =>
                  this.setState({ snackbarMessage: message })
                }
                policyOptions={newState.chancellorChoices}
                sendWSCommand={this.sendWSCommand}
                // Disable if veto has already happened
                enableVeto={
                  newState.fascistPolicies === 5 && !newState.vetoOccurred
                }
              />
            );
          }
          break;

        case STATE_LEGISLATIVE_PRESIDENT_VETO:
          this.queueStatusMessage(
            "Thủ tướng đề nghị phủ quyết. Đang chờ tổng thống quyết định."
          );
          if (isPresident) {
            this.queueAlert(
              <VetoPrompt
                sendWSCommand={this.sendWSCommand}
                electionTracker={newState.electionTracker}
              />,
              true
            );
          }
          break;

        case STATE_PP_PEEK:
          this.queueEventUpdate("QUYỀN TỔNG THỐNG");
          if (isPresident) {
            if (!newState.peek) {
              throw new Error("Peek policies not found.");
            }
            this.queueAlert(
              <PeekPrompt
                policies={newState.peek}
                sendWSCommand={this.sendWSCommand}
              />,
              true
            );
          } else {
            this.queueStatusMessage(
              "Xem trước: Tổng thống đang xem trước 3 chính sách tiếp theo."
            );
          }
          break;

        case STATE_PP_ELECTION:
          this.queueEventUpdate("QUYỀN TỔNG THỐNG");
          if (isPresident) {
            this.queueAlert(
              SelectSpecialElectionPrompt(name, newState, this.sendWSCommand)
            );
          } else {
            this.queueStatusMessage(
              "Bầu cử đặc biệt: Tổng thống đang chọn tổng thống tiếp theo."
            );
          }
          break;

        case STATE_PP_EXECUTION:
          this.queueEventUpdate("QUYỀN TỔNG THỐNG");
          if (isPresident) {
            this.queueAlert(
              SelectExecutionPrompt(name, newState, this.sendWSCommand),
              true
            );
          } else {
            this.queueStatusMessage(
              "Hành quyết: Tổng thống đang chọn người chơi để hành quyết."
            );
          }
          break;

        case STATE_PP_INVESTIGATE:
          this.queueEventUpdate("QUYỀN TỔNG THỐNG");
          if (isPresident) {
            this.queueAlert(
              SelectInvestigationPrompt(name, newState, this.sendWSCommand)
            );
          } else {
            this.queueStatusMessage(
              "Điều tra: Tổng thống đang chọn người chơi để điều tra."
            );
          }
          break;

        case STATE_POST_LEGISLATIVE:
          // Show results of any special elections, executions, or investigations.
          switch (newState.lastState) {
            case STATE_PP_ELECTION:
              if (!isPresident) {
                console.log("Special Election Alert: " + newState.targetUser);
                this.queueAlert(
                  <ButtonPrompt
                    label={"BẦU CỬ ĐẶC BIỆT"}
                    footerText={
                      newState[PARAM_PRESIDENT] +
                      " đã chọn " +
                      newState.targetUser +
                      " làm tổng thống tiếp theo." +
                      "\nThứ tự tổng thống bình thường sẽ tiếp tục sau vòng tiếp theo."
                    }
                    buttonText={"HIỂU RỒI"}
                    buttonOnClick={this.hideAlertAndFinish}
                  >
                    <PlayerDisplay
                      user={name}
                      gameState={newState}
                      showLabels={false}
                      players={[newState.targetUser!]}
                    />
                  </ButtonPrompt>,
                  false
                );
              }
              break;
            case STATE_PP_EXECUTION:
              // If player was executed
              this.showExecutionResults(name, newState);
              break;
            case STATE_PP_INVESTIGATE:
              if (!isPresident) {
                let isTarget = newState.targetUser === name;
                let footerText = isTarget
                  ? `Bạn đã bị điều tra bởi ${newState[PARAM_PRESIDENT]}. Tổng thống bây giờ biết đảng phái của bạn.`
                  : `${newState.targetUser} đã bị điều tra bởi ${newState[PARAM_PRESIDENT]}. Tổng thống bây giờ biết đảng phái của họ.`;
                this.queueAlert(
                  <ButtonPrompt
                    label={"KẾT QUẢ ĐIỀU TRA"}
                    footerText={footerText}
                    buttonOnClick={this.hideAlertAndFinish}
                    buttonText={"HIỂU RỒI"}
                  >
                    <PlayerDisplay
                      user={name}
                      gameState={newState}
                      showLabels={false}
                      players={[newState.targetUser!]}
                    />
                  </ButtonPrompt>,
                  true
                );
              } else {
                // Is President; do nothing because we handle the
                // response directly from the server.
              }
              break;
            case STATE_PP_PEEK: // No additional case is necessary for peeking.
            default:
          }

          this.queueStatusMessage(
            "Đang chờ tổng thống kết thúc nhiệm kỳ."
          );
          break;

        case STATE_LIBERAL_VICTORY_EXECUTION:
        case STATE_FASCIST_VICTORY_ELECTION:
        case STATE_FASCIST_VICTORY_POLICY:
        case STATE_LIBERAL_VICTORY_POLICY:
          // Show normal enactments when victory events happen.
          if (newState.state === STATE_LIBERAL_VICTORY_EXECUTION) {
            this.showExecutionResults(name, newState);
          }
          if (newState.state === STATE_FASCIST_VICTORY_ELECTION) {
            this.addAnimationToQueue(() => this.showVotes(newState));
          }
          // Policies will already be shown for policy-based victories.
          // If the game was won via election, show the votes.

          // Divide fascist and liberal players.
          const fascistPlayers: string[] = [];
          const liberalPlayers: string[] = [];
          newState.playerOrder.forEach((player) => {
            const role = newState.players[player].id;
            if (role === Role.FASCIST || role === Role.HITLER) {
              fascistPlayers.push(player);
            } else {
              liberalPlayers.push(player);
            }
          });

          let victoryMessage: string,
            messageClass: string,
            headerImage: string,
            headerAlt: string;
          let players: string[] = [];
          let state = newState.state;
          let fascistVictoryPolicy = state === STATE_FASCIST_VICTORY_POLICY;
          let fascistVictoryElection = state === STATE_FASCIST_VICTORY_ELECTION;
          let liberalVictoryPolicy = state === STATE_LIBERAL_VICTORY_POLICY;
          let liberalVictoryExecution =
            state === STATE_LIBERAL_VICTORY_EXECUTION;
          let playerID = newState.players[name].id;
          let playerWon =
            (playerID === Role.LIBERAL &&
              (liberalVictoryExecution || liberalVictoryPolicy)) ||
            (playerID !== Role.LIBERAL &&
              (fascistVictoryElection || fascistVictoryPolicy));

          // Register player victory/loss with analytics.
          // TODO: Only register if player is host, or if player is the only
          // non-bot player in the game.
          if (playerWon) {
            ReactGA.event({
              category: "Victory",
              action: playerID + " team won the game.",
            });
          } else {
            ReactGA.event({
              category: "Loss",
              action: playerID + " team lost the game.",
            });
          }

          if (fascistVictoryElection || fascistVictoryPolicy) {
            players = fascistPlayers.concat(liberalPlayers);
            headerImage = VictoryFascistHeader;
            headerAlt = "Fascist Victory, written in red with a skull icon.";
            messageClass = "highlight";
            if (fascistVictoryPolicy) {
              victoryMessage = "Phát Xít đã thành công thông qua sáu chính sách!";
            } else if (fascistVictoryElection) {
              victoryMessage =
                "Phát Xít đã thành công bầu Hitler làm thủ tướng!";
            }
          } else {
            players = liberalPlayers.concat(fascistPlayers);
            headerImage = VictoryLiberalHeader;
            headerAlt = "Liberal Victory, written in blue with a dove icon.";
            messageClass = "highlight-blue";
            if (liberalVictoryPolicy) {
              victoryMessage = "Phe Tự Do đã thành công thông qua năm chính sách!";
            } else if (liberalVictoryExecution) {
              victoryMessage = "Phe Tự Do đã thành công hành quyết Hitler!";
            }
          }
          if (DEBUG) {
            console.log("Player ordering: " + players);
          }
          this.addAnimationToQueue(() => {
            this.setState({
              alertContent: (
                <ButtonPrompt
                  renderLabel={() => {
                    return (
                      <>
                        <img
                          src={headerImage}
                          alt={headerAlt}
                          id={"victory-header"}
                        />
                        <p
                          style={{ textAlign: "center" }}
                          className={messageClass}
                        >
                          {victoryMessage}
                        </p>
                      </>
                    );
                  }}
                  buttonText={"QUAY LẠI PHÒNG CHỜ"}
                  buttonOnClick={() => {
                    this.gameOver = false;
                    this.reconnectOnConnectionClosed = true;
                    this.tryOpenWebSocket(this.state.name, this.state.lobby);
                    this.hideAlertAndFinish();
                    this.setState({
                      page: PAGE.LOBBY,
                      gameState: DEFAULT_GAME_STATE,
                      liberalPolicies: 0,
                      fascistPolicies: 0,
                      electionTracker: 0,
                      drawDeckSize: 17,
                      discardDeckSize: 0,
                    });
                  }}
                >
                  <PlayerDisplay
                    players={players}
                    playerDisabledFilter={DISABLE_NONE}
                    showRoles={true}
                    showLabels={false}
                    useAsButtons={false}
                    user={this.state.name}
                    gameState={newState}
                  />
                </ButtonPrompt>
              ),
              showAlert: true,
            });
          });
          this.gameOver = true;
          this.reconnectOnConnectionClosed = false;
          this.websocket?.close();
          break;

        default:
        // Do nothing
      }
    }

    // Update the draw decks
    this.addAnimationToQueue(() => {
      this.setState({
        drawDeckSize: newState.drawSize,
        discardDeckSize: newState.discardSize,
      });
      this.onAnimationFinish();
    });
  }

  //// Animation Handling
  // <editor-fold desc="Animation Handling">

  /**
   * Plays the next animation in the queue if it exists.
   * @effects If {@code this.animationQueue} is not empty,
   *          removes the function at the front of the animation queue and calls it.
   */
  onAnimationFinish() {
    if (this.animationQueue.length > 0) {
      let func = this.animationQueue.shift();
      if (func !== undefined) {
        func(); //call the function.
      }
    } else {
      // the animation queue is empty, so we set a flag.
      this.allAnimationsFinished = true;
      this.setState({ allAnimationsFinished: true });
    }
  }

  /**
   * Clears the animation queue and ends any currently playing animations.
   */
  clearAnimationQueue() {
    this.allAnimationsFinished = true;
    this.setState({ allAnimationsFinished: true });
    this.animationQueue = [];
  }

  /**
   * Adds the specified animation to the end of the queue.
   * @param func {function} the function to add to the animation queue.
   * @effects Adds the function to the back of the animation queue. If no animations are currently playing,
   *          starts the specified animation.
   */
  addAnimationToQueue(func: () => void) {
    this.animationQueue.push(func);
    if (this.allAnimationsFinished) {
      this.allAnimationsFinished = false;
      this.setState({ allAnimationsFinished: false });
      let func = this.animationQueue.shift();
      if (func !== undefined) {
        func(); //call the function.
      }
    }
  }

  showVotes(newState: GameState) {
    this.setState({ statusBarText: "Đang kiểm phiếu..." });
    setTimeout(() => {
      this.setState({ showVotes: true });
    }, 1000);
    // Calculate final result:

    let noVotes = 0;
    let yesVotes = 0;
    Object.values(newState.userVotes).forEach((value) => {
      if (value) {
        yesVotes++;
      } else {
        noVotes++;
      }
    });
    setTimeout(() => {
      if (yesVotes > noVotes) {
        this.setState({
          statusBarText: yesVotes + " - " + noVotes + ": Bỏ phiếu thành công",
        });
      } else {
        this.setState({
          statusBarText: yesVotes + " - " + noVotes + ": Bỏ phiếu thất bại",
        });
      }
    }, 2000);
    setTimeout(
      () => this.setState({ showVotes: false, statusBarText: "" }),
      6000
    );
    setTimeout(() => {
      this.onAnimationFinish();
    }, 6500);
  }

  /**
   * Adds a listener to be called when the server returns an 'OK' status.
   * @param func The function to be called.
   * @effects adds the listener to the queue of functions. When the server returns an 'OK' status, all of the
   *          listeners will be called and then cleared from the queue.
   */
  addServerOKListener(func: () => void) {
    this.okMessageListeners.push(func);
  }

  /**
   * Hides the CustomAlert and marks this animation as finished.
   * @param delayExit {boolean} When true, delays advancing the animation queue until after the alert is hidden.
   * @effects: Sets {@code this.state.showAlert} to false and hides the CustomAlert.
   *           If delayExit is true, waits until the CustomAlert is done hiding before advancing the animation queue.
   *           Otherwise, immediately queues the next animation.
   */
  hideAlertAndFinish(delayExit = true) {
    this.setState({ showAlert: false });
    if (delayExit) {
      setTimeout(() => {
        this.setState({ alertContent: <div /> }); // reset the alert box contents
        this.onAnimationFinish();
      }, CUSTOM_ALERT_FADE_DURATION);
    } else {
      this.setState({ alertContent: <div /> });
      this.onAnimationFinish();
    }
  }

  /**
   * Shows the eventBar for a set period of time.
   * @param message {String} the message for the Event Bar to be fully visible.
   * @param duration {Number} the duration (in ms) for the Event Bar to be visible. (default is 3000 ms).
   * @effects Adds a function to the animation queue that, when called, shows the EventBar with the given message
   *          for {@code duration} ms, then advances to the next animation when finished.
   */
  queueEventUpdate(message: string, duration = 2000) {
    this.addAnimationToQueue(() => {
      this.setState({
        showEventBar: true,
        eventBarMessage: message,
      });
      setTimeout(() => {
        this.setState({ showEventBar: false });
      }, duration);
      setTimeout(() => {
        this.onAnimationFinish();
      }, duration + EVENT_BAR_FADE_OUT_DURATION);
    });
  }

  /**
   * Adds a CustomAlert to the animation queue.
   * @param content {html} the contents to be shown in the AlertBox.
   * @param closeOnOK {boolean} whether to close the alert when the server responds with an ok message. (default = true)
   * @effects Adds a new function to the animation queue that, when called, causes a CustomAlert with the
   *          given {@code content} to appear. If {@code closeOnOK} is true, once shown, the alert box will
   *          be closed when the server responds with an 'ok' to any command. (There will be a short delay before the
   *          animation queue advances if not waiting for a server response.)
   */
  queueAlert(content: React.JSX.Element, closeOnOK = true) {
    this.addAnimationToQueue(() => {
      this.setState({
        alertContent: content,
        showAlert: true,
      });
      if (closeOnOK) {
        // Remove the exit delay if waiting for the server response, because otherwise the player will lag
        // behind everyone else.
        this.addServerOKListener(() => this.hideAlertAndFinish(false));
      }
    });
  }

  /**
   * Adds an update to the status message to the animation queue.
   * @param message {String} the text for the status bar to display.
   * @effects Adds a new function to the animation queue that, when called, updates {@code this.state.statusBarText} to
   *          the message provided then instantly advances the animation queue.
   */
  queueStatusMessage(message: string) {
    this.addAnimationToQueue(() => {
      this.setState({ statusBarText: message });
      this.onAnimationFinish();
    });
  }

  // </editor-fold>

  /**
   * Renders the game page.
   */
  renderGamePage() {
    return (
      <div className="App" style={{ textAlign: "center" }}>
        <header className="App-header">BÍ MẬT HITLER - Nguyễn Minh Trí Edition</header>

        <CustomAlert show={this.state.showAlert}>
          {this.state.alertContent}
        </CustomAlert>

        <EventBar
          show={this.state.showEventBar}
          message={this.state.eventBarMessage}
        />

        <div style={{ backgroundColor: "var(--backgroundDark)" }}>
          <PlayerDisplay
            gameState={this.state.gameState}
            user={this.state.name}
            showVotes={this.state.showVotes}
            showBusy={this.state.allAnimationsFinished} // Only show busy when there isn't an active animation.
            playerDisabledFilter={DISABLE_EXECUTED_PLAYERS}
          />
        </div>

        <StatusBar>{this.state.statusBarText}</StatusBar>

        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: "30px", margin: "20px" }}>
          <RulesPanel side="left" />

          <div style={{ display: "inline-block", maxWidth: "800px" }}>
            <div
              id={"Board Layout"}
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                margin: "10px auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: "15px",
                }}
              >
                <Deck cardCount={this.state.drawDeckSize} deckType={"DRAW"} />

                <div style={{ margin: "auto auto" }}>
                  <button
                    disabled={
                      this.state.gameState[PARAM_STATE] !==
                      STATE_POST_LEGISLATIVE ||
                      this.state.name !== this.state.gameState[PARAM_PRESIDENT]
                    }
                    onClick={() => {
                      this.sendWSCommand({ command: WSCommandType.END_TERM });
                    }}
                  >
                    {" "}
                    KẾT THÚC NHIỆM KỲ
                  </button>

                  <PlayerPolicyStatus
                    numFascistPolicies={this.state.fascistPolicies}
                    numLiberalPolicies={this.state.liberalPolicies}
                    playerCount={this.state.gameState.playerOrder.length}
                  />
                </div>

                <Deck
                  cardCount={this.state.discardDeckSize}
                  deckType={"DISCARD"}
                />
              </div>

              <Board
                numPlayers={this.state.gameState.playerOrder.length}
                numFascistPolicies={this.state.fascistPolicies}
                numLiberalPolicies={this.state.liberalPolicies}
                electionTracker={this.state.electionTracker}
              />
            </div>
          </div>

          <RulesPanel side="right" />
        </div>

        <div style={{ textAlign: "center" }}>
          <div id="snackbar">{this.state.snackbarMessage}</div>
        </div>
      </div>
    );
  }

  //</editor-fold>

  render() {
    // Check URL params. If joining from a lobby link, open the lobby with the given code.
    let url = window.location.search;
    let lobby = new URLSearchParams(url).get("lobby");
    if (lobby !== null && !this.state.lobbyFromURL) {
      ReactGA.event({
        category: "Lobby Link",
        action: "User is using a lobby link.",
      });
      this.setState({
        joinLobby: lobby.toUpperCase().substr(0, 4),
        lobbyFromURL: true,
      });
    }

    let page_render;
    switch (this.state.page) {
      case PAGE.LOBBY:
        page_render = this.renderLobbyPage();
        break;
      case PAGE.GAME:
        page_render = this.renderGamePage();
        break;
      case PAGE.LOGIN: // login is default
      default:
        page_render = this.renderLoginPage();
    }
    return (
      <>
        <HelmetMetaData />
        {page_render}
      </>
    );
  }
}

export default App;
