import CreatePostModal from "../../components/CreatePostModal";
import { AnimatePresence, motion } from "framer-motion";
import {
  AtSign,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Music,
  Plus,
  Smile,
  Sparkles,
  Trophy,
  Video,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import api from "../api/axios";

const postTypes = [
  {
    id: "post",
    label: "Post",
    icon: Sparkles,
  },
  {
    id: "career",
    label: "Career Advice",
    icon: GraduationCap,
  },
  {
    id: "job",
    label: "Job",
    icon: BriefcaseBusiness,
  },
  {
    id: "achievement",
    label: "Achievement",
    icon: Trophy,
  },
  {
    id: "event",
    label: "Event",
    icon: CalendarDays,
  },
];

const mediaOptions = [
  {
    id: "image",
    label: "Photo",
    icon: ImageIcon,
  },
  {
    id: "video",
    label: "Video",
    icon: Video,
  },
  {
    id: "audio",
    label: "Audio",
    icon: Music,
  },
  {
    id: "document",
    label: "Document",
    icon: FileText,
  },
];

function CreatePostModal({
  isOpen,
  onClose,
  onPost,
}) {
  const [postType, setPostType] =
    useState("post");

  const [content, setContent] =
    useState("");

  const [media, setMedia] =
    useState([]);

  const [link, setLink] =
    useState("");

  const [showLink, setShowLink] =
    useState(false);

  const [showPoll, setShowPoll] =
    useState(false);

  const [pollQuestion, setPollQuestion] =
    useState("");

  const [pollOptions, setPollOptions] =
    useState(["", ""]);

  const [showJob, setShowJob] =
    useState(false);

  const [jobData, setJobData] =
    useState({
      title: "",
      company: "",
      location: "",
      experience: "",
      description: "",
    });

  const [showEvent, setShowEvent] =
    useState(false);

  const [eventData, setEventData] =
    useState({
      title: "",
      date: "",
      location: "",
      description: "",
    });

  const [showEmoji, setShowEmoji] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  // Separate file inputs
  const imageInputRef =
    useRef(null);

  const videoInputRef =
    useRef(null);

  const audioInputRef =
    useRef(null);

  const documentInputRef =
    useRef(null);

  const emojis = [
    "😊",
    "👍",
    "❤️",
    "🎉",
    "🚀",
    "🔥",
    "💡",
    "👏",
  ];

  // =========================================
  // OPEN FILE PICKER
  // =========================================

  const handleMediaClick = (type) => {
    if (isUploading) {
      return;
    }

    if (type === "image") {
      imageInputRef.current?.click();
      return;
    }

    if (type === "video") {
      videoInputRef.current?.click();
      return;
    }

    if (type === "audio") {
      audioInputRef.current?.click();
      return;
    }

    if (type === "document") {
      documentInputRef.current?.click();
    }
  };

  // =========================================
  // FILE SELECTED
  // =========================================

  const handleFileChange = (
    event,
    type
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    const newMedia = files.map(
      (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        type,
        name: file.name,
        url: URL.createObjectURL(file),
      })
    );

    setMedia((previous) => [
      ...previous,
      ...newMedia,
    ]);

    // Allow selecting same file again
    event.target.value = "";
  };

  // =========================================
  // REMOVE MEDIA
  // =========================================

  const removeMedia = (id) => {
    if (isUploading) {
      return;
    }

    setMedia((previous) => {
      const item = previous.find(
        (mediaItem) =>
          mediaItem.id === id
      );

      if (
        item?.url &&
        item.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(item.url);
      }

      return previous.filter(
        (mediaItem) =>
          mediaItem.id !== id
      );
    });
  };

  // =========================================
  // POLL
  // =========================================

  const addPollOption = () => {
    if (pollOptions.length >= 4) {
      return;
    }

    setPollOptions((previous) => [
      ...previous,
      "",
    ]);
  };

  const removePollOption = (index) => {
    if (pollOptions.length <= 2) {
      return;
    }

    setPollOptions((previous) =>
      previous.filter(
        (_, optionIndex) =>
          optionIndex !== index
      )
    );
  };

  const updatePollOption = (
    index,
    value
  ) => {
    setPollOptions((previous) =>
      previous.map(
        (option, optionIndex) =>
          optionIndex === index
            ? value
            : option
      )
    );
  };

  // =========================================
  // JOB
  // =========================================

  const updateJob = (
    field,
    value
  ) => {
    setJobData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================
  // EVENT
  // =========================================

  const updateEvent = (
    field,
    value
  ) => {
    setEventData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================
  // EMOJI
  // =========================================

  const insertEmoji = (emoji) => {
    setContent(
      (previous) =>
        `${previous}${emoji}`
    );

    setShowEmoji(false);
  };

  // =========================================
  // UPLOAD FILE TO CLOUDINARY
  // =========================================

  const uploadMediaToCloudinary =
    async (item) => {
      const formData =
        new FormData();

      formData.append(
        "file",
        item.file
      );

      // Do NOT manually set Content-Type.
      // Axios/browser will add the multipart boundary.
      const response = await api.post(
        "/uploads/media",
        formData
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Media upload failed."
        );
      }

      const uploadedFile =
        response.data?.data;

      if (!uploadedFile?.url) {
        throw new Error(
          "Cloudinary did not return a file URL."
        );
      }

      return {
        type: item.type,
        name:
          uploadedFile.originalName ||
          item.name,
        url: uploadedFile.url,
      };
    };

  // =========================================
  // RESET FORM
  // =========================================

  const resetForm = () => {
    media.forEach((item) => {
      if (
        item.url &&
        item.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(item.url);
      }
    });

    setPostType("post");

    setContent("");

    setMedia([]);

    setLink("");

    setShowLink(false);

    setShowPoll(false);

    setPollQuestion("");

    setPollOptions([
      "",
      "",
    ]);

    setShowJob(false);

    setShowEvent(false);

    setShowEmoji(false);

    setIsUploading(false);

    setJobData({
      title: "",
      company: "",
      location: "",
      experience: "",
      description: "",
    });

    setEventData({
      title: "",
      date: "",
      location: "",
      description: "",
    });

    // Clear file inputs
    if (imageInputRef.current) {
      imageInputRef.current.value =
        "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value =
        "";
    }

    if (audioInputRef.current) {
      audioInputRef.current.value =
        "";
    }

    if (documentInputRef.current) {
      documentInputRef.current.value =
        "";
    }
  };

  // =========================================
  // CLOSE MODAL
  // =========================================

  const handleClose = () => {
    if (isUploading) {
      return;
    }

    resetForm();

    onClose();
  };

  // =========================================
  // SUBMIT POST
  // =========================================

  const handleSubmit = async () => {
    if (isUploading) {
      return;
    }

    const hasContent =
      content.trim() ||
      media.length > 0 ||
      link.trim() ||
      pollQuestion.trim() ||
      jobData.title.trim() ||
      eventData.title.trim();

    if (!hasContent) {
      return;
    }

    try {
      setIsUploading(true);

      // ---------------------------------------
      // UPLOAD ALL MEDIA
      // ---------------------------------------

      let uploadedMedia = [];

      if (media.length > 0) {
        uploadedMedia =
          await Promise.all(
            media.map((item) =>
              uploadMediaToCloudinary(
                item
              )
            )
          );
      }

      // ---------------------------------------
      // CREATE POST OBJECT
      // ---------------------------------------

      const newPost = {
        id: Date.now(),

        author: {
          name: "Your Name",
          role: "Student",
          company:
            "AlumniConnect",
        },

        type: postType,

        content:
          content.trim(),

        media: uploadedMedia,

        link:
          link.trim() || null,

        poll: showPoll
          ? {
              question:
                pollQuestion.trim(),

              options:
                pollOptions
                  .map((option) =>
                    option.trim()
                  )
                  .filter(Boolean),
            }
          : null,

        job: showJob
          ? {
              title:
                jobData.title.trim(),

              company:
                jobData.company.trim(),

              location:
                jobData.location.trim(),

              experience:
                jobData.experience.trim(),

              description:
                jobData.description.trim(),
            }
          : null,

        event: showEvent
          ? {
              title:
                eventData.title.trim(),

              date:
                eventData.date,

              location:
                eventData.location.trim(),

              description:
                eventData.description.trim(),
            }
          : null,

        hashtags: [],

        mentions: [],

        likes: 0,

        comments: 0,

        shares: 0,

        createdAt:
          new Date().toISOString(),
      };

      console.log(
        "POST DATA:",
        newPost
      );

      // ---------------------------------------
      // SEND TO PARENT
      // ---------------------------------------

      if (onPost) {
        await onPost(newPost);
      }

      handleClose();
    } catch (error) {
      console.error(
        "Create post error:",
        error
      );

      const errorMessage =
        error.response?.data
          ?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to upload media. Please try again.";

      alert(errorMessage);

      setIsUploading(false);
    }
  };

  // =========================================
  // POST BUTTON STATE
  // =========================================

  const isPostDisabled =
    isUploading ||
    (!content.trim() &&
      media.length === 0 &&
      !link.trim() &&
      !pollQuestion.trim() &&
      !jobData.title.trim() &&
      !eventData.title.trim());

  // =========================================
  // UI
  // =========================================

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 40,
              scale: 0.98,
            }}
            transition={{
              duration: 0.25,
            }}
            className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Create a post
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Share knowledge,
                  opportunities and
                  achievements
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={
                  isUploading
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* ================================= */}
            {/* BODY */}
            {/* ================================= */}

            <div className="overflow-y-auto p-5 sm:p-6">

              {/* USER */}

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white">
                  YK
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Your Name
                  </p>

                  <p className="text-xs text-slate-500">
                    Student ·
                    AlumniConnect
                  </p>
                </div>
              </div>

              {/* ================================= */}
              {/* POST TYPE */}
              {/* ================================= */}

              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Post type
                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {postTypes.map(
                    (type) => {
                      const Icon =
                        type.icon;

                      const active =
                        postType ===
                        type.id;

                      return (
                        <button
                          key={
                            type.id
                          }
                          type="button"
                          disabled={
                            isUploading
                          }
                          onClick={() =>
                            setPostType(
                              type.id
                            )
                          }
                          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${
                            active
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <Icon
                            size={16}
                          />

                          {type.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* ================================= */}
              {/* CONTENT */}
              {/* ================================= */}

              <div className="relative mt-5">
                <textarea
                  value={content}
                  onChange={(event) =>
                    setContent(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isUploading
                  }
                  placeholder={
                    postType ===
                    "job"
                      ? "Share the job opportunity and requirements..."
                      : postType ===
                          "career"
                        ? "Share your career advice..."
                        : postType ===
                            "achievement"
                          ? "Share your achievement..."
                          : postType ===
                              "event"
                            ? "Tell the community about your event..."
                            : "What would you like to share?"
                  }
                  rows={6}
                  maxLength={5000}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 pb-12 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                />

                <div className="absolute bottom-3 left-3 flex gap-1">
                  <button
                    type="button"
                    disabled={
                      isUploading
                    }
                    onClick={() =>
                      setShowEmoji(
                        (previous) =>
                          !previous
                      )
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-indigo-600 disabled:opacity-50"
                  >
                    <Smile size={18} />
                  </button>

                  <button
                    type="button"
                    disabled={
                      isUploading
                    }
                    onClick={() =>
                      setContent(
                        (previous) =>
                          `${previous}@`
                      )
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-indigo-600 disabled:opacity-50"
                  >
                    <AtSign
                      size={18}
                    />
                  </button>
                </div>

                <div className="absolute bottom-3 right-4 text-xs text-slate-400">
                  {content.length}/5000
                </div>

                {showEmoji && (
                  <div className="absolute bottom-12 left-0 z-20 flex gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {emojis.map(
                      (emoji) => (
                        <button
                          key={
                            emoji
                          }
                          type="button"
                          onClick={() =>
                            insertEmoji(
                              emoji
                            )
                          }
                          className="rounded-lg p-2 text-lg transition hover:bg-slate-100"
                        >
                          {emoji}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* ================================= */}
              {/* MEDIA TOOLBAR */}
              {/* ================================= */}

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Add to your post
                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {mediaOptions.map(
                    (option) => {
                      const Icon =
                        option.icon;

                      return (
                        <button
                          key={
                            option.id
                          }
                          type="button"
                          disabled={
                            isUploading
                          }
                          onClick={() =>
                            handleMediaClick(
                              option.id
                            )
                          }
                          className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon
                            size={19}
                          />

                          {option.label}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* ================================= */}
                {/* HIDDEN FILE INPUTS */}
                {/* ================================= */}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    handleFileChange(
                      event,
                      "image"
                    )
                  }
                />

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    handleFileChange(
                      event,
                      "video"
                    )
                  }
                />

                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    handleFileChange(
                      event,
                      "audio"
                    )
                  }
                />

                <input
                  ref={
                    documentInputRef
                  }
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    handleFileChange(
                      event,
                      "document"
                    )
                  }
                />

                {/* LINK */}

                <button
                  type="button"
                  disabled={
                    isUploading
                  }
                  onClick={() =>
                    setShowLink(
                      (previous) =>
                        !previous
                    )
                  }
                  className="mt-2 mr-2 inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50"
                >
                  <LinkIcon
                    size={19}
                  />

                  Link
                </button>

                {/* POLL */}

                <button
                  type="button"
                  disabled={
                    isUploading
                  }
                  onClick={() =>
                    setShowPoll(
                      (previous) =>
                        !previous
                    )
                  }
                  className="mt-2 mr-2 inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50"
                >
                  <BarChart3
                    size={19}
                  />

                  Poll
                </button>

                {/* JOB */}

                <button
                  type="button"
                  disabled={
                    isUploading
                  }
                  onClick={() => {
                    setPostType("job");
                    setShowJob(true);
                  }}
                  className="mt-2 mr-2 inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50"
                >
                  <BriefcaseBusiness
                    size={19}
                  />

                  Job
                </button>

                {/* EVENT */}

                <button
                  type="button"
                  disabled={
                    isUploading
                  }
                  onClick={() => {
                    setPostType(
                      "event"
                    );
                    setShowEvent(true);
                  }}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50"
                >
                  <CalendarDays
                    size={19}
                  />

                  Event
                </button>
              </div>

              {/* ================================= */}
              {/* MEDIA PREVIEW */}
              {/* ================================= */}

              {media.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">
                      Attachments
                    </p>

                    <p className="text-xs text-slate-400">
                      {media.length}{" "}
                      file
                      {media.length >
                      1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {media.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                        >
                          {/* IMAGE */}

                          {item.type ===
                            "image" && (
                            <img
                              src={
                                item.url
                              }
                              alt={
                                item.name
                              }
                              className="h-52 w-full object-cover"
                            />
                          )}

                          {/* VIDEO */}

                          {item.type ===
                            "video" && (
                            <video
                              src={
                                item.url
                              }
                              controls
                              className="h-52 w-full object-cover"
                            />
                          )}

                          {/* AUDIO */}

                          {item.type ===
                            "audio" && (
                            <div className="flex h-32 items-center justify-center p-4">
                              <audio
                                src={
                                  item.url
                                }
                                controls
                                className="w-full"
                              />
                            </div>
                          )}

                          {/* DOCUMENT */}

                          {item.type ===
                            "document" && (
                            <div className="flex h-32 items-center gap-3 p-5">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <FileText
                                  size={
                                    24
                                  }
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-800">
                                  {
                                    item.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Document
                                  attachment
                                </p>
                              </div>
                            </div>
                          )}

                          {/* REMOVE */}

                          <button
                            type="button"
                            disabled={
                              isUploading
                            }
                            onClick={() =>
                              removeMedia(
                                item.id
                              )
                            }
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X
                              size={15}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ================================= */}
              {/* LINK */}
              {/* ================================= */}

              {showLink && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <LinkIcon
                      size={17}
                      className="text-indigo-600"
                    />

                    <p className="text-sm font-bold text-slate-800">
                      Add a link
                    </p>
                  </div>

                  <input
                    type="url"
                    value={link}
                    onChange={(event) =>
                      setLink(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      isUploading
                    }
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              )}

              {/* ================================= */}
              {/* POLL */}
              {/* ================================= */}

              {showPoll && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BarChart3
                      size={18}
                      className="text-indigo-600"
                    />

                    <p className="text-sm font-bold text-slate-800">
                      Create a poll
                    </p>
                  </div>

                  <input
                    type="text"
                    value={
                      pollQuestion
                    }
                    onChange={(event) =>
                      setPollQuestion(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      isUploading
                    }
                    placeholder="Ask your community a question..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />

                  <div className="mt-3 space-y-2">
                    {pollOptions.map(
                      (
                        option,
                        index
                      ) => (
                        <div
                          key={
                            index
                          }
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={
                              option
                            }
                            onChange={(
                              event
                            ) =>
                              updatePollOption(
                                index,
                                event
                                  .target
                                  .value
                              )
                            }
                            disabled={
                              isUploading
                            }
                            placeholder={`Option ${
                              index +
                              1
                            }`}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                          />

                          {pollOptions.length >
                            2 && (
                            <button
                              type="button"
                              disabled={
                                isUploading
                              }
                              onClick={() =>
                                removePollOption(
                                  index
                                )
                              }
                              className="rounded-xl px-3 text-slate-400 hover:bg-white hover:text-red-500"
                            >
                              <X
                                size={
                                  17
                                }
                              />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {pollOptions.length <
                    4 && (
                    <button
                      type="button"
                      disabled={
                        isUploading
                      }
                      onClick={
                        addPollOption
                      }
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
                    >
                      <Plus
                        size={16}
                      />

                      Add option
                    </button>
                  )}
                </div>
              )}

              {/* ================================= */}
              {/* JOB */}
              {/* ================================= */}

              {showJob && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <BriefcaseBusiness
                      size={18}
                      className="text-indigo-600"
                    />

                    <p className="text-sm font-bold text-slate-800">
                      Job opportunity
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={
                        jobData.title
                      }
                      onChange={(event) =>
                        updateJob(
                          "title",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      placeholder="Job title"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    />

                    <input
                      value={
                        jobData.company
                      }
                      onChange={(event) =>
                        updateJob(
                          "company",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      placeholder="Company"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    />

                    <input
                      value={
                        jobData.location
                      }
                      onChange={(event) =>
                        updateJob(
                          "location",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      placeholder="Location"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    />

                    <input
                      value={
                        jobData.experience
                      }
                      onChange={(event) =>
                        updateJob(
                          "experience",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      placeholder="Experience e.g. Fresher"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    />

                    <textarea
                      value={
                        jobData.description
                      }
                      onChange={(event) =>
                        updateJob(
                          "description",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      placeholder="Job description and requirements..."
                      rows={4}
                      className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 sm:col-span-2"
                    />
                  </div>
                </div>
              )}

              {/* ================================= */}
              {/* EVENT */}
              {/* ================================= */}

              {showEvent && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays
                      size={18}
                      className="text-indigo-600"
                    />

                    <p className="text-sm font-bold text-slate-800">
                      Create an event
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={
                        eventData.title
                      }
                      onChange={(event) =>
                        updateEvent(
                          "title",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      placeholder="Event title"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    />

                    <input
                      type="date"
                      value={
                        eventData.date
                      }
                      onChange={(event) =>
                        updateEvent(
                          "date",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                    />

                    <input
                      value={
                        eventData.location
                      }
                      onChange={(event) =>
                        updateEvent(
                          "location",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      placeholder="Location / Online"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 sm:col-span-2"
                    />

                    <textarea
                      value={
                        eventData.description
                      }
                      onChange={(event) =>
                        updateEvent(
                          "description",
                          event.target
                            .value
                        )
                      }
                      disabled={
                        isUploading
                      }
                      placeholder="Event description..."
                      rows={4}
                      className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 sm:col-span-2"
                    />
                  </div>
                </div>
              )}

              {/* ================================= */}
              {/* TIP */}
              {/* ================================= */}

              <div className="mt-4 flex gap-3 rounded-2xl bg-indigo-50 p-4">
                <Sparkles
                  size={18}
                  className="mt-0.5 shrink-0 text-indigo-600"
                />

                <p className="text-xs leading-5 text-indigo-700">
                  Share useful career
                  knowledge,
                  opportunities,
                  achievements,
                  events, media or
                  experiences that
                  can help the
                  AlumniConnect
                  community.
                </p>
              </div>
            </div>

            {/* ================================= */}
            {/* FOOTER */}
            {/* ================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={handleClose}
                disabled={
                  isUploading
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={
                  isPostDisabled
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Uploading...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreatePostModal;