import { showToastError } from "../../utilities/errortoast";
import { axios } from "../lib/axios";
import { getAllVisitorsConfig, getVisitorNamesConfig } from "../lib/requests/visitor.url";
import { moduleLoading } from "../slices/module.slice";
import { getAllVisitorsSlice, visitorDataSlice } from "../slices/visitor.slice";


//getallstudent name
export const getAllVisitorsAction = () => {
    return async (dispatch) => {
        try {
            const { url } = getVisitorNamesConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.get(url, { headers });
            const response = result?.data?.visitors
            if (result?.status === 200 && response) {
                dispatch(visitorDataSlice(response))
            }
        } catch (e) {
            showToastError("An error occurred");
        }
    };
};

//Visitor Filter Table Search
export const getFilterVisitors = (payload) => {
    return async (dispatch) => {
        dispatch(moduleLoading(true));
        try {
            const { url } = getAllVisitorsConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };

            const result = await axios.post(url, payload, { headers });
            const response = result?.data?.visitors
            if (result?.status === 200 && response) {
                dispatch(getAllVisitorsSlice(response))
                dispatch(moduleLoading(false));
            }
        } catch (e) {
            dispatch(moduleLoading(false));
            showToastError("An error occurred");
        }
    };
};