import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    testData: {},
    studentdetails: {},
    viewModuleDetails: {},
    schoolDetails: {},
    courseDetails: {},
    moduleDetails: {},
    cohortDetails: {},
    countryDetails: {},
    studentLoader: false,
    icaSTudentNames: [],
    icaStudentTableData: [],
    StudentModuleByID: [],
    icaStudentByID: [],
    icaStudentLoading: false,
    studentDataList: []
};

const studentSlice = createSlice({
    name: 'studentSlice',
    initialState,
    reducers: {
        studentDataSlice: (state, { payload }) => {
            state.testData = payload;
        },
        studentDetailsSlice: (state, { payload }) => {
            state.studentdetails = payload;
        },
        viewmoduleDetailsSlice: (state, { payload }) => {
            state.viewModuleDetails = payload;
        },
        schoolDetailsSlice: (state, { payload }) => {
            state.schoolDetails = payload;
        },
        courseDetailsSlice: (state, { payload }) => {
            state.courseDetails = payload;
        },
        moduleDetailsSlice: (state, { payload }) => {
            state.moduleDetails = payload;
        },
        cohortDetailsSlice: (state, { payload }) => {
            state.cohortDetails = payload;
        },
        countryDetailsSlice: (state, { payload }) => {
            state.countryDetails = payload;
        },
        icaStudentSlice: (state, { payload }) => {
            state.icaSTudentNames = payload;
        },
        icaStudentTableListSlice: (state, { payload }) => {
            state.icaStudentTableData = payload;
        },
        icaStudentByIdSlice: (state, { payload }) => {
            state.icaStudentByID = payload;
        },
        StudentModuleByIdSlice: (state, { payload }) => {
            state.StudentModuleByID = payload;
        },
        studentLoading: (state, { payload }) => {
            state.studentLoader = payload;
        },
        icaStudentLoading: (state, { payload }) => {
            state.icaStudentLoading = payload;
        },
        studentDataListSlice: (state, { payload }) => {
            state.studentDataList = payload;
        },
    },
});

const { actions, reducer } = studentSlice;

export const { studentDataSlice, studentDetailsSlice, viewmoduleDetailsSlice, schoolDetailsSlice, courseDetailsSlice, moduleDetailsSlice, cohortDetailsSlice, countryDetailsSlice, studentLoading, icaStudentSlice, icaStudentTableListSlice, StudentModuleByIdSlice, icaStudentByIdSlice, icaStudentLoading, studentDataListSlice } =
    actions;

export default reducer;
