import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import api from "../api/axios";
import styles from "./Chat.module.css";
import AvatarImg from "../components/common/AvatarImg";

const ROOM = "general";
const SERVER_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

/** Deterministic conversation ID (same as server) */
const makeConvId = (a, b) => [a, b].sort().join("_");

const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  GROUP CHAT                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const GroupChat = ({ socketRef, connected, online, user }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        api.get(`/chat/messages?room=${ROOM}`)
            .then(({ data }) => setMessages(data.messages || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        socket.emit("join-room", ROOM);
        const handler = (msg) => setMessages(prev => [...prev, msg]);
        socket.on("new-message", handler);
        return () => socket.off("new-message", handler);
    }, [socketRef, connected]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim() || !user || !socketRef.current) return;
        socketRef.current.emit("send-message", {
            room: ROOM,
            text: text.trim(),
            sender: { name: user.name, userId: user._id || user.id || "" },
        });
        setText("");
    };

    return (
        <div className={styles.groupLayout}>
            {/* ── Left: Room info sidebar ── */}
            <div className={styles.groupSidebar}>
                <div className={styles.convListHeader}>
                    <span className={styles.convListTitle}>🌐 General</span>
                    <span className={`${styles.statusDot} ${connected ? styles.online : styles.offline}`} />
                </div>
                <div className={styles.groupSidebarBody}>
                    <div className={styles.groupRoomCard}>
                        <div className={styles.groupRoomIcon}>🌐</div>
                        <div className={styles.groupRoomName}>General Chat</div>
                        <div className={styles.groupRoomDesc}>A public room for everyone. Be respectful!</div>
                    </div>
                    <div className={styles.groupOnlineBox}>
                        <span className={styles.groupOnlineDot} />
                        <span className={styles.groupOnlineText}>{online} online right now</span>
                    </div>
                    <div className={styles.groupTips}>
                        <p className={styles.groupTipTitle}>💡 Tips</p>
                        <p>Press <kbd className={styles.kbd}>Enter</kbd> to send</p>
                        <p>Press <kbd className={styles.kbd}>Shift+Enter</kbd> for new line</p>
                    </div>
                </div>
            </div>

            {/* ── Right: Chat ── */}
            <div className={styles.groupChat}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderIcon}>🌐</div>
                    <div>
                        <div className={styles.chatHeaderName}>General Chat</div>
                        <div className={styles.chatHeaderSub}>{online} member{online !== 1 ? "s" : ""} online</div>
                    </div>
                    <span className={`${styles.statusDot} ${connected ? styles.online : styles.offline}`} style={{ marginLeft: "auto" }} />
                </div>

                <div className={styles.messages}>
                    {loading ? <Spinner /> : messages.length === 0 ? <EmptyChat /> : (
                        <AnimatePresence initial={false}>
                            {messages.map((msg, idx) => {
                                const isMe = user && (msg.sender?.userId === (user._id || user.id) || msg.sender?.name === user.name);
                                const showAvatar = idx === 0 || messages[idx - 1]?.sender?.name !== msg.sender?.name;
                                return <MsgBubble key={msg._id || idx} msg={msg} isMe={isMe} showInfo={showAvatar} />;
                            })}
                        </AnimatePresence>
                    )}
                    <div ref={bottomRef} />
                </div>

                {user ? (
                    <form className={styles.inputBar} onSubmit={handleSend}>
                        <AvatarImg userId={user?._id} name={user?.name} hasAvatar={user?.hasAvatar} size={34} />
                        <textarea
                            className={styles.input}
                            placeholder="Type a message… (Enter to send)"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                            rows={1}
                            maxLength={1000}
                        />
                        <button type="submit" className={styles.sendBtn} disabled={!text.trim() || !connected}>➤</button>
                    </form>
                ) : (
                    <GuestBar />
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DM PANEL                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
const DMPanel = ({ socketRef, connected, user }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [sideTab, setSideTab] = useState("people"); // "chats" | "people"
    const [convLoading, setConvLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const bottomRef = useRef(null);

    const myId = user?._id || user?.id;

    // Load conversations
    const loadConversations = useCallback(async () => {
        try {
            const { data } = await api.get("/direct/conversations");
            setConversations(data.conversations || []);
        } catch { /* ignore */ }
        finally { setConvLoading(false); }
    }, []);

    // Load ALL users on mount (always visible)
    useEffect(() => {
        if (!user) return;
        loadConversations();
        api.get("/users")
            .then(({ data }) => {
                const list = (data.users || []).filter(u => (u._id || u.id) !== myId);
                setUsers(list);
            })
            .catch(() => { })
            .finally(() => setUsersLoading(false));
    }, [user, myId, loadConversations]);

    // Join DM room and listen for messages
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !activeConv) return;
        socket.emit("dm-join", activeConv.conversationId);
        const handler = (msg) => {
            if (msg.conversationId === activeConv.conversationId) {
                setMessages(prev => [...prev, msg]);
            }
        };
        socket.on("dm-message", handler);
        return () => socket.off("dm-message", handler);
    }, [socketRef, activeConv, connected]);

    // Listen for DM notifications
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        const handler = () => loadConversations();
        socket.on("dm-notification", handler);
        return () => socket.off("dm-notification", handler);
    }, [socketRef, loadConversations]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const openConversation = async (convId, otherUser) => {
        setActiveConv({ conversationId: convId, otherUser });
        setMsgLoading(true);
        setMessages([]);
        try {
            const { data } = await api.get(`/direct/messages/${convId}`);
            setMessages(data.messages || []);
            await api.patch(`/direct/read/${convId}`);
            setConversations(prev => prev.map(c =>
                c._id === convId ? { ...c, unread: 0 } : c
            ));
        } catch { /* ignore */ }
        finally { setMsgLoading(false); }
    };

    const startNewDM = (otherUser) => {
        const otherId = otherUser._id || otherUser.id;
        const convId = makeConvId(myId, otherId);
        openConversation(convId, { userId: otherId, name: otherUser.name, role: otherUser.role });
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim() || !user || !activeConv || !socketRef.current) return;
        socketRef.current.emit("dm-send", {
            from: { userId: myId, name: user.name },
            to: activeConv.otherUser,
            text: text.trim(),
        });
        setText("");
        setTimeout(loadConversations, 500);
    };

    const q = search.toLowerCase();
    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
    const filteredConvs = conversations.filter(conv => {
        const other = conv.lastMessage.from.userId === myId
            ? conv.lastMessage.to
            : conv.lastMessage.from;
        return other.name?.toLowerCase().includes(q);
    });

    if (!user) return <div className={styles.dmLayout}><div className={styles.dmChat}><GuestBar /></div></div>;

    return (
        <div className={styles.dmLayout}>
            {/* ── Left sidebar ── */}
            <div className={styles.convList}>
                {/* Search */}
                <div className={styles.convListHeader}>
                    <span className={styles.convListTitle}>Direct Messages</span>
                </div>
                <div className={styles.dmSearchWrap}>
                    <input
                        className={styles.dmSearchInput}
                        placeholder="🔍 Search people or chats…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Sub-tabs */}
                <div className={styles.dmSubTabs}>
                    <button
                        className={`${styles.dmSubTab} ${sideTab === "people" ? styles.dmSubTabActive : ""}`}
                        onClick={() => setSideTab("people")}
                    >
                        👥 People
                        {users.length > 0 && <span className={styles.dmSubCount}>{users.length}</span>}
                    </button>
                    <button
                        className={`${styles.dmSubTab} ${sideTab === "chats" ? styles.dmSubTabActive : ""}`}
                        onClick={() => setSideTab("chats")}
                    >
                        💬 Chats
                        {conversations.length > 0 && <span className={styles.dmSubCount}>{conversations.length}</span>}
                    </button>
                </div>

                {/* ── People tab ── */}
                {sideTab === "people" && (
                    <div className={styles.convItems}>
                        {usersLoading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className={styles.convSkeleton} />)
                        ) : filteredUsers.length === 0 ? (
                            <div className={styles.noConvs}>
                                <span>No users found</span>
                            </div>
                        ) : filteredUsers.map(u => {
                            const uid = u._id || u.id;
                            const convId = makeConvId(myId, uid);
                            const isActive = activeConv?.conversationId === convId;
                            return (
                                <div
                                    key={uid}
                                    className={`${styles.convItem} ${isActive ? styles.convItemActive : ""}`}
                                    onClick={() => startNewDM(u)}
                                >
                                    <AvatarImg userId={uid} name={u.name} hasAvatar={u.hasAvatar} size={36} />
                                    <div className={styles.convBody}>
                                        <div className={styles.convName}>{u.name}</div>
                                        <div className={styles.convLast}>{u.email}</div>
                                    </div>
                                    {u.role === "admin" && (
                                        <span className={styles.roleTag}>Admin</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Chats tab ── */}
                {sideTab === "chats" && (
                    <div className={styles.convItems}>
                        {convLoading ? (
                            [1, 2, 3].map(i => <div key={i} className={styles.convSkeleton} />)
                        ) : filteredConvs.length === 0 ? (
                            <div className={styles.noConvs}>
                                <span>No conversations yet</span>
                                <span className={styles.noConvSub}>Go to People tab to start a DM</span>
                            </div>
                        ) : (
                            filteredConvs.map(conv => {
                                const other = conv.lastMessage.from.userId === myId
                                    ? conv.lastMessage.to
                                    : conv.lastMessage.from;
                                const isActive = activeConv?.conversationId === conv._id;
                                return (
                                    <div
                                        key={conv._id}
                                        className={`${styles.convItem} ${isActive ? styles.convItemActive : ""}`}
                                        onClick={() => openConversation(conv._id, other)}
                                    >
                                        <AvatarImg userId={other.userId} name={other.name} hasAvatar={other.hasAvatar} size={36} />
                                        <div className={styles.convBody}>
                                            <div className={styles.convName}>{other.name}</div>
                                            <div className={styles.convLast}>{conv.lastMessage.text}</div>
                                        </div>
                                        <div className={styles.convMeta}>
                                            <span className={styles.convTime}>{formatDate(conv.lastMessage.createdAt)}</span>
                                            {conv.unread > 0 && <span className={styles.unreadBadge}>{conv.unread}</span>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* ── Right: Active DM ── */}
            <div className={styles.dmChat}>
                {!activeConv ? (
                    <div className={styles.noDM}>
                        <span className={styles.noDMIcon}>💌</span>
                        <p>Select someone from the People list to start chatting</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.convAvatar} style={{ width: 38, height: 38, fontSize: 16 }}>
                                {activeConv.otherUser.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className={styles.chatHeaderName}>{activeConv.otherUser.name}</div>
                                <div className={styles.chatHeaderSub}>
                                    {activeConv.otherUser.role === "admin" ? "👑 Admin" : "Direct Message"}
                                </div>
                            </div>
                        </div>

                        <div className={styles.messages}>
                            {msgLoading ? <Spinner /> : messages.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <span className={styles.emptyIcon}>👋</span>
                                    <p>Say hello to {activeConv.otherUser.name}!</p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.from.userId === myId;
                                        const showInfo = idx === 0 || messages[idx - 1]?.from?.userId !== msg.from?.userId;
                                        return <MsgBubble key={msg._id || idx} msg={{ ...msg, sender: msg.from, text: msg.text }} isMe={isMe} showInfo={showInfo} />;
                                    })}
                                </AnimatePresence>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <form className={styles.inputBar} onSubmit={handleSend}>
                            <AvatarImg userId={user?._id} name={user?.name} hasAvatar={user?.hasAvatar} size={34} />
                            <textarea
                                className={styles.input}
                                placeholder={`Message ${activeConv.otherUser.name}…`}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                                rows={1}
                                maxLength={1000}
                            />
                            <button type="submit" className={styles.sendBtn} disabled={!text.trim() || !connected}>➤</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SHARED SUB-COMPONENTS                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
const MsgBubble = ({ msg, isMe, showInfo }) => (
    <motion.div
        className={`${styles.msgRow} ${isMe ? styles.msgRowMe : ""}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
    >
        {!isMe && (
            <div className={`${styles.avatar} ${!showInfo ? styles.avatarHidden : ""}`}>
                <AvatarImg
                    userId={msg.sender?.userId}
                    name={msg.sender?.name}
                    hasAvatar={msg.sender?.hasAvatar}
                    size={34}
                />
            </div>
        )}
        <div className={styles.msgGroup}>
            {showInfo && !isMe && <span className={styles.senderName}>{msg.sender?.name}</span>}
            <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleOther}`}>{msg.text}</div>
            <span className={styles.time}>{formatTime(msg.createdAt)}</span>
        </div>
        {isMe && <div className={`${styles.avatar} ${styles.avatarMe}`}>{msg.sender?.name?.charAt(0).toUpperCase()}</div>}
    </motion.div>
);

const Spinner = () => (
    <div className={styles.loadingCenter}>
        <div className={styles.spinner} />
    </div>
);

const EmptyChat = () => (
    <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>💬</span>
        <p>No messages yet. Be the first!</p>
    </div>
);

const GuestBar = () => (
    <div className={styles.guestBar}>
        <span>👁️ Viewing as guest.</span>
        <a href="/login" className={styles.loginLink}>Log in to chat →</a>
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN CHAT PAGE                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
const Chat = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState("group"); // "group" | "dm"
    const [online, setOnline] = useState(0);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = io(SERVER_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            setConnected(true);
            socket.emit("join-room", ROOM);
            if (user) socket.emit("dm-register", user._id || user.id);
        });
        socket.on("disconnect", () => setConnected(false));
        socket.on("online-count", setOnline);

        return () => socket.disconnect();
    }, [user]);

    return (
        <PageWrapper>
            <div className={styles.page}>
                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${tab === "group" ? styles.tabActive : ""}`}
                        onClick={() => setTab("group")}
                    >
                        🌐 General
                    </button>
                    <button
                        className={`${styles.tab} ${tab === "dm" ? styles.tabActive : ""}`}
                        onClick={() => setTab("dm")}
                    >
                        💌 Direct Messages
                    </button>
                </div>

                {tab === "group" ? (
                    <GroupChat socketRef={socketRef} connected={connected} online={online} user={user} />
                ) : (
                    <DMPanel socketRef={socketRef} connected={connected} user={user} />
                )}
            </div>
        </PageWrapper>
    );
};

export default Chat;
