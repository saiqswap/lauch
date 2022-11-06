import React from "react";
import "./index.scss";
import {Link} from "react-router-dom";
import BackgroundUniverse from "@/Components/BackgroundUniverse";

export default function NotFoundScreen() {
  return (
    <div id="not-found">
      <BackgroundUniverse>
        <div className="wrap-page container-fluid d-flex flex-column justify-content-center align-items-center">
          <div className="title">
            4
            <img className="logo-icon" src="/images/logo_icon_gold.svg" alt="Buy crypto with paypal" />
            4
          </div>
          <p className="description text-center">
            <span>Look like you are</span>
            <br/>
            <span className="fw-light">lost in space</span>
          </p>
          <Link to="/" className="cbtn cbtn-outline-gradient-blue cbtn-lg text-uppercase">Go back home</Link>
        </div>
      </BackgroundUniverse>
    </div>
  );
}
