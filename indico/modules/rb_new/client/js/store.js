/* This file is part of Indico.
 * Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico; if not, see <http://www.gnu.org/licenses/>.
 */

import createHistory from 'history/createBrowserHistory';
import {queryStringMiddleware, createQueryStringReducer, validator as v} from 'redux-router-querystring';
import {routerReducer, routerMiddleware} from 'react-router-redux';
import createReduxStore from 'indico/utils/redux';
import {userReducer, bookRoomReducer, roomListReducer} from './reducers';
import {SET_FILTER_PARAMETER} from './actions';


const queryStringRules = {
    recurrence: {
        validator: v.isIn(['single', 'daily', 'every']),
        stateField: 'filters.recurrence.type'
    },
    number: {
        validator: v.isInt({min: 1, max: 99}),
        sanitizer: v.toInt(),
        stateField: 'filters.recurrence.number'
    },
    interval: {
        validator: v.isIn(['day', 'week', 'month']),
        stateField: 'filters.recurrence.interval'
    },
    startDate: {
        validator: v.isDate(),
        stateField: 'filters.dates.startDate'
    },
    endDate: {
        validator: v.isDate(),
        stateField: 'filters.dates.endDate'
    },
    startTime: {
        validator: v.isTime(),
        stateField: 'filters.timeSlot.startTime'
    },
    endTime: {
        validator: v.isTime(),
        stateField: 'filters.timeSlot.endTime'
    },
    capacity: {
        validator: v.isInt({min: 1}),
        sanitizer: v.toInt(),
        stateField: 'filters.capacity'
    }
};

const initialData = {
    staticData: {}
};

const routeConfig = {
    reduxPathname: ({router: {location: {pathname}}}) => pathname,
    routes: {
        '/book': {
            listen: SET_FILTER_PARAMETER,
            select: ({bookRoom: {filters}}) => ({filters}),
            serialize: queryStringRules
        }
    }
};

const qsReducer = createQueryStringReducer(
    queryStringRules,
    (state) => {
        const {router: {location: {pathname}}} = state;
        return {
            '/book': 'bookRoom',
            '/rooms': 'roomList'
        }[pathname];
    },
    (state, action) => {
        if (action.type === '@@router/LOCATION_CHANGE') {
            const {router: {location: {search}}} = state;
            return search.slice(1);
        }
        return null;
    }
);

export const history = createHistory({
    basename: '/rooms-new'
});

export default function createRBStore(data) {
    return createReduxStore({
        user: userReducer,
        bookRoom: bookRoomReducer,
        roomList: roomListReducer,
        router: routerReducer,
    }, Object.assign(initialData, data), [
        routerMiddleware(history),
        queryStringMiddleware(history, routeConfig)
    ], [
        qsReducer
    ]);
}