interface IHasher {
    sum(message: string): Promise<string>;
}
interface INoncer {
    generate128(): Promise<string>;
}
interface IVerifier {
    verify(message: string, signature: string, publicKey: string): Promise<void>;
}
interface IVerificationKey {
    public(): Promise<string>;
    verifier(): IVerifier;
    verify(message: string, signature: string): Promise<void>;
}
interface ISigningKey extends IVerificationKey {
    identity(): Promise<string>;
    sign(message: string): Promise<string>;
}

interface IClientValueStore {
    store(value: string): Promise<void>;
    get(): Promise<string>;
}
interface IClientRotatingKeyStore {
    initialize(extraData?: string): Promise<[string, string, string]>;
    next(): Promise<[ISigningKey, string]>;
    rotate(): Promise<void>;
    signer(): Promise<ISigningKey>;
}
interface IVerificationKeyStore {
    get(identity: string): Promise<IVerificationKey>;
}
interface IServerAuthenticationNonceStore {
    lifetimeInSeconds: number;
    generate(identity: string): Promise<string>;
    validate(nonce: string): Promise<string>;
}
interface IServerAuthenticationKeyStore {
    register(identity: string, device: string, publicKey: string, rotationHash: string, existingIdentity: boolean): Promise<void>;
    rotate(identity: string, device: string, publicKey: string, rotationHash: string): Promise<void>;
    public(identity: string, device: string): Promise<string>;
    revokeDevice(identity: string, device: string): Promise<void>;
    revokeDevices(identity: string): Promise<void>;
    deleteIdentity(identity: string): Promise<void>;
    ensureActive(identity: string, device: string): Promise<void>;
}
interface IServerRecoveryHashStore {
    register(identity: string, keyHash: string): Promise<void>;
    rotate(identity: string, oldHash: string, newHash: string): Promise<void>;
    change(identity: string, keyHash: string): Promise<void>;
}
interface IServerTimeLockStore {
    lifetimeInSeconds: number;
    reserve(value: string): Promise<void>;
}

interface INetwork {
    sendRequest(path: string, message: string): Promise<string>;
}

interface IAuthenticationPaths {
    account: {
        create: string;
        recover: string;
        delete: string;
    };
    session: {
        request: string;
        create: string;
        refresh: string;
    };
    device: {
        rotate: string;
        link: string;
        unlink: string;
    };
    recovery: {
        change: string;
    };
}

interface ITimestamper {
    format(when: Date): string;
    parse(when: string | Date): Date;
    now(): Date;
}
interface ITokenEncoder {
    encode(object: string): Promise<string>;
    decode(rawToken: string): Promise<string>;
    signatureLength(token: string): Promise<number>;
}
interface IIdentityVerifier {
    verify(identity: string, publicKey: string, rotationHash: string, extraData?: string): Promise<void>;
}

interface Signable {
    composePayload(): string;
}
interface Serializable {
    serialize(): Promise<string>;
}
declare abstract class SerializableMessage implements Serializable {
    abstract serialize(): Promise<string>;
}
declare abstract class SignableMessage extends SerializableMessage implements Signable {
    payload?: object;
    signature?: string;
    composePayload(): string;
    serialize(): Promise<string>;
    sign(signer: ISigningKey): Promise<void>;
    verify(verifier: IVerifier, publicKey: string): Promise<void>;
}

interface IClientAccess {
    nonce: string;
}
interface IClientPayload<T> {
    access: IClientAccess;
    request: T;
}
interface IClientRequest<T> {
    payload: IClientPayload<T>;
    signature?: string;
}
declare class ClientRequest<T> extends SignableMessage implements IClientRequest<T> {
    payload: IClientPayload<T>;
    constructor(request: T, nonce: string);
    static _parse<T, U extends ClientRequest<T>>(message: string, constructor: new (request: T, nonce: string) => U): ClientRequest<T>;
}

interface IServerAccess {
    nonce: string;
    serverIdentity: string;
}
interface IServerPayload<T> {
    access: IServerAccess;
    response: T;
}
interface IServerResponse<T> {
    payload: IServerPayload<T>;
    signature?: string;
}
declare class ServerResponse<T> extends SignableMessage implements IServerResponse<T> {
    payload: IServerPayload<T>;
    constructor(response: T, serverIdentity: string, nonce: string);
    static _parse<T, U extends ServerResponse<T>>(message: string, constructor: new (response: T, publicKeyHash: string, nonce: string) => U): ServerResponse<T>;
}
interface IScannableResponse {
}
declare class ScannableResponse extends ServerResponse<IScannableResponse> {
    static parse(message: string): ScannableResponse;
}

interface ICreateAccountRequest {
    authentication: {
        device: string;
        identity: string;
        publicKey: string;
        recoveryHash: string;
        rotationHash: string;
    };
}
declare class CreateAccountRequest extends ClientRequest<ICreateAccountRequest> {
    static parse(message: string): CreateAccountRequest;
}
interface ICreateAccountResponse {
}
declare class CreateAccountResponse extends ServerResponse<ICreateAccountResponse> {
    static parse(message: string): CreateAccountResponse;
}
interface IDeleteAccountRequest {
    authentication: {
        device: string;
        identity: string;
        publicKey: string;
        rotationHash: string;
    };
}
declare class DeleteAccountRequest extends ClientRequest<IDeleteAccountRequest> {
    static parse(message: string): DeleteAccountRequest;
}
interface IDeleteAccountResponse {
}
declare class DeleteAccountResponse extends ServerResponse<IDeleteAccountResponse> {
    static parse(message: string): DeleteAccountResponse;
}
interface IRecoverAccountRequest {
    authentication: {
        device: string;
        identity: string;
        publicKey: string;
        recoveryHash: string;
        recoveryKey: string;
        rotationHash: string;
    };
}
declare class RecoverAccountRequest extends ClientRequest<IRecoverAccountRequest> {
    static parse(message: string): RecoverAccountRequest;
}
interface IRecoverAccountResponse {
}
declare class RecoverAccountResponse extends ServerResponse<IRecoverAccountResponse> {
    static parse(message: string): RecoverAccountResponse;
}

interface ILinkContainer {
    payload: {
        authentication: {
            device: string;
            identity: string;
            publicKey: string;
            rotationHash: string;
        };
    };
    signature?: string;
}
declare class LinkContainer extends SignableMessage implements ILinkContainer {
    payload: {
        authentication: {
            device: string;
            identity: string;
            publicKey: string;
            rotationHash: string;
        };
    };
    constructor(payload: {
        authentication: {
            device: string;
            identity: string;
            publicKey: string;
            rotationHash: string;
        };
    });
    composePayload(): string;
    static parse(message: string): LinkContainer;
}
interface ILinkDeviceRequest {
    authentication: {
        device: string;
        identity: string;
        publicKey: string;
        rotationHash: string;
    };
    link: ILinkContainer;
}
declare class LinkDeviceRequest extends ClientRequest<ILinkDeviceRequest> {
    static parse(message: string): LinkDeviceRequest;
}
interface ILinkDeviceResponse {
}
declare class LinkDeviceResponse extends ServerResponse<ILinkDeviceResponse> {
    static parse(message: string): LinkDeviceResponse;
}
interface IUnlinkDeviceRequest {
    authentication: {
        device: string;
        identity: string;
        publicKey: string;
        rotationHash: string;
    };
    link: {
        device: string;
    };
}
declare class UnlinkDeviceRequest extends ClientRequest<IUnlinkDeviceRequest> {
    static parse(message: string): UnlinkDeviceRequest;
}
interface IUnlinkDeviceResponse {
}
declare class UnlinkDeviceResponse extends ServerResponse<IUnlinkDeviceResponse> {
    static parse(message: string): UnlinkDeviceResponse;
}
interface IRotateDeviceRequest {
    authentication: {
        device: string;
        identity: string;
        publicKey: string;
        rotationHash: string;
    };
}
declare class RotateDeviceRequest extends ClientRequest<IRotateDeviceRequest> {
    static parse(message: string): RotateDeviceRequest;
}
interface IRotateDeviceResponse {
}
declare class RotateDeviceResponse extends ServerResponse<IRotateDeviceResponse> {
    static parse(message: string): RotateDeviceResponse;
}

interface IRequestSessionRequest {
    payload: {
        access: {
            nonce: string;
        };
        request: {
            authentication: {
                identity: string;
            };
        };
    };
}
declare class RequestSessionRequest extends SerializableMessage implements IRequestSessionRequest {
    payload: {
        access: {
            nonce: string;
        };
        request: {
            authentication: {
                identity: string;
            };
        };
    };
    constructor(payload: {
        access: {
            nonce: string;
        };
        request: {
            authentication: {
                identity: string;
            };
        };
    });
    serialize(): Promise<string>;
    static parse(message: string): RequestSessionRequest;
}
interface IRequestSessionResponse {
    authentication: {
        nonce: string;
    };
}
declare class RequestSessionResponse extends ServerResponse<IRequestSessionResponse> {
    static parse(message: string): RequestSessionResponse;
}
interface ICreateSessionRequest {
    access: {
        publicKey: string;
        rotationHash: string;
    };
    authentication: {
        device: string;
        nonce: string;
    };
}
declare class CreateSessionRequest extends ClientRequest<ICreateSessionRequest> {
    static parse(message: string): CreateSessionRequest;
}
interface ICreateSessionResponse {
    access: {
        token: string;
    };
}
declare class CreateSessionResponse extends ServerResponse<ICreateSessionResponse> {
    static parse(message: string): CreateSessionResponse;
}
interface IRefreshSessionRequest {
    access: {
        publicKey: string;
        rotationHash: string;
        token: string;
    };
}
declare class RefreshSessionRequest extends ClientRequest<IRefreshSessionRequest> {
    static parse(message: string): RefreshSessionRequest;
}
interface IRefreshSessionResponse {
    access: {
        token: string;
    };
}
declare class RefreshSessionResponse extends ServerResponse<IRefreshSessionResponse> {
    static parse(message: string): RefreshSessionResponse;
}

interface IChangeRecoveryKeyRequest {
    authentication: {
        device: string;
        identity: string;
        publicKey: string;
        recoveryHash: string;
        rotationHash: string;
    };
}
declare class ChangeRecoveryKeyRequest extends ClientRequest<IChangeRecoveryKeyRequest> {
    static parse(message: string): ChangeRecoveryKeyRequest;
}
interface IChangeRecoveryKeyResponse {
}
declare class ChangeRecoveryKeyResponse extends ServerResponse<IChangeRecoveryKeyResponse> {
    static parse(message: string): ChangeRecoveryKeyResponse;
}

interface IAccessToken<T> {
    serverIdentity: string;
    device: string;
    identity: string;
    publicKey: string;
    rotationHash: string;
    issuedAt: string;
    expiry: string;
    refreshExpiry: string;
    attributes: T;
}
declare class AccessToken<T> extends SignableMessage implements IAccessToken<T> {
    serverIdentity: string;
    device: string;
    identity: string;
    publicKey: string;
    rotationHash: string;
    issuedAt: string;
    expiry: string;
    refreshExpiry: string;
    attributes: T;
    constructor(serverIdentity: string, device: string, identity: string, publicKey: string, rotationHash: string, issuedAt: string, expiry: string, refreshExpiry: string, attributes: T);
    static parse<T>(message: string, tokenEncoder: ITokenEncoder): Promise<AccessToken<T>>;
    composePayload(): string;
    serializeToken(tokenEncoder: ITokenEncoder): Promise<string>;
    verifySignature(verifier: IVerifier, publicKey: string): Promise<void>;
    verifyTokenForAccess(verifier: IVerifier, publicKey: string, timestamper: ITimestamper): Promise<void>;
}
interface IAccessRequest<T> {
    payload: {
        access: {
            nonce: string;
            timestamp: string;
            token: string;
        };
        request: T;
    };
    signature?: string;
}
declare class AccessRequest<T> extends SignableMessage implements IAccessRequest<T> {
    payload: {
        access: {
            nonce: string;
            timestamp: string;
            token: string;
        };
        request: T;
    };
    constructor(payload: {
        access: {
            nonce: string;
            timestamp: string;
            token: string;
        };
        request: T;
    });
    _verify<T>(nonceStore: IServerTimeLockStore, verifier: IVerifier, accessKeyStore: IVerificationKeyStore, tokenEncoder: ITokenEncoder, timestamper: ITimestamper): Promise<AccessToken<T>>;
    static parse<T>(message: string): AccessRequest<T>;
}

declare class BetterAuthServer {
    private readonly args;
    constructor(args: {
        crypto: {
            hasher: IHasher;
            keyPair: {
                response: ISigningKey;
                access: ISigningKey;
            };
            noncer: INoncer;
            verifier: IVerifier;
        };
        encoding: {
            identityVerifier: IIdentityVerifier;
            timestamper: ITimestamper;
            tokenEncoder: ITokenEncoder;
        };
        expiry: {
            accessInMinutes: number;
            refreshInHours: number;
        };
        store: {
            access: {
                verificationKey: IVerificationKeyStore;
                keyHash: IServerTimeLockStore;
            };
            authentication: {
                key: IServerAuthenticationKeyStore;
                nonce: IServerAuthenticationNonceStore;
            };
            recovery: {
                hash: IServerRecoveryHashStore;
            };
        };
    });
    createAccount(message: string): Promise<string>;
    deleteAccount(message: string): Promise<string>;
    recoverAccount(message: string): Promise<string>;
    linkDevice(message: string): Promise<string>;
    unlinkDevice(message: string): Promise<string>;
    rotateDevice(message: string): Promise<string>;
    requestSession(message: string): Promise<string>;
    createSession<T>(message: string, attributes: T): Promise<string>;
    refreshSession<T>(message: string): Promise<string>;
    changeRecoveryKey(message: string): Promise<string>;
}
declare class AccessVerifier {
    private readonly args;
    constructor(args: {
        crypto: {
            verifier: IVerifier;
        };
        encoding: {
            tokenEncoder: ITokenEncoder;
            timestamper: ITimestamper;
        };
        store: {
            access: {
                nonce: IServerTimeLockStore;
                key: IVerificationKeyStore;
            };
        };
    });
    verify<T, U>(message: string): Promise<[T, AccessToken<U>, string]>;
}

declare class BetterAuthClient {
    private readonly args;
    constructor(args: {
        crypto: {
            hasher: IHasher;
            noncer: INoncer;
        };
        encoding: {
            timestamper: ITimestamper;
        };
        io: {
            network: INetwork;
        };
        paths: IAuthenticationPaths;
        store: {
            identifier: {
                device: IClientValueStore;
                identity: IClientValueStore;
            };
            key: {
                access: IClientRotatingKeyStore;
                authentication: IClientRotatingKeyStore;
                response: IVerificationKeyStore;
            };
            token: {
                access: IClientValueStore;
            };
        };
    });
    identity(): Promise<string>;
    device(): Promise<string>;
    private verifyResponse;
    createAccount(recoveryHash: string): Promise<void>;
    deleteAccount(): Promise<void>;
    recoverAccount(identity: string, recoveryKey: ISigningKey, recoveryHash: string): Promise<void>;
    generateLinkContainer(identity: string): Promise<string>;
    linkDevice(linkContainer: string): Promise<void>;
    unlinkDevice(device: string): Promise<void>;
    rotateDevice(): Promise<void>;
    createSession(): Promise<void>;
    refreshSession(): Promise<void>;
    changeRecoveryKey(recoveryHash: string): Promise<void>;
    makeAccessRequest<T>(path: string, request: T): Promise<string>;
}

/**
 * Better Auth Error Classes
 *
 * Standardized error types for all Better Auth operations.
 * See ERRORS.md in the root repository for complete specification.
 */
declare class BetterAuthError extends Error {
    readonly code: string;
    readonly context?: Record<string, unknown>;
    constructor(message: string, code: string, context?: Record<string, unknown>);
    toJSON(): Record<string, unknown>;
}
declare class InvalidMessageError extends BetterAuthError {
    constructor(field?: string, details?: string);
}
declare class InvalidIdentityError extends BetterAuthError {
    constructor(provided?: string, details?: string);
}
declare class InvalidDeviceError extends BetterAuthError {
    constructor(provided?: string, calculated?: string);
}
declare class InvalidHashError extends BetterAuthError {
    constructor(expected?: string, actual?: string, hashType?: string);
}
declare class IncorrectNonceError extends BetterAuthError {
    constructor(expected?: string, actual?: string);
}
declare class MismatchedIdentitiesError extends BetterAuthError {
    constructor(linkContainerIdentity?: string, requestIdentity?: string);
}
declare class ExpiredTokenError extends BetterAuthError {
    constructor(expiryTime?: string, currentTime?: string, tokenType?: 'access' | 'refresh');
}
declare class FutureTokenError extends BetterAuthError {
    constructor(issuedAt?: string, currentTime?: string, timeDifference?: number);
}
declare class StaleRequestError extends BetterAuthError {
    constructor(requestTimestamp?: string, currentTime?: string, maximumAge?: number);
}
declare class FutureRequestError extends BetterAuthError {
    constructor(requestTimestamp?: string, currentTime?: string, timeDifference?: number);
}

export { AccessRequest, AccessToken, AccessVerifier, BetterAuthClient, BetterAuthError, BetterAuthServer, ChangeRecoveryKeyRequest, ChangeRecoveryKeyResponse, ClientRequest, CreateAccountRequest, CreateAccountResponse, CreateSessionRequest, CreateSessionResponse, DeleteAccountRequest, DeleteAccountResponse, ExpiredTokenError, FutureRequestError, FutureTokenError, type IAccessRequest, type IAccessToken, type IAuthenticationPaths, type IChangeRecoveryKeyRequest, type IClientRotatingKeyStore, type IClientValueStore, type ICreateAccountRequest, type IDeleteAccountRequest, type IHasher, type IIdentityVerifier, type INetwork, type INoncer, type IServerAuthenticationKeyStore, type IServerAuthenticationNonceStore, type IServerRecoveryHashStore, type IServerTimeLockStore, type ISigningKey, type ITimestamper, type ITokenEncoder, type IVerificationKey, type IVerificationKeyStore, type IVerifier, IncorrectNonceError, InvalidDeviceError, InvalidHashError, InvalidIdentityError, InvalidMessageError, LinkContainer, LinkDeviceRequest, LinkDeviceResponse, MismatchedIdentitiesError, RecoverAccountRequest, RecoverAccountResponse, RefreshSessionRequest, RefreshSessionResponse, RequestSessionRequest, RequestSessionResponse, RotateDeviceRequest, RotateDeviceResponse, ScannableResponse, SerializableMessage, ServerResponse, SignableMessage, StaleRequestError, UnlinkDeviceRequest, UnlinkDeviceResponse, BetterAuthClient as default };
