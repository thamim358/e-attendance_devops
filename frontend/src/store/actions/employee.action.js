import { showToastError } from "../../utilities/errortoast";
import { axios } from "../lib/axios";
import { getAllEmployeeConfig, getdepartmentNamesConfig, getEmployeeNamesConfig, getLocationNamesConfig } from "../lib/requests/employee.url";
import { departmentDataSlice, employeeDataSlice, employeeNameSlice, locationDataSlice } from "../slices/employee.slice";
import { moduleLoading } from "../slices/module.slice";


//getalllocation value
export const getAllLocationAction = () => {
    return async (dispatch) => {
        try {
            const { url } = getLocationNamesConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.get(url, { headers });
            const response = result?.data?.locations
            if (result?.status === 200 && response) {
                dispatch(locationDataSlice(response));
            }
        } catch (e) {
            showToastError("An error occurred");
        }
    };
};

//getalldepartment value
export const getAllDepartmentAction = () => {
    return async (dispatch) => {
        try {
            const { url } = getdepartmentNamesConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.get(url, { headers });
            const response = result?.data?.departments
            if (result?.status === 200 && response) {
                dispatch(departmentDataSlice(response));
            }
        } catch (e) {
            showToastError("An error occurred");
        }
    };
};

//getallempname value
export const getAllEmployeeNameAction = () => {
    return async (dispatch) => {
        try {
            const { url } = getEmployeeNamesConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.get(url, { headers });
            const response = result?.data?.employees
            if (result?.status === 200 && response) {
                dispatch(employeeNameSlice(response));
            }
        } catch (e) {
            showToastError("An error occurred");
        }
    };
};

//Filter Table Search
export const getFilterEmployee = (payload, ) => {
    return async (dispatch) => {
        dispatch(moduleLoading(true));
        try {
            const { url } = getAllEmployeeConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };

            const result = await axios.post(url, payload, { headers });
            const response = result?.data?.employees
            if (result?.status === 200 && response) {
                dispatch(employeeDataSlice(response))
                dispatch(moduleLoading(false));
            }
        } catch (e) {
            showToastError("An error occurred");
            dispatch(moduleLoading(false));
        }
    };
};