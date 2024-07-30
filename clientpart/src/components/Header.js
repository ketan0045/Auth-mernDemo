import React, { useContext } from "react";
import Avatar from "@mui/material/Avatar";
import { LoginContext } from "../ContextProvider/Context";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "../hearder.css"
import { NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const { logindata, setLoginData } = useContext(LoginContext);

  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    logindata.ValidUserOne && setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const logoutuser = async () => {
    console.log("use logout");
    localStorage.removeItem("usersdatatoken");
    setLoginData(false);
    navigate("/");
  };

  // const logoutuser = async () => {
  //   let token = localStorage.getItem("usersdatatoken");

  //   const res = await "http://localhost:8009/logout", {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: token,
  //       Accept: "application/json",
  //     },
  //     credentials: "include",
  //   });

  //   const data = await res.json();
  //   console.log(data);

  //   if (data.status === 201) {
  //     console.log("use logout");
  //     localStorage.removeItem("usersdatatoken");
  //     setLoginData(false);
  //     navigate("/");
  //   } else {
  //     console.log("error");
  //   }
  // };

  // useEffect(() => {
  //   setLoginData(logindata)
  // }, [])
  
  const goProfilePage = () => {
    navigate("/profile");
  };

  return (
    <>
      <header>
        <nav>
          <NavLink to="/dashboard">
            <h1>Demo</h1>
          </NavLink>
          <div className="avtar">
            {logindata?.ValidUserOne ? (
              <Avatar
                style={{
                  background: "salmon",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
                onClick={handleClick}
              >
                {logindata?.ValidUserOne?.fname[0]?.toUpperCase()}
              </Avatar>
            ) : (
              <></>
              // <Avatar onClick={handleClick} style={{ background: "blue" }} />
            )}
          </div>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            {logindata?.ValidUserOne &&(
              <>
                <MenuItem
                  onClick={() => {
                    goProfilePage();
                    handleClose();
                  }}
                >
                  View Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logoutuser();
                    handleClose();
                  }}
                >
                  Logout
                </MenuItem>
              </>
            ) }
          </Menu>
        </nav>
      </header>
    </>
  );
};

export default Header;

