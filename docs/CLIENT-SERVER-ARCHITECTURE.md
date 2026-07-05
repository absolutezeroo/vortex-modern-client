# Habbo Client-Server Architecture

How Arcturus-Community (server) and habbo-client-clean (client) work together.

**Server:** Arcturus Morningstar 4.0.3-beta — Java 21, Netty 4.1, MySQL
**Client:** PRODUCTION-201611291003-338511768 — ActionScript 3 / Flash Player 25
**Protocol:** Binary TCP with EvaWireFormat framing, optional RC4 encryption

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Connection Lifecycle](#2-connection-lifecycle)
3. [Wire Protocol](#3-wire-protocol)
4. [Encryption Negotiation](#4-encryption-negotiation)
5. [Authentication](#5-authentication)
6. [Packet System In Depth](#6-packet-system-in-depth)
7. [Room System](#7-room-system)
8. [Chat](#8-chat)
9. [Catalog and Purchasing](#9-catalog-and-purchasing)
10. [Inventory](#10-inventory)
11. [Navigator](#11-navigator)
12. [Messenger and Friends](#12-messenger-and-friends)
13. [Trading](#13-trading)
14. [Groups and Guilds](#14-groups-and-guilds)
15. [Avatar System](#15-avatar-system)
16. [Moderation](#16-moderation)
17. [WIRED](#17-wired)
18. [Pets and Bots](#18-pets-and-bots)
19. [Games](#19-games)
20. [Achievements](#20-achievements)
21. [Packet Alignment Audit](#21-packet-alignment-audit)
22. [Configuration and Deployment](#22-configuration-and-deployment)
23. [Threading and Performance](#23-threading-and-performance)
24. [Known Issues](#24-known-issues)
25. [Architecture Diagrams](#25-architecture-diagrams)

---

## 1. System Overview

### What Each Side Does

The **server** (Arcturus-Community) is the authoritative game state manager. It owns all
persistent data (users, rooms, items, currencies), enforces game rules, validates every
action, and broadcasts state changes to connected clients. It never trusts the client.

The **client** (habbo-client-clean) is a Flash-based rendering and input layer. It presents
the hotel visually, captures user input, sends requests to the server, and applies the
server's responses to the local display. It has no authority over game state.

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER / FLASH PLAYER                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  habbo-client-clean (ActionScript 3)                  │  │
│  │  ├─ Habbo.as              Entry point & preloader     │  │
│  │  ├─ HabboMain.as          Component bootstrap         │  │
│  │  ├─ com/sulake/core/       Core framework             │  │
│  │  │   └─ communication/     SocketConnection, codecs   │  │
│  │  └─ com/sulake/habbo/      Game modules               │  │
│  │      ├─ communication/     Protocol, messages          │  │
│  │      ├─ room/              Room engine & rendering     │  │
│  │      ├─ catalog/           Shop UI                     │  │
│  │      ├─ inventory/         Inventory UI                │  │
│  │      ├─ navigator/         Room browser UI             │  │
│  │      ├─ avatar/            Figure rendering            │  │
│  │      └─ [20+ subsystems]                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │ TCP Socket                      │
└───────────────────────────┼─────────────────────────────────┘
                            │
              ══════════════╪══════════════  Network
                            │
┌───────────────────────────┼─────────────────────────────────┐
│  Arcturus-Community (Java 21)                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Emulator.java            Service locator & main()    │  │
│  │  ├─ networking/            Netty server & pipeline     │  │
│  │  │   └─ GameServer         TCP listener on :30000     │  │
│  │  ├─ messages/              Packet dispatch             │  │
│  │  │   ├─ PacketManager      Handler registry            │  │
│  │  │   ├─ incoming/          ~500 MessageHandler classes │  │
│  │  │   └─ outgoing/          ~500 MessageComposer classes│  │
│  │  ├─ habbohotel/            Domain logic                │  │
│  │  │   ├─ GameEnvironment    Composition root            │  │
│  │  │   ├─ rooms/             Room state & cycle          │  │
│  │  │   ├─ users/             Habbo, HabboInfo, stats     │  │
│  │  │   ├─ items/             Item definitions            │  │
│  │  │   ├─ catalog/           Purchase logic              │  │
│  │  │   └─ [15+ managers]                                 │  │
│  │  ├─ crypto/                DH + RC4 encryption         │  │
│  │  └─ database/              HikariCP → MySQL            │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                 │
│                    ┌──────┴──────┐                          │
│                    │   MySQL DB  │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Summary

Every interaction follows the same pattern:

1. User performs an action in the client (click, type, drag)
2. Client constructs a `MessageComposer` and sends it over the socket
3. Server's Netty pipeline decodes the bytes into a `ClientMessage`
4. `PacketManager` looks up the header ID and instantiates the matching `MessageHandler`
5. Handler executes business logic (DB queries, state mutations, validation)
6. Handler sends one or more `MessageComposer` responses back to the client (or broadcasts to a room)
7. Client receives, decodes, and dispatches each response to the appropriate `MessageEvent`
8. `MessageParser` extracts fields; callback updates UI/room state

---

## 2. Connection Lifecycle

### Phase 1: TCP Connection

The client reads connection parameters from its SWF loader:

```
connection.info.host = "127.0.0.1"
connection.info.port = "30000,3000,30001"  // fallback ports
```

`HabboCommunicationManager` attempts to connect via `SocketConnection` (a `flash.net.Socket`
wrapper). If the first port fails within 10 seconds, it tries the next port. After exhausting
all ports, it retries the cycle 2-3 times before giving up.

On the server side, `GameServer` (extending Netty's `ServerBootstrap`) listens on
`game.host:game.port` (default `0.0.0.0:30000`). When a connection arrives, Netty fires
`channelRegistered` in `GameMessageHandler`, which calls `GameClientManager.addClient()` to
create a new `GameClient` instance bound to that channel.

### Phase 2: Flash Policy (Legacy)

Flash Player requires a socket policy file before allowing cross-domain connections. The
first bytes the client sends may be `<policy-file-request/>`. The server's
`GamePolicyDecoder` (first handler in the Netty pipeline) intercepts this, responds with an
XML policy granting access, and removes itself from the pipeline.

### Phase 3: Handshake

```
Client                                          Server
  │                                                │
  │──── ClientHelloMessageComposer ───────────────>│  "PRODUCTION-201611291003...", "FLASH"
  │     (header from HabboMessages.as)             │
  │                                                │  ReleaseVersionEvent handler (header 4000)
  │                                                │  Stores client version string
  │                                                │
  │──── UniqueIDMessageComposer ──────────────────>│  Machine ID / device fingerprint
  │                                                │  MachineIDEvent handler (header 2490)
  │                                                │  Stores in GameClient.machineId
  │                                                │
  │──── InitDiffieHandshakeMessageComposer ───────>│  Request encryption parameters
  │                                                │  InitDiffieHandshakeEvent (header 3110)
  │                                                │
  │<─── InitDiffieHandshakeComposer ──────────────│  RSA-encrypted DH prime, generator, server pubkey
  │                                                │
  │  (Client decrypts with RSA, generates DH pair) │
  │                                                │
  │──── CompleteDiffieHandshakeMessageComposer ──>│  Client's DH public key
  │                                                │  CompleteDiffieHandshakeEvent (header 773)
  │                                                │
  │  (Both compute shared secret → RC4 key)        │  Server inserts RC4 encoder/decoder into pipeline
  │                                                │
  │<─── CompleteDiffieHandshakeComposer ──────────│  Handshake confirmed
  │                                                │
  │  ════ ALL SUBSEQUENT PACKETS ARE RC4 ENCRYPTED ════
  │                                                │
  │──── SSOTicketMessageComposer ─────────────────>│  SSO token from web login
  │                                                │  SecureLoginEvent handler
  │                                                │
  │<─── AuthenticationOKMessageComposer ──────────│  Login successful
  │<─── UserRightsMessageComposer ──────────────────│  Rank & permissions
  │<─── UserEffectsListMessageComposer ──────────────────│  Active effects
  │<─── UserHomeRoomComposer ─────────────────────│  Home room ID
  │<─── ... (20+ initialization composers) ───────│  Full session bootstrap
  │                                                │
```

### Phase 4: Session

After authentication, the client is fully connected. The user sees the hotel view and can
navigate rooms, chat, trade, shop, etc. Each action generates outgoing packets; each server
response triggers UI updates.

### Phase 5: Disconnect

When the socket closes (user closes browser, network drop, or server kick):

**Client side:** `SocketConnection` fires `Event.CLOSE`. The client shows a disconnection
overlay and may attempt reconnection.

**Server side:** Netty fires `channelUnregistered` in `GameMessageHandler`, which calls
`GameClientManager.disposeClient()`:
1. Sets `habbo.online = false`
2. Removes habbo from current room (if any)
3. Persists final state to database
4. Fires `UserDisconnectEvent` for plugins
5. Removes `GameClient` from the client manager

---

## 3. Wire Protocol

Both sides use the same binary format, called **EvaWireFormat** on the client side.

### Frame Structure

Every message on the wire has this layout:

```
┌──────────────┬──────────────┬──────────────────────────┐
│ Length (4B)   │ Header (2B)  │ Body (variable)          │
│ big-endian    │ big-endian   │                          │
│ int32         │ uint16       │ type-specific fields     │
└──────────────┴──────────────┴──────────────────────────┘

Length = size of (Header + Body), NOT including the 4 length bytes themselves
```

### Data Types

| Type    | Wire Size | Encoding |
|---------|-----------|----------|
| int     | 4 bytes   | Big-endian signed 32-bit |
| short   | 2 bytes   | Big-endian signed 16-bit |
| boolean | 1 byte    | `0x00` = false, `0x01` = true |
| string  | 2 + N     | 2-byte UTF-8 length prefix, then N bytes of UTF-8 |
| byte[]  | 4 + N     | 4-byte length prefix, then N raw bytes |

### Server Side: Encoding and Decoding

The Netty pipeline processes packets in stages:

**Inbound (client → server):**
```
Raw bytes
  → GameByteFrameDecoder    Reads 4-byte length, waits for full frame
  → GameByteDecoder          Reads 2-byte header, wraps remainder as ClientMessage
  → GameMessageRateLimit     Checks per-handler rate limits
  → GameMessageHandler       Routes to PacketManager.handlePacket()
```

**Outbound (server → client):**
```
MessageComposer.compose()
  → ServerMessage            Writes [4B length placeholder][2B header][body fields]
  → GameServerMessageEncoder Encrypts body with RC4 (if enabled), finalizes length
  → Channel.writeAndFlush()  Sends bytes
```

`ClientMessage` provides sequential read methods:
```java
packet.readInt()       // read 4 bytes as int
packet.readShort()     // read 2 bytes as short
packet.readBoolean()   // read 1 byte as boolean
packet.readString()    // read 2-byte length + UTF-8 string
```

`ServerMessage` provides sequential write methods:
```java
response.appendInt(42)
response.appendShort((short) 1)
response.appendBoolean(true)
response.appendString("Hello")
```

### Client Side: Encoding and Decoding

`EvaWireFormat.as` mirrors the server's logic:

**Sending (outgoing):**
1. `MessageComposer.getMessageArray()` returns an `Array` of typed values
2. `EvaWireFormat.encode(headerId, array)` serializes to `ByteArray`
3. If post-handshake, `ArcFour.encipher()` encrypts the payload
4. `Socket.writeBytes()` sends the frame

**Receiving (incoming):**
1. `Socket.SOCKET_DATA` fires, raw bytes appended to `_dataBuffer`
2. `processReceivedData()` runs each frame tick (30 FPS)
3. `EvaWireFormat.decode()` reads 4-byte length, waits for full frame
4. Decrypts if encryption active
5. Reads 2-byte header, creates `EvaMessageDataWrapper(id, data)`
6. Header ID looked up in `HabboMessages.INCOMING_PACKETS` → `MessageEvent` class
7. `MessageEvent.parser.parse(wrapper)` extracts typed fields
8. Callback handler invoked (e.g., `RoomMessageHandler.onRoomUsers()`)

### Maximum Packet Size

Server enforces `MAX_PACKET_LENGTH = 417,792 bytes` in `GameByteFrameDecoder`. Packets
exceeding this are rejected and the connection is closed.

---

## 4. Encryption Negotiation

### Overview

Encryption is optional (controlled by `enc.enabled` in server config) but expected by this
client revision. The scheme uses RSA to protect a Diffie-Hellman key exchange, which produces
a shared secret used as an RC4 stream cipher key.

### Step-by-Step

**1. Client requests DH parameters** (`InitDiffieHandshakeMessageComposer`)
- Sends an empty or minimal packet to header 3110

**2. Server generates DH parameters** (`InitDiffieHandshakeEvent`)
- Generates a 128-bit DH prime `p` and generator `g`
- Generates server keypair: private `a`, public `A = g^a mod p`
- RSA-encrypts `p`, `g`, and `A` using the server's RSA public key
- Sends all three encrypted values to the client

**3. Client processes DH parameters**
- Decrypts `p`, `g`, `A` using the RSA public key (embedded in client SWF)
- Generates client keypair: private `b`, public `B = g^b mod p`
- Computes shared secret: `S = A^b mod p`
- Derives RC4 key from `S`
- Initializes two `ArcFour` instances (one for encrypt, one for decrypt)

**4. Client sends its public key** (`CompleteDiffieHandshakeMessageComposer`)
- Sends `B` (client's DH public key) to header 773

**5. Server completes handshake** (`CompleteDiffieHandshakeEvent`)
- Computes shared secret: `S = B^a mod p`
- Derives RC4 key from `S` (same derivation as client → identical key)
- Inserts `GameByteEncryption` (outgoing RC4) and `GameByteDecryption` (incoming RC4)
  into the Netty pipeline
- Sends `CompleteDiffieHandshakeComposer` confirmation

**6. All subsequent traffic is RC4-encrypted**
- The 4-byte length prefix is encrypted
- The header and body are encrypted
- Both sides maintain synchronized RC4 stream state

### RSA Key Configuration

Server `config.ini`:
```ini
enc.enabled=true
enc.e=65537                    # RSA public exponent
enc.n=<2048-bit modulus>       # RSA modulus (shared between client and server)
enc.d=<RSA private exponent>   # Server's RSA private key
```

The client has the matching RSA public key (`e`, `n`) embedded in its SWF binary via the
`com/hurlant/crypto/rsa/` library.

### Security Notes

- RC4 is a weak cipher by modern standards (biased keystream bytes)
- No message authentication codes — integrity is not verified
- No forward secrecy — compromising the RSA private key exposes all sessions
- This was standard for Flash-era Habbo; modern clients (Nitro) use WebSocket + TLS

---

## 5. Authentication

### SSO Token Flow

Authentication does not happen directly between client and server. Instead:

1. User logs into the **web application** (PHP/CMS) via username + password
2. Web app generates a one-time **SSO ticket** (random string) and stores it in the
   `users` table alongside the user's IP
3. Web app passes the SSO ticket to the Flash client via FlashVars or JavaScript
4. Client sends the SSO ticket to the server via `SSOTicketMessageComposer`
5. Server's `SecureLoginEvent` handler:
   - Queries the database for a user with that SSO ticket
   - Validates the IP matches (if configured)
   - Clears the ticket (one-time use)
   - Creates a `Habbo` object and binds it to the `GameClient`
   - Sends the login response batch

### Login Response Batch

After successful authentication, the server sends 20+ packets to initialize the client
session:

| Composer | Purpose |
|----------|---------|
| `AuthenticationOKMessageComposer` | Confirms authentication |
| `UserRightsMessageComposer` | Rank and permission flags |
| `UserHomeRoomComposer` | Home room ID |
| `UserEffectsListMessageComposer` | Active avatar effects |
| `UserClothesComposer` | Owned clothing items |
| `NewNavigatorMetaDataComposer` | Navigator categories |
| `FavoriteRoomsCountComposer` | Favorite room IDs |
| `AchievementScoreComposer` | Total achievement points |
| `IsFirstLoginOfDayComposer` | Daily login bonus flag |
| `BuildersClubExpiredComposer` | Subscription status |
| `CfhTopicsInitComposer` | Help/report categories |
| `FavoriteRoomsCountComposer` | Favorite room list |
| `AvailabilityStatusComposer` | Hotel open/closed status |
| `CreditsComposer` | Current credit balance |
| `ActivityPointsComposer` | Duckets, diamonds, etc. |
| `SubscriptionStatusComposer` | HC/VIP status |
| `MysteryBoxKeysComposer` | Mystery box inventory |
| `... and more` | |

### Authentication Boundary

The server enforces an authentication boundary in `PacketManager.handlePacket()`:

```java
if (client.getHabbo() == null && !handlerClass.isAnnotationPresent(NoAuthMessage.class)) {
    return; // Silently drop — not yet authenticated
}
```

Only handlers annotated `@NoAuthMessage` are allowed before login:
- `ReleaseVersionEvent` (4000)
- `MachineIDEvent` (2490)
- `InitDiffieHandshakeEvent` (3110)
- `CompleteDiffieHandshakeEvent` (773)
- `SecureLoginEvent`
- `PingEvent`

All other packets require a valid `Habbo` on the `GameClient`.

---

## 6. Packet System In Depth

### How Packet IDs Are Mapped

Both sides maintain independent registries of packet ID → class mappings. These must agree
for communication to work.

**Server — `Incoming.java`** (client → server packet IDs):
```java
public static final int ClientHelloMessageEvent = 4000;
public static final int UniqueIDMessageEvent = 2490;
public static final int InitDiffieHandshake = 3110;
public static final int CompleteDiffieHandshake = 773;
public static final int GetCatalogIndexEvent = 1195;
public static final int MoveAvatarMessageEvent = 3320;
public static final int ChatMessageEvent = 1314;
// ... ~500 entries
```

**Server — `Outgoing.java`** (server → client packet IDs):
```java
public static final int AuthenticationOKMessageComposer = 2491;
public static final int OpenConnectionMessageComposer = 758;
public static final int UsersMessageComposer = 374;
public static final int ObjectsMessageComposer = 1778;
public static final int ChatMessageComposer = 1446;
// ... ~503+ entries
```

**Client — `HabboMessages.as`** (~2,038 lines):
```actionscript
// OUTGOING (client sends to server)
OUTGOING_PACKETS[ClientHelloMessageComposer] = 4000;
OUTGOING_PACKETS[UniqueIDMessageComposer] = 2490;
OUTGOING_PACKETS[SSOTicketMessageComposer] = ...;
OUTGOING_PACKETS[MoveAvatarMessageComposer] = 3320;

// INCOMING (client receives from server)
INCOMING_PACKETS[2491] = AuthenticationOKMessageEvent;
INCOMING_PACKETS[758]  = RoomReadyMessageEvent;
INCOMING_PACKETS[374]  = UsersMessageEvent;
INCOMING_PACKETS[1778] = ObjectsMessageEvent;
INCOMING_PACKETS[1446] = ChatMessageEvent;
// ... ~501 entries
```

### Naming Conventions

The two sides use different naming for the same packets. This is normal — they were developed
independently.

| Server (Outgoing.java) | Client (HabboMessages.as) | Header |
|------------------------|---------------------------|--------|
| `AuthenticationOKMessageComposer` | `AuthenticationOKMessageEvent` | 2491 |
| `OpenConnectionMessageComposer` | `OpenConnectionMessageEvent` | 758 |
| `UsersMessageComposer` | `UsersEvent` | 374 |
| `ObjectsMessageComposer` | `ObjectsMessageEvent` | 1778 |
| `ChatMessageComposer` | `ChatMessageEvent` | 1446 |
| `UserObjectMessageComposer` | `UserObjectEvent` | 2725 |

What matters is that the **header IDs match** and the **field order and types match**.

### Handler Instantiation (Server)

When a packet arrives, `PacketManager` creates a fresh handler instance via reflection:

```java
Class<? extends MessageHandler> handlerClass = incoming.get(packet.getMessageId());
MessageHandler handler = handlerClass.getDeclaredConstructor().newInstance();
handler.client = client;
handler.packet = packet;
handler.handle();
```

Each handler reads fields from the packet in the exact order the client wrote them:

```java
// Server: PurchaseFromCatalogEvent.handle()
int pageId = this.packet.readInt();
int itemId = this.packet.readInt();
String extraData = this.packet.readString();
int amount = this.packet.readInt();
```

```actionscript
// Client: CatalogPagePurchaseMessageComposer.getMessageArray()
return [pageId, itemId, extraData, amount];
```

If the field order or types don't match, the packet is misread — there is no schema
validation, only sequential binary reads.

### Composer Pattern (Server → Client)

Outgoing packets are built by `MessageComposer` subclasses:

```java
public class UsersMessageComposer extends MessageComposer {
    public UsersMessageComposer(Room room) {
        this.response.init(Outgoing.UsersMessageComposer);   // header 374
        this.response.appendInt(this.habbos.size());       // count
        for (Habbo habbo : this.habbos) {
            this.response.appendInt(habbo.getHabboInfo().getId());
            this.response.appendString(habbo.getHabboInfo().getUsername());
            this.response.appendString(habbo.getHabboInfo().getMotto());
            this.response.appendString(habbo.getHabboInfo().getLook());
            // ... more fields
        }
        return this.response;
    }
}
```

The client's parser reads the same fields in the same order:

```actionscript
// Client: UsersMessageParser.parse()
var count:int = wrapper.readInteger();
for (var i:int = 0; i < count; i++) {
    var id:int = wrapper.readInteger();
    var name:String = wrapper.readString();
    var motto:String = wrapper.readString();
    var look:String = wrapper.readString();
    // ... same fields, same order
}
```

### Broadcast Patterns

The server uses several broadcast strategies:

| Pattern | Method | Use Case |
|---------|--------|----------|
| **Room broadcast** | `room.sendComposer(composer)` | Chat, movement, item state — all users in room |
| **Target user** | `client.sendResponse(composer)` | Login response, inventory, personal data |
| **All online** | Iterate `habboManager.getOnlineHabbos()` | Hotel alerts, maintenance warnings |
| **Friends** | Iterate `messenger.getFriends()` | Online status changes |
| **Group members** | Iterate guild member list | Guild announcements |

---

## 7. Room System

The room system is the core of the hotel experience. It involves the tightest coordination
between client and server.

### Entering a Room

```
Client                                          Server
  │                                                │
  │──── GoToFlatMessageComposer ──────────────────>│  roomId
  │     (or follow/teleport/doorbell variants)     │
  │                                                │
  │  [Server validates access: owner? open? locked? banned?]
  │                                                │
  │<─── FlatAccessibleMessageComposer (3783) ──────────────────│  "You may enter"
  │                                                │
  │──── OpenFlatConnectionMessageComposer ────────>│  roomId, password (if locked)
  │                                                │
  │<─── RoomReadyMessageComposer (2031) ──────────────────│  Room model name, room ID
  │<─── RoomPaintComposer ────────────────────────│  Floor/wall colors and thickness
  │<─── FloorHeightMapComposer ───────────────────│  Height map string (tile heights)
  │<─── RoomRelativeMapComposer ──────────────────│  Relative height map
  │                                                │
  │  [Client builds room geometry from height map] │
  │                                                │
  │<─── ObjectsMessageComposer (1778) ────────────────│  All floor furniture (id, type, x, y, z, rotation, state)
  │<─── WallItemsComposer ────────────────────────│  All wall items (id, type, position, state)
  │<─── UsersMessageComposer (374) ──────────────────│  All users in room (id, name, look, position)
  │<─── RoomUserStatusComposer ───────────────────│  User states (sitting, walking, effects)
  │<─── RoomThicknessComposer ────────────────────│  Wall/floor thickness settings
  │<─── RoomRightsComposer ───────────────────────│  Your permission level in this room
  │<─── RoomScoreComposer ────────────────────────│  Room rating
  │<─── RoomPromotionComposer ────────────────────│  Active event/promotion (if any)
  │                                                │
  │  [Client renders room with all objects]        │
  │                                                │
```

### Room Heightmap

The server stores room layouts as ASCII heightmaps where each character represents the tile
height at that position. Characters `0`-`9` and `a`-`z` represent heights 0-35. `x` marks
blocked tiles (walls, void).

```
xxxxxxxxxxxx
x222211110xx
x222211110xx
x222211110xx
x222222220xx
x222222220xx
xxxxxxxxxxxx
```

The server sends this via `FloorHeightMapComposer`. The client parses it in
`RoomMessageHandler.onFloorHeightMap()` and constructs the isometric tile grid used for
rendering and pathfinding.

### Movement

```
Client                                          Server
  │                                                │
  │  [User clicks tile at (5, 8)]                  │
  │                                                │
  │──── MoveAvatarMessageComposer (3320) ───────>│  targetX=5, targetY=8
  │                                                │
  │  [Server runs A* pathfinding from current pos] │
  │  [Validates: tile walkable? not blocked?]       │
  │  [Stores path in RoomUnit]                     │
  │                                                │
  │  [Room cycle tick (every ~500ms):]             │
  │  [  - Advances unit 1 tile along path]         │
  │  [  - Calculates new Z (stacking)]             │
  │                                                │
  │<─── RoomUserStatusComposer ───────────────────│  unitId, x, y, z, direction, action
  │     (broadcast to all room users)              │
  │                                                │
  │  [Client animates avatar walking to new tile]  │
  │                                                │
```

The server's `RoomCycleManager` runs at approximately 500ms intervals (configurable). Each
tick, it processes all room units: advances movement, evaluates item triggers (step-on
effects, teleporters), and broadcasts position updates.

The client receives `RoomUserStatusComposer` and smoothly animates the avatar between tiles
using interpolation at 30 FPS.

### Furniture Interaction

```
Client                                          Server
  │                                                │
  │  [User double-clicks a lamp (item ID 4821)]   │
  │                                                │
  │──── UseFurnitureMessageComposer (99) ─────────>│  itemId=4821, state=0
  │                                                │
  │  [Server finds item in RoomItemManager]        │
  │  [Checks user has rights to interact]          │
  │  [Calls item.onClick() — toggles state 0↔1]   │
  │  [Persists new state to database]              │
  │                                                │
  │<─── ObjectUpdateMessageComposer (3776) ───────────│  itemId=4821, newState=1
  │     (broadcast to all room users)              │
  │                                                │
  │  [Client updates furniture sprite animation]   │
  │                                                │
```

Different item types have different interaction classes on the server:
- `InteractionDefault` — simple state toggle (lamps, chairs)
- `InteractionTeleport` — teleporter pairs
- `InteractionDice` — random number generation
- `InteractionRoller` — moves items/users periodically
- `InteractionWired*` — programmable WIRED triggers/effects
- `InteractionGate` — passage control
- `InteractionVendingMachine` — gives hand items
- And ~100 more interaction types

### Room Unit Types

The room unit system handles multiple entity types:

| Type | Server Class | Purpose |
|------|-------------|---------|
| Habbo | `RoomHabbo` via `RoomUnit` | Human player avatars |
| Bot | `RoomBot` via `RoomUnit` | NPC bots placed by room owner |
| Pet | `RoomPet` via `RoomUnit` | Player-owned pets |

All unit types share the same movement system, position tracking, and are serialized
identically in `UsersMessageComposer` — the client distinguishes them by a type field.

---

## 8. Chat

### Sending a Message

```
Client                                          Server
  │                                                │
  │  [User types "Hello!" and presses Enter]       │
  │                                                │
  │──── ChatMessageComposer (1314) ───────────────>│  message="Hello!", bubbleType=0
  │     (for shout: header 2085)                   │
  │     (for whisper: header 1543)                 │
  │                                                │
  │  [Server: ChatMessageEvent handler]            │
  │  [  1. Word filter check]                      │
  │  [  2. Flood/mute check]                       │
  │  [  3. Command check (starts with :)]          │
  │  [  4. Fire ChatMessageEvent for plugins]      │
  │  [  5. Log to chat_log table]                  │
  │  [  6. Broadcast to room]                      │
  │                                                │
  │<─── ChatMessageComposer (1446) ───────────────│  unitId, message, emotion, bubbleType
  │     (whisper: only sent to target + sender)    │
  │     (shout: sent to all in room)               │
  │     (say: sent to users within hearing range)  │
  │                                                │
  │  [Client shows chat bubble above avatar]       │
  │                                                │
```

### Chat Variants

| Client Composer | Server Handler | Server Broadcast | Scope |
|----------------|----------------|-----------------|-------|
| `ChatMessageComposer` (1314) | `ChatMessageEvent` | `ChatMessageComposer` (1446) | Users within range |
| `ShoutMessageComposer` (2085) | `ShoutMessageEvent` | `ShoutMessageComposer` | All users in room |
| `WhisperMessageComposer` (1543) | `WhisperMessageEvent` | `WhisperMessageComposer` | Sender + target only |

### Word Filter

The server's `WordFilter` checks all chat messages against a database of filtered words.
Depending on configuration, it can:
- Replace the word with `*` characters (bobba filter)
- Mute the user
- Report the message to moderators
- Block the message entirely

### Commands

If a chat message starts with `:` (configurable prefix), the server routes it to the
`CommandHandler` instead of broadcasting it. Commands like `:kick username`,
`:give credits 1000`, `:broadcast message` are handled server-side. The client never sees
command text — it receives either a command response or nothing.

---

## 9. Catalog and Purchasing

### Loading the Catalog

```
Client                                          Server
  │                                                │
  │  [User clicks Shop button]                     │
  │                                                │
  │──── GetCatalogIndexComposer (2529) ───────────>│  type="NORMAL"
  │                                                │
  │<─── CatalogIndexComposer ─────────────────────│  Tree of pages (id, name, icon, children)
  │                                                │
  │  [Client renders catalog navigation tree]      │
  │  [User clicks a page]                          │
  │                                                │
  │──── GetCatalogPageComposer (412) ─────────────>│  pageId=42
  │                                                │
  │<─── CatalogPageComposer ──────────────────────│  Page layout, items, prices, descriptions
  │                                                │
  │  [Client renders page with items and prices]   │
  │                                                │
```

### Purchasing an Item

```
Client                                          Server
  │                                                │
  │  [User clicks Buy on a Habbo Lamp, 25 credits]│
  │                                                │
  │──── PurchaseFromCatalogComposer (3492) ───────>│  pageId, itemId, extraData, amount=1
  │                                                │
  │  [Server: PurchaseFromCatalogEvent handler]         │
  │  [  1. Validate page & item exist]             │
  │  [  2. Check user can afford (credits/duckets)]│
  │  [  3. Check club requirement]                 │
  │  [  4. Deduct currency]                        │
  │  [  5. Create item(s) in database]             │
  │  [  6. Add to user's inventory]                │
  │  [  7. Fire CatalogItemPurchasedEvent]         │
  │                                                │
  │<─── PurchaseOKComposer (2307) ────────────────│  Purchase confirmed
  │<─── CreditsComposer ─────────────────────────│  Updated credit balance
  │<─── ActivityPointsComposer ───────────────────│  Updated ducket/diamond balance
  │<─── InventoryRefreshComposer ─────────────────│  "Your inventory has new items"
  │                                                │
  │  [Client updates currency display]             │
  │  [Client shows purchase confirmation]          │
  │  [Client marks inventory as needing refresh]   │
  │                                                │
```

### Currency Types

The server manages multiple currencies, each with separate schedulers:

| Currency | Config Key | Scheduler | Client Display |
|----------|-----------|-----------|---------------|
| Credits | `habbo.credits` | `CreditsScheduler` | Gold coins |
| Duckets | `seasonal.types` | `PixelScheduler` | Purple diamonds |
| Diamonds | `seasonal.types` | `PointsScheduler` | Blue diamonds |
| Seasonal | `seasonal.types` | `PointsScheduler` | Various icons |

Schedulers periodically award currency and send `CreditsComposer` / `ActivityPointsComposer`
to keep the client display updated.

---

## 10. Inventory

### Loading Inventory

The client does not load the full inventory at login. Instead, it requests items on demand:

```
Client                                          Server
  │                                                │
  │  [User opens inventory panel]                  │
  │                                                │
  │──── RequestFurniInventoryComposer ────────────>│
  │                                                │
  │<─── FurniListComposer ────────────────────────│  Paginated item list
  │     (may send multiple pages)                  │  (id, type, spriteId, category, stuffData)
  │                                                │
  │  [Client renders inventory grid]               │
  │                                                │
```

### Placing Furniture

```
Client                                          Server
  │                                                │
  │  [User drags lamp from inventory to room]      │
  │                                                │
  │──── PlaceObjectMessageComposer ───────────────>│  itemId, x, y, direction
  │                                                │
  │  [Server validates:]                           │
  │  [  - User owns item]                          │
  │  [  - Has room rights]                         │
  │  [  - Tile is valid and stackable]             │
  │  [  - Calculates Z height (stacking)]          │
  │                                                │
  │<─── ObjectUpdateMessageComposer (3776) ───────────│  Full item data at placed position
  │     (broadcast to room)                        │
  │                                                │
  │<─── FurniListRemoveMessageComposer (159) ────────│  Remove item from inventory display
  │     (sent only to placing user)                │
  │                                                │
```

### Picking Up Furniture

```
Client                                          Server
  │                                                │
  │──── ObjectRemoveMessageComposer (2703) ───────>│  itemId
  │                                                │
  │  [Server removes item from room]               │
  │  [Adds item back to user inventory]            │
  │                                                │
  │<─── RemoveFloorItemComposer ──────────────────│  itemId (broadcast: remove from room view)
  │<─── InventoryAddItemComposer ─────────────────│  item data (to owner: add to inventory)
  │                                                │
```

---

## 11. Navigator

### Searching for Rooms

```
Client                                          Server
  │                                                │
  │  [User opens navigator]                        │
  │                                                │
  │──── NewNavigatorSearchComposer ───────────────>│  category="hotel_view", filter=""
  │                                                │
  │<─── NavigatorSearchResultSetComposer ─────────│  List of result blocks:
  │                                                │  [{category, rooms: [{id, name, owner,
  │                                                │    userCount, maxUsers, description}]}]
  │                                                │
  │  [Client renders room list with user counts]   │
  │                                                │
  │  [User types "chill" in search box]            │
  │                                                │
  │──── NewNavigatorSearchComposer ───────────────>│  category="hotel_view", filter="chill"
  │                                                │
  │<─── NavigatorSearchResultSetComposer ─────────│  Filtered results
  │                                                │
```

### Room Categories

The navigator organizes rooms into categories loaded at server startup:
- **Official Rooms** — Server-owned public rooms
- **Popular Rooms** — Highest current user count
- **My Rooms** — Rooms owned by the user
- **My Favorites** — User's bookmarked rooms
- **My Friends' Rooms** — Rooms where friends are online
- **Rooms with Groups** — Guild-associated rooms
- **Promoted Rooms** — Rooms with active events

---

## 12. Messenger and Friends

### Friend Request Flow

```
Client                                          Server
  │                                                │
  │──── RequestBuddyMessageComposer ──────────────>│  targetUsername="Bob"
  │                                                │
  │  [Server creates pending request in DB]        │
  │                                                │
  │  [If Bob is online:]                           │
  │  ────────────────────── Bob's Client ──────────│
  │                    FriendRequestComposer ──────>│  "Alice wants to be friends"
  │                                                │
  │  [Bob clicks Accept]                           │
  │                                                │
  │  Bob ── AcceptBuddyMessageComposer ───────────>│  requesterId=Alice.id
  │                                                │
  │  [Server creates friend relationship in DB]    │
  │                                                │
  │<─── FriendListUpdateComposer ─────────────────│  Bob added to Alice's friend list
  │  Bob <── FriendListUpdateComposer ────────────│  Alice added to Bob's friend list
  │                                                │
```

### Private Messaging

```
Client                                          Server
  │                                                │
  │──── SendMsgMessageEvent (3567) ────────────────>│  friendId=42, message="Hey!"
  │                                                │
  │  [Server validates friendship exists]          │
  │  [Logs message to database]                    │
  │                                                │
  │  [If friend online:]                           │
  │  ──── NewConsoleMessageComposer ──────────────>│  Friend's client receives message
  │                                                │
  │  [If friend offline:]                          │
  │  [  Message stored, delivered on next login]   │
  │                                                │
```

### Online Status

When a user logs in or out, the server notifies all online friends:

```java
// On login:
for (MessengerBuddy buddy : habbo.getMessenger().getFriends().values()) {
    Habbo friend = Emulator.getGameEnvironment().getHabboManager().getHabbo(buddy.getId());
    if (friend != null) {
        friend.getClient().sendResponse(new FriendListUpdateComposer(habbo));  // "Alice is now online"
    }
}
```

---

## 13. Trading

### Trade Flow

```
Client                                          Server
  │                                                │
  │  [Alice clicks Bob's avatar → Trade]           │
  │                                                │
  │──── OpenTradingComposer ──────────────────────>│  targetUserId=Bob.id
  │                                                │
  │  [Server validates: both in room, trades allowed, not self-trade]
  │  [Creates RoomTrade instance]                  │
  │                                                │
  │<─── TradingOpenComposer ──────────────────────│  Trade window opens (both users)
  │  Bob <── TradingOpenComposer ─────────────────│
  │                                                │
  │  [Alice offers items]                          │
  │──── TradingOfferItemComposer ─────────────────>│  itemId
  │                                                │
  │<─── TradingItemListComposer ──────────────────│  Updated offer lists (both users)
  │  Bob <── TradingItemListComposer ─────────────│
  │                                                │
  │  [Both users click Accept]                     │
  │──── TradingAcceptComposer ────────────────────>│
  │  Bob ── TradingAcceptComposer ────────────────>│
  │                                                │
  │<─── TradingAcceptComposer ────────────────────│  Show accept status
  │                                                │
  │  [Both users click Confirm]                    │
  │──── TradingConfirmComposer ───────────────────>│
  │  Bob ── TradingConfirmComposer ───────────────>│
  │                                                │
  │  [Server executes trade:]                      │
  │  [  - Transfer items in database]              │
  │  [  - Update both inventories]                 │
  │  [  - Log trade for moderation]                │
  │                                                │
  │<─── TradingCompleteComposer ──────────────────│  Trade successful
  │  Bob <── TradingCompleteComposer ─────────────│
  │<─── InventoryRefreshComposer ─────────────────│  Refresh inventory
  │  Bob <── InventoryRefreshComposer ────────────│
  │                                                │
```

### Trade Safety

The server enforces:
- Both users must be in the same room
- Both must have trading enabled (not trade-banned)
- Items must exist in the offerer's inventory
- Double-confirm prevents accidental trades
- All trades are logged for moderation review

---

## 14. Groups and Guilds

### Creating a Guild

```
Client                                          Server
  │                                                │
  │──── CreateGuildMessageComposer ───────────────>│  name, description, roomId, colorA, colorB, badgeParts
  │                                                │
  │  [Server validates:]                           │
  │  [  - User owns the room]                      │
  │  [  - Room not already assigned to a guild]    │
  │  [  - User can afford guild creation cost]     │
  │                                                │
  │  [Creates guild in database]                   │
  │  [Sets user as guild admin]                    │
  │  [Assigns room to guild]                       │
  │                                                │
  │<─── GuildCreatedComposer ─────────────────────│  guildId
  │<─── GuildInfoComposer ────────────────────────│  Full guild details
  │                                                │
```

### Guild Badges

Guild badges are composed from parts selected during creation. The badge string is stored on
the server and sent to the client for rendering. The client has embedded badge part assets
and composes them into the final badge image.

---

## 15. Avatar System

### Figure String

Avatars are represented as a **figure string** — a dot-separated list of body part codes:

```
hd-180-1.ch-255-92.lg-285-82.sh-290-92.hr-100-61.ha-1003-92
│         │         │         │         │         │
│         │         │         │         │         └─ Hair accessory
│         │         │         │         └─ Hair
│         │         │         └─ Shoes
│         │         └─ Legs
│         └─ Chest/torso
└─ Head
```

Each segment: `<part>-<type>-<color>`

### Avatar Rendering

**Server:** Stores figure strings in database. Sends them in `UsersMessageComposer` and user
info packets. Never renders avatars — only stores and transmits the string.

**Client:** The `AvatarRenderManager` and `AvatarAssetDownloadManager` handle rendering:
1. Parse figure string into body parts
2. Load required SWF assets (`hh_human_body.swf`, clothing SWFs)
3. Compose sprites for each body part, direction (8 directions), and animation frame
4. Layer sprites in correct Z-order
5. Cache rendered BitmapData for reuse

### Avatar Editor

```
Client                                          Server
  │                                                │
  │  [User opens avatar editor]                    │
  │  [Modifies look locally — client-side preview] │
  │  [Clicks Save]                                 │
  │                                                │
  │──── UpdateFigureDataMessageEvent (2730) ────────>│  newFigure="hd-180-1.ch-...", gender="M"
  │                                                │
  │  [Server validates figure string]              │
  │  [Updates database]                            │
  │  [If in room: broadcasts to room]              │
  │                                                │
  │<─── UserChangeComposer ───────────────────────│  Updated figure (broadcast to room)
  │                                                │
```

---

## 16. Moderation

### Reporting a User

```
Client                                          Server
  │                                                │
  │──── CallForHelpMessageComposer ───────────────>│  category, reportedUserId, roomId, chatMessages[]
  │                                                │
  │  [Server creates ModToolIssue]                 │
  │  [Stores in ticket queue]                      │
  │  [Notifies online moderators]                  │
  │                                                │
  │  Moderator <── ModToolIssueInfoComposer ──────│  New ticket notification
  │                                                │
  │  [Moderator reviews and takes action]          │
  │  Mod ── ModToolSanctionComposer ──────────────>│  userId, sanctionType, duration
  │                                                │
  │  [Server applies sanction: mute/ban/kick]      │
  │  [If kicked:]                                  │
  │  Target <── GenericErrorComposer ─────────────│  "You have been kicked"
  │  [Server closes target's connection]           │
  │                                                │
```

### Moderation Tools

The mod tool system provides moderators with:

| Feature          | Packets Involved                                              |
|------------------|---------------------------------------------------------------|
| **Chat logs**    | `ModToolRoomChatlogComposer`, `ModToolUserChatlogComposer`    |
| **User info**    | `ModToolUserInfoComposer` (IP, registration date, bans, etc.) |
| **Room info**    | `ModToolRoomInfoComposer`                                     |
| **Ticket queue** | `ModToolIssueInfoComposer`, `ModToolIssueHandlerComposer`     |
| **Sanctions**    | Mute, kick, ban (IP/machine/account), trade lock              |
| **Room admin**   | Lock room, kick all users, change settings                    |

---

## 17. WIRED

WIRED is the in-game visual programming system. Players place special furniture items that
act as triggers, conditions, and effects to create interactive room experiences.

### How WIRED Works Across Client and Server

```
Client                                          Server
  │                                                │
  │  [Room owner places WIRED trigger on tile]     │
  │  [Double-clicks to configure]                  │
  │                                                │
  │──── WiredTriggerSaveDataComposer ─────────────>│  triggerId, config (delay, params)
  │                                                │
  │  [Server stores WIRED configuration]           │
  │                                                │
  │  [Later: a user walks on the trigger tile]     │
  │                                                │
  │  [Server evaluates WIRED chain:]               │
  │  [  1. Trigger fires (user walked on tile)]    │
  │  [  2. Check conditions (is it nighttime?)]    │
  │  [  3. Execute effects (teleport user)]        │
  │                                                │
  │<─── RoomUserStatusComposer ───────────────────│  User teleported to new position
  │     (broadcast to room)                        │
  │                                                │
```

**WIRED types:**

| Category       | Examples                                                                   |
|----------------|----------------------------------------------------------------------------|
| **Triggers**   | User walks on tile, user says keyword, item state changes, timer fires     |
| **Conditions** | User has badge, time between X-Y, user count in room, furni has state      |
| **Effects**    | Teleport user, toggle furniture, give reward, show message, move furniture |

All WIRED logic runs server-side. The client only provides the configuration UI and renders
the results of WIRED actions (which arrive as normal room update packets).

---

## 18. Pets and Bots

### Pets

```
Client                                          Server
  │                                                │
  │  [User places pet from inventory]              │
  │                                                │
  │──── PlacePetMessageComposer ──────────────────>│  petId, x, y
  │                                                │
  │  [Server creates pet RoomUnit]                 │
  │                                                │
  │<─── UsersMessageComposer ────────────────────────│  Pet appears as room unit (type=2)
  │     (broadcast to room)                        │
  │                                                │
  │  [Pet moves autonomously via server AI]        │
  │  [Server sends position updates each cycle]    │
  │                                                │
  │<─── RoomUserStatusComposer ───────────────────│  Pet movement updates
  │                                                │
```

Pets have server-side AI that handles:
- Random wandering within the room
- Responding to owner commands (sit, stay, follow)
- Energy/happiness/experience systems
- Breeding (two pets of same type produce offspring)

### Bots

Bots are similar to pets but are simpler NPCs:
- Room owner places them
- Can be configured with chat lines (server sends them periodically)
- Walk on configurable paths
- Serve as decorative or interactive elements

---

## 19. Games

### SnowStorm (and other minigames)

The server supports in-room games like SnowStorm, Freeze, and BattleBall:

```
Client                                          Server
  │                                                │
  │  [User clicks game start tile]                 │
  │                                                │
  │──── GameStartComposer ────────────────────────>│  gameType
  │                                                │
  │  [Server creates Game instance]                │
  │  [Assigns teams, initializes state]            │
  │                                                │
  │<─── GameStartedComposer ──────────────────────│  Game parameters, teams
  │                                                │
  │  [Game runs on server tick cycle]              │
  │  [Player actions → game state updates]         │
  │                                                │
  │<─── GameStatusComposer ───────────────────────│  Score updates, effects
  │                                                │
  │  [Game ends]                                   │
  │                                                │
  │<─── GameEndedComposer ────────────────────────│  Final scores, winners
  │                                                │
```

Game logic is entirely server-authoritative. The client renders game state and sends player
inputs (movement, actions).

---

## 20. Achievements

### Achievement Progress

```
Client                                          Server
  │                                                │
  │  [User performs an action that counts toward    │
  │   an achievement (e.g., "Chat 100 times")]     │
  │                                                │
  │  [Server increments achievement progress]      │
  │                                                │
  │  [If threshold reached:]                       │
  │<─── AchievementUnlockedComposer ──────────────│  Achievement details, badge earned
  │                                                │
  │  [Client shows achievement popup]              │
  │                                                │
  │  [User opens achievements panel]               │
  │                                                │
  │──── RequestAchievementsComposer ──────────────>│
  │                                                │
  │<─── AchievementsComposer ─────────────────────│  All achievements with progress
  │                                                │
```

Achievement definitions are loaded from the database at server startup. Progress is tracked
per-user in the `achievements` table. The server increments progress automatically when
relevant events occur (chat, login, room visits, etc.).

---

## 21. Packet Alignment Audit

This section documents the protocol alignment between the server's `Outgoing.java` (503+
constants) and the client's `HabboMessages.as` (501 `INCOMING_PACKETS` entries).

### Summary

| Category                                     | Count |
|----------------------------------------------|-------|
| Shared headers (working correctly)           | 465+  |
| Server headers not in client (dropped)       | 5     |
| Client headers not in server (unimplemented) | 27    |
| Unused `Outgoing` constants (dead code)      | 61    |
| Confirmed semantic mismatches                | 1     |
| Hardcoded header bypassing constant          | 1     |
| Naming-only mismatches (functionally OK)     | ~10   |

### Confirmed Semantic Mismatch: OneWayGate

`InteractionOneWayGate.java` sends `ItemIntStateComposer` (header 3431), which the client
routes to `DiceValueMessageEvent` → `onDiceValue()`. The correct header is 2376
(`ItemStateComposer`), which routes to `OneWayDoorStatusMessageEvent`. Both handlers call
identical code, so it works by accident, but the routing is semantically wrong.

### Dropped Packets (Server Sends, Client Ignores)

| Header | Server Constant                       | Issue                                                               |
|--------|---------------------------------------|---------------------------------------------------------------------|
| 2830   | `UpdateStackHeightTileHeightComposer` | Client has no handler — packet silently dropped                     |
| 3786   | `RoomFloorThicknessUpdatedComposer`   | Client has no handler                                               |
| 3128   | `UnknownTradeComposer` (misuse)       | Server sends this but client expects `TradingCompletedEvent` (1001) |

### Unimplemented Client Features (27 headers)

These are packet IDs the client expects but the server never sends. They represent newer
Habbo features not yet implemented in Arcturus:

- Camera/photo system (6 packets)
- Crafting system updates (3 packets)
- Competition/voting (3 packets)
- Group forum enhancements (2 packets)
- Targeted offers (2 packets)
- Various UI features (11 packets)

### Notable Composer Issues

| Composer                         | Header | Problem                                                                            |
|----------------------------------|--------|------------------------------------------------------------------------------------|
| `ObjectUpdateMessageComposer`    | 3776   | Always sends `usability=0` instead of correct interaction type                     |
| `EffectsListAddMessageComposer`  | 2867   | Sends 4 fields; client expects 6 (missing `remainingQuantity`, `secondsRemaining`) |
| `UserEffectsListMessageComposer` | 340    | Inverted time formula: sends `elapsed + duration` instead of `duration - elapsed`  |

---

## 22. Configuration and Deployment

### Server Configuration (`config.ini`)

```ini
# Network
game.host=0.0.0.0
game.port=30000
rcon.host=127.0.0.1
rcon.port=30001

# Database
db.hostname=localhost
db.port=3306
db.database=habbo
db.username=root
db.password=secret
db.params=?useSSL=false&serverTimezone=UTC

# Encryption (must match client's embedded RSA public key)
enc.enabled=true
enc.e=65537
enc.n=<modulus matching client>
enc.d=<private exponent>

# Runtime
runtime.threads=16
console.mode=true
debug.mode=false
```

### Client Configuration

The client receives its configuration through **SWF FlashVars** set by the web CMS:

```html
<param name="flashvars" value="
  connection.info.host=127.0.0.1&
  connection.info.port=30000&
  sso.ticket=abc123def456&
  url.prefix=http://localhost&
  client.starting=Starting...&
"/>
```

Additional configuration is loaded from XML files served by the web layer and from the
server itself via configuration packets sent after login.

### RSA Key Alignment

The RSA keys must match between server and client:
- **Server** stores `e`, `n`, `d` in `config.ini`
- **Client** has `e`, `n` embedded in its SWF (in the `com/hurlant/crypto/rsa/` classes)
- If these don't match, the DH handshake fails and encryption cannot be established

To change keys, you must both update the server config AND recompile the client SWF with
matching keys.

### Database

The server uses MySQL with ~200+ tables covering:

| Category     | Example Tables                                                     |
|--------------|--------------------------------------------------------------------|
| Users        | `users`, `users_settings`, `users_clothing`, `users_wardrobe`      |
| Rooms        | `rooms`, `room_models`, `room_bans`, `room_rights`, `room_votes`   |
| Items        | `items`, `items_base`, `items_crackable`, `items_highscores`       |
| Catalog      | `catalog_pages`, `catalog_items`, `catalog_clothing`               |
| Messenger    | `messenger_friendships`, `messenger_requests`, `messenger_offline` |
| Guilds       | `guilds`, `guilds_members`, `guilds_elements`                      |
| Moderation   | `bans`, `chat_logs`, `modtool_issues`, `sanctions`                 |
| Achievements | `achievements`, `users_achievements`                               |
| Pets         | `users_pets`, `pet_commands`, `pet_breeding`                       |
| Misc         | `emulator_settings`, `permissions`, `wordfilter`                   |

SQL migration scripts are stored in `sqlupdates/` tracking schema changes from version 1.0.0
through 3.5.5.

---

## 23. Threading and Performance

### Server Threading Model

```
Main Thread
  └─ Emulator.main() → startup sequence

Netty Boss Group (1 thread)
  └─ Accepts TCP connections

Netty Worker Group (CPU cores × 2 threads)
  └─ Reads/writes socket data
  └─ Decodes packets
  └─ Routes to PacketManager

ScheduledExecutorService (runtime.threads, default CPU × 2)
  ├─ Packet handlers (if MULTI_THREADED_PACKET_HANDLING enabled)
  ├─ Room cycle ticks (~500ms per room)
  ├─ HabboStats persistence (periodic)
  ├─ CreditsScheduler (periodic currency awards)
  ├─ PixelScheduler (periodic ducket awards)
  ├─ PointsScheduler (periodic diamond awards)
  └─ Delayed tasks (WIRED delays, welcome messages, etc.)

HikariCP Connection Pool (runtime.threads × 2 connections)
  └─ MySQL queries from any thread
```

### Client Threading Model

Flash Player is single-threaded. The client runs on a frame loop at 30 FPS:

```
Frame Tick (33ms)
  ├─ Process socket buffer (read all available packets)
  ├─ Dispatch message events
  ├─ Update room engine (avatar interpolation, animations)
  ├─ Render stage
  └─ Process user input events
```

All network I/O is asynchronous via Flash's event-driven `Socket` class. Heavy operations
(like loading SWF assets) use Flash's built-in async loader.

### Performance Characteristics

| Concern               | How It's Handled                                              |
|-----------------------|---------------------------------------------------------------|
| **Packet throughput** | Rate limiting per handler type in `GameMessageRateLimit`      |
| **Room ticks**        | Each active room runs its own cycle on the thread pool        |
| **Database**          | HikariCP pools connections; domain objects do direct JDBC     |
| **Memory**            | Rooms unload after all users leave; items lazy-loaded         |
| **Client FPS**        | Stage quality set to LOW; avatar sprites cached as BitmapData |

---

## 24. Known Issues

### Server Bugs

| #  | Bug                                                                              | Impact                                                                                     |
|----|----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| 1  | `GuildMember.compareTo()` always returns 0                                       | Guild member lists unsorted                                                                |
| 2  | `GuardianTicket.calculateVerdict()` hardcoded                                    | Guide/guardian system broken                                                               |
| 3  | `GuideTour.finish()` is a stub                                                   | Guide tours never complete                                                                 |
| 4  | Guild member paging uses `LIMIT offset, pageSize` where offset grows incorrectly | Later pages return too many rows                                                           |
| 5  | `SearchResultList.serialize()` mutates the underlying list                       | Navigator results shrink on repeated views                                                 |
| 6  | `ModToolManager.createOfflineUserBan()` uses wrong JDBC call                     | Offline bans may silently fail                                                             |
| 7  | `WordFilter.filter()` has regex bugs                                             | Profanity filter misses some words                                                         |
| 8  | `PacketManager.unregisterCallables(header)` clears all headers                   | Plugin packet hooks break globally                                                         |
| 9  | `RoomTile.copy()` shares the units set reference                                 | Pathfinding can corrupt room occupancy data                                                |
| 10 | `Game.onEnd()` awards XP to room owner instead of game winner                    | Wrong player gets achievement progress                                                     |
| 11 | Packet naming refactored to match client conventions                             | All `*Composer` classes renamed in commits `bbb8d64c` (outgoing) and `c8fd8212` (incoming) |

### Protocol Bugs

| Issue                                                              | Impact                                               |
|--------------------------------------------------------------------|------------------------------------------------------|
| `ObjectUpdateMessageComposer` sends `usability=0` always           | Client may not show interactive cursors on furniture |
| `FlatAccessibleMessageComposer` sends empty body                   | Doorbell/banned users may not get proper response    |
| `TradingCompletedMessageComposer` uses wrong header (3128 vs 2369) | Trade completion packet silently dropped by client   |
| `EffectsListAddMessageComposer` missing fields                     | Client may crash or show wrong effect data           |
| `UserEffectsListMessageComposer` inverted time formula             | Effect durations display incorrectly                 |
| `RoomTrade.java:138` sends roomUnitId instead of userId            | Trade partner identification breaks in edge cases    |

### Architectural Concerns

| Concern                              | Detail                                                                                      |
|--------------------------------------|---------------------------------------------------------------------------------------------|
| **Global singleton**                 | `Emulator` class is a static service locator used everywhere — hard to test, tight coupling |
| **No dependency injection**          | All managers created manually in `GameEnvironment` constructor                              |
| **Direct SQL in domain objects**     | `HabboStats`, `Habbo`, etc. do their own JDBC — no repository layer                         |
| **Reflective handler instantiation** | `PacketManager` creates handlers via `newInstance()` on every packet — allocation pressure  |
| **Implicit thread safety**           | Relies on `ConcurrentHashMap` but rarely uses explicit synchronization                      |

---

## 25. Architecture Diagrams

### Full Request-Response Flow

```
USER ACTION (click, type, drag)
         │
         ▼
┌─────────────────────────┐
│  Client UI Component    │  (catalog, room, inventory, etc.)
│  (ActionScript 3)       │
└──────────┬──────────────┘
           │ Creates MessageComposer
           ▼
┌─────────────────────────┐
│  HabboCommunicationMgr  │  Looks up header ID from HabboMessages.as
│  + EvaWireFormat.encode  │  Serializes fields to ByteArray
│  + ArcFour.encipher     │  Encrypts (if post-handshake)
└──────────┬──────────────┘
           │ Socket.writeBytes()
           ▼
    ═══ TCP NETWORK ═══
           │
           ▼
┌─────────────────────────┐
│  Netty Pipeline          │
│  GameByteFrameDecoder   │  Reads 4-byte length, buffers until complete
│  GameByteDecoder        │  Decrypts, reads 2-byte header → ClientMessage
│  GameMessageRateLimit   │  Rate limit check
│  GameMessageHandler     │  Routes to PacketManager
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  PacketManager           │
│  incoming[headerId]     │  Looks up MessageHandler class
│  → handler.handle()     │  Instantiates and executes
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  MessageHandler          │  (e.g., PurchaseFromCatalogEvent)
│  1. Read packet fields  │  packet.readInt(), readString(), etc.
│  2. Validate & execute  │  Business logic, DB queries
│  3. Build response(s)   │  new PurchaseOKComposer(...)
│  4. Send to client(s)   │  client.sendResponse(composer)
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  MessageComposer         │
│  .compose()             │  Serializes to ServerMessage
│  ServerMessage           │  [4B len][2B header][body]
│  GameServerMsgEncoder   │  RC4 encrypts, writes to channel
└──────────┬──────────────┘
           │
    ═══ TCP NETWORK ═══
           │
           ▼
┌─────────────────────────┐
│  SocketConnection        │  flash.net.Socket receives bytes
│  processReceivedData()  │  Called each frame (30 FPS)
│  EvaWireFormat.decode   │  Read length, decrypt, extract header
│  ArcFour.decipher       │  Decrypt payload
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Message Dispatch        │
│  INCOMING_PACKETS[id]   │  Look up MessageEvent class
│  parser.parse(wrapper)  │  Extract typed fields
│  callback(event)        │  Invoke registered handler
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Client Handler          │  (e.g., RoomMessageHandler.onRoomUsers)
│  Update local state     │  Add avatars to room, update UI
│  Render changes         │  Sprite updates, animations
└─────────────────────────┘
         │
         ▼
    VISUAL UPDATE ON SCREEN
```

### Subsystem Communication Map

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CLIENT SUBSYSTEMS                             │
│                                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Room     │ │ Catalog  │ │Navigator │ │Inventory │ │Messenger │    │
│  │  Engine   │ │  Shop    │ │  Search  │ │  Panel   │ │ Friends  │    │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘    │
│       │            │            │            │            │            │
│  ┌────┴────────────┴────────────┴────────────┴────────────┴─────┐     │
│  │                 HabboCommunicationManager                     │     │
│  │              (EvaWireFormat + ArcFour encryption)              │     │
│  └───────────────────────────┬───────────────────────────────────┘     │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
                        TCP / RC4 Stream
                               │
┌──────────────────────────────┼────────────────────────────────────────┐
│  ┌───────────────────────────┴───────────────────────────────────┐     │
│  │                    Netty Pipeline + PacketManager              │     │
│  │                 (GameServer on port 30000)                     │     │
│  └────┬────────────┬────────────┬────────────┬────────────┬──────┘     │
│       │            │            │            │            │            │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐    │
│  │  Room    │ │ Catalog  │ │Navigator │ │  Item    │ │Messenger │    │
│  │ Manager  │ │ Manager  │ │ Manager  │ │ Manager  │ │ (per-user│    │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘    │
│       │            │            │            │            │            │
│  ┌────┴────────────┴────────────┴────────────┴────────────┴─────┐     │
│  │                     MySQL Database (HikariCP)                 │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                                                        │
│                           SERVER SUBSYSTEMS                            │
└────────────────────────────────────────────────────────────────────────┘
```

### Room Tick Cycle

```
Every ~500ms per active room:

RoomCycleManager.run()
  │
  ├─ Process unit movement
  │   ├─ For each RoomUnit with active path:
  │   │   ├─ Advance 1 tile along A* path
  │   │   ├─ Calculate Z from tile stack height
  │   │   ├─ Check step-on triggers (WIRED, teleporters, rollers)
  │   │   └─ Add to status update batch
  │   └─ Broadcast RoomUserStatusComposer (all changed units)
  │
  ├─ Process item cycles
  │   ├─ Roller movement (items + users on rollers)
  │   ├─ Effect expiry
  │   └─ Timed item state changes
  │
  ├─ Process WIRED
  │   ├─ Evaluate pending triggers
  │   ├─ Check conditions
  │   └─ Execute effects (with configured delays)
  │
  ├─ Process games (if active)
  │   ├─ Update game state
  │   ├─ Check win conditions
  │   └─ Broadcast score updates
  │
  └─ Cleanup
      ├─ Remove expired effects
      ├─ Check idle users (kick after timeout)
      └─ Persist changed items to database
```

---

## Appendix A: Key File Locations

### Server (Arcturus-Community)

| File                                                                                      | Purpose                           |
|-------------------------------------------------------------------------------------------|-----------------------------------|
| `src/main/java/com/eu/habbo/Emulator.java`                                                | Main entry point, service locator |
| `src/main/java/com/eu/habbo/habbohotel/GameEnvironment.java`                              | Composition root for all managers |
| `src/main/java/com/eu/habbo/messages/PacketManager.java`                                  | Packet registry and dispatch      |
| `src/main/java/com/eu/habbo/messages/incoming/Incoming.java`                              | Client→server packet IDs          |
| `src/main/java/com/eu/habbo/messages/outgoing/Outgoing.java`                              | Server→client packet IDs          |
| `src/main/java/com/eu/habbo/messages/incoming/MessageHandler.java`                        | Handler base class                |
| `src/main/java/com/eu/habbo/messages/outgoing/MessageComposer.java`                       | Composer base class               |
| `src/main/java/com/eu/habbo/messages/ClientMessage.java`                                  | Inbound packet wrapper            |
| `src/main/java/com/eu/habbo/messages/ServerMessage.java`                                  | Outbound packet builder           |
| `src/main/java/com/eu/habbo/networking/gameserver/GameServer.java`                        | Netty bootstrap                   |
| `src/main/java/com/eu/habbo/networking/gameserver/decoders/GameMessageHandler.java`       | Netty inbound router              |
| `src/main/java/com/eu/habbo/networking/gameserver/decoders/GameByteFrameDecoder.java`     | Frame delimiter                   |
| `src/main/java/com/eu/habbo/networking/gameserver/decoders/GameByteDecoder.java`          | Packet decoder                    |
| `src/main/java/com/eu/habbo/networking/gameserver/encoders/GameServerMessageEncoder.java` | Outgoing encoder                  |
| `src/main/java/com/eu/habbo/crypto/HabboDiffieHellman.java`                               | DH key exchange                   |
| `src/main/java/com/eu/habbo/crypto/HabboEncryption.java`                                  | RC4 cipher wrapper                |
| `src/main/java/com/eu/habbo/habbohotel/rooms/Room.java`                                   | Room entity                       |
| `src/main/java/com/eu/habbo/habbohotel/rooms/RoomManager.java`                            | Room lifecycle                    |
| `src/main/java/com/eu/habbo/habbohotel/rooms/RoomCycleManager.java`                       | Room tick loop                    |
| `src/main/java/com/eu/habbo/habbohotel/users/Habbo.java`                                  | User entity                       |
| `src/main/java/com/eu/habbo/habbohotel/users/HabboInfo.java`                              | Persistent user data              |
| `src/main/java/com/eu/habbo/habbohotel/catalog/CatalogManager.java`                       | Shop logic                        |
| `src/main/java/com/eu/habbo/habbohotel/items/ItemManager.java`                            | Item definitions                  |
| `src/main/java/com/eu/habbo/habbohotel/modtool/ModToolManager.java`                       | Moderation                        |
| `src/main/java/com/eu/habbo/core/ConfigurationManager.java`                               | Config loading                    |
| `src/main/java/com/eu/habbo/database/Database.java`                                       | HikariCP wrapper                  |

### Client (habbo-client-clean)

| File                                                               | Purpose                           |
|--------------------------------------------------------------------|-----------------------------------|
| `src/Habbo.as`                                                     | SWF entry point, preloader        |
| `src/HabboMain.as`                                                 | Component bootstrap sequence      |
| `src/com/sulake/core/communication/connection/SocketConnection.as` | TCP socket wrapper                |
| `src/com/sulake/core/communication/formatter/EvaWireFormat.as`     | Binary serialization              |
| `src/com/sulake/habbo/communication/HabboCommunicationManager.as`  | Protocol manager                  |
| `src/com/sulake/habbo/communication/HabboMessages.as`              | Packet ID registry (~2,038 lines) |
| `src/com/sulake/habbo/communication/encryption/ArcFour.as`         | RC4 implementation                |
| `src/com/sulake/habbo/communication/encryption/DiffieHellman.as`   | DH key exchange                   |
| `src/com/sulake/habbo/room/RoomEngine.as`                          | Room rendering engine (199KB)     |
| `src/com/sulake/habbo/room/RoomMessageHandler.as`                  | Room message handlers (64KB)      |
| `src/com/sulake/habbo/avatar/AvatarRenderManager.as`               | Avatar rendering                  |
| `src/com/sulake/habbo/catalog/HabboCatalogCom.as`                  | Catalog UI                        |
| `src/com/sulake/habbo/inventory/HabboInventoryCom.as`              | Inventory UI                      |
| `src/com/sulake/habbo/navigator/HabboNavigatorCom.as`              | Navigator UI                      |
| `src/com/sulake/habbo/friendlist/HabboFriendListCom.as`            | Friends UI                        |
| `src/com/sulake/habbo/messenger/HabboMessengerCom.as`              | Messaging UI                      |
| `src/com/hurlant/crypto/rsa/`                                      | RSA crypto library                |

---

## Appendix B: Packet ID Quick Reference

### Handshake Sequence

| Step | Direction | Header | Server Name                              | Client Name                              |
|------|-----------|--------|------------------------------------------|------------------------------------------|
| 1    | C→S       | 4000   | `ClientHelloMessageEvent`                | `ClientHelloMessageComposer`             |
| 2    | C→S       | 2490   | `UniqueIDMessageEvent`                   | `UniqueIDMessageComposer`                |
| 3    | C→S       | 3110   | `InitDiffieHandshake`                    | `InitDiffieHandshakeMessageComposer`     |
| 4    | S→C       | 1347   | `InitDiffieHandshakeMessageComposer`     | `InitDiffieHandshakeEvent`               |
| 5    | C→S       | 773    | `CompleteDiffieHandshake`                | `CompleteDiffieHandshakeMessageComposer` |
| 6    | S→C       | 3885   | `CompleteDiffieHandshakeMessageComposer` | `CompleteDiffieHandshakeEvent`           |
| 7    | C→S       | 2419   | `SSOTicketMessageEvent`                  | `SSOTicketMessageComposer`               |
| 8    | S→C       | 2491   | `AuthenticationOKMessageComposer`        | `AuthenticationOKMessageEvent`           |

### Common Room Packets

| Direction | Header | Server Name                     | Client Name                   | Purpose                |
|-----------|--------|---------------------------------|-------------------------------|------------------------|
| S→C       | 758    | `OpenConnectionMessageComposer` | `OpenConnectionMessageEvent`  | Connection opened      |
| S→C       | 2031   | `RoomReadyMessageComposer`      | `RoomReadyMessageEvent`       | Room model loaded      |
| S→C       | 1778   | `ObjectsMessageComposer`        | `ObjectsMessageEvent`         | Floor furniture list   |
| S→C       | 374    | `UsersMessageComposer`          | `UsersEvent`                  | Users in room          |
| C→S       | 3320   | `MoveAvatarMessageEvent`        | `MoveAvatarMessageComposer`   | Walk request           |
| S→C       | 1640   | `UserUpdateMessageComposer`     | `UserUpdateEvent`             | Movement updates       |
| C→S       | 1314   | `ChatMessageEvent`              | `ChatMessageComposer`         | Say chat               |
| S→C       | 1446   | `ChatMessageComposer`           | `ChatMessageEvent`            | Chat broadcast         |
| C→S       | 99     | `UseFurnitureMessageEvent`      | `UseFurnitureMessageComposer` | Click furniture        |
| S→C       | 3776   | `ObjectUpdateMessageComposer`   | `ObjectUpdateMessageEvent`    | Furniture state change |

### Common User Packets

| Direction | Header | Server Name                     | Client Name                  | Purpose           |
|-----------|--------|---------------------------------|------------------------------|-------------------|
| S→C       | 2725   | `UserObjectMessageComposer`     | `UserObjectEvent`            | User profile data |
| S→C       | 3475   | `CreditBalanceMessageComposer`  | `CreditBalanceEvent`         | Credit balance    |
| S→C       | 2018   | `ActivityPointsMessageComposer` | `ActivityPointsMessageEvent` | Duckets/diamonds  |
| S→C       | 411    | `UserRightsMessageComposer`     | `UserRightsMessageEvent`     | Rank/rights       |

### Common Catalog Packets

| Direction | Header | Server Name                 | Client Name                   | Purpose            |
|-----------|--------|-----------------------------|-------------------------------|--------------------|
| C→S       | 1195   | `GetCatalogIndexEvent`      | `GetCatalogIndexComposer`     | Open catalog       |
| C→S       | 412    | `GetCatalogPageEvent`       | `GetCatalogPageComposer`      | Load page          |
| C→S       | 3492   | `PurchaseFromCatalogEvent`  | `PurchaseFromCatalogComposer` | Buy item           |
| S→C       | 869    | `PurchaseOKMessageComposer` | `PurchaseOKMessageEvent`      | Purchase confirmed |
