import React from "react";
import { useEffect, useState } from "react";
import logo from "../../images/Twitter-logo.png";
import { useNavigate } from "react-router-dom";

import "./Home.scss";

// Material UI Components
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Home = ({ gun, user }) => {
  const navigate = useNavigate();
  const [currUser, setCurrUser] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [follows, setFollows] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currUserPosts, setCurrUserPosts] = useState([]);
  const [postField, setPostField] = useState("");

  useEffect(() => {
    gun.user().once((data) => {
      setCurrUser(data.alias);
    });
  }, []);

  useEffect(() => {
    if (!user.is) {
      navigate("/login");
    }
    gun.get("users").on(handleAllUsers);
    gun.get("users").get(currUser).get("follows").on(handleAllFollows);
    gun.get("users").get(currUser).get("follows").on(handleFollowPosts);
    gun
      .get("users")
      .get(currUser)
      .get("posts_timeline")
      .on((data) => {
        setCurrUserPosts([]);
        for (let key in data) {
          gun
            .get("users")
            .get(currUser)
            .get("posts_timeline")
            .get(key)
            .on(currUserPostsListener);
        }
      });
  }, [currUser]);

  const deduplicate = (posts) => {
    let deduplicated = [];
    let exist = false;

    for (let post in posts) {
      exist = false;
      for (let de_post in deduplicated) {
        if (
          deduplicated[de_post].createdAt === posts[post].createdAt &&
          deduplicated[de_post].from === posts[post].from
        ) {
          exist = true;
          break;
        }
      }
      if (!exist) {
        deduplicated.push(posts[post]);
      }
    }
    return deduplicated;
  };

  const currUserPostsListener = (value, key, _msg, _ev) => {
    if (key === "_") {
      return;
    }
    if (value === null) {
      setCurrUserPosts((posts) => {
        return posts.filter((post) => {
          return !(
            post.from === key.split("_")[0] &&
            String(post.createdAt) === key.split("_")[1]
          );
        });
      });
      return;
    }

    const post = {
      content: value.content,
      createdAt: value.createdAt,
      from: value.from,
    };
    setCurrUserPosts((currUserPosts) => [...currUserPosts, post]);
  };

  const followsPostsListener = (value, key, _msg, _ev) => {
    if (value === null) {
      setPosts((posts) => {
        return posts.filter((post) => {
          return !(
            post.from === key.split("_")[0] &&
            String(post.createdAt) === key.split("_")[1]
          );
        });
      });
      return;
    }
    const post = {
      content: value.content,
      createdAt: value.createdAt,
      from: value.from,
    };
    setPosts((posts) => [...posts, post]);
  };

  const handleAllUsers = (data) => {
    setAllUsers([]);
    for (let key in data) {
      if (key !== "_" && key !== currUser) {
        setAllUsers((prev) => [...prev, key]);
      }
    }
  };

  const handleDeletePost = (post) => {
    gun
      .get("users")
      .get(post.from)
      .get("posts_timeline")
      .get(`${post.from}_${post.createdAt}`)
      .put(null);
  };

  const handleAddFollow = (username) => {
    console.log("username", username);
    gun
      .get("users")
      .get(currUser)
      .get("follows")
      .put({ [username]: username });

    setFollows((prev) => [...prev, username]);
  };

  const handleRemoveFollow = (username) => {
    console.log("username", username);
    gun.get("users").get(currUser).get("follows").get(username).put(null);
  };

  const handleAllFollows = (data) => {
    console.log("data follows", data);
    setFollows([]);
    for (let key in data) {
      if (key !== "_" && data[key] !== null) {
        setFollows((prev) => [...prev, key]);
      }
    }
  };

  const handleFollowPosts = (data) => {
    console.log(data);

    let follArr = [];
    setPosts([]);

    for (let key in data) {
      if (key !== "_" && data[key] !== null) {
        follArr.push(key);
      }
    }
    follArr.forEach((foll) => {
      gun
        .get("users")
        .get(foll)
        .get("posts_timeline")
        .map()
        .on(followsPostsListener);
    });
  };

  function getAllPosts() {
    return deduplicate(currUserPosts.concat(posts)).sort((b, a) => {
      return new Date(parseInt(a.createdAt)) - new Date(parseInt(b.createdAt));
    });
  }


  function handleSendPost(e) {
    e.preventDefault();

    const newPost = {
      from: currUser,
      content: postField,
      createdAt: Date.now(),
    };

    gun
      .get("users")
      .get(currUser)
      .get("posts_timeline")
      .get(`${currUser}_${newPost.createdAt}`)
      .put(newPost);

    setPostField("");
  }
  function logOut() {
    user.leave();
    navigate("/login");
  }

  function onChange(e) {
    setPostField(e.target.value);
  }

  function formatDate(miliseconds) {
    return `${new Date(parseInt(miliseconds)).toISOString().split("T")[0]} - ${
      new Date(parseInt(miliseconds))
        .toISOString()
        .split("T")[1]
        .split("Z")[0]
        .split(".")[0]
    }`;
  }

  return (
    <Box className="homepage-container">
      <Box className="left-side_bar">
        <Box className="logo">
          <img src={logo} alt="logo" width={"40px"} height={"40px"}></img>
        </Box>

        <Box className="logout-btn">
          <Box>
            <InputAdornment>
              <AccountCircle sx={{ height: "50px", width: "50px" }} />
            </InputAdornment>
          </Box>
          <Typography variant="h5">{currUser}</Typography>
          <Button variant="text" onClick={logOut}>
            <ExitToAppIcon/>
          </Button>
        </Box>
      </Box>

      <Box className="content-wrapper">
        <Box className="send_form-container">
          <Typography variant="h5">Home</Typography>
          <Box className="send_form">
            <FormControl variant="standard" fullWidth>
              <Input
                placeholder="What's happening?"
                disableUnderline={true}
                startAdornment={
                  <InputAdornment position="start">
                    <AccountCircle sx={{ height: "50px", width: "50px" }} />
                  </InputAdornment>
                }
                onChange={onChange}
                value={postField}
                sx={{ fontSize: "1.8em" }}
              />
            </FormControl>
          </Box>
          <Box className="submit-btn_container">
            <Button
              variant="contained"
              sx={{
                borderRadius: "16px",
                textTransform: "none",
                backgroundColor: "#5CC4FF",
              }}
              onClick={handleSendPost}
              disabled={postField.length === 0}
            >
              Tweet
            </Button>
          </Box>
        </Box>
        <Box className="posts-wrapper">
          {getAllPosts().map((post) => (
            <Box key={post.createdAt} className="single_post-wrapper">
              <Box className="post_container">
                <InputAdornment>
                  <AccountCircle sx={{ height: "100px", width: "100px" }} />
                </InputAdornment>
                <Box className="post-content">
                  <Box className="post-content-title">
                    <Typography>{post.from}</Typography>
                    <Typography>{formatDate(post.createdAt)}</Typography>
                  </Box>

                  <Typography>{post.content}</Typography>
                </Box>
              </Box>

              <Box className="post-action-btns-wrapper">
                {post.from === currUser ? (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeletePost(post)}
                  >
                    <DeleteIcon />
                    Delete
                  </Button>
                ) : (
                  <></>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box className="right-side_bar">
        <Box className="follows_recomendations">
          <Typography className="follows_recomendations-title" variant="h6">
            Who to follow
          </Typography>
          {allUsers.map((user, idx) => (
            <Box className="follows-wrapper" key={`follow_profile_${user}`}>
              <Box className="follows-user_profile">
                <InputAdornment>
                  <AccountCircle sx={{ height: "60px", width: "60px" }} />
                </InputAdornment>
                <Box className="follows-user_profile_content">
                  <Typography>{user}</Typography>
                  {follows.includes(user) ? (
                    <Button
                      onClick={() => handleRemoveFollow(user)}
                      variant="contained"
                    >
                      unflollow
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleAddFollow(user)}
                      variant="contained"
                    >
                      Follow
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
