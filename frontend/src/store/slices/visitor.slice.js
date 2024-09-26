import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    visitorLoader: false,
    allVisitors: [],
    allVisitorsData: []
};

const visitorSlice = createSlice({
    name: 'visitorSlice',
    initialState,
    reducers: {
        visitorLoading: (state, { payload }) => {
            state.visitorLoader = payload;
        },
        visitorDataSlice: (state, { payload }) => {
            state.allVisitors = payload;
        },
        getAllVisitorsSlice: (state, { payload }) => {
            state.allVisitorsData = payload;
        },
    },
});

const { actions, reducer } = visitorSlice;

export const {
    visitorLoading, visitorDataSlice, getAllVisitorsSlice
} = actions;

export default reducer;
