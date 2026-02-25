import Report from "../models/Report.js";
import { createError } from "../utils/error.js";

//remote Forwarding required to be implemented
    
export const createReport = async (req, res, next) => {
    try {
        const reporterId = req.user.federatedId;
        const { reportedId, targetType, reason, description } = req.body;

        // Basic validation
        if (!reportedId || !targetType || !reason) {
            return next(createError(400, "Missing required fields"));
        }

        if (!["user", "post"].includes(targetType)) {
            return next(createError(400, "Invalid target type"));
        }

        const parts = reportedId.split("@");

        if (parts.length < 2) {
            return next(createError(400, "Invalid reportedId format"));
        }

        const afterAt = parts[1];
        const originServer = afterAt.split("/")[0];

        const isRemoteTarget =
            originServer !== process.env.SERVER_NAME;

        // Delegate DB logic to service
        const savedReport = await createReportService({
            reporterId,
            reportedId,
            targetType,
            reason,
            description,
            targetOriginServer: originServer,
            isRemoteTarget
        });

        res.status(201).json(savedReport);

    } catch (err) {
        next(err);
    }
};

export const getAllReports = async (req, res, next) => {
    try {
        const { status, targetType, limit } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (targetType) filter.targetType = targetType;

        const reports = await Report.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit) || 20); // default = 20

        res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });
    }catch(err){
        next(err);
    }
}



export const updateReportStatus = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;
        if (!["pending", "resolved", "dismissed"].includes(status)) {
            return next(createError(400, "Invalid status value"));
        }
        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { status: status },
            { new: true }
        );
        if (!updatedReport) {
            return next(createError(404, "Report not found"));
        }
        res.status(200).json(updatedReport);
    }catch(err){
        next(err);
    }
}

