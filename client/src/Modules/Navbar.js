import React, { Component } from "react";
import './css/navbar.css';
import { Link } from 'react-router-dom';

export class Navbar extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        return (
            <nav className="navbar">
                <div className="navbar-left">
                    <button className="" type="button" onClick={ this.props.sidebarToggle }>
                        <i className="fas fa-bars nav-icons"></i>
                    </button>

                    <Link to="/" >
                        Asperanto
                    </Link>
                </div>

                <div className="center">
                    <form action="" method="get">
                        <input type="text" placeholder="Найти" onClick={ this.props.searchBoxToggle } onChange={ this.props.searchBoxQuery }></input>
                        <button type="button"><i className="fas fa-search nav-icons"></i></button>
                    </form>
                </div>

                <div className="navbar-right">
                    <a href="#">
                        <div className="circle-nav"></div>
                        <span className="nickname-nav">А.И. Гайдамака</span>
                    </a>
                </div>

                <div className="categories">
                    <a className="categories-all">Все категории</a>

                    <a>Промышленность</a>

                    <a>Категория 2</a>

                    <a>Категория 3</a>

                    <a>Категория 4</a>

                    <a>Категория 5</a>
                </div>
            </nav>
        )}
}