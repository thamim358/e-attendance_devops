import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    batchjobLoader: false,
    allBatchData: [],
    allBatchOptions: []
};

const batchjobSlice = createSlice({
    name: 'batchjobSlice',
    initialState,
    reducers: {
        batchjobLoading: (state, { payload }) => {
            state.batchjobLoader = payload;
        },
        batchDataSlice: (state, { payload }) => {
            state.allBatchData = payload;
        },
        batchDataOptionsSlice: (state, { payload }) => {
            state.allBatchOptions = payload;
        },
    },
});

const { actions, reducer } = batchjobSlice;

export const {
    batchjobLoading, batchDataSlice, batchDataOptionsSlice
} = actions;

export default reducer;
