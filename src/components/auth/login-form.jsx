import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { TextField, Button, Typography, Box } from "@mui/material";
import symphonyImg from "./../../assets/images/BGlogin.jpg";


const LoginForm = () => {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef();
  const [username, setUsername] = useState({
    user_name: "",
    password: "",
  });
  
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    } else {
      setUsername({
        user_name: "",
        password: "",
      });
    }
  }, [isLoggedIn, navigate]);

  const onSubmit = () => {
    login(username);
  };

  const handleChange = (e) => {
    setUsername({
      ...username,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${symphonyImg})` }}
    >
      {!isLoggedIn && (
      
          <Box
            component="form"
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(username);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 600,
              height: 400,
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: 2,
              borderRadius: 2,
            }}
          >

            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Login
            </Typography>

          
            <TextField
              name="user_name"
              label="Username"
              placeholder="ระบุชื่อผู้ใช้"
              required
              value={username.user_name}
              onChange={handleChange}
            />

            <TextField
              name="password"
              label="Password"
              placeholder="ระบุรหัสผ่าน"
              type="password"
              autoComplete="off"
              required
              value={username.password}
              onChange={handleChange}
            />

            <Button variant="outlined" type="submit" onClick={() => onSubmit()}>
              เข้าสู่ระบบ
            </Button>
          </Box>
        
      )}
    </div>
  );
};

export default LoginForm;
