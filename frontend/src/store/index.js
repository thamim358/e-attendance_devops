import { configureStore } from '@reduxjs/toolkit';
import moduleReducer from '../store/slices/module.slice'
import studentReducer from '../store/slices/student.slice'
import visitorReducer from '../store/slices/visitor.slice'
import employeeReducer from '../store/slices/employee.slice'
import batchReducer from '../store/slices/batchjob.slice'

// Correct configuration for configureStore
const store = configureStore({
    reducer: {
        moduleState: moduleReducer,
        studentState: studentReducer,
        visitorState: visitorReducer,
        employeeState: employeeReducer,
        batchState: batchReducer,
    },
});

export * from './slices';
export * from './actions';
export default store;
