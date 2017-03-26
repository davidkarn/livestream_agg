import thunkMiddleware                       from 'redux-thunk'
import Reducers                              from 'reducers'
import {createStore, applyMiddleware, compose} from 'redux'
import {Provider}                            from 'inferno-redux'
import persistState                          from 'redux-localstorage'
import __                                    from 'jsml'
import Inferno                               from 'inferno';
import Home                                  from 'components/home';
import Component                             from 'inferno-component';
import React                                 from 'react'

var store = createStore(Reducers,
                        compose(applyMiddleware(thunkMiddleware),
                                persistState()))
 

Inferno.render(
    __(Provider, {store: store},
       __(Home, {})),
    document.querySelector("#main-body"))   
