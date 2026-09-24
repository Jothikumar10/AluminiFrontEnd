import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { io } from "socket.io-client";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Smile,
  User,
  X,
} from "lucide-react";

import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| Socket.IO Server URL
|--------------------------------------------------------------------------
*/

const SOCKET_URL = "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| Messages Page
|--------------------------------------------------------------------------
*/

const Messages = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  // =========================================================
  // STATE
  // =========================================================

  const [currentUser, setCurrentUser] =
    useState(null);

  const [conversations, setConversations] =
    useState([]);

  const [people, setPeople] =
    useState([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [filePreviewUrl, setFilePreviewUrl] =
    useState(null);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [
    loadingPeople,
    setLoadingPeople,
  ] = useState(true);

  const [
    loadingConversation,
    setLoadingConversation,
  ] = useState(false);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    socketConnected,
    setSocketConnected,
  ] = useState(false);

  // =========================================================
  // REFS
  // =========================================================

  const messagesEndRef =
    useRef(null);

  const inputRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  const socketRef =
    useRef(null);

  const selectedConversationRef =
    useRef(null);

  const currentUserIdRef =
    useRef(null);

  // =========================================================
  // CURRENT USER
  // =========================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      setCurrentUser(parsedUser);
    } catch (error) {
      console.error(
        "Failed to read current user:",
        error
      );
    }
  }, []);

  const currentUserId = useMemo(() => {
    return (
      currentUser?._id ||
      currentUser?.id ||
      currentUser?.userId ||
      null
    );
  }, [currentUser]);

  // =========================================================
  // KEEP CURRENT USER ID IN REF
  // =========================================================

  useEffect(() => {
    currentUserIdRef.current =
      currentUserId;
  }, [currentUserId]);

  // =========================================================
  // KEEP SELECTED CONVERSATION IN REF
  // =========================================================

  useEffect(() => {
    selectedConversationRef.current =
      selectedConversation;
  }, [selectedConversation]);

  // =========================================================
  // FILE PREVIEW URL
  // =========================================================

  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }

    const isImage =
      selectedFile.type.startsWith(
        "image/"
      );

    const isVideo =
      selectedFile.type.startsWith(
        "video/"
      );

    if (!isImage && !isVideo) {
      setFilePreviewUrl(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedFile
      );

    setFilePreviewUrl(
      objectUrl
    );

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [selectedFile]);

  // =========================================================
  // SCROLL TO BOTTOM
  // =========================================================

  const scrollToBottom =
    useCallback(() => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView(
          {
            behavior: "smooth",
          }
        );
      }, 100);
    }, []);

  // =========================================================
  // GET CONVERSATIONS
  // =========================================================

  const fetchConversations =
    useCallback(async () => {
      try {
        setLoadingConversations(
          true
        );

        const response =
          await api.get(
            "/conversations"
          );

        const list =
          response.data
            ?.conversations || [];

        setConversations(list);

        return list;
      } catch (error) {
        console.error(
          "Fetch conversations error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to load conversations."
        );

        return [];
      } finally {
        setLoadingConversations(
          false
        );
      }
    }, []);

  // =========================================================
  // GET FOLLOWERS
  // =========================================================

  const fetchFollowers =
    useCallback(async () => {
      if (!currentUserId) {
        return [];
      }

      try {
        const response =
          await api.get(
            `/follows/followers/${currentUserId}`
          );

        const followers =
          response.data
            ?.followers || [];

        return followers
          .map(
            (item) =>
              item?.follower
          )
          .filter(Boolean);
      } catch (error) {
        console.error(
          "Fetch followers error:",
          error
        );

        return [];
      }
    }, [currentUserId]);

  // =========================================================
  // GET FOLLOWING
  // =========================================================

  const fetchFollowing =
    useCallback(async () => {
      if (!currentUserId) {
        return [];
      }

      try {
        const response =
          await api.get(
            `/follows/following/${currentUserId}`
          );

        const following =
          response.data
            ?.following || [];

        return following
          .map(
            (item) =>
              item?.following
          )
          .filter(Boolean);
      } catch (error) {
        console.error(
          "Fetch following error:",
          error
        );

        return [];
      }
    }, [currentUserId]);

  // =========================================================
  // GET PEOPLE
  // =========================================================

  const fetchPeople =
    useCallback(async () => {
      if (!currentUserId) {
        return;
      }

      try {
        setLoadingPeople(true);

        const [
          followers,
          following,
        ] = await Promise.all([
          fetchFollowers(),
          fetchFollowing(),
        ]);

        const combined = [
          ...followers,
          ...following,
        ];

        const uniqueUsers = [];
        const ids = new Set();

        combined.forEach(
          (person) => {
            const id =
              person?._id ||
              person?.id;

            if (!id) {
              return;
            }

            if (
              String(id) ===
              String(
                currentUserId
              )
            ) {
              return;
            }

            const key =
              String(id);

            if (
              ids.has(key)
            ) {
              return;
            }

            ids.add(key);

            uniqueUsers.push(
              person
            );
          }
        );

        setPeople(
          uniqueUsers
        );
      } catch (error) {
        console.error(
          "Fetch people error:",
          error
        );
      } finally {
        setLoadingPeople(
          false
        );
      }
    }, [
      currentUserId,
      fetchFollowers,
      fetchFollowing,
    ]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    fetchPeople();
  }, [
    currentUserId,
    fetchPeople,
  ]);

  // =========================================================
  // GET OR CREATE CONVERSATION
  // =========================================================

  const getOrCreateConversation =
    useCallback(
      async (targetUserId) => {
        if (!targetUserId) {
          setError(
            "User ID is missing."
          );

          return null;
        }

        try {
          setLoadingConversation(
            true
          );

          setError("");

          const response =
            await api.get(
              `/conversations/user/${targetUserId}`
            );

          const conversation =
            response.data
              ?.conversation;

          if (!conversation?._id) {
            setError(
              "Conversation could not be created."
            );

            return null;
          }

          setSelectedConversation(
            conversation
          );

          setConversations(
            (previous) => {
              const exists =
                previous.some(
                  (item) =>
                    String(
                      item._id
                    ) ===
                    String(
                      conversation._id
                    )
                );

              if (exists) {
                return previous.map(
                  (item) =>
                    String(
                      item._id
                    ) ===
                    String(
                      conversation._id
                    )
                      ? {
                          ...item,
                          ...conversation,
                        }
                      : item
                );
              }

              return [
                conversation,
                ...previous,
              ];
            }
          );

          return conversation;
        } catch (error) {
          console.error(
            "Get/create conversation error:",
            error
          );

          setError(
            error.response?.data
              ?.message ||
              "Conversation could not be found."
          );

          return null;
        } finally {
          setLoadingConversation(
            false
          );
        }
      },
      []
    );

  // =========================================================
  // GET MESSAGES
  // =========================================================

  const fetchMessages =
    useCallback(
      async (conversationId) => {
        if (!conversationId) {
          setMessages([]);
          return [];
        }

        try {
          setLoadingMessages(
            true
          );

          setMessages([]);

          const response =
            await api.get(
              `/messages/${conversationId}`
            );

          const list =
            response.data
              ?.messages || [];

          /*
          | Deduplicate API response just in case.
          */

          const uniqueMessages = [];
          const ids = new Set();

          list.forEach(
            (item) => {
              if (!item?._id) {
                return;
              }

              const id =
                String(
                  item._id
                );

              if (
                ids.has(id)
              ) {
                return;
              }

              ids.add(id);

              uniqueMessages.push(
                item
              );
            }
          );

          setMessages(
            uniqueMessages
          );

          scrollToBottom();

          return uniqueMessages;
        } catch (error) {
          console.error(
            "Fetch messages error:",
            error
          );

          setMessages([]);

          setError(
            error.response?.data
              ?.message ||
              "Failed to load messages."
          );

          return [];
        } finally {
          setLoadingMessages(
            false
          );
        }
      },
      [scrollToBottom]
    );

  // =========================================================
  // MARK MESSAGES AS READ
  // =========================================================

  const markMessagesAsRead =
    useCallback(
      async (conversationId) => {
        if (!conversationId) {
          return;
        }

        try {
          await api.put(
            `/messages/${conversationId}/read`
          );

          /*
          | Update local read status.
          */

          setMessages(
            (previous) =>
              previous.map(
                (item) => {
                  const receiverId =
                    item?.receiver?._id ||
                    item?.receiver?.id ||
                    item?.receiver;

                  if (
                    String(
                      receiverId
                    ) ===
                    String(
                      currentUserIdRef.current
                    )
                  ) {
                    return {
                      ...item,
                      isRead: true,
                      readAt:
                        new Date().toISOString(),
                    };
                  }

                  return item;
                }
              )
          );

          /*
          | Update sidebar lastMessage
          | if it belongs to this conversation.
          */

          setConversations(
            (previous) =>
              previous.map(
                (conversation) => {
                  if (
                    String(
                      conversation._id
                    ) !==
                    String(
                      conversationId
                    )
                  ) {
                    return conversation;
                  }

                  if (
                    !conversation.lastMessage
                  ) {
                    return conversation;
                  }

                  const lastMessage =
                    typeof conversation.lastMessage ===
                    "object"
                      ? {
                          ...conversation.lastMessage,
                          isRead: true,
                        }
                      : conversation.lastMessage;

                  return {
                    ...conversation,
                    lastMessage,
                  };
                }
              )
          );
        } catch (error) {
          console.error(
            "Mark messages as read error:",
            error
          );
        }
      },
      []
    );

  // =========================================================
  // SOCKET.IO CONNECTION
  // =========================================================

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Create Socket
    |--------------------------------------------------------------------------
    */

    const socket = io(
      SOCKET_URL,
      {
        transports: [
          "websocket",
          "polling",
        ],
        withCredentials: true,
      }
    );

    socketRef.current =
      socket;

    // =======================================================
    // CONNECT
    // =======================================================

    const handleConnect =
      () => {
        console.log(
          "Socket.IO connected:",
          socket.id
        );

        setSocketConnected(
          true
        );

        /*
        | Join current user's room.
        */

        socket.emit(
          "join-user",
          String(
            currentUserId
          )
        );

        /*
        | Join selected conversation if
        | one is already open.
        */

        const conversationId =
          selectedConversationRef
            .current?._id;

        if (conversationId) {
          socket.emit(
            "join-conversation",
            String(
              conversationId
            )
          );
        }
      };

    // =======================================================
    // NEW MESSAGE
    // =======================================================

    const handleNewMessage =
      async (newMessage) => {
        console.log(
          "New real-time message:",
          newMessage
        );

        if (!newMessage?._id) {
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Find Conversation ID
        |--------------------------------------------------------------------------
        */

        const messageConversationId =
          newMessage?.conversation
            ?._id ||
          newMessage?.conversation;

        if (!messageConversationId) {
          return;
        }

        const selectedConversationId =
          selectedConversationRef
            .current?._id;

        /*
        |--------------------------------------------------------------------------
        | Add Message If It Belongs To Open Conversation
        |--------------------------------------------------------------------------
        */

        const belongsToCurrentConversation =
          String(
            messageConversationId
          ) ===
          String(
            selectedConversationId
          );

        if (
          belongsToCurrentConversation
        ) {
          setMessages(
            (previous) => {
              const alreadyExists =
                previous.some(
                  (item) =>
                    String(
                      item._id
                    ) ===
                    String(
                      newMessage._id
                    )
                );

              if (
                alreadyExists
              ) {
                return previous;
              }

              return [
                ...previous,
                newMessage,
              ];
            }
          );

          /*
          | Check whether this message
          | came from another user.
          */

          const senderId =
            newMessage?.sender
              ?._id ||
            newMessage?.sender
              ?.id ||
            newMessage?.sender;

          const isIncoming =
            String(
              senderId
            ) !==
            String(
              currentUserIdRef.current
            );

          /*
          | Mark incoming message read.
          */

          if (isIncoming) {
            try {
              await api.put(
                `/messages/${messageConversationId}/read`
              );

              setMessages(
                (previous) =>
                  previous.map(
                    (item) =>
                      String(
                        item._id
                      ) ===
                      String(
                        newMessage._id
                      )
                        ? {
                            ...item,
                            isRead: true,
                            readAt:
                              new Date().toISOString(),
                          }
                        : item
                  )
              );
            } catch (error) {
              console.error(
                "Mark incoming real-time message as read error:",
                error
              );
            }
          }

          scrollToBottom();
        }

        /*
        |--------------------------------------------------------------------------
        | Update Sidebar
        |--------------------------------------------------------------------------
        */

        setConversations(
          (previous) => {
            const existingIndex =
              previous.findIndex(
                (conversation) =>
                  String(
                    conversation._id
                  ) ===
                  String(
                    messageConversationId
                  )
              );

            /*
            | Conversation already exists.
            */

            if (
              existingIndex !==
              -1
            ) {
              const updatedConversation =
                {
                  ...previous[
                    existingIndex
                  ],
                  lastMessage:
                    newMessage,
                  lastMessageAt:
                    newMessage.createdAt,
                  updatedAt:
                    newMessage.createdAt,
                };

              const newList = [
                ...previous,
              ];

              newList.splice(
                existingIndex,
                1
              );

              /*
              | Move latest conversation
              | to the top.
              */

              return [
                updatedConversation,
                ...newList,
              ];
            }

            /*
            | If conversation is not in sidebar,
            | refresh conversations.
            */

            return previous;
          }
        );

        /*
        |--------------------------------------------------------------------------
        | Refresh Conversation List
        |--------------------------------------------------------------------------
        |
        | This also handles a conversation
        | that was not previously loaded.
        |--------------------------------------------------------------------------
        */

        fetchConversations();
      };

    // =======================================================
    // DISCONNECT
    // =======================================================

    const handleDisconnect =
      (reason) => {
        console.log(
          "Socket.IO disconnected:",
          reason
        );

        setSocketConnected(
          false
        );
      };

    // =======================================================
    // CONNECTION ERROR
    // =======================================================

    const handleConnectError =
      (socketError) => {
        console.error(
          "Socket.IO connection error:",
          socketError
        );

        setSocketConnected(
          false
        );
      };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "new-message",
      handleNewMessage
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      const conversationId =
        selectedConversationRef
          .current?._id;

      if (
        conversationId &&
        socket.connected
      ) {
        socket.emit(
          "leave-conversation",
          String(
            conversationId
          )
        );
      }

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "new-message",
        handleNewMessage
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.disconnect();

      if (
        socketRef.current ===
        socket
      ) {
        socketRef.current =
          null;
      }

      setSocketConnected(
        false
      );
    };
  }, [
    currentUserId,
    fetchConversations,
    scrollToBottom,
  ]);

  // =========================================================
  // JOIN / LEAVE CONVERSATION
  // =========================================================

  useEffect(() => {
    const socket =
      socketRef.current;

    const conversationId =
      selectedConversation?._id;

    if (
      !socket ||
      !conversationId
    ) {
      return;
    }

    const joinConversation =
      () => {
        socket.emit(
          "join-conversation",
          String(
            conversationId
          )
        );
      };

    /*
    | If already connected, join immediately.
    */

    if (socket.connected) {
      joinConversation();
    }

    /*
    | If connection happens after this effect,
    | join when socket connects.
    */

    socket.on(
      "connect",
      joinConversation
    );

    return () => {
      if (
        socket.connected
      ) {
        socket.emit(
          "leave-conversation",
          String(
            conversationId
          )
        );
      }

      socket.off(
        "connect",
        joinConversation
      );
    };
  }, [
    selectedConversation?._id,
  ]);

  // =========================================================
  // OPEN USER FROM URL
  // /messages/:userId
  // =========================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    /*
    | Don't run until current user
    | has been loaded.
    */

    if (!currentUserId) {
      return;
    }

    let cancelled = false;

    const openUser =
      async () => {
        try {
          setError("");

          /*
          | Get or create conversation.
          */

          const conversation =
            await getOrCreateConversation(
              userId
            );

          if (
            cancelled ||
            !conversation?._id
          ) {
            return;
          }

          /*
          | Load messages.
          */

          await fetchMessages(
            conversation._id
          );

          if (cancelled) {
            return;
          }

          /*
          | Mark as read.
          */

          await markMessagesAsRead(
            conversation._id
          );

          if (cancelled) {
            return;
          }

          /*
          | Focus input.
          */

          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        } catch (error) {
          console.error(
            "Open user conversation error:",
            error
          );
        }
      };

    openUser();

    return () => {
      cancelled = true;
    };
  }, [
    userId,
    currentUserId,
    getOrCreateConversation,
    fetchMessages,
    markMessagesAsRead,
  ]);

  // =========================================================
  // FIND OTHER PARTICIPANT
  // =========================================================

  const getOtherParticipant =
    useCallback(
      (conversation) => {
        if (
          !conversation?.participants ||
          !Array.isArray(
            conversation.participants
          ) ||
          conversation
            .participants.length ===
            0
        ) {
          return null;
        }

        return (
          conversation.participants.find(
            (participant) =>
              String(
                participant?._id ||
                  participant?.id
              ) !==
              String(
                currentUserId
              )
          ) ||
          conversation
            .participants[0]
        );
      },
      [currentUserId]
    );

  // =========================================================
  // SELECT EXISTING CONVERSATION
  // =========================================================

  const handleSelectConversation =
    (conversation) => {
      if (!conversation?._id) {
        return;
      }

      const otherUser =
        getOtherParticipant(
          conversation
        );

      const otherUserId =
        otherUser?._id ||
        otherUser?.id;

      if (!otherUserId) {
        setError(
          "Unable to identify the other user."
        );

        return;
      }

      setError("");

      /*
      | Clear old messages immediately.
      */

      setMessages([]);

      /*
      | Set selected conversation.
      */

      setSelectedConversation(
        conversation
      );

      /*
      | Navigate.
      |
      | The URL effect will load the
      | conversation and messages.
      */

      navigate(
        `/messages/${otherUserId}`
      );
    };

  // =========================================================
  // OPEN FOLLOWER / FOLLOWING
  // =========================================================

  const handleOpenPerson =
    (person) => {
      const targetUserId =
        person?._id ||
        person?.id;

      if (!targetUserId) {
        return;
      }

      setError("");

      /*
      | Do not manually call get/create here.
      |
      | Navigate first.
      |
      | The /messages/:userId effect will
      | create/load the conversation.
      */

      navigate(
        `/messages/${targetUserId}`
      );
    };

  // =========================================================
  // OPEN PROFILE
  // =========================================================

  const handleOpenProfile = (
    targetUser
  ) => {
    const targetUserId =
      targetUser?._id ||
      targetUser?.id;

    if (!targetUserId) {
      return;
    }

    navigate(
      `/profile/${targetUserId}`
    );
  };

  // =========================================================
  // FILE SELECT
  // =========================================================

  const handleFileSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    /*
    |--------------------------------------------------------------------------
    | Maximum File Size
    |--------------------------------------------------------------------------
    */

    const maxSize =
      50 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "File size cannot exceed 50 MB."
      );

      event.target.value = "";

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Allowed File Types
    |--------------------------------------------------------------------------
    */

    const allowedTypes = [
      "image/",
      "video/",
      "audio/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const isAllowed =
      allowedTypes.some(
        (type) => {
          if (
            type.endsWith("/")
          ) {
            return file.type.startsWith(
              type
            );
          }

          return (
            file.type ===
            type
          );
        }
      );

    if (!isAllowed) {
      setError(
        "Unsupported file type. Please select an image, video, audio, PDF, DOC, or DOCX file."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);
  };

  // =========================================================
  // REMOVE FILE
  // =========================================================

  const handleRemoveFile =
    () => {
      setSelectedFile(null);
      setFilePreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    };

  // =========================================================
  // OPEN FILE PICKER
  // =========================================================

  const handleOpenFilePicker =
    () => {
      if (sending) {
        return;
      }

      fileInputRef.current?.click();
    };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage =
    async (event) => {
      event?.preventDefault();

      const text =
        message.trim();

      /*
      |--------------------------------------------------------------------------
      | Validate
      |--------------------------------------------------------------------------
      */

      if (
        sending ||
        (!text &&
          !selectedFile)
      ) {
        return;
      }

      if (
        !selectedConversation?._id
      ) {
        setError(
          "Please select a conversation first."
        );

        return;
      }

      if (text.length > 5000) {
        setError(
          "Message cannot exceed 5000 characters."
        );

        return;
      }

      try {
        setSending(true);
        setError("");

        /*
        |--------------------------------------------------------------------------
        | FormData
        |--------------------------------------------------------------------------
        */

        const formData =
          new FormData();

        if (text) {
          formData.append(
            "text",
            text
          );
        }

        if (selectedFile) {
          formData.append(
            "file",
            selectedFile
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Send REST Request
        |--------------------------------------------------------------------------
        */

        const response =
          await api.post(
            `/messages/${selectedConversation._id}`,
            formData
          );

        const newMessage =
          response.data
            ?.message;

        /*
        |--------------------------------------------------------------------------
        | Add REST Message
        |--------------------------------------------------------------------------
        |
        | Socket.IO may send the same message.
        | We deduplicate by _id.
        |--------------------------------------------------------------------------
        */

        if (newMessage?._id) {
          setMessages(
            (previous) => {
              const exists =
                previous.some(
                  (item) =>
                    String(
                      item._id
                    ) ===
                    String(
                      newMessage._id
                    )
                );

              if (exists) {
                return previous;
              }

              return [
                ...previous,
                newMessage,
              ];
            }
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Clear Input
        |--------------------------------------------------------------------------
        */

        setMessage("");
        setSelectedFile(null);
        setFilePreviewUrl(null);

        if (fileInputRef.current) {
          fileInputRef.current.value =
            "";
        }

        /*
        |--------------------------------------------------------------------------
        | Refresh Conversations
        |--------------------------------------------------------------------------
        */

        const updated =
          await fetchConversations();

        const updatedConversation =
          updated.find(
            (conversation) =>
              String(
                conversation._id
              ) ===
              String(
                selectedConversation._id
              )
          );

        if (
          updatedConversation
        ) {
          setSelectedConversation(
            updatedConversation
          );
        }

        scrollToBottom();

        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      } catch (error) {
        console.error(
          "Send message error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            error.response?.data
              ?.error ||
            "Failed to send message."
        );
      } finally {
        setSending(false);
      }
    };

  // =========================================================
  // ENTER TO SEND
  // =========================================================

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendMessage(
        event
      );
    }
  };

  // =========================================================
  // SIDEBAR PEOPLE
  // =========================================================

  const sidebarPeople =
    useMemo(() => {
      const result = [];
      const addedIds = new Set();

      /*
      | Existing conversations first.
      */

      conversations.forEach(
        (conversation) => {
          const person =
            getOtherParticipant(
              conversation
            );

          if (!person) {
            return;
          }

          const id =
            person?._id ||
            person?.id;

          if (!id) {
            return;
          }

          if (
            String(id) ===
            String(currentUserId)
          ) {
            return;
          }

          const key =
            String(id);

          if (
            addedIds.has(key)
          ) {
            return;
          }

          addedIds.add(key);

          result.push({
            type: "conversation",
            user: person,
            conversation,
          });
        }
      );

      /*
      | Followers + following without
      | existing conversations.
      */

      people.forEach(
        (person) => {
          const id =
            person?._id ||
            person?.id;

          if (!id) {
            return;
          }

          if (
            String(id) ===
            String(currentUserId)
          ) {
            return;
          }

          const key =
            String(id);

          if (
            addedIds.has(key)
          ) {
            return;
          }

          addedIds.add(key);

          result.push({
            type: "person",
            user: person,
            conversation: null,
          });
        }
      );

      return result;
    }, [
      conversations,
      people,
      currentUserId,
      getOtherParticipant,
    ]);

  // =========================================================
  // FILTER SIDEBAR
  // =========================================================

  const filteredPeople =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return sidebarPeople;
      }

      return sidebarPeople.filter(
        (item) => {
          const person =
            item?.user || {};

          const name =
            String(
              person?.name ||
                ""
            ).toLowerCase();

          const role =
            String(
              person?.role ||
                ""
            ).toLowerCase();

          const jobRole =
            String(
              person?.jobRole ||
                ""
            ).toLowerCase();

          const company =
            String(
              person?.company ||
                ""
            ).toLowerCase();

          return (
            name.includes(
              value
            ) ||
            role.includes(
              value
            ) ||
            jobRole.includes(
              value
            ) ||
            company.includes(
              value
            )
          );
        }
      );
    }, [
      sidebarPeople,
      search,
    ]);

  // =========================================================
  // SELECTED OTHER USER
  // =========================================================

  const selectedOtherUser =
    useMemo(() => {
      return getOtherParticipant(
        selectedConversation
      );
    }, [
      selectedConversation,
      getOtherParticipant,
    ]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  // =========================================================
  // FORMAT SIDEBAR TIME
  // =========================================================

  const formatSidebarTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    try {
      const dateObject =
        new Date(date);

      const now =
        new Date();

      if (
        dateObject.toDateString() ===
        now.toDateString()
      ) {
        return dateObject.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
      }

      return dateObject.toLocaleDateString(
        [],
        {
          day: "2-digit",
          month: "short",
        }
      );
    } catch {
      return "";
    }
  };

  // =========================================================
  // CHECK MY MESSAGE
  // =========================================================

  const isMyMessage = (
    item
  ) => {
    const senderId =
      item?.sender?._id ||
      item?.sender?.id ||
      item?.sender;

    return (
      String(senderId) ===
      String(currentUserId)
    );
  };

  // =========================================================
  // AVATAR
  // =========================================================

  const Avatar = ({
    user,
    large = false,
    clickable = false,
  }) => {
    const image =
      user?.profileImage ||
      user?.avatar ||
      "";

    const sizeClass =
      large
        ? "h-12 w-12"
        : "h-11 w-11";

    const content = image ? (
      <img
        src={image}
        alt={
          user?.name ||
          "User"
        }
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-slate-200`}
      />
    ) : (
      <div
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500`}
      >
        <User
          size={
            large ? 24 : 20
          }
        />
      </div>
    );

    if (!clickable) {
      return content;
    }

    return (
      <button
        type="button"
        onClick={() =>
          handleOpenProfile(
            user
          )
        }
        className="shrink-0 rounded-full outline-none ring-offset-2 transition hover:scale-105 focus:ring-2 focus:ring-blue-500"
        title="View profile"
      >
        {content}
      </button>
    );
  };

  // =========================================================
  // RENDER MESSAGE ATTACHMENT
  // =========================================================

  const renderAttachment = (
    item,
    mine
  ) => {
    const attachment =
      item?.attachment;

    if (!attachment?.url) {
      return null;
    }

    const url =
      attachment.url;

    const fileName =
      attachment.fileName ||
      "Attachment";

    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    */

    if (
      item.messageType ===
      "image"
    ) {
      return (
        <div className="mb-2 overflow-hidden rounded-xl">
          <img
            src={url}
            alt={fileName}
            className="max-h-[360px] max-w-full cursor-pointer rounded-xl object-contain"
            onClick={() =>
              window.open(
                url,
                "_blank",
                "noopener,noreferrer"
              )
            }
          />
        </div>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VIDEO
    |--------------------------------------------------------------------------
    */

    if (
      item.messageType ===
      "video"
    ) {
      return (
        <div className="mb-2 overflow-hidden rounded-xl">
          <video
            src={url}
            controls
            preload="metadata"
            className="max-h-[360px] max-w-full rounded-xl"
          />
        </div>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | AUDIO
    |--------------------------------------------------------------------------
    */

    if (
      item.messageType ===
      "audio"
    ) {
      return (
        <div className="mb-2">
          <audio
            src={url}
            controls
            className="max-w-full"
          />
        </div>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FILE
    |--------------------------------------------------------------------------
    */

    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`mb-2 flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
          mine
            ? "border-blue-400/40 bg-blue-700/40 text-white hover:bg-blue-700/60"
            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            mine
              ? "bg-white/10"
              : "bg-white"
          }`}
        >
          <FileText
            size={20}
          />
        </div>

        <div className="min-w-0">
          <p className="max-w-[220px] truncate text-sm font-medium">
            {fileName}
          </p>

          <p
            className={`text-xs ${
              mine
                ? "text-blue-100"
                : "text-slate-400"
            }`}
          >
            Open attachment
          </p>
        </div>
      </a>
    );
  };

  // =========================================================
  // SELECTED FILE PREVIEW
  // =========================================================

  const renderSelectedFilePreview =
    () => {
      if (!selectedFile) {
        return null;
      }

      const isImage =
        selectedFile.type.startsWith(
          "image/"
        );

      const isVideo =
        selectedFile.type.startsWith(
          "video/"
        );

      return (
        <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start gap-3">
            {isImage &&
              filePreviewUrl && (
                <img
                  src={filePreviewUrl}
                  alt="Selected"
                  className="h-20 w-20 rounded-xl object-cover"
                />
              )}

            {isVideo &&
              filePreviewUrl && (
                <video
                  src={filePreviewUrl}
                  className="h-20 w-20 rounded-xl object-cover"
                  muted
                  playsInline
                />
              )}

            {!isImage &&
              !isVideo && (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
                  <FileText
                    size={28}
                  />
                </div>
              )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {(
                  selectedFile.size /
                  (1024 * 1024)
                ).toFixed(2)}{" "}
                MB
              </p>

              <p className="mt-1 text-xs text-blue-600">
                {isImage
                  ? "Image"
                  : isVideo
                  ? "Video"
                  : selectedFile.type ||
                    "File"}
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleRemoveFile
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-red-500"
              title="Remove attachment"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      );
    };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex h-screen max-w-7xl overflow-hidden bg-white shadow-sm">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside
          className={`flex w-full shrink-0 flex-col border-r border-slate-200 md:w-[360px] ${
            selectedConversation
              ? "hidden md:flex"
              : "flex"
          }`}
        >
          {/* SIDEBAR HEADER */}

          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    Messages
                  </h1>

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      socketConnected
                        ? "bg-green-500"
                        : "bg-slate-300"
                    }`}
                    title={
                      socketConnected
                        ? "Real-time connected"
                        : "Real-time disconnected"
                    }
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Conversations and people
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MessageCircle
                  size={20}
                />
              </div>
            </div>

            {/* SEARCH */}

            <div className="relative mt-4">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search people..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* SIDEBAR ERROR */}

          {error &&
            !selectedConversation && (
              <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

          {/* PEOPLE */}

          <div className="flex-1 overflow-y-auto">
            {loadingConversations ||
            loadingPeople ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2
                  size={25}
                  className="animate-spin text-blue-600"
                />
              </div>
            ) : filteredPeople.length ===
              0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <MessageCircle
                    size={30}
                  />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-800">
                  No people found
                </h3>

                <p className="mt-2 max-w-[260px] text-sm text-slate-500">
                  Follow or connect
                  with people to
                  start a
                  conversation.
                </p>
              </div>
            ) : (
              filteredPeople.map(
                (item) => {
                  const person =
                    item.user;

                  const conversation =
                    item.conversation;

                  const conversationId =
                    conversation?._id;

                  const isSelected =
                    String(
                      selectedConversation?._id
                    ) ===
                    String(
                      conversationId
                    );

                  const lastMessage =
                    conversation?.lastMessage;

                  return (
                    <div
                      key={
                        person?._id ||
                        person?.id
                      }
                      className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-4 text-left transition ${
                        isSelected
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* AVATAR */}

                      <Avatar
                        user={person}
                        clickable
                      />

                      {/* PERSON */}

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            conversation?._id
                          ) {
                            handleSelectConversation(
                              conversation
                            );
                          } else {
                            handleOpenPerson(
                              person
                            );
                          }
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {person?.name ||
                              "Unknown User"}
                          </h3>

                          {conversation && (
                            <span className="shrink-0 text-[11px] text-slate-400">
                              {formatSidebarTime(
                                conversation.lastMessageAt ||
                                  (typeof lastMessage ===
                                  "object"
                                    ? lastMessage?.createdAt
                                    : null) ||
                                  conversation.updatedAt
                              )}
                            </span>
                          )}
                        </div>

                        <div className="mt-1">
                          {lastMessage ? (
                            <p className="truncate text-sm text-slate-500">
                              {lastMessage?.messageType ===
                              "image"
                                ? "📷 Image"
                                : lastMessage?.messageType ===
                                  "video"
                                ? "🎥 Video"
                                : lastMessage?.messageType ===
                                  "audio"
                                ? "🎵 Audio"
                                : lastMessage?.messageType ===
                                  "file"
                                ? "📎 File"
                                : typeof lastMessage ===
                                    "object" &&
                                  lastMessage?.text
                                ? lastMessage.text
                                : "Message"}
                            </p>
                          ) : (
                            <p className="truncate text-xs text-blue-600">
                              Start a
                              conversation
                            </p>
                          )}
                        </div>

                        {person?.jobRole && (
                          <p className="mt-1 truncate text-[11px] text-slate-400">
                            {person.jobRole}

                            {person?.company
                              ? ` • ${person.company}`
                              : ""}
                          </p>
                        )}
                      </button>
                    </div>
                  );
                }
              )
            )}
          </div>
        </aside>

        {/* =====================================================
            CHAT
        ====================================================== */}

        <main
          className={`flex min-w-0 flex-1 flex-col ${
            selectedConversation
              ? "flex"
              : "hidden md:flex"
          }`}
        >
          {!selectedConversation ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MessageCircle
                  size={38}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Select a person
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Select an existing
                conversation or
                choose a
                follower/following
                user to start a
                new conversation.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  CHAT HEADER
              ================================================== */}

              <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  {/* MOBILE BACK */}

                  <button
                    type="button"
                    onClick={() => {
                      const conversationId =
                        selectedConversation?._id;

                      if (
                        conversationId &&
                        socketRef.current
                          ?.connected
                      ) {
                        socketRef.current.emit(
                          "leave-conversation",
                          String(
                            conversationId
                          )
                        );
                      }

                      setSelectedConversation(
                        null
                      );

                      setMessages([]);

                      setError("");

                      navigate(
                        "/messages"
                      );
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden"
                  >
                    <ArrowLeft
                      size={20}
                    />
                  </button>

                  {/* AVATAR */}

                  <Avatar
                    user={
                      selectedOtherUser
                    }
                    large
                    clickable
                  />

                  {/* USER INFO */}

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenProfile(
                        selectedOtherUser
                      )
                    }
                    className="min-w-0 text-left"
                  >
                    <h2 className="truncate text-base font-semibold text-slate-900 hover:text-blue-600">
                      {selectedOtherUser?.name ||
                        "User"}
                    </h2>

                    <p className="truncate text-xs text-slate-500">
                      {selectedOtherUser?.jobRole ||
                        selectedOtherUser?.role ||
                        "AlumniConnect User"}

                      {selectedOtherUser?.company
                        ? ` • ${selectedOtherUser.company}`
                        : ""}
                    </p>
                  </button>
                </div>

                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                  title="More options"
                >
                  <MoreVertical
                    size={20}
                  />
                </button>
              </header>

              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="mx-4 mt-3 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 md:mx-6">
                  <span>
                    {error}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="shrink-0 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* =================================================
                  MESSAGES
              ================================================== */}

              <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5 md:px-6">
                {loadingConversation ||
                loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2
                        size={28}
                        className="animate-spin text-blue-600"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Loading
                        conversation...
                      </p>
                    </div>
                  </div>
                ) : messages.length ===
                  0 ? (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                      <MessageCircle
                        size={30}
                      />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-slate-800">
                      Start a
                      conversation
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Send your
                      first message
                      to{" "}
                      {selectedOtherUser?.name ||
                        "this user"}
                      .
                    </p>
                  </div>
                ) : (
                  <div className="mx-auto flex max-w-4xl flex-col gap-3">
                    {messages.map(
                      (item) => {
                        const mine =
                          isMyMessage(
                            item
                          );

                        return (
                          <div
                            key={
                              item._id
                            }
                            className={`flex ${
                              mine
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex max-w-[85%] flex-col md:max-w-[65%] ${
                                mine
                                  ? "items-end"
                                  : "items-start"
                              }`}
                            >
                              {/* MESSAGE */}

                              <div
                                className={`rounded-2xl px-3 py-2.5 text-sm leading-6 shadow-sm ${
                                  mine
                                    ? "rounded-br-md bg-blue-600 text-white"
                                    : "rounded-bl-md bg-white text-slate-800"
                                }`}
                              >
                                {renderAttachment(
                                  item,
                                  mine
                                )}

                                {item.text && (
                                  <p className="whitespace-pre-wrap break-words">
                                    {
                                      item.text
                                    }
                                  </p>
                                )}
                              </div>

                              {/* TIME + READ */}

                              <div
                                className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 ${
                                  mine
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <span>
                                  {formatTime(
                                    item.createdAt
                                  )}
                                </span>

                                {mine &&
                                  (item.isRead ? (
                                    <CheckCheck
                                      size={
                                        13
                                      }
                                    />
                                  ) : (
                                    <Check
                                      size={
                                        13
                                      }
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}

                    <div
                      ref={
                        messagesEndRef
                      }
                    />
                  </div>
                )}
              </div>

              {/* =================================================
                  MESSAGE INPUT
              ================================================== */}

              <div className="border-t border-slate-200 bg-white px-3 py-3 md:px-6 md:py-4">
                <form
                  onSubmit={
                    handleSendMessage
                  }
                  className="mx-auto max-w-4xl"
                >
                  {/* FILE PREVIEW */}

                  {renderSelectedFilePreview()}

                  <div className="flex items-end gap-2">
                    {/* FILE INPUT */}

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                      onChange={
                        handleFileSelect
                      }
                      className="hidden"
                    />

                    {/* ATTACHMENT BUTTONS */}

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={
                          handleOpenFilePicker
                        }
                        disabled={
                          sending
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Attach file"
                      >
                        <Paperclip
                          size={19}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleOpenFilePicker
                        }
                        disabled={
                          sending
                        }
                        className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                        title="Add image or video"
                      >
                        <ImageIcon
                          size={19}
                        />
                      </button>
                    </div>

                    {/* TEXT INPUT */}

                    <div className="relative flex-1">
                      <textarea
                        ref={
                          inputRef
                        }
                        value={message}
                        onChange={(
                          event
                        ) =>
                          setMessage(
                            event.target
                              .value
                          )
                        }
                        onKeyDown={
                          handleKeyDown
                        }
                        rows={1}
                        maxLength={5000}
                        placeholder={
                          selectedFile
                            ? "Add a caption..."
                            : "Write a message..."
                        }
                        className="max-h-32 min-h-[42px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />

                      {/* EMOJI */}

                      <button
                        type="button"
                        className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        title="Emoji"
                      >
                        <Smile
                          size={19}
                        />
                      </button>
                    </div>

                    {/* SEND */}

                    <button
                      type="submit"
                      disabled={
                        sending ||
                        (!message.trim() &&
                          !selectedFile)
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Send message"
                    >
                      {sending ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <Send
                          size={19}
                        />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;