import React from "react";
import "./index.scss";
import {Link, NavLink, useLocation, matchPath} from "react-router-dom";
import {useAppSelector} from "@/MyRedux";
import {useTranslation} from "react-i18next";
import WalletInteractComponent from "./Components/WalletInteract";
import LanguageComponent from "./Components/Language";
import {toast} from "react-toastify";

function Header() {
  const location = useLocation();
  const {t} = useTranslation();

  const isSubMenuActive = () => {
    const subRoutes = [
      "document",
      "about-us"
    ];

    for (const subRoute of subRoutes) {
      if (matchPath(subRoute, location.pathname)) {
        return true;
      }
    }

    return false;
  };

  const toggleSubMenu = (toggle: boolean) => {
    document.querySelector("#header #wrap-sub-menu")!.style.display = toggle ? "block" : "none";
  };

  return (
    <div id="header" className="container-fluid">
      <div id="logo" className="me-4">
        <Link to="/" className="h-100 d-flex align-items-center">
          <img className="logo-icon" src="/images/logo.svg" alt="" />
        </Link>
      </div>

      <div className="header-left d-none d-lg-block">
        <ul className="menu m-0 p-0 d-flex">
          <li>
            <NavLink
              to="/"
              className={({isActive}) => isActive ? "menu-blue active" : "menu-blue"}
            >
              <i className="fa fa-home icon" aria-hidden="true"></i>
              <span className="text ms-2">{t("home")}</span>
            </NavLink>
          </li>
          <li>
            <a
              href="/"
              className="menu-green"
              rel="noreferrer"
              target="_blank"
            >
              <img className="icon" src="/images/logo-icon.svg" alt="" />
              <span className="text ms-2">ATP</span>
            </a>
          </li>
          <li>
            <div
              className={`menu-violet ${isSubMenuActive() ? "active" : ""}`}
              onMouseOver={() => toggleSubMenu(true)}
              onMouseOut={() => toggleSubMenu(false)}
            >
              <i className="fa fa-ellipsis-h icon" aria-hidden="true"></i>

              <div id="wrap-sub-menu">
                <ul id="sub-menu" className="p-0">
                  <li>
                    <NavLink
                      to="/document"
                      onClick={() => toggleSubMenu(false)}
                    >
                      <i className="fa fa-leanpub icon" aria-hidden="true"></i>
                      <span className="text ms-2">Document</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/about-us"
                      onClick={() => toggleSubMenu(false)}
                    >
                      <i className="fa fa-user icon" aria-hidden="true"></i>
                      <span className="text ms-2">About Us</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div className="header-right d-flex">
        <div className="stack d-none d-sm-flex align-items-center" role="button">
          <img src="/images/logo-icon.svg" className="me-1" alt="mmo crypto" style={{"width": "24px"}} />
          <span>$0</span>
        </div>
        <div className="stack d-none d-md-flex align-items-center">
          <WalletInteractComponent />
        </div>
        <div className="stack d-flex align-items-center">
          <LanguageComponent />
        </div>
      </div>
    </div>
  );
}

export default Header;