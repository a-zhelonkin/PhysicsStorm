import {connect} from "socket.io-client";
import SocketIO, {Socket} from "socket.io";
import ConsoleLogger from "../../shared/logging/console-logger";
import Logger from "../../shared/logging/logger";
import Vector2 from "../../shared/data/vector2";
import {
    WS_EVENT_CONNECT,
    WS_EVENT_DISCONNECT,
    WS_EVENT_MESSAGE,
    WS_EVENT_REGISTER_REQUEST,
    WS_EVENT_REGISTER_RESPONSE,
    WS_KEY_DATA,
    WS_KEY_ID,
    WS_KEY_INPUT,
    WS_KEY_INPUT_CLICK,
    WS_KEY_INPUT_JUMP,
    WS_KEY_INPUT_LEFT,
    WS_KEY_INPUT_RIGHT,
    WS_KEY_INPUT_STOP,
    WS_KEY_TIME
} from "../../shared/constants-ws";

export default class GameClient {

    private static readonly log: Logger = new ConsoleLogger(GameClient);

    private _id: string;
    private _socket: any;

    public set onMessage(onMessage: any) {
        this._socket.on(WS_EVENT_MESSAGE, onMessage);
    }

    private _onRegister: any;

    public set onRegister(onRegister: any) {
        this._onRegister = onRegister;
    }

    public constructor(url: string) {
        this.connect(url);
    }

    public connect(url: string): void {
        if (this._socket) {
            this._socket.destroy();
            delete this._socket;
            this._socket = undefined;
        }

        this._socket = connect();
        // this._socket = connect(url, {
        //     reconnection: true,
        //     reconnectionDelay: 1000,
        //     reconnectionDelayMax: 5000,
        //     reconnectionAttempts: Infinity
        // });

        this._socket.on(WS_EVENT_CONNECT, () => {
            GameClient.log.debug("Connected to server");

            this._socket.on(WS_EVENT_REGISTER_RESPONSE, (id: string) => {
                GameClient.log.debug(`Registered as ${id}`);

                this._id = id;
                this._onRegister(id);
            });

            this._socket.emit(WS_EVENT_REGISTER_REQUEST, this._id);

            this._socket.on(WS_EVENT_DISCONNECT, () => {
                GameClient.log.debug("Disconnected from server");

                setTimeout(() => this.connect(url), 5000);
            });
        });
    }

    public right(): void {
        this._sendInput({[WS_KEY_INPUT]: WS_KEY_INPUT_RIGHT});
    }

    public left(): void {
        this._sendInput({[WS_KEY_INPUT]: WS_KEY_INPUT_LEFT});
    }

    public stop(): void {
        this._sendInput({[WS_KEY_INPUT]: WS_KEY_INPUT_STOP});
    }

    public jump(): void {
        this._sendInput({[WS_KEY_INPUT]: WS_KEY_INPUT_JUMP});
    }

    public click(target: Vector2): void {
        this._sendInput({[WS_KEY_INPUT]: WS_KEY_INPUT_CLICK, [WS_KEY_DATA]: target});
    }

    private _sendInput(message: any): void {
        message[WS_KEY_ID] = this._id;
        message[WS_KEY_TIME] = Date.now();
        this._socket.emit(WS_EVENT_MESSAGE, message);
    }

}