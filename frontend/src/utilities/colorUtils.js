
export const getAttendanceTypeColor = (attendanceType) => {
    switch (attendanceType) {
      case "Gantry":
        return { argb: '0022ff' }; 
      case "Blackboard":
        return { argb: '925ada' }; 
      default:
        return { argb: 'FF000000' }; 
    }   
  };
  

export const getStatusColor = (attendanceStatus) => {
    switch (attendanceStatus) {
      case "Present":
        return { argb: 'FF00FF00' }; 
      case "Late":
        return { argb: 'FFFFFF00' }; 
      case "Absent":
        return { argb: 'FFFF0000' }; 
      default:
        return { argb: 'FF000000' }; 
    }
  };
  