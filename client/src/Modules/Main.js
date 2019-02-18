import React, { Component } from "react";
import { Goods } from '../Pages/Goods.js';
import { Category } from '../Pages/Category.js';
import { Home } from '../Pages/Home.js';
import { Search } from '../Components/Search';
import { Organization } from '../Pages/Organization/Organization';
import './css/main.css';
import { Switch, Route } from "react-router-dom";



export class Main extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let search;

        if (this.props.state.searchBox.activated)
            search = <Search state={this.props.state} getAddInfo={this.props.getAddInfo}/>;
        else
            search = null;

        return (
            <main className="main">
                {search}

                <Switch>
                    <Route exact path={'/'} component={Home}/>
                    <Route path={'/categories'} component={Category}/>
                    <Route path={'/organization'} component={Organization}/>
                    <Route path={'/goods'} component={Goods}/>
                </Switch>
            </main>
        )}
}