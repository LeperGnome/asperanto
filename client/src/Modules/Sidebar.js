import React, { Component } from "react";
import './css/sidebar.css';

export class Sidebar extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let body = document.getElementsByClassName('wrapper')[0];

        body.className = 'wrapper-sidebar-toggled';
    }

    componentWillUnmount() {
        let body = document.getElementsByClassName('wrapper-sidebar-toggled')[0];

        body.className = 'wrapper';
    }

    render() {
        return (
            <section className="sidebar">

            </section>
        )
    }
}