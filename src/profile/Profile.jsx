import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  BriefcaseBusiness,
  Pencil,
  X,
  Check,
  Globe,
  User,
  Save,
  Loader2,
  Camera,
  ZoomIn,
  ZoomOut,
  FileText,
  Music,
  Heart,
  MessageCircle,
  Bookmark,
  ExternalLink,
  MoreHorizontal,
  Play,
  Share2,
  Send,
} from "lucide-react";

import api from "../api/axios";

const Profile = () => {
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [uploadingProfileImage, setUploadingProfileImage] =
    useState(false);

  const [uploadingCoverImage, setUploadingCoverImage] =
    useState(false);

  const [error, setError] = useState("");
  const [postsError, setPostsError] = useState("");

  const [activeSection, setActiveSection] = useState("about");

  const [showEditModal, setShowEditModal] = useState(false);

  // Photo adjustment
  const [showPhotoAdjust, setShowPhotoAdjust] = useState(false);
  const [photoType, setPhotoType] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoX, setPhotoX] = useState(50);
  const [photoY, setPhotoY] = useState(50);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    location: "",
    department: "",
    graduationYear: "",
    college: "",
    company: "",
    jobRole: "",
    skills: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  /*
  |--------------------------------------------------------------------------
  | POST INTERACTION STATES
  |--------------------------------------------------------------------------
  */

  const [commentPost, setCommentPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROFILE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchProfile();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER POSTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (user?._id) {
      fetchUserPosts(user._id);
    }
  }, [user?._id]);

  /*
  |--------------------------------------------------------------------------
  | GET PROFILE
  |--------------------------------------------------------------------------
  */

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/me");

      const profile =
        response.data?.user ||
        response.data?.data?.user ||
        response.data;

      setUser(profile);

      setFormData({
        name: profile?.name || "",
        bio: profile?.bio || "",
        phone: profile?.phone || "",
        location: profile?.location || "",
        department: profile?.department || "",
        graduationYear: profile?.graduationYear || "",
        college: profile?.college || "",
        company: profile?.company || "",
        jobRole: profile?.jobRole || "",
        skills: Array.isArray(profile?.skills)
          ? profile.skills.join(", ")
          : "",
        linkedin: profile?.linkedin || "",
        github: profile?.github || "",
        portfolio: profile?.portfolio || "",
      });

      localStorage.setItem(
        "user",
        JSON.stringify(profile)
      );
    } catch (err) {
      console.error("Get profile error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | GET USER POSTS
  |--------------------------------------------------------------------------
  */

  const fetchUserPosts = async (userId) => {
    try {
      setPostsLoading(true);
      setPostsError("");

      const response = await api.get(
        `/posts/user/${userId}`
      );

      const userPosts =
        response.data?.posts ||
        response.data?.data?.posts ||
        response.data?.data ||
        [];

      setPosts(
        Array.isArray(userPosts)
          ? userPosts
          : []
      );
    } catch (err) {
      console.error(
        "Get user posts error:",
        err
      );

      setPostsError(
        err?.response?.data?.message ||
          "Failed to load posts."
      );
    } finally {
      setPostsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | GET CURRENT USER ID
  |--------------------------------------------------------------------------
  */

  const getCurrentUserId = () => {
    return (
      user?._id ||
      user?.id ||
      JSON.parse(
        localStorage.getItem("user") || "null"
      )?._id ||
      JSON.parse(
        localStorage.getItem("user") || "null"
      )?.id ||
      null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CHECK LIKE
  |--------------------------------------------------------------------------
  */

  const isPostLiked = (post) => {
    const currentUserId =
      getCurrentUserId();

    if (!currentUserId) {
      return false;
    }

    if (!Array.isArray(post?.likes)) {
      return false;
    }

    return post.likes.some((like) => {
      const likeId =
        typeof like === "object"
          ? like?._id || like?.id
          : like;

      return (
        String(likeId) ===
        String(currentUserId)
      );
    });
  };

  /*
  |--------------------------------------------------------------------------
  | CHECK SAVE
  |--------------------------------------------------------------------------
  */

  const isPostSaved = (post) => {
    const currentUserId =
      getCurrentUserId();

    if (!currentUserId) {
      return false;
    }

    if (!Array.isArray(post?.savedBy)) {
      return false;
    }

    return post.savedBy.some((saved) => {
      const savedId =
        typeof saved === "object"
          ? saved?._id || saved?.id
          : saved;

      return (
        String(savedId) ===
        String(currentUserId)
      );
    });
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE SINGLE POST
  |--------------------------------------------------------------------------
  */

  const updatePostInState = (
    postId,
    updatedPost
  ) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        String(post._id) ===
        String(postId)
          ? {
              ...post,
              ...updatedPost,
            }
          : post
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LIKE / UNLIKE POST
  |--------------------------------------------------------------------------
  */

  const handleLikePost = async (post) => {
    if (!post?._id) return;

    try {
      const liked = isPostLiked(post);

      if (liked) {
        await api.delete(
          `/posts/${post._id}/like`
        );

        setPosts((prevPosts) =>
          prevPosts.map((item) => {
            if (
              String(item._id) !==
              String(post._id)
            ) {
              return item;
            }

            const currentUserId =
              getCurrentUserId();

            const updatedLikes =
              Array.isArray(item.likes)
                ? item.likes.filter(
                    (like) => {
                      const likeId =
                        typeof like ===
                        "object"
                          ? like?._id ||
                            like?.id
                          : like;

                      return (
                        String(likeId) !==
                        String(
                          currentUserId
                        )
                      );
                    }
                  )
                : [];

            return {
              ...item,
              likes: updatedLikes,
            };
          })
        );
      } else {
        const response = await api.post(
          `/posts/${post._id}/like`
        );

        const responsePost =
          response.data?.post ||
          response.data?.data?.post ||
          null;

        if (responsePost) {
          updatePostInState(
            post._id,
            responsePost
          );
        } else {
          const currentUserId =
            getCurrentUserId();

          setPosts((prevPosts) =>
            prevPosts.map((item) => {
              if (
                String(item._id) !==
                String(post._id)
              ) {
                return item;
              }

              const currentLikes =
                Array.isArray(item.likes)
                  ? item.likes
                  : [];

              const alreadyLiked =
                currentLikes.some(
                  (like) => {
                    const likeId =
                      typeof like ===
                      "object"
                        ? like?._id ||
                          like?.id
                        : like;

                    return (
                      String(likeId) ===
                      String(
                        currentUserId
                      )
                    );
                  }
                );

              if (alreadyLiked) {
                return item;
              }

              return {
                ...item,
                likes: [
                  ...currentLikes,
                  currentUserId,
                ],
              };
            })
          );
        }
      }
    } catch (err) {
      console.error(
        "Like post error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to update like."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE / UNSAVE POST
  |--------------------------------------------------------------------------
  */

  const handleSavePost = async (post) => {
    if (!post?._id) return;

    try {
      const saved = isPostSaved(post);

      if (saved) {
        await api.delete(
          `/posts/${post._id}/save`
        );

        const currentUserId =
          getCurrentUserId();

        setPosts((prevPosts) =>
          prevPosts.map((item) => {
            if (
              String(item._id) !==
              String(post._id)
            ) {
              return item;
            }

            const updatedSavedBy =
              Array.isArray(item.savedBy)
                ? item.savedBy.filter(
                    (savedUser) => {
                      const savedId =
                        typeof savedUser ===
                        "object"
                          ? savedUser?._id ||
                            savedUser?.id
                          : savedUser;

                      return (
                        String(savedId) !==
                        String(
                          currentUserId
                        )
                      );
                    }
                  )
                : [];

            return {
              ...item,
              savedBy: updatedSavedBy,
            };
          })
        );
      } else {
        const response = await api.post(
          `/posts/${post._id}/save`
        );

        const responsePost =
          response.data?.post ||
          response.data?.data?.post ||
          null;

        if (responsePost) {
          updatePostInState(
            post._id,
            responsePost
          );
        } else {
          const currentUserId =
            getCurrentUserId();

          setPosts((prevPosts) =>
            prevPosts.map((item) => {
              if (
                String(item._id) !==
                String(post._id)
              ) {
                return item;
              }

              const currentSavedBy =
                Array.isArray(
                  item.savedBy
                )
                  ? item.savedBy
                  : [];

              const alreadySaved =
                currentSavedBy.some(
                  (savedUser) => {
                    const savedId =
                      typeof savedUser ===
                      "object"
                        ? savedUser?._id ||
                          savedUser?.id
                        : savedUser;

                    return (
                      String(savedId) ===
                      String(
                        currentUserId
                      )
                    );
                  }
                );

              if (alreadySaved) {
                return item;
              }

              return {
                ...item,
                savedBy: [
                  ...currentSavedBy,
                  currentUserId,
                ],
              };
            })
          );
        }
      }
    } catch (err) {
      console.error(
        "Save post error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to update saved post."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SHARE POST
  |--------------------------------------------------------------------------
  */

  const handleSharePost = async (post) => {
    if (!post?._id) return;

    const shareUrl = `${window.location.origin}/community?post=${post._id}`;

    const shareData = {
      title: `${user?.name || "AlumniConnect"}'s post`,
      text:
        post?.content ||
        "Check out this post on AlumniConnect.",
      url: shareUrl,
    };

    try {
      if (
        navigator.share &&
        typeof navigator.share ===
          "function"
      ) {
        await navigator.share(
          shareData
        );
      } else if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setError(
          "Post link copied to clipboard."
        );

        setTimeout(() => {
          setError("");
        }, 2500);
      } else {
        window.prompt(
          "Copy this post link:",
          shareUrl
        );
      }

      setPosts((prevPosts) =>
        prevPosts.map((item) => {
          if (
            String(item._id) !==
            String(post._id)
          ) {
            return item;
          }

          return {
            ...item,
            shares:
              Number(item.shares || 0) +
              1,
          };
        })
      );
    } catch (err) {
      if (
        err?.name !==
        "AbortError"
      ) {
        console.error(
          "Share post error:",
          err
        );
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN COMMENTS
  |--------------------------------------------------------------------------
  */

  const handleOpenComments = async (
    post
  ) => {
    if (!post?._id) return;

    setCommentPost(post);
    setCommentText("");
    setComments([]);
    setCommentsLoading(true);

    try {
      const response = await api.get(
        `/comments/post/${post._id}`
      );

      const loadedComments =
        response.data?.comments ||
        response.data?.data?.comments ||
        response.data?.data ||
        [];

      setComments(
        Array.isArray(
          loadedComments
        )
          ? loadedComments
          : []
      );
    } catch (err) {
      console.error(
        "Get comments error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load comments."
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT COMMENT
  |--------------------------------------------------------------------------
  */

  const handleSubmitComment = async () => {
    if (
      !commentPost?._id ||
      !commentText.trim()
    ) {
      return;
    }

    try {
      setCommentSubmitting(true);

      const response = await api.post(
        `/comments/post/${commentPost._id}`,
        {
          content:
            commentText.trim(),
        }
      );

      const newComment =
        response.data?.comment ||
        response.data?.data?.comment ||
        response.data?.data ||
        null;

      if (newComment) {
        setComments((prev) => [
          ...prev,
          newComment,
        ]);
      } else {
        const commentsResponse =
          await api.get(
            `/comments/post/${commentPost._id}`
          );

        const updatedComments =
          commentsResponse.data?.comments ||
          commentsResponse.data?.data?.comments ||
          commentsResponse.data?.data ||
          [];

        setComments(
          Array.isArray(
            updatedComments
          )
            ? updatedComments
            : []
        );
      }

      setCommentText("");

      setPosts((prevPosts) =>
        prevPosts.map((item) => {
          if (
            String(item._id) !==
            String(commentPost._id)
          ) {
            return item;
          }

          return {
            ...item,
            comments:
              Number(item.comments || 0) +
              1,
          };
        })
      );

      setCommentPost((prev) =>
        prev
          ? {
              ...prev,
              comments:
                Number(
                  prev.comments || 0
                ) + 1,
            }
          : prev
      );
    } catch (err) {
      console.error(
        "Create comment error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE COMMENTS
  |--------------------------------------------------------------------------
  */

  const handleCloseComments = () => {
    setCommentPost(null);
    setComments([]);
    setCommentText("");
  };

  /*
  |--------------------------------------------------------------------------
  | SECTION NAVIGATION
  |--------------------------------------------------------------------------
  */

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);

    const element =
      document.getElementById(sectionId);

    if (!element) return;

    const navbarOffset = 95;

    const elementPosition =
      element.getBoundingClientRect().top +
      window.scrollY;

    window.scrollTo({
      top: elementPosition - navbarOffset,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const skills = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        department: formData.department,
        graduationYear:
          formData.graduationYear === ""
            ? null
            : Number(formData.graduationYear),
        college: formData.college,
        company: formData.company,
        jobRole: formData.jobRole,
        skills,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,
      };

      const response = await api.put(
        "/users/me",
        payload
      );

      const updatedUser =
        response.data?.user ||
        response.data?.data?.user ||
        response.data;

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setShowEditModal(false);
    } catch (err) {
      console.error(
        "Update profile error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PHOTO ADJUSTMENT
  |--------------------------------------------------------------------------
  */

  const openPhotoAdjust = (type, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    const maxSize =
      type === "profile"
        ? 5 * 1024 * 1024
        : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        type === "profile"
          ? "Profile image must be less than 5 MB."
          : "Cover image must be less than 10 MB."
      );
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPhotoType(type);
    setPhotoFile(file);
    setPhotoPreview(previewUrl);

    setPhotoZoom(1);
    setPhotoX(50);
    setPhotoY(50);

    setError("");
    setShowPhotoAdjust(true);
  };

  const handleProfileImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    openPhotoAdjust("profile", file);

    e.target.value = "";
  };

  const handleCoverImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    openPhotoAdjust("cover", file);

    e.target.value = "";
  };

  const closePhotoAdjust = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setShowPhotoAdjust(false);
    setPhotoType(null);
    setPhotoFile(null);
    setPhotoPreview("");

    setPhotoZoom(1);
    setPhotoX(50);
    setPhotoY(50);
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE ADJUSTED IMAGE
  |--------------------------------------------------------------------------
  */

  const createAdjustedImage = async () => {
    if (!photoFile || !photoPreview) {
      return null;
    }

    const image = new Image();

    image.src = photoPreview;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const outputWidth =
      photoType === "cover"
        ? 1600
        : 800;

    const outputHeight =
      photoType === "cover"
        ? 500
        : 800;

    const canvas =
      document.createElement("canvas");

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Unable to create image editor."
      );
    }

    const containerRatio =
      outputWidth / outputHeight;

    const imageRatio =
      image.width / image.height;

    let drawWidth;
    let drawHeight;

    if (imageRatio > containerRatio) {
      drawHeight = outputHeight;
      drawWidth =
        drawHeight * imageRatio;
    } else {
      drawWidth = outputWidth;
      drawHeight =
        drawWidth / imageRatio;
    }

    drawWidth *= photoZoom;
    drawHeight *= photoZoom;

    const maxX = Math.max(
      0,
      drawWidth - outputWidth
    );

    const maxY = Math.max(
      0,
      drawHeight - outputHeight
    );

    const drawX =
      -(maxX * (photoX / 100));

    const drawY =
      -(maxY * (photoY / 100));

    ctx.drawImage(
      image,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );

    return new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Unable to process image."
                )
              );
              return;
            }

            const fileName =
              photoType === "cover"
                ? "cover-image.jpg"
                : "profile-image.jpg";

            const adjustedFile =
              new File(
                [blob],
                fileName,
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );

            resolve(adjustedFile);
          },
          "image/jpeg",
          0.92
        );
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE / COVER PHOTO
  |--------------------------------------------------------------------------
  */

  const handleSaveAdjustedPhoto = async () => {
    try {
      if (!photoFile) return;

      if (photoType === "profile") {
        setUploadingProfileImage(true);
      } else {
        setUploadingCoverImage(true);
      }

      setError("");

      const adjustedFile =
        await createAdjustedImage();

      if (!adjustedFile) {
        throw new Error(
          "Unable to process the image."
        );
      }

      const uploadData = new FormData();

      uploadData.append(
        "file",
        adjustedFile
      );

      let response;

      if (photoType === "profile") {
        response = await api.post(
          "/users/me/profile-image",
          uploadData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      } else {
        response = await api.post(
          "/users/me/cover-image",
          uploadData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      const updatedUser =
        response.data?.user ||
        response.data?.data?.user ||
        response.data;

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      closePhotoAdjust();
    } catch (err) {
      console.error(
        "Photo upload error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload image."
      );
    } finally {
      setUploadingProfileImage(false);
      setUploadingCoverImage(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const getProfileImage = () => {
    return user?.profileImage || "";
  };

  const getCoverImage = () => {
    return user?.coverImage || "";
  };

  const getInitials = (name = "") => {
    return (
      name
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
          (word) => word[0]?.toUpperCase()
        )
        .join("") || "U"
    );
  };

  const getPostTypeLabel = (type) => {
    const labels = {
      post: "Post",
      career: "Career Advice",
      job: "Job Opportunity",
      achievement: "Achievement",
      event: "Event",
      poll: "Poll",
    };

    return labels[type] || "Post";
  };

  const formatPostDate = (date) => {
    if (!date) return "";

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            size={24}
            className="animate-spin"
          />
          <span>
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-3"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ============================================================
            PROFILE HEADER
        ============================================================ */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* COVER */}

          <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden">

            {getCoverImage() ? (
              <img
                src={getCoverImage()}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700" />
            )}

            <div className="absolute inset-0 bg-black/10" />

            <button
              onClick={() =>
                coverInputRef.current?.click()
              }
              className="absolute top-4 right-4 bg-white/95 hover:bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-medium shadow-md flex items-center gap-2 transition"
            >
              <Camera size={17} />

              <span className="hidden sm:inline">
                Edit background
              </span>
            </button>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={
                handleCoverImageSelect
              }
            />
          </div>

          {/* PROFILE CONTENT */}

          <div className="relative px-5 sm:px-8 pb-7">

            <div className="relative -mt-20 sm:-mt-24 w-32 h-32 sm:w-40 sm:h-40">

              {getProfileImage() ? (
                <img
                  src={getProfileImage()}
                  alt={
                    user?.name ||
                    "Profile"
                  }
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg bg-white"
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                  <User
                    size={60}
                    className="text-gray-400"
                  />
                </div>
              )}

              <button
                onClick={() =>
                  profileInputRef.current?.click()
                }
                className="absolute right-1 bottom-1 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg border-4 border-white transition"
                title="Change profile photo"
              >
                <Camera size={17} />
              </button>

              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={
                  handleProfileImageSelect
                }
              />
            </div>

            <div className="mt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-5">

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user?.name ||
                    "Your Name"}
                </h1>

                {user?.jobRole && (
                  <p className="mt-1 text-gray-600 text-base">
                    {user.jobRole}

                    {user?.company
                      ? ` at ${user.company}`
                      : ""}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">

                  {user?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={15} />
                      {user.location}
                    </div>
                  )}

                  {user?.college && (
                    <div className="flex items-center gap-1">
                      <GraduationCap
                        size={15}
                      />
                      {user.college}
                    </div>
                  )}

                </div>
              </div>

              <button
                onClick={() =>
                  setShowEditModal(true)
                }
                className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition"
              >
                <Pencil size={17} />
                Edit Profile
              </button>

            </div>
          </div>
        </div>

        {/* ============================================================
            PROFILE NAVBAR
        ============================================================ */}

        <div className="sticky top-16 z-30 mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">

          <div className="flex min-w-max">

            <ProfileNavItem
              label="About"
              active={
                activeSection === "about"
              }
              onClick={() =>
                scrollToSection("about")
              }
            />

            <ProfileNavItem
              label={`Posts${
                posts.length
                  ? ` (${posts.length})`
                  : ""
              }`}
              active={
                activeSection === "posts"
              }
              onClick={() =>
                scrollToSection("posts")
              }
            />

            <ProfileNavItem
              label="Experience"
              active={
                activeSection ===
                "experience"
              }
              onClick={() =>
                scrollToSection(
                  "experience"
                )
              }
            />

            <ProfileNavItem
              label="Education"
              active={
                activeSection ===
                "education"
              }
              onClick={() =>
                scrollToSection(
                  "education"
                )
              }
            />

            <ProfileNavItem
              label="Skills"
              active={
                activeSection === "skills"
              }
              onClick={() =>
                scrollToSection("skills")
              }
            />

            <ProfileNavItem
              label="Contact"
              active={
                activeSection === "contact"
              }
              onClick={() =>
                scrollToSection("contact")
              }
            />

          </div>
        </div>

        {/* ============================================================
            ABOUT
        ============================================================ */}

        <section
          id="about"
          className="scroll-mt-24 mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            About
          </h2>

          <p className="text-gray-600 leading-7 whitespace-pre-wrap">
            {user?.bio ||
              "Add a short description about yourself."}
          </p>
        </section>

        {/* ============================================================
            POSTS
        ============================================================ */}

        <section
          id="posts"
          className="scroll-mt-24 mt-5"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">

            <div className="flex items-center justify-between gap-4 mb-5">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Posts
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Posts shared by{" "}
                  {user?.name ||
                    "this user"}
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                {posts.length}{" "}
                {posts.length === 1
                  ? "Post"
                  : "Posts"}
              </div>

            </div>

            {/* LOADING */}

            {postsLoading && (
              <div className="py-12 flex items-center justify-center gap-3 text-gray-500">
                <Loader2
                  size={22}
                  className="animate-spin"
                />
                Loading posts...
              </div>
            )}

            {/* ERROR */}

            {!postsLoading &&
              postsError && (
                <div className="py-8 text-center">

                  <p className="text-red-500 text-sm mb-4">
                    {postsError}
                  </p>

                  <button
                    onClick={() =>
                      user?._id &&
                      fetchUserPosts(
                        user._id
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Try Again
                  </button>

                </div>
              )}

            {/* EMPTY */}

            {!postsLoading &&
              !postsError &&
              posts.length === 0 && (
                <div className="py-12 text-center">

                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FileText
                      size={28}
                      className="text-gray-400"
                    />
                  </div>

                  <h3 className="font-semibold text-gray-900">
                    No posts yet
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Posts you create in
                    AlumniConnect will
                    appear here.
                  </p>

                </div>
              )}

            {/* POSTS */}

            {!postsLoading &&
              !postsError &&
              posts.length > 0 && (
                <div className="space-y-5">

                  {posts.map((post) => (
                    <ProfilePostCard
                      key={post._id}
                      post={post}
                      user={user}
                      getPostTypeLabel={
                        getPostTypeLabel
                      }
                      formatPostDate={
                        formatPostDate
                      }
                      onLike={
                        handleLikePost
                      }
                      onComment={
                        handleOpenComments
                      }
                      onSave={
                        handleSavePost
                      }
                      onShare={
                        handleSharePost
                      }
                      isLiked={isPostLiked}
                      isSaved={isPostSaved}
                      getInitials={
                        getInitials
                      }
                    />
                  ))}

                </div>
              )}

          </div>
        </section>

        {/* ============================================================
            EXPERIENCE
        ============================================================ */}

        <section
          id="experience"
          className="scroll-mt-24 mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Experience
          </h2>

          {user?.jobRole ||
          user?.company ? (
            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BriefcaseBusiness
                  size={22}
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  {user?.jobRole ||
                    "Job Role"}
                </h3>

                <p className="text-gray-600 mt-1">
                  {user?.company ||
                    "Company not added"}
                </p>

                {user?.location && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin size={14} />
                    {user.location}
                  </p>
                )}
              </div>

            </div>
          ) : (
            <p className="text-gray-500">
              No experience added yet.
            </p>
          )}
        </section>

        {/* ============================================================
            EDUCATION
        ============================================================ */}

        <section
          id="education"
          className="scroll-mt-24 mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Education
          </h2>

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.college ||
                  "College not added"}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {user?.department ||
                  "Department not added"}
              </p>

              {user?.graduationYear && (
                <p className="text-sm text-gray-500 mt-1">
                  Graduation:{" "}
                  {user.graduationYear}
                </p>
              )}
            </div>

          </div>
        </section>

        {/* ============================================================
            SKILLS
        ============================================================ */}

        <section
          id="skills"
          className="scroll-mt-24 mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Skills
          </h2>

          {Array.isArray(user?.skills) &&
          user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">

              {user.skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>
          ) : (
            <p className="text-gray-500">
              No skills added yet.
            </p>
          )}
        </section>

        {/* ============================================================
            CONTACT
        ============================================================ */}

        <section
          id="contact"
          className="scroll-mt-24 mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <ContactItem
              icon={<Mail size={18} />}
              label="Email"
              value={user?.email}
            />

            <ContactItem
              icon={<Phone size={18} />}
              label="Phone"
              value={user?.phone}
            />

            <ContactItem
              icon={<MapPin size={18} />}
              label="Location"
              value={user?.location}
            />

          </div>
        </section>

        {/* ============================================================
            SOCIAL PROFILES
        ============================================================ */}

        <section className="mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">

          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Social Profiles
          </h2>

          <div className="space-y-3">

            <SocialLink
              icon="in"
              label="LinkedIn"
              value={user?.linkedin}
            />

            <SocialLink
              icon="GH"
              label="GitHub"
              value={user?.github}
            />

            <SocialLink
              icon={<Globe size={18} />}
              label="Portfolio"
              value={user?.portfolio}
            />

          </div>

        </section>

        {/* ============================================================
            ACCOUNT
        ============================================================ */}

        <section className="mt-5 mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">

          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Account
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <InfoItem
              icon={<Mail size={19} />}
              label="Email"
              value={user?.email}
            />

            <InfoItem
              icon={<User size={19} />}
              label="Role"
              value={user?.role}
            />

          </div>

        </section>

      </div>

      {/* ==============================================================
          EDIT PROFILE MODAL
      ============================================================== */}

      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 sm:px-7 py-4 flex items-center justify-between z-10">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Profile
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update your profile information
                </p>
              </div>

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-5 sm:p-7 space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <FormInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter your name"
                />

                <FormInput
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter phone number"
                />

                <FormInput
                  label="Location"
                  name="location"
                  value={
                    formData.location
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter location"
                />

                <FormInput
                  label="Department"
                  name="department"
                  value={
                    formData.department
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter department"
                />

                <FormInput
                  label="Graduation Year"
                  name="graduationYear"
                  type="number"
                  value={
                    formData.graduationYear
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="2026"
                />

                <FormInput
                  label="College"
                  name="college"
                  value={
                    formData.college
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter college"
                />

                <FormInput
                  label="Company"
                  name="company"
                  value={
                    formData.company
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter company"
                />

                <FormInput
                  label="Job Role"
                  name="jobRole"
                  value={
                    formData.jobRole
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter job role"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={
                    handleInputChange
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Tell people about yourself..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <p className="text-xs text-gray-400 mt-1 text-right">
                  {formData.bio.length}/500
                </p>
              </div>

              <FormInput
                label="Skills"
                name="skills"
                value={formData.skills}
                onChange={
                  handleInputChange
                }
                placeholder="Java, React.js, Node.js, MongoDB"
              />

              <p className="text-xs text-gray-500 -mt-3">
                Separate skills using commas.
              </p>

              <div className="grid grid-cols-1 gap-5">

                <FormInput
                  label="LinkedIn"
                  name="linkedin"
                  value={
                    formData.linkedin
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="https://linkedin.com/in/..."
                />

                <FormInput
                  label="GitHub"
                  name="github"
                  value={
                    formData.github
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="https://github.com/..."
                />

                <FormInput
                  label="Portfolio"
                  name="portfolio"
                  value={
                    formData.portfolio
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="https://yourportfolio.com"
                />

              </div>

            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 sm:px-7 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ==============================================================
          PHOTO ADJUSTMENT MODAL
      ============================================================== */}

      {showPhotoAdjust &&
        photoPreview && (
          <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">

              <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Adjust{" "}
                    {photoType === "cover"
                      ? "Cover Photo"
                      : "Profile Photo"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Position and zoom your photo before saving
                  </p>
                </div>

                <button
                  onClick={
                    closePhotoAdjust
                  }
                  disabled={
                    uploadingProfileImage ||
                    uploadingCoverImage
                  }
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="p-5 sm:p-6">

                <div
                  className={`relative mx-auto overflow-hidden bg-gray-100 ${
                    photoType === "cover"
                      ? "w-full aspect-[3.2/1] rounded-xl"
                      : "w-64 h-64 rounded-full"
                  }`}
                >

                  <img
                    src={photoPreview}
                    alt="Adjust preview"
                    className="absolute w-full h-full object-cover"
                    style={{
                      objectPosition: `${photoX}% ${photoY}%`,
                      transform: `scale(${photoZoom})`,
                      transformOrigin:
                        "center",
                    }}
                  />

                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      photoType === "cover"
                        ? "border-2 border-white/80 rounded-xl"
                        : "border-4 border-white rounded-full"
                    }`}
                  />

                </div>

                <div className="mt-7 space-y-6">

                  {/* ZOOM */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <ZoomIn size={17} />
                        Zoom
                      </label>

                      <span className="text-sm text-gray-500">
                        {Math.round(
                          photoZoom * 100
                        )}
                        %
                      </span>

                    </div>

                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          setPhotoZoom(
                            Math.max(
                              1,
                              Number(
                                (
                                  photoZoom -
                                  0.1
                                ).toFixed(1)
                              )
                            )
                          )
                        }
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                      >
                        <ZoomOut size={18} />
                      </button>

                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={photoZoom}
                        onChange={(e) =>
                          setPhotoZoom(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="flex-1 accent-blue-600"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setPhotoZoom(
                            Math.min(
                              3,
                              Number(
                                (
                                  photoZoom +
                                  0.1
                                ).toFixed(1)
                              )
                            )
                          )
                        }
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                      >
                        <ZoomIn size={18} />
                      </button>

                    </div>

                  </div>

                  {/* HORIZONTAL */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm font-semibold text-gray-700">
                        Horizontal Position
                      </label>

                      <span className="text-xs text-gray-500">
                        {Math.round(photoX)}%
                      </span>

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={photoX}
                      onChange={(e) =>
                        setPhotoX(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full accent-blue-600"
                    />

                  </div>

                  {/* VERTICAL */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm font-semibold text-gray-700">
                        Vertical Position
                      </label>

                      <span className="text-xs text-gray-500">
                        {Math.round(photoY)}%
                      </span>

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={photoY}
                      onChange={(e) =>
                        setPhotoY(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full accent-blue-600"
                    />

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoZoom(1);
                      setPhotoX(50);
                      setPhotoY(50);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reset adjustment
                  </button>

                </div>
              </div>

              <div className="border-t border-gray-200 px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">

                <button
                  onClick={
                    closePhotoAdjust
                  }
                  disabled={
                    uploadingProfileImage ||
                    uploadingCoverImage
                  }
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleSaveAdjustedPhoto
                  }
                  disabled={
                    uploadingProfileImage ||
                    uploadingCoverImage
                  }
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {uploadingProfileImage ||
                  uploadingCoverImage ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Photo
                    </>
                  )}
                </button>

              </div>

            </div>
          </div>
        )}

      {/* ==============================================================
          COMMENTS MODAL
      ============================================================== */}

      {commentPost && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* HEADER */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Comments
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {commentPost?.comments ||
                    0}{" "}
                  comments
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseComments
                }
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>

            </div>

            {/* COMMENTS */}

            <div className="flex-1 overflow-y-auto p-5">

              {commentsLoading ? (
                <div className="py-10 flex items-center justify-center gap-3 text-gray-500">
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="py-10 text-center">

                  <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageCircle
                      size={25}
                      className="text-gray-400"
                    />
                  </div>

                  <p className="mt-3 font-medium text-gray-800">
                    No comments yet
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Be the first person to
                    comment.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {comments.map(
                    (comment, index) => (
                      <div
                        key={
                          comment?._id ||
                          `comment-${index}`
                        }
                        className="flex gap-3"
                      >

                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold shrink-0">
                          {getInitials(
                            comment?.user
                              ?.name ||
                              comment?.author
                                ?.name ||
                              comment?.createdBy
                                ?.name ||
                              "User"
                          )}
                        </div>

                        <div className="flex-1 min-w-0">

                          <div className="bg-gray-50 rounded-xl px-4 py-3">

                            <p className="text-sm font-semibold text-gray-900">
                              {comment?.user
                                ?.name ||
                                comment?.author
                                  ?.name ||
                                comment
                                  ?.createdBy
                                  ?.name ||
                                "User"}
                            </p>

                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                              {comment?.content ||
                                ""}
                            </p>

                          </div>

                          <p className="text-xs text-gray-400 mt-1 ml-2">
                            {formatPostDate(
                              comment?.createdAt
                            )}
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* COMMENT INPUT */}

            <div className="border-t border-gray-200 p-4">

              <div className="flex items-end gap-3">

                <textarea
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();

                      handleSubmitComment();
                    }
                  }}
                  rows={2}
                  placeholder="Write a comment..."
                  className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={
                    handleSubmitComment
                  }
                  disabled={
                    commentSubmitting ||
                    !commentText.trim()
                  }
                  className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentSubmitting ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}
                </button>

              </div>

              <p className="text-xs text-gray-400 mt-2">
                Press Enter to comment. Use
                Shift + Enter for a new line.
              </p>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| PROFILE NAV ITEM
|--------------------------------------------------------------------------
*/

const ProfileNavItem = ({
  label,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-5 sm:px-7 py-4 text-sm font-semibold transition whitespace-nowrap ${
        active
          ? "text-blue-600"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}

      {active && (
        <span className="absolute left-4 right-4 bottom-0 h-0.5 bg-blue-600 rounded-full" />
      )}
    </button>
  );
};

/*
|--------------------------------------------------------------------------
| PROFILE POST CARD
|--------------------------------------------------------------------------
*/

const ProfilePostCard = ({
  post,
  user,
  getPostTypeLabel,
  formatPostDate,
  onLike,
  onComment,
  onSave,
  onShare,
  isLiked,
  isSaved,
  getInitials,
}) => {
  const author =
    post?.author || user;

  const likesCount =
    Array.isArray(post?.likes)
      ? post.likes.length
      : 0;

  const savedCount =
    Array.isArray(post?.savedBy)
      ? post.savedBy.length
      : 0;

  const media =
    Array.isArray(post?.media)
      ? post.media.filter(
          (item) =>
            item &&
            item.url
        )
      : [];

  const liked =
    isLiked?.(post) || false;

  const saved =
    isSaved?.(post) || false;

  return (
    <article className="border border-gray-200 rounded-2xl overflow-hidden bg-white">

      {/* ============================================================
          POST HEADER
      ============================================================ */}

      <div className="p-4 sm:p-5">

        <div className="flex items-start justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">

            {author?.profileImage ? (
              <img
                src={author.profileImage}
                alt={
                  author?.name ||
                  "User"
                }
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                {getInitials(
                  author?.name
                )}
              </div>
            )}

            <div className="min-w-0">

              <h3 className="font-semibold text-gray-900 truncate">
                {author?.name ||
                  "User"}
              </h3>

              {author?.jobRole && (
                <p className="text-xs text-gray-500 truncate">
                  {author.jobRole}
                  {author?.company
                    ? ` • ${author.company}`
                    : ""}
                </p>
              )}

              <p className="text-xs text-gray-400">
                {formatPostDate(
                  post?.createdAt
                )}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap">
              {getPostTypeLabel(
                post?.type
              )}
            </span>

            <button
              type="button"
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <MoreHorizontal size={18} />
            </button>

          </div>

        </div>

        {/* ============================================================
            POST TEXT
        ============================================================ */}

        {post?.content && (
          <p className="mt-4 text-gray-800 leading-7 whitespace-pre-wrap break-words">
            {post.content}
          </p>
        )}

        {/* ============================================================
            HASHTAGS
        ============================================================ */}

        {Array.isArray(
          post?.hashtags
        ) &&
          post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">

              {post.hashtags.map(
                (hashtag, index) => (
                  <span
                    key={`${hashtag}-${index}`}
                    className="text-blue-600 text-sm font-medium"
                  >
                    #
                    {String(
                      hashtag
                    ).replace(
                      /^#/,
                      ""
                    )}
                  </span>
                )
              )}

            </div>
          )}

        {/* ============================================================
            PHOTO / VIDEO / AUDIO / DOCUMENT
        ============================================================ */}

        {media.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl">

            <div
              className={`grid gap-1 ${
                media.length === 1
                  ? "grid-cols-1"
                  : media.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
              }`}
            >

              {media.map(
                (item, index) => (
                  <PostMedia
                    key={`${item.url}-${index}`}
                    media={item}
                    totalMedia={
                      media.length
                    }
                  />
                )
              )}

            </div>

          </div>
        )}

        {/* ============================================================
            LINK
        ============================================================ */}

        {post?.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
          >

            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ExternalLink size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">
                External Link
              </p>

              <p className="text-xs text-gray-500 truncate">
                {post.link}
              </p>
            </div>

          </a>
        )}

        {/* ============================================================
            JOB
        ============================================================ */}

        {post?.job && (
          <div className="mt-4 border border-blue-100 bg-blue-50/50 rounded-xl p-4">

            <div className="flex items-start gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <BriefcaseBusiness size={21} />
              </div>

              <div className="min-w-0">

                <h3 className="font-semibold text-gray-900">
                  {post.job.title}
                </h3>

                {post.job.company && (
                  <p className="text-sm text-gray-600 mt-1">
                    {post.job.company}
                  </p>
                )}

                {post.job.location && (
                  <p className="text-sm text-gray-500 mt-1">
                    {post.job.location}
                  </p>
                )}

                {post.job.experience && (
                  <p className="text-sm text-gray-500 mt-1">
                    Experience:{" "}
                    {post.job.experience}
                  </p>
                )}

                {post.job.description && (
                  <p className="text-sm text-gray-600 mt-3 leading-6 whitespace-pre-wrap">
                    {post.job.description}
                  </p>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ============================================================
            EVENT
        ============================================================ */}

        {post?.event && (
          <div className="mt-4 border border-purple-100 bg-purple-50/50 rounded-xl p-4">

            <div className="flex items-start gap-3">

              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <FileText size={21} />
              </div>

              <div className="min-w-0">

                <h3 className="font-semibold text-gray-900">
                  {post.event.title}
                </h3>

                {post.event.date && (
                  <p className="text-sm text-gray-600 mt-1">
                    {post.event.date}
                  </p>
                )}

                {post.event.location && (
                  <p className="text-sm text-gray-500 mt-1">
                    {post.event.location}
                  </p>
                )}

                {post.event.description && (
                  <p className="text-sm text-gray-600 mt-3 leading-6 whitespace-pre-wrap">
                    {post.event.description}
                  </p>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ============================================================
            POLL
        ============================================================ */}

        {post?.poll && (
          <div className="mt-4 border border-gray-200 rounded-xl p-4">

            <h3 className="font-semibold text-gray-900">
              {post.poll.question}
            </h3>

            <div className="mt-3 space-y-2">

              {Array.isArray(
                post.poll.options
              ) &&
                post.poll.options.map(
                  (option, index) => (
                    <div
                      key={`${option.text}-${index}`}
                      className="border border-gray-200 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">

                        <span className="text-sm text-gray-700">
                          {option.text}
                        </span>

                        <span className="text-xs text-gray-500">
                          {option.votes || 0}{" "}
                          votes
                        </span>

                      </div>
                    </div>
                  )
                )}

            </div>

          </div>
        )}

      </div>

      {/* ============================================================
          POST STATS
      ============================================================ */}

      <div className="border-t border-gray-100 px-4 sm:px-5 py-3">

        <div className="flex items-center justify-between text-xs text-gray-500">

          <span>
            {likesCount}{" "}
            {likesCount === 1
              ? "like"
              : "likes"}
          </span>

          <div className="flex items-center gap-3 sm:gap-4">

            <span>
              {post?.comments || 0} comments
            </span>

            <span>
              {post?.shares || 0} shares
            </span>

            <span>
              {savedCount} saves
            </span>

          </div>

        </div>

      </div>

      {/* ============================================================
          POST ACTIONS
      ============================================================ */}

      <div className="border-t border-gray-100 px-2 sm:px-4 py-2 flex items-center">

        {/* LIKE */}

        <button
          type="button"
          onClick={() =>
            onLike?.(post)
          }
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            liked
              ? "text-red-600 bg-red-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Heart
            size={18}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />

          <span>
            {liked
              ? "Liked"
              : "Like"}
          </span>
        </button>

        {/* COMMENT */}

        <button
          type="button"
          onClick={() =>
            onComment?.(post)
          }
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium transition"
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>

        {/* SHARE */}

        <button
          type="button"
          onClick={() =>
            onShare?.(post)
          }
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium transition"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>

        {/* SAVE */}

        <button
          type="button"
          onClick={() =>
            onSave?.(post)
          }
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            saved
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Bookmark
            size={18}
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />

          <span>
            {saved
              ? "Saved"
              : "Save"}
          </span>
        </button>

      </div>

    </article>
  );
};

/*
|--------------------------------------------------------------------------
| POST MEDIA
|--------------------------------------------------------------------------
*/

const PostMedia = ({
  media,
  totalMedia,
}) => {
  if (!media?.url) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

  if (media.type === "image") {
    return (
      <div className="relative bg-gray-100 overflow-hidden">

        <img
          src={media.url}
          alt={
            media.name ||
            "Post image"
          }
          loading="lazy"
          className={`w-full object-cover ${
            totalMedia === 1
              ? "max-h-[650px]"
              : "h-64 sm:h-80"
          }`}
          onError={(e) => {
            e.currentTarget.style.display =
              "none";
          }}
        />

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VIDEO
  |--------------------------------------------------------------------------
  */

  if (media.type === "video") {
    return (
      <div className="relative bg-black overflow-hidden">

        <video
          src={media.url}
          controls
          playsInline
          preload="metadata"
          className={`w-full ${
            totalMedia === 1
              ? "max-h-[650px]"
              : "h-64 sm:h-80"
          } object-contain bg-black`}
        />

        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1.5">
          <Play
            size={13}
            fill="currentColor"
          />
          Video
        </div>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | AUDIO
  |--------------------------------------------------------------------------
  */

  if (media.type === "audio") {
    return (
      <div className="col-span-full p-4 bg-gray-50 border border-gray-200 rounded-xl">

        <div className="flex items-center gap-3 mb-3">

          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Music size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {media.name ||
                "Audio"}
            </p>

            <p className="text-xs text-gray-500">
              Audio attachment
            </p>
          </div>

        </div>

        <audio
          src={media.url}
          controls
          className="w-full"
        />

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DOCUMENT
  |--------------------------------------------------------------------------
  */

  if (media.type === "document") {
    return (
      <a
        href={media.url}
        target="_blank"
        rel="noopener noreferrer"
        className="col-span-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
      >

        <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <FileText size={21} />
        </div>

        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {media.name ||
              "Document"}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Open document
          </p>
        </div>

        <ExternalLink
          size={17}
          className="ml-auto shrink-0 text-gray-400"
        />

      </a>
    );
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

const InfoItem = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">

      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="text-sm font-medium text-gray-900 mt-1 break-words">
          {value || "Not added"}
        </p>

      </div>

    </div>
  );
};

/*
|--------------------------------------------------------------------------
| CONTACT ITEM
|--------------------------------------------------------------------------
*/

const ContactItem = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3">

      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="text-sm font-medium text-gray-900 mt-1 break-all">
          {value || "Not added"}
        </p>

      </div>

    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SOCIAL LINK
|--------------------------------------------------------------------------
*/

const SocialLink = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3">

      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-semibold shrink-0">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-gray-500">
          {label}
        </p>

        {value ? (
          <a
            href={
              value.startsWith("http")
                ? value
                : `https://${value}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            Not added
          </p>
        )}

      </div>

    </div>
  );
};

/*
|--------------------------------------------------------------------------
| FORM INPUT
|--------------------------------------------------------------------------
*/

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

    </div>
  );
};

export default Profile;