import { showToastError } from "../../utilities/errortoast";
import { axios } from "../lib/axios";
import { getAllCountryUrl, getAllCourseModuleUrl, getAllCourseUrl, getAllModuleUrl, getCohortConfig, getFilterModuleAttendanceConfig, getStudentNameConfig, ModuleAttendanceConfig, StudentAttendanceConfig } from "../lib/requests/module.url";
import { cohortDataSlice, countryDataSlice, courseDataSlice, courseModuleDataSlice, getAllModuleAttendanceSlice, getAllStudentAttendanceSlice, moduleDataSlice, moduleLoading, studentDataSlice } from "../slices/module.slice";

//getallcourse value
export const getAllCourseAction = () => {
    return async (dispatch) => {
        try {
            const { url } = getAllCourseUrl();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.get(url, { headers });
            const response = result?.data?.courses
            if (result?.status === 200 && response) {
                dispatch(courseDataSlice(response))
            }

        } catch (e) {
            showToastError("An error occurred");
        }
    };
};

export const getAllCountryAction = () => {
    return async (dispatch) => {
        try {
            const { url } = getAllCountryUrl();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.get(url, { headers });
            const response = result?.data?.countries
            if (result?.status === 200 && response) {
                dispatch(countryDataSlice(response))
            }

        } catch (e) {
            showToastError("An error occurred");
        }
    };
};

//getallstudent name
export const getAllStudentAction = () => {
    return async (dispatch) => {
        try {
            const { url } = getStudentNameConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.get(url, { headers });
            const response = result?.data?.students
            if (result?.status === 200 && response) {
                dispatch(studentDataSlice(response))
            }

        } catch (e) {
            showToastError("An error occurred");
        }
    };
};

//school/module
export const getAllModuleAction = (payload) => {
    return async (dispatch) => {
        try {
            const { url } = getAllModuleUrl();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.post(url, payload, { headers });
            const response = result?.data?.module_list
            if (result?.status === 200 && response) {
                dispatch(moduleDataSlice(response))
            }
        } catch (e) {
            if (e?.response?.status === 404) {
                showToastError("No modules are available for this school.");
            }
        }
    };
};
//course/module
export const getAllCourseModuleAction = (payload) => {
    return async (dispatch) => {
        try {
            const { url } = getAllCourseModuleUrl();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.post(url, payload, { headers });
            const response = result?.data?.module_details
            if (result?.status === 200 && response) {
                dispatch(courseModuleDataSlice(response))
            }
        } catch (e) {
            showToastError("An error occurred");
        }
    };
};

//course/cohort
export const getAllCohortAction = (payload) => {
    return async (dispatch) => {
        try {
            const { url } = getCohortConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.post(url, payload, { headers });
            const response = result?.data?.cohort_course_details
            if (result?.status === 200 && response) {
                dispatch(cohortDataSlice(response))
            }
        } catch (e) {
            showToastError("No course cohort available");
        }
    };
};

//StudentFilter Table Search
export const getFilterStudent = (payload) => {
    return async (dispatch) => {
        dispatch(moduleLoading(true));
        try {
            const { url } = StudentAttendanceConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };

            const result = await axios.post(url, payload, { headers });
            const response = result?.data?.students
            if (result?.status === 200 && response) {
                dispatch(getAllStudentAttendanceSlice(response))
                dispatch(moduleLoading(false));
            }
        } catch (e) {
            showToastError("An error occurred");
            dispatch(moduleLoading(false));
        }
    };
};

//ModuleFilter Table Search
export const getFilterModule = (payload, signal) => {
    return async (dispatch) => {
        dispatch(moduleLoading(true));
        try {
            const { url } = ModuleAttendanceConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };

            const result = await axios.post(url, payload, {
                headers,
                signal,
            });

            const response = result?.data?.students;
            if (result?.status === 200 && response) {
                dispatch(getAllModuleAttendanceSlice(response))
                dispatch(moduleLoading(false));
            }
        } catch (e) {
            showToastError("An error occurred");
            dispatch(moduleLoading(false));
        }
    };
};

//Module table data
export const getFilterModuleAttendance = () => {
    return async (dispatch) => {
        dispatch(moduleLoading(true));
        try {
            const { url } = getFilterModuleAttendanceConfig();
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const result = await axios.get(url, { headers });
            const response = result?.data?.attendances;
            if (result?.status === 200 && response) {
                dispatch(getAllModuleAttendanceSlice(response));
                dispatch(moduleLoading(false));
            }
        } catch (e) {
        }
    };
};