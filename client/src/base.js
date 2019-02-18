import React from "react";
import ReactDOM from "react-dom";
import App from "./Modules/App.js";
import "./base.css";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render((
    <BrowserRouter>
        <App/>
    </BrowserRouter>
    ), document.getElementById("root")
);