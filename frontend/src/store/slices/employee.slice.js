import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    employeeLoader: false,
    allLocation: [],
    allDepartment: [],
    allemployeedata: [],
    allemployeename: []
};

const employeeSlice = createSlice({
    name: 'employeerSlice',
    initialState,
    reducers: {
        employeeLoading: (state, { payload }) => {
            state.employeeLoader = payload;
        },
        locationDataSlice: (state, { payload }) => {
            state.allLocation = payload;
        },
        departmentDataSlice: (state, { payload }) => {
            state.allDepartment = payload;
        },
        employeeDataSlice: (state, { payload }) => {
            state.allemployeedata = payload;
        },
        employeeNameSlice: (state, { payload }) => {
            state.allemployeename = payload;
        },
    },
});

const { actions, reducer } = employeeSlice;

export const {
    employeeLoading, locationDataSlice, departmentDataSlice, employeeDataSlice, employeeNameSlice
} = actions;

export default reducer;
