import { ApiError } from '../utils/apiError';
import { Report, validateReport, ReportDocument } from '../models/Report';

function validReportParameters(report: any): void {
    const isNotValid = validateReport(report);
    if (isNotValid.error) throw new ApiError(400, isNotValid.error.details[0].message);
}

// interface ReportResponse {
//     message: string;
//     newReport?: ReportDocument;
//     userReport?: ReportDocument[];
// }

export const createReport = async (report: any, checkID: string, userID: string)=> {
    if (!userID) throw new ApiError(400, 'Missing User ID');
    if (!checkID) throw new ApiError(400, 'Missing Check ID');

    // Empty Reports are Allowed
    validReportParameters(report);

    // Check for Duplicate Report
    const foundDuplicate = await Report.findOne({ urlID: checkID, userID });
    if (foundDuplicate) throw new ApiError(400, 'Duplicate Report');

    const newReport = await new Report({
        ...report,
        urlID: checkID,
        userID,
    }).save();

    return { message: 'Report Created', newReport };
};

export const getReport = async (checkID: string, userID: string) => {
    if (!userID) throw new ApiError(400, 'Missing User ID');
    if (!checkID) throw new ApiError(400, 'Missing Check ID');

    const userReport = await Report.find({ urlID: checkID, userID });
    return { message: 'Reports Found', userReport };
};

export const updateReport = async (
    newReport: any,
    checkID: string,
    userID: string
) => {
    if (!newReport || Object.keys(newReport).length === 0)
        throw new ApiError(400, 'Empty Update Check');
    if (!checkID) throw new ApiError(400, 'Missing Check ID');
    if (!userID) throw new ApiError(400, 'Missing User ID');

    validReportParameters(newReport);
    const exists = await Report.exists({ urlID: checkID, userID });
    if (!exists) throw new ApiError(400, 'Check Not Found');

    await Report.findByIdAndUpdate(exists, newReport);
    return { message: 'Report Updated' };
};

export const deleteReport = async (checkID: string, userID: string) => {
    if (!checkID) throw new ApiError(400, 'Missing Check ID');
    if (!userID) throw new ApiError(400, 'Missing User ID');

    const exists = await Report.exists({ urlID: checkID, userID });
    if (!exists) throw new ApiError(400, 'Check Not Found');

    await Report.findByIdAndDelete(exists);
    return { message: 'Check Deleted' };
};

