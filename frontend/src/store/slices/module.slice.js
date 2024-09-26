import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    allCourses: {},
    allCountries: {},
    getallModules: {},
    getallCourseModules: {},
    AllModuleAttendance: [],
    AllStudentAttendance: [],
    allStudents: [],
    getallCohort: {},
    moduleLoader: false,
};

const courseSlice = createSlice({
    name: 'courseSlice',
    initialState,
    reducers: {
        courseDataSlice: (state, { payload }) => {
            state.allCourses = payload;
        },
        countryDataSlice: (state, { payload }) => {
            state.allCountries = payload;
        },
        moduleDataSlice: (state, { payload }) => {
            state.getallModules = payload;
        },
        courseModuleDataSlice: (state, { payload }) => {
            state.getallCourseModules = payload;
        },
        cohortDataSlice: (state, { payload }) => {
            state.getallCohort = payload;
        },
        getAllModuleAttendanceSlice: (state, { payload }) => {
            state.AllModuleAttendance = payload;
        },
        getAllStudentAttendanceSlice: (state, { payload }) => {
            state.AllStudentAttendance = payload;
        },
        moduleLoading: (state, { payload }) => {
            state.moduleLoader = payload;
        },
        studentDataSlice: (state, { payload }) => {
            state.allStudents = payload;
        },
    },
});

const { actions, reducer } = courseSlice;

export const {
    courseDataSlice,
    countryDataSlice,
    moduleDataSlice,
    courseModuleDataSlice,
    cohortDataSlice,
    getAllModuleAttendanceSlice,
    getAllStudentAttendanceSlice,
    moduleLoading,
    studentDataSlice
} = actions;

export default reducer;
