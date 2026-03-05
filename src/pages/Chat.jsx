import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import { Paperclip, Smile, X, Send } from "lucide-react";
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

    // Group state
    const [activeRoom, setActiveRoom] = useState("general");
    const [activeRoomName, setActiveRoomName] = useState("General Chat");
    const [groups, setGroups] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [creating, setCreating] = useState(false);
    const [showGroupManage, setShowGroupManage] = useState(false);

    // Media & Emoji
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Fetch user groups and all users for creation
    const loadGroups = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get("/groups");
            setGroups(data.groups || []);
        } catch (err) { }
    }, [user]);

    useEffect(() => {
        loadGroups();
        if (user) {
            api.get("/users")
                .then(({ data }) => setAllUsers((data.users || []).filter(u => (u._id || u.id) !== (user._id || user.id))))
                .catch(() => { });
        }
    }, [user, loadGroups]);

    // Fetch messages when room changes
    useEffect(() => {
        setLoading(true);
        setShowGroupManage(false); // hide panel on room change
        api.get(`/chat/messages?room=${activeRoom}`)
            .then(({ data }) => setMessages(data.messages || []))
            .finally(() => setLoading(false));
    }, [activeRoom]);

    // Socket listeners
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        socket.emit("join-room", activeRoom);

        const handler = (msg) => {
            if (msg.room === activeRoom || (!msg.room && activeRoom === "general")) {
                setMessages(prev => [...prev, msg]);
            }
        };
        socket.on("new-message", handler);
        return () => {
            socket.off("new-message", handler);
        };
    }, [socketRef, connected, activeRoom]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            alert("File is too large (max 50MB)");
            return;
        }
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        setShowEmojiPicker(false);
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if ((!text.trim() && !mediaFile) || !user || !socketRef.current) return;

        let mediaUrl = "";
        let mediaType = "none";

        if (mediaFile) {
            const formData = new FormData();
            formData.append("media", mediaFile);
            try {
                const { data } = await api.post("/upload/chat-media", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                mediaUrl = data.mediaUrl;
                mediaType = data.mediaType;
            } catch (err) {
                alert("Failed to upload media");
                return;
            }
        }

        socketRef.current.emit("send-message", {
            room: activeRoom,
            text: text.trim(),
            sender: { name: user.name, userId: user._id || user.id || "" },
            mediaUrl,
            mediaType
        });
        setText("");
        clearMedia();
        setShowEmojiPicker(false);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim() || selectedUsers.length === 0) return;
        setCreating(true);
        try {
            const { data } = await api.post("/groups", {
                name: newGroupName.trim(),
                members: selectedUsers
            });
            await loadGroups();
            setShowCreate(false);
            setNewGroupName("");
            setSelectedUsers([]);
            setActiveRoom(data.group._id);
            setActiveRoomName(data.group.name);
        } catch (err) {
            alert("Error creating group");
        } finally {
            setCreating(false);
        }
    };

    const toggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const activeGroupObj = groups.find(g => g._id === activeRoom);
    const isAdmin = activeGroupObj && user && activeGroupObj.admin?._id === (user._id || user.id);

    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            await api.post(`/groups/${activeRoom}/leave`);
            setActiveRoom("general");
            setActiveRoomName("General Chat");
            loadGroups();
        } catch (err) {
            alert(err.response?.data?.message || "Error leaving group");
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you sure you want to delete this group for everyone?")) return;
        try {
            await api.delete(`/groups/${activeRoom}`);
            setActiveRoom("general");
            setActiveRoomName("General Chat");
            loadGroups();
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting group");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Remove this member from the group?")) return;
        try {
            await api.delete(`/groups/${activeRoom}/members/${memberId}`);
            loadGroups();
        } catch (err) {
            alert(err.response?.data?.message || "Error removing member");
        }
    };

    return (
        <div className={styles.groupLayout}>
            {/* ── Left: Room info sidebar ── */}
            <div className={styles.groupSidebar}>
                <div className={styles.convListHeader}>
                    <span className={styles.convListTitle}>Groups</span>
                    <span className={`${styles.statusDot} ${connected ? styles.online : styles.offline}`} />
                </div>

                <div className={styles.groupList}>
                    <div
                        className={`${styles.convItem} ${activeRoom === "general" ? styles.convItemActive : ""}`}
                        onClick={() => { setActiveRoom("general"); setActiveRoomName("General Chat"); }}
                    >
                        <div className={styles.groupRoomIcon}>🌐</div>
                        <div className={styles.convBody}>
                            <div className={styles.convName}>General Chat</div>
                            <div className={styles.convLast}>Public Room</div>
                        </div>
                    </div>

                    {user && (
                        <div className={styles.createGroupBtnWrap}>
                            <button className={styles.createGroupBtn} onClick={() => setShowCreate(true)}>
                                ➕ Create Group
                            </button>
                        </div>
                    )}

                    {groups.map(g => (
                        <div
                            key={g._id}
                            className={`${styles.convItem} ${activeRoom === g._id ? styles.convItemActive : ""}`}
                            onClick={() => { setActiveRoom(g._id); setActiveRoomName(g.name); }}
                        >
                            <div className={styles.groupRoomIcon}>📁</div>
                            <div className={styles.convBody}>
                                <div className={styles.convName}>{g.name}</div>
                                <div className={styles.convLast}>{g.members?.length || 0} members</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.groupSidebarBody} style={{ marginTop: 'auto' }}>
                    <div className={styles.groupOnlineBox}>
                        <span className={styles.groupOnlineDot} />
                        <span className={styles.groupOnlineText}>{activeRoom === "general" ? online : "Group member"}s connected</span>
                    </div>
                </div>
            </div>

            {/* ── Right: Chat ── */}
            <div className={styles.groupChat}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderIcon}>{activeRoom === "general" ? "🌐" : "📁"}</div>
                    <div className={styles.chatHeaderInfo}>
                        <div className={styles.chatHeaderName}>{activeRoomName}</div>
                        <div className={styles.chatHeaderSub}>
                            {activeRoom === "general"
                                ? `${online} member${online !== 1 ? "s" : ""} online`
                                : `${activeGroupObj?.members?.length || 0} members`}
                        </div>
                    </div>

                    {/* Group Management Dropdown / Panel */}
                    {activeRoom !== "general" && activeGroupObj && (
                        <div style={{ position: "relative", marginLeft: "auto", display: "flex", alignItems: "center" }}>
                            <button
                                onClick={() => setShowGroupManage(!showGroupManage)}
                                className={styles.actionBtn}
                                title="Group Actions"
                            >
                                ⚙️
                            </button>

                            {showGroupManage && (
                                <div className={styles.groupManagePanel}>
                                    <div className={styles.groupManageTop}>
                                        <span className={styles.groupManageTitle}>Members</span>
                                        {isAdmin ? (
                                            <button className={styles.manageBtnDelete} onClick={handleDeleteGroup}>Delete Group</button>
                                        ) : (
                                            <button className={styles.manageBtnLeave} onClick={handleLeaveGroup}>Leave Group</button>
                                        )}
                                    </div>
                                    <div className={styles.groupMembersList}>
                                        {activeGroupObj.members.map(m => {
                                            const isMAdmin = m._id === activeGroupObj.admin?._id;
                                            const isMe = m._id === (user?._id || user?.id);
                                            return (
                                                <div key={m._id} className={styles.groupMemberRow}>
                                                    <AvatarImg userId={m._id} name={m.name} hasAvatar={m.hasAvatar} size={24} />
                                                    <span className={styles.groupMemberName}>
                                                        {m.name} {isMe && "(You)"} {isMAdmin && "👑"}
                                                    </span>
                                                    {isAdmin && !isMAdmin && (
                                                        <button
                                                            className={styles.removeMemberBtn}
                                                            title="Remove Member"
                                                            onClick={() => handleRemoveMember(m._id)}
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <span className={`${styles.statusDot} ${connected ? styles.online : styles.offline}`} style={{ marginLeft: activeRoom === "general" ? "auto" : "10px" }} />
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
                    <div style={{ position: "relative" }}>
                        {/* Media Preview */}
                        {mediaPreview && (
                            <div className={styles.mediaPreviewWrap}>
                                <button type="button" className={styles.removeMediaBtn} onClick={clearMedia}><X size={14} /></button>
                                {mediaFile?.type.startsWith("video/") ? (
                                    <video src={mediaPreview} className={styles.mediaPreview} controls />
                                ) : (
                                    <img src={mediaPreview} alt="preview" className={styles.mediaPreview} />
                                )}
                            </div>
                        )}

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className={styles.emojiPickerWrap}>
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => setText(prev => prev + emojiData.emoji)}
                                    theme="dark"
                                />
                            </div>
                        )}

                        <form className={styles.inputBar} onSubmit={handleSend}>
                            <AvatarImg userId={user?._id} name={user?.name} hasAvatar={user?.hasAvatar} size={34} />

                            <button type="button" className={styles.actionBtn} onClick={() => fileInputRef.current?.click()} title="Attach Image/Video">
                                <Paperclip size={20} />
                            </button>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*" onChange={handleFileSelect} />

                            <button type="button" className={styles.actionBtn} onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add Emoji">
                                <Smile size={20} />
                            </button>

                            <textarea
                                className={styles.input}
                                placeholder={`Message ${activeRoomName}… (Enter to send)`}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                                rows={1}
                                maxLength={1000}
                            />
                            <button type="submit" className={styles.sendBtn} disabled={(!text.trim() && !mediaFile) || !connected}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <GuestBar />
                )}

                {/* Create Group Modal */}
                {showCreate && (
                    <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <h3>Create New Group</h3>
                            <form onSubmit={handleCreateGroup}>
                                <div className={styles.formGroup}>
                                    <label>Group Name</label>
                                    <input
                                        type="text"
                                        value={newGroupName}
                                        onChange={e => setNewGroupName(e.target.value)}
                                        placeholder="e.g. Design Team"
                                        required
                                        maxLength={50}
                                        className={styles.modalInput}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Select Members</label>
                                    <div className={styles.userSelectMap}>
                                        {allUsers.map(u => (
                                            <div
                                                key={u._id || u.id}
                                                className={`${styles.userSelectCard} ${selectedUsers.includes(u._id || u.id) ? styles.userSelected : ""}`}
                                                onClick={() => toggleUser(u._id || u.id)}
                                            >
                                                <AvatarImg userId={u._id || u.id} name={u.name} hasAvatar={u.hasAvatar} size={30} />
                                                <span className={styles.userSelectName}>{u.name}</span>
                                                <span className={styles.userSelectCheck}>{selectedUsers.includes(u._id || u.id) ? "✓" : "+"}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancel</button>
                                    <button type="submit" className={styles.createBtn} disabled={creating || !newGroupName.trim() || selectedUsers.length === 0}>
                                        {creating ? "Creating..." : "Create Group"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
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

    // Media & Emoji
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const fileInputRef = useRef(null);

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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            alert("File is too large (max 50MB)");
            return;
        }
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        setShowEmojiPicker(false);
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if ((!text.trim() && !mediaFile) || !user || !activeConv || !socketRef.current) return;

        let mediaUrl = "";
        let mediaType = "none";

        if (mediaFile) {
            const formData = new FormData();
            formData.append("media", mediaFile);
            try {
                const { data } = await api.post("/upload/chat-media", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                mediaUrl = data.mediaUrl;
                mediaType = data.mediaType;
            } catch (err) {
                alert("Failed to upload media");
                return;
            }
        }

        socketRef.current.emit("dm-send", {
            from: { userId: myId, name: user.name },
            to: activeConv.otherUser,
            text: text.trim(),
            mediaUrl,
            mediaType
        });

        setText("");
        clearMedia();
        setShowEmojiPicker(false);
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

                        <div style={{ position: "relative" }}>
                            {/* Media Preview */}
                            {mediaPreview && (
                                <div className={styles.mediaPreviewWrap}>
                                    <button type="button" className={styles.removeMediaBtn} onClick={clearMedia}><X size={14} /></button>
                                    {mediaFile?.type.startsWith("video/") ? (
                                        <video src={mediaPreview} className={styles.mediaPreview} controls />
                                    ) : (
                                        <img src={mediaPreview} alt="preview" className={styles.mediaPreview} />
                                    )}
                                </div>
                            )}

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className={styles.emojiPickerWrap}>
                                    <EmojiPicker
                                        onEmojiClick={(emojiData) => setText(prev => prev + emojiData.emoji)}
                                        theme="dark"
                                    />
                                </div>
                            )}

                            <form className={styles.inputBar} onSubmit={handleSend}>
                                <AvatarImg userId={user?._id} name={user?.name} hasAvatar={user?.hasAvatar} size={34} />

                                <button type="button" className={styles.actionBtn} onClick={() => fileInputRef.current?.click()} title="Attach Image/Video">
                                    <Paperclip size={20} />
                                </button>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*" onChange={handleFileSelect} />

                                <button type="button" className={styles.actionBtn} onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add Emoji">
                                    <Smile size={20} />
                                </button>

                                <textarea
                                    className={styles.input}
                                    placeholder={`Message ${activeConv.otherUser.name}…`}
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                                    rows={1}
                                    maxLength={1000}
                                />
                                <button type="submit" className={styles.sendBtn} disabled={(!text.trim() && !mediaFile) || !connected}>
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  AI CHAT PANEL                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
const AIChatPanel = ({ user }) => {
    const [messages, setMessages] = useState([
        { _id: "welcome", text: "Hello! I am your AI Assistant powered by Gemini. How can I help you today?", isMe: false, sender: { name: "AI Assistant" }, createdAt: Date.now() }
    ]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!text.trim() || !user) return;

        const userMsg = {
            _id: Date.now().toString(),
            text: text.trim(),
            isMe: true,
            sender: { name: user.name, userId: user._id || user.id },
            createdAt: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setText("");
        setLoading(true);

        const recentHistory = messages.slice(-6).map(m => ({
            text: m.text,
            isMe: m.isMe,
        }));

        try {
            const { data } = await api.post("/chat/ai", {
                prompt: userMsg.text,
                history: recentHistory
            });

            setMessages(prev => [...prev, {
                _id: Date.now().toString() + "-ai",
                text: data.reply,
                isMe: false,
                sender: { name: "AI Assistant" },
                createdAt: Date.now()
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                _id: Date.now().toString() + "-err",
                text: err.response?.data?.message || "Sorry, I encountered an error and cannot process your request right now.",
                isMe: false,
                sender: { name: "System Error" },
                createdAt: Date.now()
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className={styles.groupLayout}><div className={styles.groupChat}><GuestBar /></div></div>;

    return (
        <div className={styles.groupLayout}>
            <div className={styles.groupSidebar}>
                <div className={styles.convListHeader}>
                    <span className={styles.convListTitle}>AI Assistant</span>
                </div>
                <div className={styles.groupList}>
                    <div className={`${styles.convItem} ${styles.convItemActive}`}>
                        <div className={styles.groupRoomIcon}>🤖</div>
                        <div className={styles.convBody}>
                            <div className={styles.convName}>AI Chatbot</div>
                            <div className={styles.convLast}>Powered by Gemini</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.groupChat}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderIcon}>🤖</div>
                    <div className={styles.chatHeaderInfo}>
                        <div className={styles.chatHeaderName}>Gemini AI</div>
                        <div className={styles.chatHeaderSub}>Virtual Assistant</div>
                    </div>
                </div>

                <div className={styles.messages}>
                    {messages.length === 0 ? <EmptyChat /> : (
                        <AnimatePresence initial={false}>
                            {messages.map((msg, idx) => {
                                const showAvatar = idx === 0 || messages[idx - 1]?.sender?.name !== msg.sender?.name;
                                return <MsgBubble key={msg._id} msg={msg} isMe={msg.isMe} showInfo={showAvatar} />;
                            })}
                        </AnimatePresence>
                    )}
                    {loading && (
                        <div style={{ display: "flex", padding: "16px", color: "var(--text-muted)", alignItems: "center" }}>
                            <div className={styles.spinner} style={{ width: 16, height: 16, borderTopColor: "var(--primary)", borderRightColor: "var(--primary)" }} />
                            <span style={{ marginLeft: 8 }}>AI is typing...</span>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div style={{ position: "relative" }}>
                    <form className={styles.inputBar} onSubmit={handleSend}>
                        <AvatarImg userId={user?._id} name={user?.name} hasAvatar={user?.hasAvatar} size={34} />
                        <textarea
                            className={styles.input}
                            placeholder="Ask the AI anything... (Enter to send)"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                            rows={1}
                            maxLength={2000}
                        />
                        <button type="submit" className={styles.sendBtn} disabled={!text.trim() || loading}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
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

            {msg.mediaUrl && (
                <div className={styles.msgMediaWrap}>
                    {msg.mediaType === "video" ? (
                        <video src={`${SERVER_URL}${msg.mediaUrl}`} controls className={styles.msgVideo} />
                    ) : (
                        <img src={`${SERVER_URL}${msg.mediaUrl}`} alt="Attachment" className={styles.msgImage} />
                    )}
                </div>
            )}

            {msg.text && <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleOther}`}>{msg.text}</div>}
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
                    <button
                        className={`${styles.tab} ${tab === "ai" ? styles.tabActive : ""}`}
                        onClick={() => setTab("ai")}
                    >
                        🤖 AI Assistant
                    </button>
                </div>

                {tab === "group" ? (
                    <GroupChat socketRef={socketRef} connected={connected} online={online} user={user} />
                ) : tab === "ai" ? (
                    <AIChatPanel user={user} />
                ) : (
                    <DMPanel socketRef={socketRef} connected={connected} user={user} />
                )}
            </div>
        </PageWrapper>
    );
};

export default Chat;
