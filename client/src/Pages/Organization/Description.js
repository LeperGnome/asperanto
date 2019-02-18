import React, { Component } from 'react';
import './css/description.css';

export class Description extends Component {

    render () {
        return (
            <div className={"main-description"}>
                <h1 className={"name-description"}>Aspernato</h1>

                <div className={"pic-organization"}/>

                <div className={"desc-organization"}>
                    Aspernato - крутая компнаия, которая занимается крутым маркетплейсом, который крутой.
                </div>
            </div>
        )
    }
}