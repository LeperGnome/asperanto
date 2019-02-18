import React, { Component } from "react";
import "./css/home.css";
import { Link } from "react-router-dom";

export class Home extends Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div className="main-home">
                <Link to={'/categories'}><h1>Категории</h1></Link>
                <Link to={'/organization'}><h1>Организация</h1></Link>
            </div>
        );
    }
}