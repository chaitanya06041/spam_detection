import React from "react";
import { NavLink } from "react-router-dom"; // Import NavLink for active link feature
import "./Navbar.css";
import Logo from "../assets/logo.png";
import Home from "../assets/home.png";
import History from "../assets/history.png";
import Graph from "../assets/graph.png";
import Menu from "../assets/menu.png";
import { useState } from "react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="Navbar">
      <nav className={isOpen ? "nav_open" : "nav_closed"}>
        <div className="left">
          <img src={Logo} alt="Logo" />
        </div>
        <div className="right">
          <button className="menu-btn" onClick={toggleMenu}>
            <img src={Menu}></img>
          </button>

          <li className={isOpen ? "list_open" : "list_closed"}>
            <NavLink to="/home" activeClassName="active">
              <img src={Home}></img>
              Home
            </NavLink>
          </li>
          <li className={isOpen ? "list_open" : "list_closed"}>
            <NavLink to="/history" activeClassName="active">
              <img src={History}></img>
              History
            </NavLink>
          </li>
          <li className={isOpen ? "list_open" : "list_closed"}>
            <NavLink to="/graph" activeClassName="active">
              <img src={Graph}></img>
              Graphs
            </NavLink>
          </li>
          {/* <li className={isOpen ? "list_open" : "list_closed"}>
            <NavLink to="/login" activeClassName="active">
              <img src={Graph}></img>
              Login
            </NavLink>
          </li> */}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
